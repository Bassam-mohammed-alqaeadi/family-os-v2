package com.familyos.education.quizlet.engine

import kotlin.math.max
import kotlin.math.min

/**
 * محرك التصحيح الذكي والتسامح مع الأخطاء الإملائية (Smart Grading & Fuzzy Matching Engine)
 *
 * مستخرج ومبني استناداً إلى خوارزميات Quizlet الذكية للتقييم في وضعي Write و Learn:
 * `com.quizlet.features.questiontypes` و `com.quizlet.features.oldquestiontypes`
 *
 * يدعم التسامح الذكي للغات المتعددة مع دعم فائق للغة العربية:
 * 1. تجريد التشكيل وحركات الإعراب (الفاتحة، الضمة، الكسرة، التنوين، الشدة).
 * 2. توحيد الهمزات والألف الممدودة والمقصورة والياء والتاء المربوطة.
 * 3. تجاهل علامات الترقيم والأقواس التوضيحية مثل: "الخلية (Cell)".
 * 4. حساب مسافة ليفنشتاين الموزونة (Damerau-Levenshtein Distance) للتسامح مع خطأ حرف واحد.
 */

enum class GradingVerdict {
    EXACT_MATCH,       // تطابق تام 100%
    ACCEPTED_WITH_TYPO,// مقبولة مع وجود خطأ مطبعي طفيف (تنبيه أخضر فاتح)
    OVERRIDE_REQUIRED, // قريبة جداً ولكن تحتاج مراجعة الطالب ("I was right")
    INCORRECT          // إجابة خاطئة
}

data class GradingResult(
    val verdict: GradingVerdict,
    val similarityScore: Double, // 0.0 إلى 1.0
    val normalizedUserAnswer: String,
    val normalizedExpectedAnswer: String,
    val feedbackMessage: String
)

class SmartGradingAndFuzzyMatchingEngine {

    companion object {
        // حركات التشكيل العربية
        private val ARABIC_DIACRITICS = Regex("[\\u064B-\\u0652\\u0670]")
        // علامات الترقيم والأقواس
        private val PUNCTUATION_AND_BRACKETS = Regex("[\\p{Punct}\\u060C\\u061B\\u061F]")
        // أدوات التعريف الشائعة بالإنجليزية والعربية
        private val LEADING_ARTICLES = Regex("^(the\\s+|a\\s+|an\\s+|ال)", RegexOption.IGNORE_CASE)
    }

    /**
     * تقييم إجابة الطالب مقارنة بالإجابة المتوقعة
     */
    fun grade(userAnswer: String, expectedAnswer: String): GradingResult {
        val normUser = normalizeText(userAnswer)
        val normExpected = normalizeText(expectedAnswer)

        // 1. فحص التطابق التام بعد التطبيع
        if (normUser == normExpected) {
            return GradingResult(
                verdict = GradingVerdict.EXACT_MATCH,
                similarityScore = 1.0,
                normalizedUserAnswer = normUser,
                normalizedExpectedAnswer = normExpected,
                feedbackMessage = "إجابة صحيحة تماماً!"
            )
        }

        // 2. فحص محتوى الأقواس (مثال: الإجابة الأصلية تحتوي على بدائل بين قوسين)
        val expectedWithoutBrackets = normalizeText(stripParenthesesContent(expectedAnswer))
        if (normUser == expectedWithoutBrackets && normUser.isNotEmpty()) {
            return GradingResult(
                verdict = GradingVerdict.EXACT_MATCH,
                similarityScore = 0.98,
                normalizedUserAnswer = normUser,
                normalizedExpectedAnswer = normExpected,
                feedbackMessage = "صحيحة! (تم تجاهل النص التوضيحي بين الأقواس)"
            )
        }

        // 3. حساب مسافة ليفنشتاين للتسامح مع الأخطاء المطبعية
        val distance = calculateLevenshteinDistance(normUser, normExpected)
        val maxLen = max(normUser.length, normExpected.length)
        val similarity = if (maxLen == 0) 1.0 else 1.0 - (distance.toDouble() / maxLen.toDouble())

        // معايير التسامح في Quizlet:
        // - الكلمات القصيرة (أقل من 5 أحرف): لا تسامح مع أي خطأ.
        // - الكلمات المتوسطة (5 إلى 9 أحرف): مسموح بخطأ 1 حرف.
        // - الكلمات الطويلة (10 أحرف فأكثر): مسموح بخطأ حرفين بشرط similarity >= 0.85.
        val isAllowedTypo = when {
            normExpected.length < 5 -> false
            normExpected.length in 5..9 -> distance == 1
            else -> distance <= 2 && similarity >= 0.85
        }

        return when {
            isAllowedTypo -> {
                GradingResult(
                    verdict = GradingVerdict.ACCEPTED_WITH_TYPO,
                    similarityScore = similarity,
                    normalizedUserAnswer = normUser,
                    normalizedExpectedAnswer = normExpected,
                    feedbackMessage = "إجابة مقبولة! انتبه للخطأ الإملائي الطفيف."
                )
            }
            similarity >= 0.70 -> {
                GradingResult(
                    verdict = GradingVerdict.OVERRIDE_REQUIRED,
                    similarityScore = similarity,
                    normalizedUserAnswer = normUser,
                    normalizedExpectedAnswer = normExpected,
                    feedbackMessage = "إجابة قريبة جداً! هل تعتقد أن إجابتك صحيحة؟"
                )
            }
            else -> {
                GradingResult(
                    verdict = GradingVerdict.INCORRECT,
                    similarityScore = similarity,
                    normalizedUserAnswer = normUser,
                    normalizedExpectedAnswer = normExpected,
                    feedbackMessage = "إجابة غير صحيحة. الإجابة الدقيقة هي: $expectedAnswer"
                )
            }
        }
    }

    /**
     * تطبيع وتنظيف النصوص وتجريد التشكيل وتوحيد الحروف المتشابهة
     */
    fun normalizeText(input: String): String {
        var text = input.trim().lowercase()

        // تجريد التشكيل العربي
        text = text.replace(ARABIC_DIACRITICS, "")

        // توحيد الألفات والهمزات العربية
        text = text.replace(Regex("[إأآا]"), "ا")
        text = text.replace("ة", "ه")
        text = text.replace("ى", "ي")

        // إزالة علامات الترقيم والرموز الزائدة
        text = text.replace(PUNCTUATION_AND_BRACKETS, " ")

        // ضغط المسافات المتعددة
        text = text.replace(Regex("\\s+"), " ").trim()

        return text
    }

    /**
     * إزالة النصوص الموجودة بين أقواس
     */
    private fun stripParenthesesContent(text: String): String {
        return text.replace(Regex("\\([^)]*\\)"), "").replace(Regex("\\[[^\\]]*\\]"), "")
    }

    /**
     * حساب مسافة ليفنشتاين القياسية لحساب عدد التبديلات والإضافات والحذف
     */
    private fun calculateLevenshteinDistance(s1: String, s2: String): Int {
        val dp = Array(s1.length + 1) { IntArray(s2.length + 1) }

        for (i in 0..s1.length) dp[i][0] = i
        for (j in 0..s2.length) dp[0][j] = j

        for (i in 1..s1.length) {
            for (j in 1..s2.length) {
                val cost = if (s1[i - 1] == s2[j - 1]) 0 else 1
                dp[i][j] = min(
                    min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                    dp[i - 1][j - 1] + cost
                )
            }
        }
        return dp[s1.length][s2.length]
    }
}
