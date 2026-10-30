/**
 * Telegram Forum Topics & Thread Separation Architecture
 * 
 * المستخرج من الكود المصدري المفكك:
 * - `org.telegram.messenger.TopicsController.java` (76.1 KB)
 * - `org.telegram.messenger.BotForumHelper.java` (48.5 KB)
 * 
 * المبادئ الهندسية المستخرجة:
 * 1. تحويل المجموعات الفائقة (Supergroups) إلى منتديات متعددة الغرف (Forums).
 * 2. عزل تدفق الرسائل لكل موضوع (Topic Message Stream Separation via `reply_to_top_id`).
 * 3. إدارة عدادات القراءة المستقلة، والأيقونات المخصصة، والمواضيع المثبتة (Pinned Topics).
 * 4. تطبيق القيود والصلاحيات الأبوية أو الإدارية لكل موضوع على حدة.
 */

package familyos.benchmark.telegram.algorithms.topics

import java.util.concurrent.ConcurrentHashMap

/**
 * يمثل موضوعاً (Topic) داخل منتدى المجموعة
 */
data class ForumTopic(
    val topicId: Int,           // يمثل معرف رسالة التأسيس (Root Message ID)
    val title: String,
    val iconColor: Int,
    val iconEmojiId: Long,
    var topMessageId: Int,
    var unreadCount: Int = 0,
    var isPinned: Boolean = false,
    var isClosed: Boolean = false,
    var isHidden: Boolean = false
)

/**
 * محرك إدارة المنتديات والمواضيع (ForumTopicsEngine)
 */
class ForumTopicsEngine private constructor() {

    // خريطة المواضيع لكل مجموعة: groupId -> (topicId -> ForumTopic)
    private val groupTopicsMap = ConcurrentHashMap<Long, ConcurrentHashMap<Int, ForumTopic>>()

    /**
     * إنشاء موضوع جديد داخل المجموعة
     */
    fun createTopic(
        groupId: Long,
        topicId: Int,
        title: String,
        iconColor: Int,
        iconEmojiId: Long
    ): ForumTopic {
        val topic = ForumTopic(
            topicId = topicId,
            title = title,
            iconColor = iconColor,
            iconEmojiId = iconEmojiId,
            topMessageId = topicId
        )

        val topics = groupTopicsMap.getOrPut(groupId) { ConcurrentHashMap() }
        topics[topicId] = topic
        return topic
    }

    /**
     * توجيه رسالة واردة إلى الموضوع الصحيح وتحديث عدادات القراءة
     */
    fun routeMessageToTopic(
        groupId: Long,
        messageId: Int,
        topicId: Int, // 0 = الرسائل العامة للمجموعة
        isOutgoing: Boolean
    ): Boolean {
        if (topicId == 0) return false // رسالة عامة

        val topics = groupTopicsMap[groupId] ?: return false
        val topic = topics[topicId] ?: return false

        topic.topMessageId = messageId
        if (!isOutgoing) {
            topic.unreadCount++
        }

        return true
    }

    /**
     * تصفية الرسائل وعزلها لعرض محادثة الموضوع بمفردها (Thread View)
     */
    fun filterMessagesForTopic(
        rawMessages: List<Map<String, Any>>,
        targetTopicId: Int
    ): List<Map<String, Any>> {
        return rawMessages.filter { msg ->
            val msgTopicId = (msg["topic_id"] as? Int) ?: 0
            val replyToMsgId = (msg["reply_to_top_id"] as? Int) ?: 0
            msgTopicId == targetTopicId || replyToMsgId == targetTopicId
        }
    }

    /**
     * تثبيت أو إلغاء تثبيت موضوع في قمة قائمة المواضيع
     */
    fun togglePinTopic(groupId: Long, topicId: Int, pin: Boolean): Boolean {
        val topic = groupTopicsMap[groupId]?.get(topicId) ?: return false
        topic.isPinned = pin
        return true
    }

    companion object {
        val instance: ForumTopicsEngine by lazy { ForumTopicsEngine() }
    }
}
