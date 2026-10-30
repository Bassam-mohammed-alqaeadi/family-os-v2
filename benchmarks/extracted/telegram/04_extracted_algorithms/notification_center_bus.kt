package org.familyos.messenger.core

import java.lang.ref.WeakReference
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.atomic.AtomicInteger

/**
 * ناقل الأحداث فائق السرعة والمستوحى من NotificationCenter في تطبيق Telegram.
 *
 * صُمم هذا الناقل لتجاوز استنزاف الذاكرة عبر المراجع الضعيفة (WeakReference) لمنع تسريب
 * كائنات Activity/Fragment، ويعتمد على عداد ذري آمن تزامناً (AtomicInteger)،
 * ويضمن تسليم الإشعارات في الخيط الرئيسي (Main UI Thread Affinity) لتحديث واجهات الدردشة
 * وقوائم الرسائل اللحظية بأمان تام وسرعة 120fps.
 */
class NotificationCenterBus private constructor() {

    interface NotificationCenterDelegate {
        fun didReceivedNotification(id: Int, account: Int, vararg args: Any?)
    }

    // المعرفات الرقمية لأحداث النظام (Event IDs)
    companion object {
        const val messagesDidLoad = 1
        const val didReceivedNewMessages = 2
        const val updateInterfaces = 3
        const val dialogsNeedReload = 4
        const val recordStart = 5
        const val recordProgressChanged = 6
        const val recordStopped = 7
        const val audioPlayStateChanged = 8
        const val liveLocationUpdated = 9
        const val encryptedChatCreated = 10

        private val globalInstance = NotificationCenterBus()

        @JvmStatic
        fun getInstance(): NotificationCenterBus = globalInstance
    }

    // تخزين المراقبين باستخدام مراجع ضعيفة WeakReference لمنع تسريب الذاكرة
    private val observers = ConcurrentHashMap<Int, CopyOnWriteArrayList<WeakReference<NotificationCenterDelegate>>>()

    // عداد تزامني ذري لمنع التآكل والخلل العددي أثناء البث المتزامن
    private val broadcasting = AtomicInteger(0)

    // موجه خيط واجهة المستخدم (UI Thread Dispatcher)
    @Volatile
    private var uiExecutor: ((Runnable) -> Unit)? = null

    @Volatile
    private var mainThread: Thread = Thread.currentThread()

    /**
     * تحديد منفذ خيط الواجهة المخصص (للاستخدام مع Android Handler أو Flutter PlatformDispatcher)
     */
    fun setUiExecutor(executor: ((Runnable) -> Unit)?) {
        this.uiExecutor = executor
    }

    /**
     * تعيين خيط الواجهة الرئيسي للاختبارات ولبيئات التشغيل المختلفة
     */
    fun setMainThread(thread: Thread) {
        this.mainThread = thread
    }

    /**
     * التحقق مما إذا كان التنفيذ الحالي يجري على خيط واجهة المستخدم (Looper.getMainLooper() في Android)
     */
    fun isUiThread(): Boolean {
        // 1. فحص Android Looper في حال توفره
        try {
            val looperClass = Class.forName("android.os.Looper")
            val myLooperMethod = looperClass.getMethod("myLooper")
            val getMainLooperMethod = looperClass.getMethod("getMainLooper")
            val myLooper = myLooperMethod.invoke(null)
            val mainLooper = getMainLooperMethod.invoke(null)
            if (myLooper != null && mainLooper != null) {
                return myLooper == mainLooper
            }
        } catch (_: Throwable) {
            // Android Looper غير متوفر في بيئة JVM العادية
        }

        // 2. فحص الخيط الرئيسي بالاسم أو المرجع المباشر
        val current = Thread.currentThread()
        return current == mainThread || current.name == "main"
    }

    /**
     * إرسال مهمة للتنفيذ على خيط واجهة المستخدم
     */
    private fun runOnUiThread(action: Runnable) {
        val customExecutor = uiExecutor
        if (customExecutor != null) {
            customExecutor(action)
            return
        }

        // محاولة استخدام Android Handler على Looper.getMainLooper()
        try {
            val looperClass = Class.forName("android.os.Looper")
            val handlerClass = Class.forName("android.os.Handler")
            val getMainLooperMethod = looperClass.getMethod("getMainLooper")
            val mainLooper = getMainLooperMethod.invoke(null)
            if (mainLooper != null) {
                val handler = handlerClass.getConstructor(looperClass).newInstance(mainLooper)
                val postMethod = handlerClass.getMethod("post", Runnable::class.java)
                postMethod.invoke(handler, action)
                return
            }
        } catch (_: Throwable) {
            // بيئة JVM عادية
        }

        // في بيئة JVM دون موجه واجهة مخصص، يتم التنفيذ مباشرة
        action.run()
    }

    /**
     * تسجيل مراقب لحدث معين مع التفاف المرجع الضعيف وتطهير المراجع الميتة
     */
    fun addObserver(observer: NotificationCenterDelegate, id: Int) {
        val list = observers.computeIfAbsent(id) { CopyOnWriteArrayList() }

        // التحقق وتطهير المراجع الميتة
        var alreadyRegistered = false
        for (ref in list) {
            val existing = ref.get()
            if (existing == null) {
                list.remove(ref) // تطهير مرجع ميت تمت إزالته بواسطة GC
            } else if (existing === observer) {
                alreadyRegistered = true
            }
        }

        if (!alreadyRegistered) {
            list.add(WeakReference(observer))
        }
    }

    /**
     * إزالة مراقب لحدث معين
     */
    fun removeObserver(observer: NotificationCenterDelegate, id: Int) {
        val list = observers[id] ?: return
        for (ref in list) {
            val existing = ref.get()
            if (existing == null || existing === observer) {
                list.remove(ref)
            }
        }
    }

    /**
     * بث الحدث لجميع المراقبين المسجلين فوراً مع ضمان تسليم خيط الواجهة
     */
    fun postNotificationName(id: Int, vararg args: Any?) {
        postNotificationNameInternal(id, 0, *args)
    }

    /**
     * البث مع تحديد حساب المستخدم (لبيئات الحسابات المتعددة كأفراد الأسرة)
     */
    fun postNotificationNameInternal(id: Int, account: Int, vararg args: Any?) {
        if (!isUiThread()) {
            runOnUiThread(Runnable {
                dispatchDirect(id, account, *args)
            })
        } else {
            dispatchDirect(id, account, *args)
        }
    }

    /**
     * بث الحدث مجدولاً على خيط واجهة المستخدم حصراً (مماثل لـ postNotificationNameOnUIThread في Telegram)
     */
    fun postNotificationNameOnUIThread(id: Int, vararg args: Any?) {
        runOnUiThread(Runnable {
            dispatchDirect(id, 0, *args)
        })
    }

    /**
     * التنفيذ المباشر للبث مع التطهير التلقائي وعداد ذري آمن
     */
    private fun dispatchDirect(id: Int, account: Int, vararg args: Any?) {
        val list = observers[id] ?: return
        broadcasting.incrementAndGet()
        try {
            for (ref in list) {
                val delegate = ref.get()
                if (delegate != null) {
                    delegate.didReceivedNotification(id, account, *args)
                } else {
                    // تطهير المراقب الذي حذفه جامع القمامة GC
                    list.remove(ref)
                }
            }
        } finally {
            broadcasting.decrementAndGet()
        }
    }

    /**
     * الحصول على قيمة عداد البث الجاري (للتحقق وتفادي التسريب)
     */
    fun getBroadcastingCount(): Int = broadcasting.get()

    /**
     * الحصول على عدد المراقبين الأحياء الفعلي لحدث معين
     */
    fun getObserverCount(id: Int): Int {
        val list = observers[id] ?: return 0
        var activeCount = 0
        for (ref in list) {
            if (ref.get() != null) {
                activeCount++
            } else {
                list.remove(ref)
            }
        }
        return activeCount
    }
}
