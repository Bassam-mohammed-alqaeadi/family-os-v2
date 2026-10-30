package com.familyos.core.prayer.scheduler

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import com.familyos.core.prayer.PrayerType
import java.util.Date

/**
 * مجدول إنذارات الأذان الدقيق ومقاومة إغلاق النظام (Azan Alarm Scheduler & Doze Keepalive)
 *
 * مستخلص بالهندسة العكسية من فئتي:
 * 1. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/o/setSharedElementEnterTransition.java L1030-L1070]
 * 2. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/PrayerTimeNotificationReceiver.java L190-L280]
 */
class AzanAlarmScheduler(private val context: Context) {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    companion object {
        const val ACTION_ADHAN = "com.familyos.prayer.ACTION_ADHAN_TRIGGER"
        const val ACTION_PRE_ADHAN = "com.familyos.prayer.ACTION_PRE_ADHAN_TRIGGER"
        const val EXTRA_PRAYER_ORDINAL = "extra_prayer_type"
        const val EXTRA_SCHEDULED_TIME = "extra_scheduled_timestamp"
        
        // كود الويك لوك لإيقاظ الشاشة في وضع السكون الكامل (FULL_WAKE_LOCK | ACQUIRE_CAUSES_WAKEUP)
        // [REF: PrayerTimeNotificationReceiver.java L191]
        const val SCREEN_WAKE_FLAGS = PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP
    }

    /**
     * جدولة موعد الأذان باستخدام أعلى مستويات الإنذار دقة في أندرويد
     * تجاوز Doze Mode و App Standby عبر setAlarmClock
     */
    fun schedulePrayerAlarm(prayerType: PrayerType, triggerTime: Date, showOnLockscreenIntent: Intent) {
        val now = System.currentTimeMillis()
        if (triggerTime.time <= now) return

        val intent = Intent(ACTION_ADHAN).apply {
            setPackage(context.packageName)
            putExtra(EXTRA_PRAYER_ORDINAL, prayerType.ordinal)
            putExtra(EXTRA_SCHEDULED_TIME, triggerTime.time)
        }

        val pendingBroadcast = PendingIntent.getBroadcast(
            context,
            prayerType.ordinal,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // إلغاء أي إنذار سابق لنفس الصلاة
        alarmManager.cancel(pendingBroadcast)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // نمط منبه الساعة AlarmClockInfo: يضمن استيقاظ المعالج حتى في أقصى درجات حفظ الطاقة
            val showIntent = PendingIntent.getActivity(
                context,
                1000 + prayerType.ordinal,
                showOnLockscreenIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            val clockInfo = AlarmManager.AlarmClockInfo(triggerTime.time, showIntent)
            alarmManager.setAlarmClock(clockInfo, pendingBroadcast)
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime.time, pendingBroadcast)
        }
    }

    /**
     * جدولة تنبيه ما قبل الأذان (Pre-Adhan Reminder، مثال: قبل 10 أو 15 دقيقة)
     */
    fun schedulePreAdhanReminder(prayerType: PrayerType, prayerTime: Date, minutesBefore: Int) {
        if (minutesBefore <= 0) return
        val preAdhanTime = prayerTime.time - (minutesBefore * 60 * 1000L)
        if (preAdhanTime <= System.currentTimeMillis()) return

        val intent = Intent(ACTION_PRE_ADHAN).apply {
            setPackage(context.packageName)
            putExtra(EXTRA_PRAYER_ORDINAL, prayerType.ordinal)
        }

        val pendingBroadcast = PendingIntent.getBroadcast(
            context,
            2000 + prayerType.ordinal,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        alarmManager.cancel(pendingBroadcast)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, preAdhanTime, pendingBroadcast)
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, preAdhanTime, pendingBroadcast)
        }
    }
}

/**
 * مستقبِل بث إنذار الأذان ومعالجة استيقاظ المعالج وتأخيرات النظام
 */
class AzanNotificationReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager

        when (action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED -> {
                // إعادة الحساب الفوري وإعادة الجدولة لكافة الصلوات عند إعادة التشغيل أو السفر
                // [REF: PrayerTimeNotificationReceiver.java L206-L235]
                rescheduleAllPrayers(context)
            }

            AzanAlarmScheduler.ACTION_ADHAN -> {
                val prayerOrdinal = intent.getIntExtra(AzanAlarmScheduler.EXTRA_PRAYER_ORDINAL, -1)
                val scheduledTime = intent.getLongExtra(AzanAlarmScheduler.EXTRA_SCHEDULED_TIME, 0L)
                val currentTime = System.currentTimeMillis()

                // كشف تأخير الإشعار بسبب تحسين البطارية الصارم في أندرويد
                // [REF: PrayerTimeNotificationReceiver.java L268-L280]
                if (scheduledTime > 0 && (currentTime - scheduledTime) >= 60_000L) {
                    showDelayedNotificationWarning(context)
                }

                // الاستحواذ على WakeLock لإضاءة الشاشة ومنع نوم المعالج أثناء تلاوة الأذان
                val wakeLock = powerManager.newWakeLock(
                    AzanAlarmScheduler.SCREEN_WAKE_FLAGS,
                    "FamilyOS:AzanAlarmWakeLock"
                )
                wakeLock.acquire(180_000L) // 3 دقائق كحد أقصى لانتهاء الأذان

                try {
                    // تشغيل خدمة الأذان / عرض الإشعار التفاعلي
                    triggerAdhanPlayback(context, prayerOrdinal)
                } finally {
                    if (wakeLock.isHeld) {
                        wakeLock.release()
                    }
                }

                // جدولة أوتوماتيكية للصلوات اللاحقة لضمان استمرارية الطابور
                rescheduleAllPrayers(context)
            }
        }
    }

    private fun rescheduleAllPrayers(context: Context) {
        // استدعاء محرك الحساب وتحديث جداول AlarmManager
    }

    private fun triggerAdhanPlayback(context: Context, prayerOrdinal: Int) {
        // تشغيل صوت المؤذن وعرض إشعار الرأس Heads-Up Notification
    }

    private fun showDelayedNotificationWarning(context: Context) {
        // تنبيه المستخدم بأن النظام تأخر في إطلاق الأذان وإرشاده لاستثناء التطبيق من تحسين البطارية
    }
}
