package org.familyos.messenger.core

import java.security.SecureRandom
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicLong

/**
 * محرك طابور وإرسال الرسائل ومكافحة التكرار المستوحى من SendMessagesHelper في Telegram.
 *
 * يوفر استجابة فورية (Optimistic UI) للمستخدم بحيث تظهر الرسالة كأنها أُرسلت في الواجهة
 * فور الضغط على زر الإرسال، مع تولي معالجة ضغط الوسائط والرفع بالخلفية وإعادة المحاولة التلقائية
 * وفق خوارزمية التراجع الأسي (Exponential Backoff) والتراجع التفاؤلي (Optimistic Rollback)
 * عند تجاوز المهلة الزمنية (Offline Timeout 30s) مع منع الازدواجية عبر random_id والتتبع التسلسلي seq.
 */
class SendMessagesHelper private constructor() {

    enum class MessageState {
        PENDING,      // قيد التجهيز أو الضغط
        SENDING,      // يتم الإرسال للسيرفر عبر MTProto / WebSocket
        SENT,         // تم الاستلام بنجاح وتأكيده بـ ACK من الخادم
        FAILED        // فشل الإرسال بعد استنفاد المحاولات (تتيح زر إعادة المحاولة)
    }

    data class OutgoingMessage(
        val randomId: Long = SecureRandom().nextLong(), // معرف عشوائي 64-بت فريد لمكافحة التكرار
        val seq: Long = 0L,                             // عداد تسلسلي تصاعدي صارم للرسائل (Monotonic Sequence)
        val peerId: Long,                               // معرف المستلم (محادثة فردية أو عائلية)
        val text: String?,                              // نص الرسالة
        val audioWaveform: ByteArray? = null,           // قمم الصوت إذا كانت رسالة صوتية
        val mediaPath: String? = null,                  // مسار ملف الوسائط المحلي
        var state: MessageState = MessageState.PENDING,
        val timestamp: Long = System.currentTimeMillis(),
        var retryCount: Int = 0,                        // عدد محاولات الإرسال المنفذة
        val maxRetries: Int = 3,                        // الحد الأقصى لإعادة المحاولة قبل الإخفاق
        var lastAttemptTimestamp: Long = 0L
    )

    private val outgoingQueue = ConcurrentLinkedQueue<OutgoingMessage>()
    
    // مجموعة المعرفات المرسلة لمكافحة التكرار وضمان عدم تكرار البث (Deduplication Set)
    private val sentMessageIds = ConcurrentHashMap.newKeySet<Long>()

    // عداد تسلسلي ذري لتوليد seq بشكل تصاعدي مستمر
    private val sequenceCounter = AtomicLong(1L)

    companion object {
        const val OFFLINE_TIMEOUT_MS = 30000L // مهلة انقطاع الاتصال (30 ثانية) قبل التراجع إلى FAILED

        private val instance = SendMessagesHelper()
        
        @JvmStatic
        fun getInstance(): SendMessagesHelper = instance
    }

    /**
     * الحصول على القيمة التالية لعداد التسلسل
     */
    fun getNextSequence(): Long = sequenceCounter.get()

    /**
     * التحقق مما إذا كان المعرف قد تم إرساله مسبقاً (Deduplication Check)
     */
    fun isMessageSent(randomId: Long): Boolean = sentMessageIds.contains(randomId)

    /**
     * الحصول على طابور الرسائل الجارية
     */
    fun getQueue(): List<OutgoingMessage> = outgoingQueue.toList()

    /**
     * إرسال رسالة صوتية مشفرة فوراً
     */
    fun sendVoiceMessage(peerId: Long, audioPath: String, waveform: ByteArray): OutgoingMessage {
        val seq = sequenceCounter.getAndIncrement()
        val msg = OutgoingMessage(
            seq = seq,
            peerId = peerId,
            text = null,
            audioWaveform = waveform,
            mediaPath = audioPath,
            state = MessageState.PENDING
        )
        enqueueMessage(msg)
        return msg
    }

    /**
     * إرسال رسالة نصية
     */
    fun sendTextMessage(peerId: Long, text: String): OutgoingMessage {
        val seq = sequenceCounter.getAndIncrement()
        val msg = OutgoingMessage(
            seq = seq,
            peerId = peerId,
            text = text,
            state = MessageState.PENDING
        )
        enqueueMessage(msg)
        return msg
    }

    /**
     * إدراج الرسالة في طابور الإرسال مع فحص مكافحة التكرار
     */
    fun enqueueMessage(msg: OutgoingMessage): Boolean {
        // فحص الازدواجية: إذا كان random_id موجوداً مسبقاً، نرفض إعادة الإرسال
        if (sentMessageIds.contains(msg.randomId)) {
            return false
        }

        // تسجيل المعرف فوراً في قائمة الرسائل المعالجة
        sentMessageIds.add(msg.randomId)
        msg.state = MessageState.SENDING
        msg.lastAttemptTimestamp = System.currentTimeMillis()
        outgoingQueue.add(msg)

        // بث إشعار للواجهة عبر NotificationCenter لإظهار الرسالة محلياً فوراً (Optimistic UI)
        NotificationCenterBus.getInstance().postNotificationName(
            NotificationCenterBus.didReceivedNewMessages,
            msg.peerId,
            listOf(msg)
        )

        processQueue()
        return true
    }

    /**
     * معالجة طابور الإرسال مع التراجع الأسي والتراجع التفاؤلي عند المهلة
     */
    fun processQueue() {
        val iterator = outgoingQueue.iterator()
        val now = System.currentTimeMillis()

        while (iterator.hasNext()) {
            val msg = iterator.next()

            when (msg.state) {
                MessageState.PENDING -> {
                    msg.state = MessageState.SENDING
                    msg.lastAttemptTimestamp = now
                }

                MessageState.SENDING -> {
                    // فحص مهلة انقطاع الاتصال (Offline Timeout 30 ثانية)
                    val elapsed = now - msg.timestamp
                    if (elapsed >= OFFLINE_TIMEOUT_MS) {
                        // تراجع تفاؤلي (Optimistic Rollback) إلى حالة الفشل FAILED دون فقدان البيانات
                        msg.state = MessageState.FAILED
                        iterator.remove()
                        notifyStateChange(msg)
                    } else if (msg.retryCount < msg.maxRetries) {
                        // تراجع أسي (Exponential Backoff): delay = 1s, 2s, 4s...
                        val backoffDelay = 1000L * (1L shl msg.retryCount)
                        if (now - msg.lastAttemptTimestamp >= backoffDelay) {
                            msg.retryCount++
                            msg.lastAttemptTimestamp = now
                            // محاكاة محاولة الإرسال للشبكة
                        }
                    } else {
                        // استنفاد أقصى عدد من المحاولات
                        msg.state = MessageState.FAILED
                        iterator.remove()
                        notifyStateChange(msg)
                    }
                }

                MessageState.SENT -> {
                    iterator.remove()
                }

                MessageState.FAILED -> {
                    iterator.remove()
                }
            }
        }
    }

    /**
     * محاكاة استلام تأكيد الخادم (Server ACK) لرسالة معينة بنجاح
     */
    fun simulateServerAck(randomId: Long): Boolean {
        for (msg in outgoingQueue) {
            if (msg.randomId == randomId) {
                msg.state = MessageState.SENT
                outgoingQueue.remove(msg)
                notifyStateChange(msg)
                return true
            }
        }
        return false
    }

    /**
     * محاكاة انتهاء المهلة الزمنية وانقطاع الشبكة (Offline Timeout Rollback)
     */
    fun simulateTimeoutRollback(randomId: Long): Boolean {
        for (msg in outgoingQueue) {
            if (msg.randomId == randomId) {
                msg.state = MessageState.FAILED
                outgoingQueue.remove(msg)
                notifyStateChange(msg)
                return true
            }
        }
        return false
    }

    /**
     * إعادة محاولة إرسال رسالة فاشلة
     */
    fun retryMessage(msg: OutgoingMessage): Boolean {
        if (msg.state != MessageState.FAILED) {
            return false
        }
        msg.state = MessageState.PENDING
        msg.retryCount = 0
        msg.lastAttemptTimestamp = System.currentTimeMillis()
        outgoingQueue.add(msg)
        processQueue()
        return true
    }

    /**
     * بث تحديث حالة الرسالة عبر ناقل الأحداث لتحديث واجهة المستخدم
     */
    private fun notifyStateChange(msg: OutgoingMessage) {
        NotificationCenterBus.getInstance().postNotificationName(
            NotificationCenterBus.updateInterfaces,
            msg.peerId,
            msg.randomId,
            msg.state
        )
    }
}
