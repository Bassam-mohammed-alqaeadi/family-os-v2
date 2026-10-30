package com.familyos.education.quizlet.engine

import java.util.Locale

/**
 * محرك المذاكرة الصوتية وتحويل النصوص إلى كلام (Text-to-Speech & Hands-Free Audio Engine)
 *
 * مستخرج ومبني استناداً إلى كود Quizlet في:
 * `com.quizlet.features.recordaudio` و `com.quizlet.features.flashcards`
 *
 * يوفر هذا المحرك:
 * 1. وضع المذاكرة بالأيدي الحرة (Hands-Free Audio Autoplay):
 *    - قراءة المصطلح باللغة المستهدفة.
 *    - فترة صمت قابلة للتهيئة (مثلاً ثانيتان) لمنح الطالب فرصة لتذكر الإجابة ذهنياً.
 *    - قراءة التعريف.
 *    - الانتقال التلقائي للبطاقة التالية.
 * 2. التحويل التلقائي بين الصوت المسجل عالي الجودة ومحرك نظام أندرويد (Google TTS Fallback).
 * 3. اكتشاف لغة النص آلياً لضبط اللكنة السليمة (مثال: الإنجليزية، العربية، الفرنسية، الإسبانية).
 */

enum class PlaybackState {
    IDLE,
    PLAYING_TERM,
    PAUSE_FOR_RECALL,
    PLAYING_DEFINITION,
    TRANSITIONING_NEXT,
    PAUSED
}

data class AudioConfig(
    val recallPauseDurationMs: Long = 2000L,
    val transitionPauseDurationMs: Long = 1000L,
    val speechRate: Float = 1.0f,
    val isAutoAdvanceEnabled: Boolean = true
)

class TextToSpeechAndAudioEngine(
    private val config: AudioConfig = AudioConfig()
) {

    private var currentState: PlaybackState = PlaybackState.IDLE
    private var currentCardIndex: Int = 0

    /**
     * تحديد كود اللغة الأنسب للنص المكتوب
     */
    fun detectLocale(text: String): Locale {
        return when {
            text.any { it in '\u0600'..'\u06FF' } -> Locale("ar")
            text.any { it in '\u4E00'..'\u9FFF' } -> Locale.SIMPLIFIED_CHINESE
            text.any { it in '\u0400'..'\u04FF' } -> Locale("ru")
            text.any { it in "éèêëàâîïôûùçÉÈÊËÀÂÎÏÔÛÙÇ" } -> Locale.FRENCH
            text.any { it in "áéíóúüñÁÉÍÓÚÜÑ" } -> Locale("es")
            text.any { it in "äöüßÄÖÜ" } -> Locale.GERMAN
            else -> Locale.ENGLISH
        }
    }

    /**
     * خطة تسلسل التشغيل الصوتي للبطاقة (Audio Execution Plan)
     */
    fun buildPlaybackSequence(card: StudiableCard): List<PlaybackStep> {
        val termLocale = detectLocale(card.term)
        val defLocale = detectLocale(card.definition)

        return listOf(
            PlaybackStep.Speak(
                text = card.term,
                locale = termLocale,
                audioUrl = card.audioUrl,
                phase = PlaybackState.PLAYING_TERM
            ),
            PlaybackStep.Silence(durationMs = config.recallPauseDurationMs),
            PlaybackStep.Speak(
                text = card.definition,
                locale = defLocale,
                audioUrl = null,
                phase = PlaybackState.PLAYING_DEFINITION
            ),
            PlaybackStep.Silence(durationMs = config.transitionPauseDurationMs),
            PlaybackStep.AdvanceCard
        )
    }

    sealed class PlaybackStep {
        data class Speak(
            val text: String,
            val locale: Locale,
            val audioUrl: String?,
            val phase: PlaybackState
        ) : PlaybackStep()

        data class Silence(val durationMs: Long) : PlaybackStep()
        object AdvanceCard : PlaybackStep()
    }
}
