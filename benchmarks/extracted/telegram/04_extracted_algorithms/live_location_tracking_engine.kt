/**
 * Telegram Live Location Tracking & Proximity Alert Engine
 * 
 * المستخرج من الكود المصدري المفكك:
 * - `org.telegram.messenger.LocationController.java` (2,228 سطر / 182.4 KB)
 * 
 * المبادئ الهندسية المستخرجة:
 * 1. آلية تتبع الموقع الحي في الخلفية (Background Live Location Broadcast).
 * 2. التحكم الديناميكي في معدل تحديث GPS بناءً على سرعة الحركة ومستوى البطارية لتفادي استنزاف الطاقة.
 * 3. فلترة الضوضاء الجغرافية والاهتزاز وحساب المسافة الدنيا للتحديث (Distance Delta Threshold).
 * 4. خوارزمية تنبيهات الاقتراب (Proximity Alert Algorithm) عند دخول الأصدقاء أو أفراد العائلة في نطاق محدد.
 */

package familyos.benchmark.telegram.algorithms.location

import java.util.concurrent.ConcurrentHashMap
import kotlin.math.*

/**
 * نقطة موقع جغرافي مع السرعة والدقة والاتجاه
 */
data class GeoPoint(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val speed: Float,      // متر / ثانية
    val bearing: Float,
    val timestamp: Long
)

/**
 * جلسة مشاركة موقع مباشر مع محادثة معينة
 */
data class LiveLocationSession(
    val dialogId: Long,
    val expireDate: Long,
    var lastSentPoint: GeoPoint? = null,
    var proximityRadiusMeters: Int = 0 // 0 = معطل
)

/**
 * محرك تتبع ومشاركة الموقع الحي الموفر للطاقة (LiveLocationTrackingEngine)
 */
class LiveLocationTrackingEngine private constructor() {

    private val activeLiveSessions = ConcurrentHashMap<Long, LiveLocationSession>()
    private var isGpsActive = false
    private var currentBatteryLevel = 100 // نسبة مئوية

    /**
     * حساب الفترة الزمنية المثالية بين قراءات GPS (Dynamic Polling Interval)
     * تمنع هذه الخوارزمية استنزاف البطارية بمواءمة التردد مع سرعة المستخدم
     */
    fun calculateOptimalUpdateInterval(speedMetersPerSec: Float, batteryPercent: Int): Long {
        return when {
            // بطارية حرجة (أقل من 15%): تحديث كل 3 دقائق كحد أدنى
            batteryPercent < 15 -> 180_000L

            // المستخدم ثابت أو يمشي ببطء (< 1.5 م/ث ~ 5 كم/س): تحديث كل 60 ثانية
            speedMetersPerSec < 1.5f -> 60_000L

            // المستخدم يركض أو يقود دراجة (1.5 إلى 7 م/ث ~ 25 كم/س): تحديث كل 20 ثانية
            speedMetersPerSec in 1.5f..7.0f -> 20_000L

            // المستخدم في سيارة أو قطار (> 7 م/ث): تحديث كل 5 إلى 10 ثوانٍ
            else -> 8_000L
        }
    }

    /**
     * فحص ما إذا كانت النقطة الجديدة تستحق الإرسال للسيرفر (Distance Delta Filter)
     * لتفادي استهلاك الباندويث إذا كان المستخدم في نفس المكان
     */
    fun shouldBroadcastLocation(newPoint: GeoPoint, lastPoint: GeoPoint?): Boolean {
        if (lastPoint == null) return true

        val distanceMeters = calculateHaversineDistance(
            lastPoint.latitude, lastPoint.longitude,
            newPoint.latitude, newPoint.longitude
        )

        val timeDiffSeconds = (newPoint.timestamp - lastPoint.timestamp) / 1000

        // إرسال التحديث إذا تحرك أكثر من 15 متراً أو مر أكثر من دقيقة كاملة
        return distanceMeters >= 15.0 || timeDiffSeconds >= 60
    }

    /**
     * خوارزمية تنبيهات الاقتراب (Proximity Alert Check)
     * تحسب المسافة بين شخصين وتطلق إشعاراً عند التقارب ضمن الدائرة المحددة
     */
    fun checkProximityAlert(
        userPoint: GeoPoint,
        targetPoint: GeoPoint,
        thresholdRadiusMeters: Int,
        onTriggerAlert: (distanceMeters: Double) -> Unit
    ) {
        val distance = calculateHaversineDistance(
            userPoint.latitude, userPoint.longitude,
            targetPoint.latitude, targetPoint.longitude
        )

        if (distance <= thresholdRadiusMeters) {
            onTriggerAlert(distance)
        }
    }

    /**
     * معادلة هافرسين لحساب المسافة الدقيقة بين نقطتين على الكرة الأرضية بالأمتار
     */
    private fun calculateHaversineDistance(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Double {
        val earthRadiusMeters = 6371000.0

        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)

        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2).pow(2)

        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return earthRadiusMeters * c
    }

    companion object {
        val instance: LiveLocationTrackingEngine by lazy { LiveLocationTrackingEngine() }
    }
}
