/**
 * Telegram Dynamic Theme & Color Key Dispatch Engine (Reconstructed Clean Architecture)
 * 
 * المستخرج من الكود المفكك: `org.telegram.ui.ActionBar.Theme.java` (n6.java - 380.8 KB)
 * 
 * هذا الملف يوثق ويعيد بناء النواة البرمجية لمحرك السمات (Theme Engine) في Telegram:
 * 1. قاموس مفاتيح الألوان (1,778 مفتاح لوني).
 * 2. آلية ربط الخصائص البصرية بعناصر الواجهة البرمجية (ThemeDescription Array).
 * 3. التبديل اللحظي التلقائي للوضع الليلي عبر مستشعر الضوء المحيطي (Ambient Light Sensor).
 * 4. مترجم ومحلل ملفات الثيمات المخصصة (.attheme parser).
 */

package familyos.benchmark.telegram.ui.theme

import java.io.BufferedReader
import java.io.InputStream
import java.io.InputStreamReader
import java.util.concurrent.ConcurrentHashMap

/**
 * قاموس مفاتيح الألوان المعيارية المستخرجة من Theme.java
 */
object ThemeKeys {
    const val KEY_WINDOW_BACKGROUND_WHITE = "windowBackgroundWhite"
    const val KEY_WINDOW_BACKGROUND_WHITE_BLACK_TEXT = "windowBackgroundWhiteBlackText"
    const val KEY_WINDOW_BACKGROUND_WHITE_GRAY_TEXT = "windowBackgroundWhiteGrayText"
    const val KEY_ACTION_BAR_DEFAULT = "actionBarDefault"
    const val KEY_ACTION_BAR_DEFAULT_TITLE = "actionBarDefaultTitle"
    const val KEY_ACTION_BAR_DEFAULT_ICON = "actionBarDefaultIcon"
    const val KEY_ACTION_BAR_DEFAULT_SUBTITLE = "actionBarDefaultSubtitle"
    
    // محادثات ورسائل
    const val KEY_CHAT_OUT_BUBBLE = "chat_outBubble"
    const val KEY_CHAT_IN_BUBBLE = "chat_inBubble"
    const val KEY_CHAT_MESSAGE_TEXT_IN = "chat_messageTextIn"
    const val KEY_CHAT_MESSAGE_TEXT_OUT = "chat_messageTextOut"
    const val KEY_CHAT_OUT_TIME_TEXT = "chat_outTimeText"
    const val KEY_CHAT_IN_TIME_TEXT = "chat_inTimeText"
    const val KEY_CHAT_RECORD_VOICE_ACTIVE = "chat_recordVoiceActive"
    const val KEY_CHAT_WAVEFORM_IN = "chat_inAudioPerfSelected"
    const val KEY_CHAT_WAVEFORM_OUT = "chat_outAudioPerfSelected"
    
    // شارات وعدّادات
    const val KEY_CHATS_UNREAD_COUNTER = "chats_unreadCounter"
    const val KEY_CHATS_UNREAD_COUNTER_MUTED = "chats_unreadCounterMuted"
    const val KEY_CHATS_UNREAD_COUNTER_TEXT = "chats_unreadCounterText"
}

/**
 * يمثل سمة بصرية كاملة تحتوي على خريطة الألوان وخصائص التدرج
 */
data class TelegramTheme(
    val name: String,
    val isDark: Boolean,
    val defaultAccentColor: Int,
    val colorMap: ConcurrentHashMap<String, Int> = ConcurrentHashMap()
)

/**
 * واجهة تمثيل العنصر المرتبط بالثيم للتحديث اللحظي (ThemeDescription Pattern)
 */
data class ThemeDescription(
    val viewId: String,
    val colorKey: String,
    val paintMask: Int = 0,
    val onThemeUpdated: (newColor: Int) -> Unit
)

/**
 * المحرك المركزي لإدارة وتوزيع الألوان في الوقت الحقيقي (Dynamic Theme Engine)
 */
class DynamicThemeEngine private constructor() {

    private val registeredThemes = mutableMapOf<String, TelegramTheme>()
    private var currentActiveTheme: TelegramTheme
    private val activeThemeDescriptions = mutableListOf<ThemeDescription>()
    private var autoNightModeThreshold: Float = 5.0f // عتبة مستشعر اللوكس للتبديل التلقائي

    init {
        // تهيئة الثيمات الأساسية المدمجة
        val defaultLight = TelegramTheme(
            name = "Classic Light",
            isDark = false,
            defaultAccentColor = 0xFF2481CC.toInt(),
            colorMap = ConcurrentHashMap(mapOf(
                ThemeKeys.KEY_WINDOW_BACKGROUND_WHITE to 0xFFFFFFFF.toInt(),
                ThemeKeys.KEY_WINDOW_BACKGROUND_WHITE_BLACK_TEXT to 0xFF222222.toInt(),
                ThemeKeys.KEY_WINDOW_BACKGROUND_WHITE_GRAY_TEXT to 0xFF8D8D8D.toInt(),
                ThemeKeys.KEY_ACTION_BAR_DEFAULT to 0xFF527DA3.toInt(),
                ThemeKeys.KEY_ACTION_BAR_DEFAULT_TITLE to 0xFFFFFFFF.toInt(),
                ThemeKeys.KEY_CHAT_OUT_BUBBLE to 0xFFEFFDDE.toInt(),
                ThemeKeys.KEY_CHAT_IN_BUBBLE to 0xFFFFFFFF.toInt(),
                ThemeKeys.KEY_CHAT_MESSAGE_TEXT_IN to 0xFF000000.toInt(),
                ThemeKeys.KEY_CHAT_MESSAGE_TEXT_OUT to 0xFF000000.toInt(),
                ThemeKeys.KEY_CHATS_UNREAD_COUNTER to 0xFF4ECC5E.toInt(),
                ThemeKeys.KEY_CHATS_UNREAD_COUNTER_MUTED to 0xFFC6C9CC.toInt()
            ))
        )

        val darkNight = TelegramTheme(
            name = "Night Dark",
            isDark = true,
            defaultAccentColor = 0xFF64B5EF.toInt(),
            colorMap = ConcurrentHashMap(mapOf(
                ThemeKeys.KEY_WINDOW_BACKGROUND_WHITE to 0xFF18222D.toInt(),
                ThemeKeys.KEY_WINDOW_BACKGROUND_WHITE_BLACK_TEXT to 0xFFFFFFFF.toInt(),
                ThemeKeys.KEY_WINDOW_BACKGROUND_WHITE_GRAY_TEXT to 0xFF7D8B99.toInt(),
                ThemeKeys.KEY_ACTION_BAR_DEFAULT to 0xFF212D3B.toInt(),
                ThemeKeys.KEY_ACTION_BAR_DEFAULT_TITLE to 0xFFFFFFFF.toInt(),
                ThemeKeys.KEY_CHAT_OUT_BUBBLE to 0xFF2B5278.toInt(),
                ThemeKeys.KEY_CHAT_IN_BUBBLE to 0xFF18222D.toInt(),
                ThemeKeys.KEY_CHAT_MESSAGE_TEXT_IN to 0xFFFFFFFF.toInt(),
                ThemeKeys.KEY_CHAT_MESSAGE_TEXT_OUT to 0xFFFFFFFF.toInt(),
                ThemeKeys.KEY_CHATS_UNREAD_COUNTER to 0xFF4A90E2.toInt(),
                ThemeKeys.KEY_CHATS_UNREAD_COUNTER_MUTED to 0xFF566E84.toInt()
            ))
        )

        registeredThemes[defaultLight.name] = defaultLight
        registeredThemes[darkNight.name] = darkNight
        currentActiveTheme = defaultLight
    }

    /**
     * استرجاع اللون اللحظي لمفتاح معين مع آلية التراجع للقيمة الافتراضية
     */
    fun getColor(key: String): Int {
        return currentActiveTheme.colorMap[key] ?: when {
            key.contains("Text") -> if (currentActiveTheme.isDark) 0xFFFFFFFF.toInt() else 0xFF000000.toInt()
            key.contains("Background") -> if (currentActiveTheme.isDark) 0xFF121212.toInt() else 0xFFFFFFFF.toInt()
            else -> currentActiveTheme.defaultAccentColor
        }
    }

    /**
     * تسجيل عنصر واجهة برمجي لتحديثه تلقائياً عند تغيير الثيم دون إعادة بناء الشاشة
     */
    fun registerThemeDescription(description: ThemeDescription) {
        activeThemeDescriptions.add(description)
        // تطبيق اللون الحالي فوراً
        description.onThemeUpdated(getColor(description.colorKey))
    }

    /**
     * إلغاء تسجيل العناصر عند تدمير الشاشة لتفادي تسريب الذاكرة (Memory Leak Prevention)
     */
    fun unregisterThemeDescriptions(viewId: String) {
        activeThemeDescriptions.removeAll { it.viewId == viewId }
    }

    /**
     * تبديل الثيم النشط وتحديث جميع عناصر الواجهة النشطة فوراً
     */
    fun applyTheme(themeName: String) {
        val theme = registeredThemes[themeName] ?: return
        currentActiveTheme = theme

        // إشعار كافة المكونات المسجلة بالألوان الجديدة (Live Color Cascade)
        for (desc in activeThemeDescriptions) {
            val newColor = getColor(desc.colorKey)
            desc.onThemeUpdated(newColor)
        }
    }

    /**
     * معالجة قراءات مستشعر الضوء المحيطي (SensorManager Integration)
     */
    fun onAmbientLightSensorChanged(lux: Float) {
        if (lux < autoNightModeThreshold && !currentActiveTheme.isDark) {
            applyTheme("Night Dark")
        } else if (lux >= autoNightModeThreshold + 2.0f && currentActiveTheme.isDark) {
            applyTheme("Classic Light")
        }
    }

    /**
     * محلل ملفات الثيم المخصصة بتنسيق .attheme
     */
    fun parseAndLoadAttheme(inputStream: InputStream, themeName: String, isDark: Boolean): TelegramTheme {
        val customMap = ConcurrentHashMap<String, Int>()
        BufferedReader(InputStreamReader(inputStream)).use { reader ->
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                val trimmed = line?.trim() ?: continue
                if (trimmed.isEmpty() || trimmed.startsWith("//")) continue
                val parts = trimmed.split("=")
                if (parts.size == 2) {
                    val key = parts[0].trim()
                    val valueStr = parts[1].trim()
                    try {
                        val colorInt = valueStr.toLong().toInt()
                        customMap[key] = colorInt
                    } catch (_: Exception) {
                        // تجاهل الخصائص غير اللونية (مثل خلفيات الصور)
                    }
                }
            }
        }

        val customTheme = TelegramTheme(
            name = themeName,
            isDark = isDark,
            defaultAccentColor = customMap[ThemeKeys.KEY_ACTION_BAR_DEFAULT] ?: 0xFF2481CC.toInt(),
            colorMap = customMap
        )
        registeredThemes[themeName] = customTheme
        return customTheme
    }

    companion object {
        val instance: DynamicThemeEngine by lazy { DynamicThemeEngine() }
    }
}
