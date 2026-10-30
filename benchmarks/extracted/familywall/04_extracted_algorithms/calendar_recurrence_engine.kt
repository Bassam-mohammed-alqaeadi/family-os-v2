package com.familyos.calendar.engine

import java.time.Duration
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

enum class Frequency {
    DAILY, WEEKLY, MONTHLY, YEARLY
}

enum class WeekDay(val value: Int) {
    MO(1), TU(2), WE(3), TH(4), FR(5), SA(6), SU(7);

    companion object {
        fun fromIsoValue(isoDayOfWeek: Int): WeekDay? =
            entries.firstOrNull { it.value == isoDayOfWeek }
    }
}

data class RecurrenceRule(
    val frequency: Frequency,
    val interval: Int = 1,
    val byDays: List<WeekDay> = emptyList(),
    val until: LocalDateTime? = null,
    val count: Int? = null,
    val exceptions: Set<LocalDate> = emptySet()
) {
    init {
        require(interval >= 1) { "Recurrence interval must be >= 1, got $interval" }
        require(count == null || count >= 1) { "Recurrence count must be >= 1 when specified" }
    }
}

data class FamilyEvent(
    val id: String,
    val title: String,
    val startDateTime: LocalDateTime,
    val endDateTime: LocalDateTime,
    val assignedMemberIds: List<String>,
    val rrule: RecurrenceRule? = null,
    val colorHex: String? = null
) {
    init {
        require(!endDateTime.isBefore(startDateTime)) {
            "Event endDateTime ($endDateTime) cannot be before startDateTime ($startDateTime)"
        }
    }
}

data class EventInstance(
    val originalEventId: String,
    val title: String,
    val instanceStart: LocalDateTime,
    val instanceEnd: LocalDateTime,
    val assignedMemberIds: List<String>,
    val colorHex: String?
)

class CalendarRecurrenceEngine {

    /**
     * حساب وتوليد نسخ الفعالية المتكررة خلال نافذة زمنية محددة (Viewport Range)
     * مع إصلاح:
     * 1. حساب عدد مرات التكرار (count) منذ تاريخ البداية الفعلي للحدث وليس من بداية النافذة المعروضة.
     * 2. احترام الفاصل الأسبوعي (interval > 1) عند تحديد أيام معينة في الأسبوع (byDays).
     * 3. تثبيت يوم البداية الأصلي في التكرار الشهري والسنوي لمنع انزلاق التاريخ بعد الأشهر القصيرة (مثل 31 يناير -> 28 فبراير -> 31 مارس).
     * 4. تضمين الفعاليات المستمرة عبر منتصف الليل التي تتقاطع مع بداية النافذة المعروضة.
     */
    fun expandOccurrences(
        event: FamilyEvent,
        rangeStart: LocalDate,
        rangeEnd: LocalDate
    ): List<EventInstance> {
        if (rangeEnd.isBefore(rangeStart)) return emptyList()

        val duration = Duration.between(event.startDateTime, event.endDateTime)
        val rangeStartDateTime = rangeStart.atStartOfDay()
        val rangeEndExclusive = rangeEnd.plusDays(1).atStartOfDay()

        val rule = event.rrule
        if (rule == null) {
            return if (overlapsRange(event.startDateTime, event.endDateTime, rangeStartDateTime, rangeEndExclusive)) {
                listOf(toInstance(event, event.startDateTime, duration))
            } else {
                emptyList()
            }
        }

        val instances = mutableListOf<EventInstance>()
        val anchorDate = event.startDateTime.toLocalDate()
        val startTime = event.startDateTime.toLocalTime()
        var totalOccurrencesCount = 0
        var step = 0L

        while (true) {
            val candidateDates: List<LocalDate> = when (rule.frequency) {
                Frequency.DAILY -> listOf(anchorDate.plusDays(step * rule.interval))
                Frequency.WEEKLY -> expandWeeklyStep(anchorDate, step, rule)
                Frequency.MONTHLY -> listOf(anchorDate.plusMonths(step * rule.interval))
                Frequency.YEARLY -> listOf(anchorDate.plusYears(step * rule.interval))
            }

            if (candidateDates.isEmpty() || candidateDates.first().isAfter(rangeEnd)) {
                break
            }

            for (candidateDate in candidateDates) {
                if (candidateDate.isBefore(anchorDate)) continue
                if (candidateDate.isAfter(rangeEnd)) return instances

                val instStart = LocalDateTime.of(candidateDate, startTime)
                if (rule.until != null && instStart.isAfter(rule.until)) {
                    return instances
                }

                if (rule.count != null && totalOccurrencesCount >= rule.count) {
                    return instances
                }

                // كل تكرار شرعي يُحسب ضمن العدد الإجمالي (count) منذ بداية الحدث
                totalOccurrencesCount++

                if (candidateDate in rule.exceptions) {
                    continue
                }

                val instEnd = instStart.plus(duration)
                if (overlapsRange(instStart, instEnd, rangeStartDateTime, rangeEndExclusive)) {
                    instances.add(toInstance(event, instStart, duration))
                }
            }

            step++
        }

        return instances
    }

    /**
     * توليد أيام الأسبوع المرشحة في دورة الأسبوع الحالية مع احترام الفاصل الزمني (interval)
     */
    private fun expandWeeklyStep(
        anchorDate: LocalDate,
        step: Long,
        rule: RecurrenceRule
    ): List<LocalDate> {
        val cycleWeekStart = anchorDate.plusWeeks(step * rule.interval)
        if (rule.byDays.isEmpty()) {
            return listOf(cycleWeekStart)
        }

        // بداية الأسبوع (الاثنين = 1) الذي يقع فيه تاريخ البداية للدورة الحالية
        val mondayOfCycleWeek = cycleWeekStart.minusDays((cycleWeekStart.dayOfWeek.value - 1).toLong())
        val sortedUniqueDays = rule.byDays.distinct().sortedBy { it.value }

        return sortedUniqueDays.map { weekDay ->
            val offsetDays = (weekDay.value - 1).toLong()
            mondayOfCycleWeek.plusDays(offsetDays)
        }.filter { !it.isBefore(anchorDate) }
    }

    private fun overlapsRange(
        instStart: LocalDateTime,
        instEnd: LocalDateTime,
        rangeStart: LocalDateTime,
        rangeEndExclusive: LocalDateTime
    ): Boolean {
        return if (instStart == instEnd) {
            !instStart.isBefore(rangeStart) && instStart.isBefore(rangeEndExclusive)
        } else {
            instStart.isBefore(rangeEndExclusive) && instEnd.isAfter(rangeStart)
        }
    }

    private fun toInstance(
        event: FamilyEvent,
        instStart: LocalDateTime,
        duration: Duration
    ): EventInstance {
        return EventInstance(
            originalEventId = event.id,
            title = event.title,
            instanceStart = instStart,
            instanceEnd = instStart.plus(duration),
            assignedMemberIds = event.assignedMemberIds,
            colorHex = event.colorHex
        )
    }

    /**
     * تلوين وتوزيع أحداث أفراد العائلة (Multi-Member Avatar / Stripe Color Assignment)
     */
    fun resolveMemberColors(
        assignedIds: List<String>,
        memberColorMap: Map<String, String>
    ): List<String> {
        return assignedIds.mapNotNull { memberColorMap[it] }
    }
}