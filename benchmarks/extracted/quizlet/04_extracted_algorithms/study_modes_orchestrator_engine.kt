package com.familyos.education.quizlet.engine

import kotlin.random.Random

/**
 * محرك تنظيم وتوليد أوضاع المذاكرة والاختبارات (Study Modes Orchestrator Engine)
 *
 * مستخرج ومبني استناداً إلى كود Quizlet في:
 * `com.quizlet.features.practicetest` و `com.quizlet.features.learn` و `com.quizlet.features.flashcards`
 *
 * يقوم هذا المحرك بما يلي:
 * 1. تقسيم المجموعات الضخمة إلى جولات تعلم صغيرة (7 إلى 10 بطاقات لكل جولة) لمنع إرهاق الطالب.
 * 2. التدرج المعرفي التكيفي (Cognitive Scaffolding): البدء بأسئلة اختيار من متعدد، ثم الانتقال للأسئلة الكتابية.
 * 3. توليد مضللات ذكية (Distractor Generation) لأسئلة الخيارات المتعددة من نفس المجموعة الدراسية.
 * 4. توليد اختبارات تجريبية متوازنة تحاكي اختبارات المدارس الحقيقية.
 */

data class StudiableCard(
    val id: String,
    val term: String,
    val definition: String,
    val imageUrl: String? = null,
    val audioUrl: String? = null,
    val isStarred: Boolean = false
)

enum class QuestionType {
    FLASHCARD_FLIP,    // بطاقة قابلة للتقليب
    MULTIPLE_CHOICE,   // اختيار من متعدد (4 خيارات)
    TRUE_OR_FALSE,     // صح أم خطأ
    WRITTEN_PROMPT,    // إجابة كتابية
    MATCHING_PAIR      // زوج مطابقة
}

data class GeneratedQuestion(
    val id: String,
    val cardId: String,
    val type: QuestionType,
    val prompt: String,
    val correctAnswer: String,
    val options: List<String> = emptyList(), // للخيارات المتعددة
    val statementIsTrue: Boolean = true,     // لأسئلة صح/خطأ
    val promptImageUrl: String? = null
)

data class StudyRound(
    val roundNumber: Int,
    val questions: List<GeneratedQuestion>,
    val totalCardsInSet: Int,
    val masteredCardsCount: Int
)

class StudyModesOrchestratorEngine {

    companion object {
        const val CARDS_PER_LEARN_ROUND = 7
    }

    /**
     * توليد جولة جديدة في وضع التعلم الذكي (Learn Mode Round Generator)
     * يطبق مبدأ التدرج: البطاقات الجديدة تبدأ كخيارات متعددة، والبطاقات المتقدمة تصبح كتابية.
     */
    fun generateLearnRound(
        activeCards: List<StudiableCard>,
        memoryStates: Map<String, CardMemoryState>,
        roundNumber: Int = 1
    ): StudyRound {
        val selectedCards = activeCards.take(CARDS_PER_LEARN_ROUND)
        val questions = selectedCards.map { card ->
            val state = memoryStates[card.id]
            val isAdvanced = (state?.consecutiveCorrectCount ?: 0) >= 1

            if (isAdvanced) {
                // سؤال كتابي للبطاقات التي أجاب عليها الطالب سابقاً
                GeneratedQuestion(
                    id = "q_write_${card.id}",
                    cardId = card.id,
                    type = QuestionType.WRITTEN_PROMPT,
                    prompt = card.definition,
                    correctAnswer = card.term,
                    promptImageUrl = card.imageUrl
                )
            } else {
                // سؤال خيارات متعددة مع 3 مضللات من باقي البطاقات
                val distractors = generateDistractors(card, activeCards, count = 3)
                val options = (distractors + card.term).shuffled()

                GeneratedQuestion(
                    id = "q_mc_${card.id}",
                    cardId = card.id,
                    type = QuestionType.MULTIPLE_CHOICE,
                    prompt = card.definition,
                    correctAnswer = card.term,
                    options = options,
                    promptImageUrl = card.imageUrl
                )
            }
        }

        val masteredCount = memoryStates.values.count { it.masteryLevel == MasteryLevel.MASTERED }
        return StudyRound(
            roundNumber = roundNumber,
            questions = questions,
            totalCardsInSet = activeCards.size,
            masteredCardsCount = masteredCount
        )
    }

    /**
     * توليد اختبار تجريبي متكامل (Practice Test Generator)
     * بنسب توزيع قياسية: 50% خيارات متعددة، 20% صح/خطأ، 30% أسئلة كتابية.
     */
    fun generatePracticeTest(
        cards: List<StudiableCard>,
        questionCount: Int = 20,
        includeWritten: Boolean = true,
        includeMultipleChoice: Boolean = true,
        includeTrueFalse: Boolean = true
    ): List<GeneratedQuestion> {
        val shuffledCards = cards.shuffled()
        val targetCount = questionCount.coerceAtMost(cards.size)
        val questions = mutableListOf<GeneratedQuestion>()

        shuffledCards.take(targetCount).forEachIndexed { index, card ->
            val qType = selectQuestionType(index, targetCount, includeWritten, includeMultipleChoice, includeTrueFalse)

            when (qType) {
                QuestionType.MULTIPLE_CHOICE -> {
                    val distractors = generateDistractors(card, cards, count = 3)
                    questions.add(
                        GeneratedQuestion(
                            id = "test_mc_${card.id}",
                            cardId = card.id,
                            type = QuestionType.MULTIPLE_CHOICE,
                            prompt = card.definition,
                            correctAnswer = card.term,
                            options = (distractors + card.term).shuffled(),
                            promptImageUrl = card.imageUrl
                        )
                    )
                }
                QuestionType.TRUE_OR_FALSE -> {
                    val isTrue = Random.nextBoolean()
                    val displayedTerm = if (isTrue) card.term else generateDistractors(card, cards, 1).firstOrNull() ?: card.term
                    questions.add(
                        GeneratedQuestion(
                            id = "test_tf_${card.id}",
                            cardId = card.id,
                            type = QuestionType.TRUE_OR_FALSE,
                            prompt = "هل هذا المصطلح يطابق التعريف التالي؟\n\"${card.definition}\" ⬅️ [$displayedTerm]",
                            correctAnswer = if (isTrue) "صح" else "خطأ",
                            options = listOf("صح", "خطأ"),
                            statementIsTrue = isTrue
                        )
                    )
                }
                QuestionType.WRITTEN_PROMPT -> {
                    questions.add(
                        GeneratedQuestion(
                            id = "test_write_${card.id}",
                            cardId = card.id,
                            type = QuestionType.WRITTEN_PROMPT,
                            prompt = card.definition,
                            correctAnswer = card.term,
                            promptImageUrl = card.imageUrl
                        )
                    )
                }
                else -> { /* لا ينطبق على الاختبار التجريبي */ }
            }
        }
        return questions
    }

    /**
     * استخراج مضللات ذكية (Distractors) من نفس المجموعة الدراسية
     */
    private fun generateDistractors(
        correctCard: StudiableCard,
        allCards: List<StudiableCard>,
        count: Int
    ): List<String> {
        return allCards
            .filter { it.id != correctCard.id && it.term.trim().isNotEmpty() }
            .shuffled()
            .take(count)
            .map { it.term }
    }

    private fun selectQuestionType(
        index: Int,
        total: Int,
        allowWrite: Boolean,
        allowMC: Boolean,
        allowTF: Boolean
    ): QuestionType {
        val ratio = index.toDouble() / total.toDouble()
        return when {
            allowMC && ratio < 0.50 -> QuestionType.MULTIPLE_CHOICE
            allowTF && ratio < 0.70 -> QuestionType.TRUE_OR_FALSE
            allowWrite -> QuestionType.WRITTEN_PROMPT
            allowMC -> QuestionType.MULTIPLE_CHOICE
            else -> QuestionType.TRUE_OR_FALSE
        }
    }
}
