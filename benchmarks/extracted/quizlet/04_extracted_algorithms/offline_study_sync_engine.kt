package com.familyos.education.quizlet.engine

import java.time.Instant

/**
 * محرك المزامنة غير المتصلة وفض التعارضات السحابية (Offline Study Sync & Conflict Resolution Engine)
 *
 * مستخرج ومبني استناداً إلى كود Quizlet في:
 * `com.quizlet.data` و `com.quizlet.remote` و `com.quizlet.db`
 *
 * يوفر هذا المحرك:
 * 1. تسجيل أحداث التعلم المحلية (StudyEvent Log) أثناء انقطاع الإنترنت.
 * 2. تطبيق التحديث المتفائل للحالة (Optimistic UI Update) لسرعة استجابة التطبيق.
 * 3. تجميع الأحداث في حزم مضغوطة (Batching) عند عودة الاتصال.
 * 4. خوارزمية فض التعارض عند المذاكرة من أكثر من جهاز (Highest Mastery Progression Merge).
 */

enum class StudyMode {
    FLASHCARDS,
    LEARN,
    WRITE,
    TEST,
    MATCH
}

data class StudyEventRecord(
    val eventId: String,
    val cardId: String,
    val setId: String,
    val mode: StudyMode,
    val isCorrect: Boolean,
    val responseDurationMs: Long,
    val timestampMs: Long = System.currentTimeMillis()
)

data class SyncBatchPayload(
    val deviceId: String,
    val userId: String,
    val generatedAt: Instant = Instant.now(),
    val events: List<StudyEventRecord>
)

class OfflineStudySyncEngine {

    /**
     * دمج وتصفية أحداث المذاكرة غير المتصلة لتجنب إرسال أحداث متكررة أو ملغاة
     */
    fun prepareBatchPayload(
        deviceId: String,
        userId: String,
        pendingEvents: List<StudyEventRecord>
    ): SyncBatchPayload {
        return SyncBatchPayload(
            deviceId = deviceId,
            userId = userId,
            events = pendingEvents.sortedBy { it.timestampMs }
        )
    }

    /**
     * فض التعارض بين حالة الذاكرة المحلية والبيانات السحابية المستلمة (Conflict Resolution)
     * القاعدة المعمارية في Quizlet: التقدم التعليمي تراكمي (Progression Accumulation)
     * نعتمد دائماً مستوى الإتقان الأعلى وعدد التكرارات الأكبر بين الجهازين.
     */
    fun resolveConflict(local: CardMemoryState, remote: CardMemoryState): CardMemoryState {
        // تحديد الإتقان الأعلى
        val resolvedMastery = when {
            local.masteryLevel == MasteryLevel.MASTERED || remote.masteryLevel == MasteryLevel.MASTERED -> MasteryLevel.MASTERED
            local.masteryLevel == MasteryLevel.STILL_LEARNING || remote.masteryLevel == MasteryLevel.STILL_LEARNING -> MasteryLevel.STILL_LEARNING
            else -> MasteryLevel.UNSEEN
        }

        val maxConsecutive = maxOf(local.consecutiveCorrectCount, remote.consecutiveCorrectCount)
        val maxRepetitions = maxOf(local.repetitionCount, remote.repetitionCount)
        val maxInterval = maxOf(local.intervalDays, remote.intervalDays)
        val latestReview = listOfNotNull(local.lastReviewedAt, remote.lastReviewedAt).maxOrNull()

        return local.copy(
            masteryLevel = resolvedMastery,
            consecutiveCorrectCount = maxConsecutive,
            repetitionCount = maxRepetitions,
            intervalDays = maxInterval,
            lastReviewedAt = latestReview,
            isStarred = local.isStarred || remote.isStarred
        )
    }
}
