/**
 * ============================================================================
 * Bark Parental Controls — Algorithmic Engine Extraction
 * Engine 4: Dynamic Screen Time Rules & Schedule State Machine Engine
 * Package: cm.pt.barkparent.algorithms.screen_time
 * File: dynamic_screen_time_rules_engine.kt
 * ============================================================================
 *
 * Architectural Purpose:
 * Reconstructed production-grade engine responsible for managing recurring
 * daily schedules across 3 rulesets (Default, School, Bedtime), evaluating
 * 24-hour weekly time grids with midnight-spanning intervals, adjudicating
 * parent manual overrides ("Pause Internet", "Grant Bonus Time"), and driving
 * zero-reconnect policy hot-reloads in the local Bark Guard DNS VPN engine.
 *
 * Key Capabilities:
 * 1. 3 Structured Daily Rulesets:
 *    - Default: Standard recreational browsing with baseline protection.
 *    - School: Focus mode blocking social media, streaming, gaming; whitelisting educational tools.
 *    - Bedtime: Total network shutdown; preserves only emergency phone calling and system telemetry.
 * 2. Deterministic State Machine adjudicating priority:
 *    Pause Internet > Bonus Time > Bedtime Interval > School Interval > Default Fallback.
 * 3. Midnight-crossover interval resolution (e.g. Bedtime 21:00 to 07:00 next day).
 * 4. Reactive policy emission driving atomic hot-reloads in BarkGuardDnsVpnEngine.
 */

package cm.pt.barkparent.algorithms.screen_time

import cm.pt.barkparent.algorithms.dns_vpn.BarkGuardDnsVpnEngine
import cm.pt.barkparent.algorithms.dns_vpn.DnsPolicy
import cm.pt.barkparent.algorithms.dns_vpn.WebCategory
import java.util.Calendar
import java.util.concurrent.atomic.AtomicReference
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

// ============================================================================
// 1. Data Models, Enums & Schedule Structures
// ============================================================================

enum class RulesetType {
    DEFAULT,
    SCHOOL,
    BEDTIME
}

enum class ScreenTimeState {
    ACTIVE_DEFAULT,
    ACTIVE_SCHOOL,
    ACTIVE_BEDTIME,
    MANUAL_PAUSED,
    ACTIVE_BONUS_TIME
}

data class ScheduleTime(val hour: Int, val minute: Int) : Comparable<ScheduleTime> {
    init {
        require(hour in 0..23) { "Hour must be 0..23" }
        require(minute in 0..59) { "Minute must be 0..59" }
    }

    val totalMinutes: Int get() = hour * 60 + minute

    override fun compareTo(other: ScheduleTime): Int = this.totalMinutes.compareTo(other.totalMinutes)
}

data class TimeInterval(val start: ScheduleTime, val end: ScheduleTime) {
    /**
     * Checks if a given time falls within this interval.
     * Automatically handles intervals crossing midnight (e.g., 21:00 to 07:00).
     */
    fun contains(time: ScheduleTime): Boolean {
        return if (start <= end) {
            // Same-day interval (e.g. 08:30 to 15:00)
            time >= start && time < end
        } else {
            // Overnight interval crossing midnight (e.g. 21:00 to 07:00)
            time >= start || time < end
        }
    }
}

data class DaySchedule(
    val dayOfWeek: Int, // Calendar.SUNDAY (1) .. Calendar.SATURDAY (7)
    val schoolIntervals: List<TimeInterval> = emptyList(),
    val bedtimeIntervals: List<TimeInterval> = emptyList()
)

data class ScreenTimeRulesetConfig(
    val type: RulesetType,
    val name: String,
    val blockedWebCategories: Set<WebCategory>,
    val blockedAppPackages: Set<String>,
    val safeSearchForced: Boolean = true,
    val allowEmergencyPhone: Boolean = true,
    val whitelistedEducationalDomains: Set<String> = emptySet()
)

sealed class ManualOverride {
    object None : ManualOverride()

    data class PauseInternet(
        val initiatedEpochMs: Long = System.currentTimeMillis(),
        val expiresEpochMs: Long? = null, // null means indefinitely until unpaused
        val reason: String = "Parental Manual Pause"
    ) : ManualOverride() {
        fun isActive(currentTimeMs: Long): Boolean {
            return expiresEpochMs == null || currentTimeMs < expiresEpochMs
        }
    }

    data class BonusTime(
        val initiatedEpochMs: Long = System.currentTimeMillis(),
        val expiresEpochMs: Long,
        val bonusMinutes: Int
    ) : ManualOverride() {
        fun isActive(currentTimeMs: Long): Boolean = currentTimeMs < expiresEpochMs
    }
}

data class RuleEvaluationSnapshot(
    val timestampEpochMs: Long,
    val activeState: ScreenTimeState,
    val activeRuleset: ScreenTimeRulesetConfig,
    val activeOverride: ManualOverride,
    val effectiveBlockedCategories: Set<WebCategory>,
    val effectiveBlockedApps: Set<String>,
    val formattedStatus: String
)

// ============================================================================
// 2. Pre-Configured Baseline Rulesets
// ============================================================================

object BaselineRulesetFactory {

    val DEFAULT_RULESET = ScreenTimeRulesetConfig(
        type = RulesetType.DEFAULT,
        name = "Free Time / Default",
        blockedWebCategories = setOf(
            WebCategory.ADULT_PORNOGRAPHY,
            WebCategory.GAMBLING,
            WebCategory.MALWARE_PHISHING,
            WebCategory.WEAPONS_VIOLENCE
        ),
        blockedAppPackages = emptySet(),
        safeSearchForced = true,
        allowEmergencyPhone = true
    )

    val SCHOOL_RULESET = ScreenTimeRulesetConfig(
        type = RulesetType.SCHOOL,
        name = "School Focus Mode",
        blockedWebCategories = setOf(
            WebCategory.ADULT_PORNOGRAPHY,
            WebCategory.GAMBLING,
            WebCategory.MALWARE_PHISHING,
            WebCategory.WEAPONS_VIOLENCE,
            WebCategory.SOCIAL_MEDIA,
            WebCategory.VIDEO_STREAMING,
            WebCategory.ONLINE_GAMING
        ),
        blockedAppPackages = setOf(
            "com.zhiliaoapp.musically",       // TikTok
            "com.instagram.android",          // Instagram
            "com.snapchat.android",           // Snapchat
            "com.discord",                    // Discord
            "com.netflix.mediaclient",        // Netflix
            "com.roblox.client",              // Roblox
            "com.supercell.clashofclans"      // Clash of Clans
        ),
        safeSearchForced = true,
        allowEmergencyPhone = true,
        whitelistedEducationalDomains = setOf(
            "classroom.google.com",
            "instructure.com",
            "canvas.net",
            "khanacademy.org",
            "quizlet.com",
            "wikipedia.org"
        )
    )

    val BEDTIME_RULESET = ScreenTimeRulesetConfig(
        type = RulesetType.BEDTIME,
        name = "Bedtime Lockdown",
        blockedWebCategories = WebCategory.values().toSet(), // Block ALL web traffic
        blockedAppPackages = setOf("*"),                     // Block all 3rd-party user apps
        safeSearchForced = true,
        allowEmergencyPhone = true
    )
}

// ============================================================================
// 3. Dynamic Screen Time Rules Engine
// ============================================================================

class DynamicScreenTimeRulesEngine(
    private val vpnEngine: BarkGuardDnsVpnEngine? = null,
    private val weeklySchedule: Map<Int, DaySchedule> = createDefaultWeeklySchedule(),
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    private val currentOverride = AtomicReference<ManualOverride>(ManualOverride.None)
    private val _evaluationState = MutableStateFlow<RuleEvaluationSnapshot>(createInitialSnapshot())
    val evaluationState: StateFlow<RuleEvaluationSnapshot> = _evaluationState.asStateFlow()

    private var evaluationJob: Job? = null

    init {
        startScheduleTicker()
    }

    private fun startScheduleTicker() {
        evaluationJob = coroutineScope.launch {
            while (isActive) {
                evaluateAndApply(System.currentTimeMillis())
                delay(15_000L) // Re-evaluate every 15 seconds for responsive schedule transitions
            }
        }
    }

    /**
     * Adjudicates active state across the priority hierarchy:
     * 1. Manual Pause (Internet killed, emergency call permitted)
     * 2. Bonus Time (Overrides school/bedtime to grant recreational access)
     * 3. Bedtime Schedule (Highest recurring priority)
     * 4. School Schedule (Academic focus)
     * 5. Default Fallback
     */
    fun evaluateAndApply(currentTimeMs: Long): RuleEvaluationSnapshot {
        val calendar = Calendar.getInstance().apply { timeInMillis = currentTimeMs }
        val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK)
        val currentScheduleTime = ScheduleTime(calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE))

        val override = currentOverride.get()

        // 1. Check Manual Pause Override
        if (override is ManualOverride.PauseInternet && override.isActive(currentTimeMs)) {
            val pausedConfig = BaselineRulesetFactory.BEDTIME_RULESET.copy(name = "Internet Paused by Parent")
            val snapshot = RuleEvaluationSnapshot(
                timestampEpochMs = currentTimeMs,
                activeState = ScreenTimeState.MANUAL_PAUSED,
                activeRuleset = pausedConfig,
                activeOverride = override,
                effectiveBlockedCategories = pausedConfig.blockedWebCategories,
                effectiveBlockedApps = pausedConfig.blockedAppPackages,
                formattedStatus = "Internet is manually paused by parent"
            )
            applyToVpnEngine(snapshot)
            _evaluationState.value = snapshot
            return snapshot
        }

        // 2. Check Bonus Time Override
        if (override is ManualOverride.BonusTime && override.isActive(currentTimeMs)) {
            val bonusConfig = BaselineRulesetFactory.DEFAULT_RULESET.copy(name = "Bonus Time Active")
            val remainingMins = ((override.expiresEpochMs - currentTimeMs) / 60_000L).coerceAtLeast(1)
            val snapshot = RuleEvaluationSnapshot(
                timestampEpochMs = currentTimeMs,
                activeState = ScreenTimeState.ACTIVE_BONUS_TIME,
                activeRuleset = bonusConfig,
                activeOverride = override,
                effectiveBlockedCategories = bonusConfig.blockedWebCategories,
                effectiveBlockedApps = bonusConfig.blockedAppPackages,
                formattedStatus = "Bonus Time active ($remainingMins mins remaining)"
            )
            applyToVpnEngine(snapshot)
            _evaluationState.value = snapshot
            return snapshot
        }

        // Clean up expired overrides if applicable
        if (override !is ManualOverride.None) {
            currentOverride.compareAndSet(override, ManualOverride.None)
        }

        // 3. Evaluate Recurring Weekly Grid
        val daySchedule = weeklySchedule[dayOfWeek] ?: DaySchedule(dayOfWeek)

        // 3a. Check Bedtime Intervals
        val isBedtime = daySchedule.bedtimeIntervals.any { it.contains(currentScheduleTime) }
        if (isBedtime) {
            val config = BaselineRulesetFactory.BEDTIME_RULESET
            val snapshot = RuleEvaluationSnapshot(
                timestampEpochMs = currentTimeMs,
                activeState = ScreenTimeState.ACTIVE_BEDTIME,
                activeRuleset = config,
                activeOverride = ManualOverride.None,
                effectiveBlockedCategories = config.blockedWebCategories,
                effectiveBlockedApps = config.blockedAppPackages,
                formattedStatus = "Bedtime schedule active. Internet is restricted."
            )
            applyToVpnEngine(snapshot)
            _evaluationState.value = snapshot
            return snapshot
        }

        // 3b. Check School Intervals
        val isSchool = daySchedule.schoolIntervals.any { it.contains(currentScheduleTime) }
        if (isSchool) {
            val config = BaselineRulesetFactory.SCHOOL_RULESET
            val snapshot = RuleEvaluationSnapshot(
                timestampEpochMs = currentTimeMs,
                activeState = ScreenTimeState.ACTIVE_SCHOOL,
                activeRuleset = config,
                activeOverride = ManualOverride.None,
                effectiveBlockedCategories = config.blockedWebCategories,
                effectiveBlockedApps = config.blockedAppPackages,
                formattedStatus = "School mode active. Social & entertainment apps blocked."
            )
            applyToVpnEngine(snapshot)
            _evaluationState.value = snapshot
            return snapshot
        }

        // 4. Default Fallback
        val defaultConfig = BaselineRulesetFactory.DEFAULT_RULESET
        val snapshot = RuleEvaluationSnapshot(
            timestampEpochMs = currentTimeMs,
            activeState = ScreenTimeState.ACTIVE_DEFAULT,
            activeRuleset = defaultConfig,
            activeOverride = ManualOverride.None,
            effectiveBlockedCategories = defaultConfig.blockedWebCategories,
            effectiveBlockedApps = defaultConfig.blockedAppPackages,
            formattedStatus = "Free time rules active. Baseline filtering enabled."
        )
        applyToVpnEngine(snapshot)
        _evaluationState.value = snapshot
        return snapshot
    }

    /**
     * Hot-reloads the active policy into BarkGuardDnsVpnEngine without socket disconnection.
     */
    private fun applyToVpnEngine(snapshot: RuleEvaluationSnapshot) {
        if (vpnEngine == null) return

        val newDnsPolicy = DnsPolicy(
            blockedCategories = snapshot.effectiveBlockedCategories,
            customBlockedDomains = emptySet(),
            customAllowedDomains = snapshot.activeRuleset.whitelistedEducationalDomains,
            safeSearchEnabled = snapshot.activeRuleset.safeSearchForced,
            returnSinkholeIp = true
        )

        vpnEngine.updatePolicy(newDnsPolicy)
    }

    // ========================================================================
    // Parent Remote Control Actions
    // ========================================================================

    fun pauseInternet(durationMinutes: Int? = null) {
        val now = System.currentTimeMillis()
        val expiresAt = durationMinutes?.let { now + (it * 60_000L) }
        currentOverride.set(ManualOverride.PauseInternet(initiatedEpochMs = now, expiresEpochMs = expiresAt))
        evaluateAndApply(now)
    }

    fun resumeInternet() {
        currentOverride.set(ManualOverride.None)
        evaluateAndApply(System.currentTimeMillis())
    }

    fun grantBonusTime(minutes: Int) {
        val now = System.currentTimeMillis()
        val expiresAt = now + (minutes * 60_000L)
        currentOverride.set(ManualOverride.BonusTime(initiatedEpochMs = now, expiresEpochMs = expiresAt, bonusMinutes = minutes))
        evaluateAndApply(now)
    }

    fun shutdown() {
        evaluationJob?.cancel()
        coroutineScope.cancel()
    }

    private fun createInitialSnapshot(): RuleEvaluationSnapshot {
        val defaultRuleset = BaselineRulesetFactory.DEFAULT_RULESET
        return RuleEvaluationSnapshot(
            timestampEpochMs = System.currentTimeMillis(),
            activeState = ScreenTimeState.ACTIVE_DEFAULT,
            activeRuleset = defaultRuleset,
            activeOverride = ManualOverride.None,
            effectiveBlockedCategories = defaultRuleset.blockedWebCategories,
            effectiveBlockedApps = defaultRuleset.blockedAppPackages,
            formattedStatus = "Initialized"
        )
    }

    companion object {
        fun createDefaultWeeklySchedule(): Map<Int, DaySchedule> {
            val schedule = mutableMapOf<Int, DaySchedule>()

            val schoolDays = listOf(Calendar.MONDAY, Calendar.TUESDAY, Calendar.WEDNESDAY, Calendar.THURSDAY, Calendar.FRIDAY)
            val weekendDays = listOf(Calendar.SATURDAY, Calendar.SUNDAY)

            // School Days: School 08:00 - 15:00, Bedtime 21:00 - 07:00
            for (day in schoolDays) {
                schedule[day] = DaySchedule(
                    dayOfWeek = day,
                    schoolIntervals = listOf(TimeInterval(ScheduleTime(8, 0), ScheduleTime(15, 0))),
                    bedtimeIntervals = listOf(TimeInterval(ScheduleTime(21, 0), ScheduleTime(7, 0)))
                )
            }

            // Weekend Days: No school, Bedtime 22:30 - 08:00
            for (day in weekendDays) {
                schedule[day] = DaySchedule(
                    dayOfWeek = day,
                    schoolIntervals = emptyList(),
                    bedtimeIntervals = listOf(TimeInterval(ScheduleTime(22, 30), ScheduleTime(8, 0)))
                )
            }

            return schedule
        }
    }
}
