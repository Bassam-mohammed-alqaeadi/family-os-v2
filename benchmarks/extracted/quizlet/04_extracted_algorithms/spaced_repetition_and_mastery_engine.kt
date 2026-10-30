package com.familyos.education.quizlet.engine

import java.time.Instant
import java.time.temporal.ChronoUnit
import kotlin.math.exp
import kotlin.math.max
import kotlin.math.roundToLong

/**
 * محرك التكرار المتباعد واحتساب مستويات الإتقان (Spaced Repetition & Mastery Engine)
 *
 * مستخرج ومبني استناداً إلى خوارزميات Quizlet التعليمية المدمجة في:
 * `com.quizlet.features.learn` و `com.quizlet.studiablemodels`
 *
 * يعتمد المحرك على نموذج هجين يجمع بين صناديق لايتنر (Leitner System)
 * ونموذج SuperMemo SM-2 مع منحنى النسيان لإبينغهاوس (Ebbinghaus Forgetting Curve).
 */

enum class MasteryLevel {
    UNSEEN,         // لم يُدرس بعد (الطور الأولي)
    STILL_LEARNING, // قيد التعلم (أخطأ فيه حديثاً أو تمت مراجعته مرة واحدة)
    MASTERED        // تم إتقانه (تمت الإجابة عليه مرتين متتاليتين على الأقل بشكل صحيح)
}

enum class ResponseQuality(val score: Int) {
    BLACKOUT(0),    // عجز تام عن التذكر
    INCORRECT(1),   // إجابة خاطئة
    HARD(2),        // تذكر بصعوبة بالغة وتردد
    GOOD(3),        // إجابة صحيحة مع قليل من التفكير
    EASY(4)         // إجابة فورية بدون أي تردد
}

data class CardMemoryState(
    val cardId: String,
    val setId: String,
    val masteryLevel: MasteryLevel = MasteryLevel.UNSEEN,
    val repetitionCount: Int = 0,
    val consecutiveCorrectCount: Int = 0,
    val easinessFactor: Double = 2.5, // عامل السهولة الابتدائي (SM-2 EF)
    val intervalDays: Double = 0.0,   // الفاصل الزمني بالأيام حتى المراجعة التالية
    val lastReviewedAt: Instant? = null,
    val nextReviewDueAt: Instant = Instant.now(),
    val totalMistakes: Int = 0,
    val isStarred: Boolean = false
)

class SpacedRepetitionAndMasteryEngine {

    companion object {
        const val MIN_EASINESS_FACTOR = 1.3
        const val DEFAULT_EASINESS_FACTOR = 2.5
        const val STABILITY_FACTOR = 1.2
    }

    /**
     * معالجة إجابة الطالب وتحديث حالة الذاكرة للبطاقة (State Transition)
     */
    fun processAnswer(
        currentState: CardMemoryState,
        quality: ResponseQuality,
        now: Instant = Instant.now()
    ): CardMemoryState {
        val isCorrect = quality.score >= ResponseQuality.GOOD.score

        // 1. حساب عامل السهولة الجديد (Updated Easiness Factor)
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        val q = quality.score + 1 // مقياس 1 إلى 5
        val deltaEF = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
        val newEF = max(MIN_EASINESS_FACTOR, currentState.easinessFactor + deltaEF)

        // 2. تحديث التكرار والفواصل الزمنية (Interval Calculation)
        val newConsecutive = if (isCorrect) currentState.consecutiveCorrectCount + 1 else 0
        val newMistakes = if (!isCorrect) currentState.totalMistakes + 1 else currentState.totalMistakes

        val newIntervalDays: Double = when {
            !isCorrect -> {
                // إعادة الضبط الفوري عند الخطأ للتعلم السريع في نفس الجلسة
                0.1 // مراجعة بعد ساعتين ونصف
            }
            newConsecutive == 1 -> 1.0  // مراجعة غداً
            newConsecutive == 2 -> 3.0  // مراجعة بعد 3 أيام
            else -> {
                // القانون الأسي لتكرار SM-2: I(n) = I(n-1) * EF
                currentState.intervalDays * newEF * STABILITY_FACTOR
            }
        }

        // 3. تحديد مستوى الإتقان (Mastery Status)
        val newMastery = when {
            newConsecutive >= 2 && newIntervalDays >= 3.0 -> MasteryLevel.MASTERED
            isCorrect || currentState.masteryLevel == MasteryLevel.STILL_LEARNING -> MasteryLevel.STILL_LEARNING
            else -> MasteryLevel.STILL_LEARNING
        }

        val nextDue = now.plus((newIntervalDays * 24.0 * 3600.0).roundToLong(), ChronoUnit.SECONDS)

        return currentState.copy(
            masteryLevel = newMastery,
            repetitionCount = currentState.repetitionCount + 1,
            consecutiveCorrectCount = newConsecutive,
            easinessFactor = newEF,
            intervalDays = newIntervalDays,
            lastReviewedAt = now,
            nextReviewDueAt = nextDue,
            totalMistakes = newMistakes
        )
    }

    /**
     * احتساب احتمالية الاسترجاع والتذكر الحالية وفق منحنى إبينغهاوس (Retention Probability)
     * R = e^(-t / S)
     */
    fun calculateRetentionProbability(state: CardMemoryState, now: Instant = Instant.now()): Double {
        if (state.lastReviewedAt == null || state.intervalDays <= 0.0) return 0.0
        val elapsedDays = ChronoUnit.SECONDS.between(state.lastReviewedAt, now) / (24.0 * 3600.0)
        val memoryStrength = max(0.5, state.intervalDays)
        return exp(-elapsedDays / memoryStrength).coerceIn(0.0, 1.0)
    }

    /**
     * تصنيف المجموعات الدراسية إلى دفعات مراجعة حسب الأولوية
     */
    fun prioritizeStudyBatch(
        cards: List<CardMemoryState>,
        batchSize: Int = 10,
        now: Instant = Instant.now()
    ): List<CardMemoryState> {
        return cards.sortedWith(
            compareBy<CardMemoryState> { it.masteryLevel == MasteryLevel.MASTERED } // غير المتقن أولاً
                .thenByDescending { it.isStarred }                                // المميز بنجمة أولاً
                .thenBy { it.nextReviewDueAt }                                   // الأقرب استحقاقاً
        ).take(batchSize)
    }
}
