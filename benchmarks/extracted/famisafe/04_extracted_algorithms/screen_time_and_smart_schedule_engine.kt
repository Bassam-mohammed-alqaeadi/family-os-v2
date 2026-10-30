package com.familyos.benchmarks.famisafe.engine

import java.time.*
import java.time.temporal.ChronoUnit

/**
 * Wondershare FamiSafe — Screen Time & Smart Schedule Engine
 *
 * Reverse-Engineered from:
 * - `com.wondershare.famisafe.parent.screenv5.screenlimit.*`
 * - `com.wondershare.famisafe.parent.screenv5.schedule.*`
 * - `com.wondershare.famisafe.parent.screenv5.supervised.block.*`
 *
 * Core Capabilities:
 * 1. Daily Quota Tracking (per-day allowed screen time in minutes).
 * 2. Smart Recurring Time Windows (Bedtime, School Time, Homework).
 * 3. Geofence-Conditioned Schedules (e.g. Lock phone while at School).
 * 4. Instant Screen Lock (Emergency / Dinner Time freeze).
 * 5. Time Extension Requests (Child asks for +15m, Parent instant push approve).
 */

enum class ScheduleRepeatDays(val bitmask: Int) {
    MONDAY(1 shl 0),
    TUESDAY(1 shl 1),
    WEDNESDAY(1 shl 2),
    THURSDAY(1 shl 3),
    FRIDAY(1 shl 4),
    SATURDAY(1 shl 5),
    SUNDAY(1 shl 6);

    companion object {
        val WEEKDAYS = MONDAY.bitmask or TUESDAY.bitmask or WEDNESDAY.bitmask or THURSDAY.bitmask or FRIDAY.bitmask
        val WEEKENDS = SATURDAY.bitmask or SUNDAY.bitmask
        val ALL_DAYS = 0x7F
    }
}

enum class LockReason {
    NONE,
    DAILY_LIMIT_EXCEEDED,
    SCHEDULED_BEDTIME,
    SCHEDULED_SCHOOL_TIME,
    GEOFENCE_RESTRICTION,
    INSTANT_MANUAL_BLOCK
}

data class TimeWindow(
    val id: String,
    val name: String,
    val startTime: LocalTime,
    val endTime: LocalTime,
    val activeDaysBitmask: Int,
    val associatedGeofenceId: String? = null,
    val isEnabled: Boolean = true
) {
    fun isActiveAt(dateTime: LocalDateTime, currentGeofenceId: String? = null): Boolean {
        if (!isEnabled) return false

        // 1. Check Day of Week
        val dayBit = 1 shl (dateTime.dayOfWeek.value - 1)
        if ((activeDaysBitmask and dayBit) == 0) return false

        // 2. Check Geofence constraint if bound
        if (associatedGeofenceId != null && associatedGeofenceId != currentGeofenceId) {
            return false
        }

        // 3. Check Time Interval (supports overnight intervals, e.g. 21:00 to 07:00)
        val currentLocalTime = dateTime.toLocalTime()
        return if (startTime.isBefore(endTime)) {
            !currentLocalTime.isBefore(startTime) && currentLocalTime.isBefore(endTime)
        } else {
            // Crosses midnight
            !currentLocalTime.isBefore(startTime) || currentLocalTime.isBefore(endTime)
        }
    }
}

data class DailyScreenQuota(
    val dayOfWeek: DayOfWeek,
    val allowedMinutes: Int, // e.g. 120 minutes on weekdays, 240 on weekends
    val bonusMinutesApproved: Int = 0
)

data class ScreenTimeState(
    val childId: String,
    val date: LocalDate,
    val totalScreenSecondsUsed: Long,
    val isInstantBlocked: Boolean,
    val dailyLimitMinutes: Int,
    val bonusMinutes: Int,
    val activeLockReason: LockReason
)

class FamiSafeScreenTimeEngine {

    private val scheduleWindows = mutableListOf<TimeWindow>()
    private val dailyQuotas = mutableMapOf<DayOfWeek, DailyScreenQuota>()
    private var instantBlockActive: Boolean = false
    private var grantedBonusMinutes: Int = 0

    fun setInstantBlock(active: Boolean) {
        this.instantBlockActive = active
    }

    fun configureSchedule(window: TimeWindow) {
        scheduleWindows.removeAll { it.id == window.id }
        scheduleWindows.add(window)
    }

    fun configureDailyQuota(quota: DailyScreenQuota) {
        dailyQuotas[quota.dayOfWeek] = quota
    }

    fun approveExtensionRequest(requestedMinutes: Int) {
        grantedBonusMinutes += requestedMinutes
    }

    fun resetDailyBonus() {
        grantedBonusMinutes = 0
    }

    /**
     * Evaluates lock state in O(1) time complexity every time phone screen turns on
     * or foreground app polling ticks.
     */
    fun evaluateLockStatus(
        currentDateTime: LocalDateTime,
        usedScreenTimeSecondsToday: Long,
        currentGeofenceId: String? = null
    ): LockReason {
        // Rule 1: High Priority Instant Manual Override
        if (instantBlockActive) {
            return LockReason.INSTANT_MANUAL_BLOCK
        }

        // Rule 2: Active Scheduled Bedtime / School Time Windows
        for (window in scheduleWindows) {
            if (window.isActiveAt(currentDateTime, currentGeofenceId)) {
                return if (window.name.contains("Bed", ignoreCase = true)) {
                    LockReason.SCHEDULED_BEDTIME
                } else if (window.associatedGeofenceId != null) {
                    LockReason.GEOFENCE_RESTRICTION
                } else {
                    LockReason.SCHEDULED_SCHOOL_TIME
                }
            }
        }

        // Rule 3: Daily Screen Time Quota
        val quota = dailyQuotas[currentDateTime.dayOfWeek]?.allowedMinutes ?: 120
        val totalAllowedSeconds = (quota + grantedBonusMinutes) * 60L

        if (usedScreenTimeSecondsToday >= totalAllowedSeconds) {
            return LockReason.DAILY_LIMIT_EXCEEDED
        }

        return LockReason.NONE
    }

    /**
     * Calculates remaining screen time in seconds before enforcement lock triggers.
     */
    fun calculateRemainingSeconds(
        currentDateTime: LocalDateTime,
        usedScreenTimeSecondsToday: Long
    ): Long {
        val quota = dailyQuotas[currentDateTime.dayOfWeek]?.allowedMinutes ?: 120
        val totalAllowedSeconds = (quota + grantedBonusMinutes) * 60L
        val remainingDaily = (totalAllowedSeconds - usedScreenTimeSecondsToday).coerceAtLeast(0)

        // Check if any schedule window starts sooner than remaining daily time
        val nextWindowStartMinutes = scheduleWindows
            .filter { it.isEnabled }
            .mapNotNull { window ->
                val now = currentDateTime.toLocalTime()
                if (window.startTime.isAfter(now)) {
                    ChronoUnit.SECONDS.between(now, window.startTime)
                } else null
            }.minOrNull() ?: Long.MAX_VALUE

        return minOf(remainingDaily, nextWindowStartMinutes)
    }
}
