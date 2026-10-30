package com.familyos.education.quizlet.engine

import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.math.roundToInt

/**
 * محرك تتبع الإتقان ومؤشرات التحصيل المعرفي في Quizlet (Learning Mastery Tracking Engine)
 *
 * مستخرج ومبني استناداً إلى كود Quizlet في:
 * `com.quizlet.features.learn` و `com.quizlet.features.progress` و `com.quizlet.studiablemodels`
 *
 * يوفر هذا المحرك:
 * 1. تصنيف البطاقات الثلاثي: غير مدروسة (UNSEEN)، قيد التعلم (STILL_LEARNING)، ومتقنة (MASTERED).
 * 2. احتساب نسبة الإتقان الكلية للمجموعة وفق أوزان استقرار الذاكرة.
 * 3. حصر البطاقات المستحقة للمراجعة اليوم (Due for Review) وفق فواصل التكرار.
 * 4. تقدير الوقت المتوقع للوصول إلى نسبة إتقان 100%.
 */

enum class CardMasteryStatus {
    UNSEEN,         // بطاقة جديدة لم يفتحها الطالب بعد
    STILL_LEARNING, // تمت مراجعتها مرة واحدة أو حدث فيها خطأ حديثاً (تحتاج تثبيت)
    MASTERED        // تمت الإجابة عليها مرتين متتاليتين بصورة صحيحة وبفاصل زمني كافٍ
}

data class CardProgressRecord(
    val cardId: String,
    val setId: String,
    val status: CardMasteryStatus = CardMasteryStatus.UNSEEN,
    val consecutiveCorrect: Int = 0,
    val totalReviews: Int = 0,
    val totalMistakes: Int = 0,
    val isStarred: Boolean = false,
    val lastReviewedAt: Instant? = null,
    val nextReviewDueAt: Instant? = null
)

data class SetMasteryOverview(
    val setId: String,
    val totalCards: Int,
    val unseenCount: Int,
    val stillLearningCount: Int,
    val masteredCount: Int,
    val starredCount: Int,
    val masteryPercentage: Double,          // نسبة الإتقان الإجمالية (0.0% - 100.0%)
    val dueForReviewCount: Int,             // عدد البطاقات التي حان وقت مراجعتها الآن
    val estimatedMinutesToComplete: Int,    // الزمن المقدر للوصول إلى إتقان 100%
    val isFullyMastered: Boolean
)

class LearningMasteryTrackingEngine {

    companion object {
        const val AVERAGE_SECONDS_PER_CARD_REVIEW = 8.0 // متوسط زمن مراجعة البطاقة الواحدة
        const val MASTERY_WEIGHT_STILL_LEARNING = 0.40  // وزن البطاقة قيد التعلم في نسبة الإتقان
        const val MASTERY_WEIGHT_MASTERED = 1.00        // وزن البطاقة المتقنة
    }

    /**
     * تحديث حالة إتقان بطاقة فردية بناءً على نتيجة الجلسة
     */
    fun updateCardStatus(
        current: CardProgressRecord,
        isCorrect: Boolean,
        now: Instant = Instant.now()
    ): CardProgressRecord {
        val totalReviews = current.totalReviews + 1

        return if (isCorrect) {
            val consecutive = current.consecutiveCorrect + 1
            val newStatus = when {
                consecutive >= 2 -> CardMasteryStatus.MASTERED
                else -> CardMasteryStatus.STILL_LEARNING
            }
            // جدولة المراجعة القادمة: يوم واحد للتعلم، 3 أيام فما فوق للإتقان
            val intervalDays = if (newStatus == CardMasteryStatus.MASTERED) 3L else 1L
            val nextDue = now.plus(intervalDays, ChronoUnit.DAYS)

            current.copy(
                status = newStatus,
                consecutiveCorrect = consecutive,
                totalReviews = totalReviews,
                lastReviewedAt = now,
                nextReviewDueAt = nextDue
            )
        } else {
            // الخطأ يُرجع البطاقة دائماً لحالة STILL_LEARNING وتصفير العداد المتتالي
            val totalMistakes = current.totalMistakes + 1
            val nextDue = now.plus(4, ChronoUnit.HOURS) // مراجعة فورية خلال ساعات

            current.copy(
                status = CardMasteryStatus.STILL_LEARNING,
                consecutiveCorrect = 0,
                totalReviews = totalReviews,
                totalMistakes = totalMistakes,
                lastReviewedAt = now,
                nextReviewDueAt = nextDue
            )
        }
    }

    /**
     * احتساب التقرير الشامل لتقدم المجموعة الدراسية
     */
    fun computeSetMastery(
        setId: String,
        cards: List<CardProgressRecord>,
        currentTime: Instant = Instant.now()
    ): SetMasteryOverview {
        val total = cards.size
        if (total == 0) {
            return SetMasteryOverview(
                setId = setId,
                totalCards = 0,
                unseenCount = 0,
                stillLearningCount = 0,
                masteredCount = 0,
                starredCount = 0,
                masteryPercentage = 0.0,
                dueForReviewCount = 0,
                estimatedMinutesToComplete = 0,
                isFullyMastered = false
            )
        }

        val unseen = cards.count { it.status == CardMasteryStatus.UNSEEN }
        val stillLearning = cards.count { it.status == CardMasteryStatus.STILL_LEARNING }
        val mastered = cards.count { it.status == CardMasteryStatus.MASTERED }
        val starred = cards.count { it.isStarred }

        // معادلة Quizlet لحساب نسبة الإتقان:
        // Mastery % = ((Mastered * 1.0) + (StillLearning * 0.4)) / TotalCards * 100
        val weightedScore = (mastered * MASTERY_WEIGHT_MASTERED) + (stillLearning * MASTERY_WEIGHT_STILL_LEARNING)
        val rawPercentage = (weightedScore / total) * 100.0
        val roundedPercentage = (rawPercentage * 10.0).roundToInt() / 10.0

        // حصر البطاقات المستحقة للمراجعة الآن
        val dueCount = cards.count { card ->
            card.nextReviewDueAt != null && card.nextReviewDueAt.isBefore(currentTime)
        }

        // تقدير الوقت المطلوب لإنهاء المجموعة:
        // كل بطاقة جديدة تحتاج في المتوسط 3 مراجعات، والبطاقة قيد التعلم تحتاج مراجعتين
        val remainingReviewsNeeded = (unseen * 3) + (stillLearning * 2)
        val estimatedTotalSeconds = remainingReviewsNeeded * AVERAGE_SECONDS_PER_CARD_REVIEW
        val estimatedMinutes = kotlin.math.ceil(estimatedTotalSeconds / 60.0).toInt()

        return SetMasteryOverview(
            setId = setId,
            totalCards = total,
            unseenCount = unseen,
            stillLearningCount = stillLearning,
            masteredCount = mastered,
            starredCount = starred,
            masteryPercentage = roundedPercentage,
            dueForReviewCount = dueCount,
            estimatedMinutesToComplete = estimatedMinutes,
            isFullyMastered = (mastered == total)
        )
    }
}
