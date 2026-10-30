package com.qustodio.engine.screentime

import android.accessibilityservice.AccessibilityService
import android.app.ActivityManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import kotlinx.coroutines.*
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong

/**
 * ============================================================================
 * QUSTODIO BENCHMARK: SCREEN TIME & APP BLOCKER ENGINE
 * ============================================================================
 *
 * Reverse-engineered from Qustodio Parental Control:
 * - TypeScript references: `src/businessLogic/timeRules/timeQuota.ts`,
 *   `src/businessLogic/routines/routines.ts`, `src/ducks/familyPause/pause.ts`,
 *   `src/constants/index.ts`
 *
 * Core Capabilities:
 * ------------------
 * 1. Time Quota Tracking:
 *    - Strict 1440 minutes/day constraint (`MINUTES_IN_A_DAY = 1440`).
 *    - Per-weekday quota distribution (Monday through Sunday).
 *    - Hybrid tracking: UsageStatsManager event polling + Accessibility sub-second window tracking.
 * 2. Schedule & Routine Engine:
 *    - Bedtime routines, school hour restrictions, study routines.
 *    - Circular weekly minutes arithmetic (`MINS_IN_A_WEEK = 10080`).
 *    - Overlap detection with Sunday-to-Monday boundary rollover (`normalizeEventEndTime`).
 * 3. App Whitelisting & Categorization:
 *    - `APPLICATION_ALWAYS_ALLOWED = 4` (essential utility bypass: Phone, Calculator, Emergency).
 *    - `APPLICATION_BLOCKED = 1` and `APPLICATION_ALLOWED = 0`.
 *    - Category-based app restriction (`blockAppsByCategories`).
 * 4. Enforcement & Overlay System:
 *    - Fullscreen system overlay block (`TYPE_APPLICATION_OVERLAY`).
 *    - Instant Device Lock (Family Pause) with atomic lock/unlock state machine.
 *    - Extra time allowance workflow (`isRequestExtraScreenTimeEnabled`).
 */

// ============================================================================
// 1. CONSTANTS & TIME DATA STRUCTURES
// ============================================================================

object ScreenTimeConstants {
    const val MINUTES_IN_A_DAY = 1440
    const val MINUTES_IN_AN_HOUR = 60
    const val DAYS_IN_A_WEEK = 7
    const val MINS_IN_A_WEEK = MINUTES_IN_A_DAY * DAYS_IN_A_WEEK // 10080 minutes

    // Application actions matching Qustodio constants/index.ts
    const val APPLICATION_ALLOWED = 0
    const val APPLICATION_BLOCKED = 1
    const val APPLICATION_ALERT = 2
    const val APPLICATION_IGNORE = 3
    const val APPLICATION_ALWAYS_ALLOWED = 4

    // Reason codes matching Qustodio
    const val REASON_TIME_RESTRICTIONS_QUOTA = 2
    const val REASON_TIME_RESTRICTIONS_RANGE = 3
    const val REASON_APP_BLOCK = 301

    // Default package whitelists for APPLICATION_ALWAYS_ALLOWED
    val ESSENTIAL_PACKAGES = setOf(
        "com.android.dialer",
        "com.google.android.dialer",
        "com.samsung.android.dialer",
        "com.android.calculator2",
        "com.google.android.calculator",
        "com.sec.android.app.popupcalculator",
        "com.android.emergency",
        "com.google.android.apps.safetyhub"
    )
}

enum class Weekday(val apiCode: String, val dayIndex: Int, val weekOffsetMinutes: Int) {
    MON("mon", 1, 0),
    TUE("tue", 2, 1440),
    WED("wed", 3, 2880),
    THR("thr", 4, 4320),
    FRI("fri", 5, 5760),
    SAT("sat", 6, 7200),
    SUN("sun", 7, 8640);

    companion object {
        fun fromCalendarDay(calendarDay: Int): Weekday {
            return when (calendarDay) {
                Calendar.MONDAY -> MON
                Calendar.TUESDAY -> TUE
                Calendar.WEDNESDAY -> WED
                Calendar.THURSDAY -> THR
                Calendar.FRIDAY -> FRI
                Calendar.SATURDAY -> SAT
                Calendar.SUNDAY -> SUN
                else -> MON
            }
        }

        fun fromApiCode(code: String): Weekday? = values().find { it.apiCode.equals(code, ignoreCase = true) }
    }
}

// ============================================================================
// 2. SCHEDULE & ROUTINE ENGINE (CIRCULAR WEEK ARITHMETIC)
// ============================================================================

data class ScheduleEvent(
    val uid: String,
    val routineUid: String,
    val routineName: String,
    val day: Weekday,
    val startTime: String, // "HH:mm"
    val durationMinutes: Int,
    val startWeekMinutes: Int,
    val endWeekMinutes: Int
)

enum class RoutineType {
    ROUTINE_TYPE_BLOCKED,
    ROUTINE_TYPE_BEDTIME,
    ROUTINE_TYPE_SCHOOL,
    ROUTINE_TYPE_STUDY,
    ROUTINE_TYPE_CUSTOM
}

data class RoutineRecord(
    val uid: String,
    val name: String,
    val type: RoutineType,
    val isEnabled: Boolean = true,
    val isPaused: Boolean = false,
    val blockedAppCategories: Set<String> = emptySet(),
    val allowedAlwaysApps: Set<String> = emptySet()
)

class RoutineConflictException(message: String) : Exception(message)

/**
 * Handles weekly calendar schedules, bedtime, school hours, and detects
 * interval conflicts using circular modulo week arithmetic.
 */
class RoutineScheduleEngine {

    private val routines = ConcurrentHashMap<String, RoutineRecord>()
    private val schedules = ConcurrentHashMap<String, MutableList<ScheduleEvent>>() // routineUid -> events

    fun registerRoutine(routine: RoutineRecord) {
        routines[routine.uid] = routine
    }

    fun addSchedule(
        routineUid: String,
        scheduleUid: String,
        day: Weekday,
        startTime: String, // "HH:mm"
        durationMinutes: Int
    ) {
        val routine = routines[routineUid]
            ?: throw IllegalArgumentException("Routine $routineUid is not registered")

        val (hours, minutes) = startTime.split(":").map { it.toInt() }
        val dayMinutes = hours * 60 + minutes
        val startWeekMinutes = day.weekOffsetMinutes + dayMinutes
        val endWeekMinutes = startWeekMinutes + durationMinutes

        val newEvent = ScheduleEvent(
            uid = scheduleUid,
            routineUid = routineUid,
            routineName = routine.name,
            day = day,
            startTime = startTime,
            durationMinutes = durationMinutes,
            startWeekMinutes = startWeekMinutes,
            endWeekMinutes = endWeekMinutes
        )

        // Check for overlaps with enabled non-paused routines
        val conflicting = findFirstOverlap(newEvent)
        if (conflicting != null) {
            throw RoutineConflictException(
                "Schedule conflict: '${routine.name}' (${newEvent.startTime}, ${newEvent.durationMinutes}m) " +
                        "overlaps with '${conflicting.routineName}' (${conflicting.startTime}, ${conflicting.durationMinutes}m)"
            )
        }

        schedules.computeIfAbsent(routineUid) { mutableListOf() }.add(newEvent)
    }

    /**
     * Checks if a schedule event overlaps with any existing schedule event.
     * Uses Qustodio's `normalizeEventEndTime` algorithm:
     * When an event starts on Sunday evening and overflows past Sunday midnight into Monday,
     * the end time is rolled over via `endWeekMinutes % MINS_IN_A_WEEK` to test against Monday morning events.
     */
    fun findFirstOverlap(targetEvent: ScheduleEvent): ScheduleEvent? {
        val allActiveEvents = schedules.values.flatten().filter { event ->
            val routine = routines[event.routineUid]
            routine != null && routine.isEnabled && !routine.isPaused && event.uid != targetEvent.uid
        }.toMutableList()

        if (allActiveEvents.isEmpty()) return null

        val combinedList = (allActiveEvents + targetEvent).sortedBy { it.startWeekMinutes }

        for (i in combinedList.indices) {
            val curr = combinedList[i]
            val nextIndex = (i + 1) % combinedList.size
            val next = combinedList[nextIndex]

            val isLastEvent = (nextIndex == 0)
            if (isLastEvent && curr.endWeekMinutes <= ScreenTimeConstants.MINS_IN_A_WEEK) {
                continue
            }

            // Normalize end time if rolling over the week boundary
            val normalizedCurrEnd = if (isLastEvent && curr.endWeekMinutes > ScreenTimeConstants.MINS_IN_A_WEEK) {
                curr.endWeekMinutes % ScreenTimeConstants.MINS_IN_A_WEEK
            } else {
                curr.endWeekMinutes
            }

            val overlaps = if (isLastEvent) {
                normalizedCurrEnd > next.startWeekMinutes
            } else {
                curr.endWeekMinutes > next.startWeekMinutes
            }

            if (overlaps) {
                if (curr.uid == targetEvent.uid) return next
                if (next.uid == targetEvent.uid) return curr
            }
        }

        return null
    }

    /**
     * Evaluates whether the current point in time falls inside any active routine restriction.
     */
    fun getActiveRestrictingRoutine(currentCalendar: Calendar): RoutineRecord? {
        val currentWeekday = Weekday.fromCalendarDay(currentCalendar.get(Calendar.DAY_OF_WEEK))
        val currentDayMinutes = currentCalendar.get(Calendar.HOUR_OF_DAY) * 60 + currentCalendar.get(Calendar.MINUTE)
        val currentWeekMinutes = currentWeekday.weekOffsetMinutes + currentDayMinutes

        for (entry in schedules) {
            val routine = routines[entry.key] ?: continue
            if (!routine.isEnabled || routine.isPaused) continue

            for (event in entry.value) {
                val isInside = if (event.endWeekMinutes <= ScreenTimeConstants.MINS_IN_A_WEEK) {
                    currentWeekMinutes >= event.startWeekMinutes && currentWeekMinutes < event.endWeekMinutes
                } else {
                    // Rollover across Sunday midnight
                    val rolledEnd = event.endWeekMinutes % ScreenTimeConstants.MINS_IN_A_WEEK
                    (currentWeekMinutes >= event.startWeekMinutes) || (currentWeekMinutes < rolledEnd)
                }

                if (isInside) {
                    return routine
                }
            }
        }
        return null
    }
}

// ============================================================================
// 3. DAILY TIME QUOTA & USAGE STATS ENGINE
// ============================================================================

enum class QuotaState {
    UNDER_QUOTA,
    WARNING_APPROACHING, // 5 minutes remaining
    EXCEEDED
}

class DailyTimeQuotaEngine(
    private val context: Context
) {
    // Weekday -> Allowed minutes (0 to 1440)
    private val weekdayQuotas = ConcurrentHashMap<Weekday, Int>()

    // Extra screen time granted for today (e.g. +15, +30, +60 mins)
    private val extraMinutesToday = AtomicLong(0)

    // Cached active usage today in milliseconds
    private val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager

    init {
        // Default: 120 minutes (2 hours) per weekday
        Weekday.values().forEach { weekdayQuotas[it] = 120 }
    }

    fun setQuota(weekday: Weekday, minutes: Int) {
        require(minutes in 0..ScreenTimeConstants.MINUTES_IN_A_DAY) {
            "Daily quota must be between 0 and 1440 minutes"
        }
        weekdayQuotas[weekday] = minutes
    }

    fun getQuota(weekday: Weekday): Int = weekdayQuotas[weekday] ?: 120

    fun grantExtraTime(minutes: Long) {
        extraMinutesToday.addAndGet(minutes)
    }

    fun resetExtraTime() {
        extraMinutesToday.set(0)
    }

    /**
     * Computes today's total active screen usage by querying Android's UsageEvents
     * between 00:00:00 today and the current moment.
     */
    fun calculateTodayUsageMinutes(): Long {
        if (usageStatsManager == null) return 0

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val events = usageStatsManager.queryEvents(startTime, endTime)
        var totalUsageMillis = 0L
        var lastForegroundTimestamp = 0L
        var currentForegroundPackage: String? = null

        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            when (event.eventType) {
                UsageEvents.Event.ACTIVITY_RESUMED -> {
                    currentForegroundPackage = event.packageName
                    lastForegroundTimestamp = event.timeStamp
                }
                UsageEvents.Event.ACTIVITY_PAUSED, UsageEvents.Event.ACTIVITY_STOPPED -> {
                    if (event.packageName == currentForegroundPackage && lastForegroundTimestamp > 0) {
                        val duration = event.timeStamp - lastForegroundTimestamp
                        if (duration > 0 && !isPackageExemptFromQuota(event.packageName)) {
                            totalUsageMillis += duration
                        }
                        lastForegroundTimestamp = 0
                        currentForegroundPackage = null
                    }
                }
            }
        }

        // Add currently open session
        if (currentForegroundPackage != null && lastForegroundTimestamp > 0) {
            val liveDuration = endTime - lastForegroundTimestamp
            if (liveDuration > 0 && !isPackageExemptFromQuota(currentForegroundPackage)) {
                totalUsageMillis += liveDuration
            }
        }

        return totalUsageMillis / (1000 * 60)
    }

    fun evaluateQuotaState(): Pair<QuotaState, Long> {
        val today = Weekday.fromCalendarDay(Calendar.getInstance().get(Calendar.DAY_OF_WEEK))
        val baseQuota = getQuota(today)
        val totalAllowed = baseQuota + extraMinutesToday.get()
        val usedMinutes = calculateTodayUsageMinutes()

        val remaining = totalAllowed - usedMinutes
        val state = when {
            remaining <= 0 -> QuotaState.EXCEEDED
            remaining <= 5 -> QuotaState.WARNING_APPROACHING
            else -> QuotaState.UNDER_QUOTA
        }
        return Pair(state, remaining)
    }

    private fun isPackageExemptFromQuota(packageName: String): Boolean {
        return ScreenTimeConstants.ESSENTIAL_PACKAGES.contains(packageName)
    }
}

// ============================================================================
// 4. APP BLOCKING, WHITELISTING & OVERLAY ENFORCEMENT
// ============================================================================

data class AppRule(
    val packageName: String,
    val action: Int, // APPLICATION_ALLOWED, APPLICATION_BLOCKED, APPLICATION_ALWAYS_ALLOWED
    val category: String? = null
)

class ScreenTimeAndAppBlocker(
    private val context: Context,
    private val quotaEngine: DailyTimeQuotaEngine,
    private val routineEngine: RoutineScheduleEngine
) {
    private val appRules = ConcurrentHashMap<String, AppRule>()
    private val blockedCategories = ConcurrentHashMap.newKeySet<String>()

    // Instant Lock (Family Pause) state matching pause.ts
    private val isFamilyPaused = AtomicBoolean(false)
    private val isComputerLocked = AtomicBoolean(false)
    private val isNavigationLocked = AtomicBoolean(false)

    private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private var overlayBlockView: View? = null
    private val isOverlayShowing = AtomicBoolean(false)

    var onBlockTriggered: ((packageName: String, reason: Int, details: String) -> Unit)? = null

    init {
        // Register essential always-allowed packages
        ScreenTimeConstants.ESSENTIAL_PACKAGES.forEach { pkg ->
            appRules[pkg] = AppRule(pkg, ScreenTimeConstants.APPLICATION_ALWAYS_ALLOWED)
        }
    }

    fun setAppRule(packageName: String, action: Int, category: String? = null) {
        appRules[packageName] = AppRule(packageName, action, category)
    }

    fun blockAppCategory(category: String) {
        blockedCategories.add(category.lowercase())
    }

    fun unblockAppCategory(category: String) {
        blockedCategories.remove(category.lowercase())
    }

    /**
     * Instant Device Lock (Qustodio Family Pause matching pause.ts)
     */
    fun setFamilyPause(paused: Boolean, lockComputer: Boolean = true, lockNavigation: Boolean = true) {
        isFamilyPaused.set(paused)
        isComputerLocked.set(lockComputer)
        isNavigationLocked.set(lockNavigation)

        if (paused && lockComputer) {
            showOverlayBlock("Family Pause Active", "Your parents have paused your device.")
        } else if (!paused) {
            hideOverlayBlock()
        }
    }

    /**
     * Primary inspection method invoked when an app window is focused
     * (called via AccessibilityService or UsageStats observer)
     */
    fun inspectForegroundApp(packageName: String): Boolean {
        // 1. Whitelisted apps are ALWAYS permitted (Phone, SOS, Calculator)
        val rule = appRules[packageName]
        if (rule?.action == ScreenTimeConstants.APPLICATION_ALWAYS_ALLOWED ||
            ScreenTimeConstants.ESSENTIAL_PACKAGES.contains(packageName)
        ) {
            hideOverlayBlock()
            return true
        }

        // 2. Check Instant Family Pause
        if (isFamilyPaused.get() && isComputerLocked.get()) {
            triggerBlock(packageName, ScreenTimeConstants.REASON_APP_BLOCK, "Device is locked by Family Pause")
            return false
        }

        // 3. Check App-specific Blacklist
        if (rule?.action == ScreenTimeConstants.APPLICATION_BLOCKED) {
            triggerBlock(packageName, ScreenTimeConstants.REASON_APP_BLOCK, "App is explicitly blocked")
            return false
        }

        // 4. Check Category Block
        rule?.category?.let { cat ->
            if (blockedCategories.contains(cat.lowercase())) {
                triggerBlock(packageName, ScreenTimeConstants.REASON_APP_BLOCK, "Category '$cat' is blocked")
                return false
            }
        }

        // 5. Check Active Routine / Bedtime / School Restrictions
        val activeRoutine = routineEngine.getActiveRestrictingRoutine(Calendar.getInstance())
        if (activeRoutine != null) {
            triggerBlock(
                packageName,
                ScreenTimeConstants.REASON_TIME_RESTRICTIONS_RANGE,
                "Restricted by active routine: ${activeRoutine.name}"
            )
            return false
        }

        // 6. Check Daily Time Quota
        val (quotaState, remainingMinutes) = quotaEngine.evaluateQuotaState()
        if (quotaState == QuotaState.EXCEEDED) {
            triggerBlock(
                packageName,
                ScreenTimeConstants.REASON_TIME_RESTRICTIONS_QUOTA,
                "Daily screen time limit reached"
            )
            return false
        }

        hideOverlayBlock()
        return true
    }

    private fun triggerBlock(packageName: String, reason: Int, explanation: String) {
        onBlockTriggered?.invoke(packageName, reason, explanation)
        showOverlayBlock("Access Restricted", explanation)
        killOrDismissPackage(packageName)
    }

    private fun showOverlayBlock(title: String, message: String) {
        if (isOverlayShowing.get()) return

        CoroutineScope(Dispatchers.Main).launch {
            if (overlayBlockView != null) return@launch

            val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            }

            val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                        WindowManager.LayoutParams.FLAG_FULLSCREEN,
                PixelFormat.TRANSLUCENT
            ).apply {
                gravity = Gravity.CENTER
            }

            val overlayView = View(context).apply {
                setBackgroundColor(0xEE1A1A2E.toInt()) // Deep dark purple overlay matching Qustodio UI
            }

            try {
                windowManager.addView(overlayView, params)
                overlayBlockView = overlayView
                isOverlayShowing.set(true)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun hideOverlayBlock() {
        if (!isOverlayShowing.get()) return

        CoroutineScope(Dispatchers.Main).launch {
            overlayBlockView?.let { view ->
                try {
                    windowManager.removeView(view)
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                overlayBlockView = null
                isOverlayShowing.set(false)
            }
        }
    }

    private fun killOrDismissPackage(packageName: String) {
        try {
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            activityManager.killBackgroundProcesses(packageName)
        } catch (e: Exception) {
            // Ignored on newer Androids
        }

        // Send user to Home Launcher
        val homeIntent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(homeIntent)
    }
}
