package com.familyos.education.quizlet.engine

import java.time.LocalDate
import java.time.Period
import java.time.format.DateTimeFormatter
import kotlin.math.floor
import kotlin.math.sqrt

/**
 * محرك السلاسل والتلعيب والمكافآت في Quizlet (Streaks & Gamification Engine)
 *
 * مستخرج ومبني استناداً إلى كود Quizlet في:
 * `com.quizlet.features.achievements` و `com.quizlet.features.streak` و `com.quizlet.data.model`
 *
 * يوفر هذا المحرك:
 * 1. حساب السلاسل اليومية (Daily Streaks) ومراقبة الاستمرارية مع مراعاة التوقيت المحلي.
 * 2. نظام درع تجميد السلسلة (Streak Freeze) لحماية أيام الغياب دون فقدان التقدم.
 * 3. نظام احتساب نقاط الخبرة (XP Points Engine) مع مضاعفات التتابع (Combos).
 * 4. نظام الشارات ومستويات التلعيب (Badges & Gamification Levels).
 */

data class StreakState(
    val userId: String,
    val currentStreak: Int = 0,
    val longestStreak: Int = 0,
    val lastStudyDate: LocalDate? = null,
    val streakFreezeCount: Int = 0,
    val totalXp: Long = 0L,
    val level: Int = 1,
    val earnedBadgeIds: Set<String> = emptySet()
)

enum class StudyActivityType(val baseXP: Int) {
    CARD_REVIEW(5),           // مراجعة بطاقة واحدة
    CARD_MASTERED(15),        // إتقان بطاقة لأول مرة
    COMPLETED_SESSION(50),    // إتمام جلسة مذاكرة كاملة
    PERFECT_TEST(150),        // اجتياز اختبار تجريبي بدرجة 100%
    MATCH_GAME_WIN(40)        // إنهاء لعبة مطابقة في وقت قياسي
}

data class StreakUpdateResult(
    val previousStreak: Int,
    val newStreak: Int,
    val streakBroken: Boolean,
    val freezeUsed: Boolean,
    val xpGained: Int,
    val totalXp: Long,
    val newLevel: Int,
    val leveledUp: Boolean,
    val newBadges: List<BadgeInfo>
)

data class BadgeInfo(
    val id: String,
    val title: String,
    val description: String,
    val iconName: String,
    val xpBonus: Int
)

class StreaksAndGamificationEngine {

    companion object {
        val DATE_FORMATTER: DateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE

        // كتالوج الشارات والإنجازات المستخرجة من Quizlet
        val BADGE_CATALOG = listOf(
            BadgeInfo("streak_3", "بداية الرحلة", "حافظت على سلسلة المذاكرة لـ 3 أيام متتالية", "ic_badge_streak_3", 100),
            BadgeInfo("streak_7", "صانع العادة", "أسبوع كامل من التعلم اليومي المستمر", "ic_badge_streak_7", 250),
            BadgeInfo("streak_30", "بطل الالتزام", "شهر كامل من المذاكرة دون انقطاع", "ic_badge_streak_30", 1000),
            BadgeInfo("streak_100", "الأسطورة المئوية", "100 يوم من الإصرار والتحصيل الأكاديمي", "ic_badge_streak_100", 5000),
            BadgeInfo("cards_50_mastered", "ذاكرة فولاذية", "أتقنت 50 مصطلحاً جديداً بنسبة 100%", "ic_badge_master_50", 300),
            BadgeInfo("perfect_test", "العلامة الكاملة", "أحرزت 100% في اختبار تجريبي تكيفي", "ic_badge_perfect_score", 200),
            BadgeInfo("speed_matcher", "سرعة البرق", "أنهيت لعبة المطابقة في أقل من 15 ثانية", "ic_badge_speed", 150)
        )
    }

    /**
     * تسجيل نشاط دراسي وحساب تحديث السلسلة ونقاط الـ XP
     */
    fun recordStudySession(
        currentState: StreakState,
        today: LocalDate = LocalDate.now(),
        activities: List<StudyActivityType>,
        comboMultiplier: Double = 1.0
    ): Pair<StreakState, StreakUpdateResult> {
        val lastDate = currentState.lastStudyDate

        var currentStreak = currentState.currentStreak
        var freezeUsed = false
        var streakBroken = false
        var freezeCount = currentState.streakFreezeCount

        if (lastDate == null) {
            // أول يوم مذاكرة في تاريخ الحساب
            currentStreak = 1
        } else {
            val daysDiff = Period.between(lastDate, today).days
            when {
                daysDiff == 0 -> {
                    // المذاكرة في نفس اليوم: لا زيادة في السلسلة ولكن يستمر احتساب الـ XP
                }
                daysDiff == 1 -> {
                    // يوم تالٍ مباشر: زيادة السلسلة بمقدار +1
                    currentStreak += 1
                }
                daysDiff == 2 && freezeCount > 0 -> {
                    // فاته يوم واحد ولديه درع تجميد: استهلاك الدرع وحفظ السلسلة
                    freezeCount -= 1
                    freezeUsed = true
                    currentStreak += 1
                }
                else -> {
                    // انقطاع السلسلة لعدم توفر دروع تجميد
                    streakBroken = true
                    currentStreak = 1
                }
            }
        }

        val longestStreak = maxOf(currentState.longestStreak, currentStreak)

        // احتساب نقاط الـ XP المكتسبة
        val baseSessionXp = activities.sumOf { it.baseXP }
        val finalSessionXp = (baseSessionXp * comboMultiplier).toInt()
        val totalXp = currentState.totalXp + finalSessionXp

        // احتساب المستوى الحالي: Level = floor(sqrt(XP / 100)) + 1
        val newLevel = calculateLevel(totalXp)
        val leveledUp = newLevel > currentState.level

        // فحص الشارات المستحقة
        val newlyEarnedBadges = mutableListOf<BadgeInfo>()
        val currentBadges = currentState.earnedBadgeIds.toMutableSet()

        if (currentStreak >= 3 && "streak_3" !in currentBadges) {
            BADGE_CATALOG.find { it.id == "streak_3" }?.let { newlyEarnedBadges.add(it); currentBadges.add(it.id) }
        }
        if (currentStreak >= 7 && "streak_7" !in currentBadges) {
            BADGE_CATALOG.find { it.id == "streak_7" }?.let { newlyEarnedBadges.add(it); currentBadges.add(it.id) }
        }
        if (currentStreak >= 30 && "streak_30" !in currentBadges) {
            BADGE_CATALOG.find { it.id == "streak_30" }?.let { newlyEarnedBadges.add(it); currentBadges.add(it.id) }
        }
        if (currentStreak >= 100 && "streak_100" !in currentBadges) {
            BADGE_CATALOG.find { it.id == "streak_100" }?.let { newlyEarnedBadges.add(it); currentBadges.add(it.id) }
        }

        // إضافة بونص الشارات لنقاط الـ XP
        val badgeXpBonus = newlyEarnedBadges.sumOf { it.xpBonus }
        val updatedTotalXp = totalXp + badgeXpBonus

        val updatedState = currentState.copy(
            currentStreak = currentStreak,
            longestStreak = longestStreak,
            lastStudyDate = today,
            streakFreezeCount = freezeCount,
            totalXp = updatedTotalXp,
            level = newLevel,
            earnedBadgeIds = currentBadges
        )

        val result = StreakUpdateResult(
            previousStreak = currentState.currentStreak,
            newStreak = currentStreak,
            streakBroken = streakBroken,
            freezeUsed = freezeUsed,
            xpGained = finalSessionXp + badgeXpBonus,
            totalXp = updatedTotalXp,
            newLevel = newLevel,
            leveledUp = leveledUp,
            newBadges = newlyEarnedBadges
        )

        return Pair(updatedState, result)
    }

    /**
     * احتساب مستوى اللاعب بناءً على دالة النمو التربيعي للـ XP
     */
    fun calculateLevel(xp: Long): Int {
        if (xp <= 0L) return 1
        return floor(sqrt(xp.toDouble() / 100.0)).toInt() + 1
    }

    /**
     * احتساب كمية الـ XP المطلوبة للوصول إلى المستوى القادم
     */
    fun xpRequiredForNextLevel(currentLevel: Int): Long {
        val nextLevel = currentLevel + 1
        return ((nextLevel - 1) * (nextLevel - 1) * 100).toLong()
    }
}
