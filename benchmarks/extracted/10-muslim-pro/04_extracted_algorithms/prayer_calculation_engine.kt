package com.familyos.core.prayer

import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import kotlin.math.*

/**
 * محرك الحساب الفلكي لمواقيت الصلاة (Prayer Calculation Engine)
 *
 * مستخلص بالهندسة العكسية من كود تطبيق Muslim Pro v11.2.9 (الفئة setSharedElementEnterTransition)
 * [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/o/setSharedElementEnterTransition.java]
 *
 * يوفر الحساب الفلكي المباشر On-Device دون الحاجة لأي اتصال بالإنترنت،
 * مع دعم كافة الطرق الـ 21 الدولية المعتمدة، والتصحيح للارتفاع عن سطح البحر،
 * وحسابات العصر بالمذهبين (الجمهور والحنفي)، وقواعد خطوط العرض العالية.
 */
enum class PrayerMethod(val fajrAngle: Double, val ishaAngleOrInterval: Double, val isIshaInterval: Boolean) {
    CUSTOM_ANGLE(16.0, 14.0, false),
    KARACHI(18.0, 18.0, false),              // جامعة العلوم الإسلامية بكراتشي (باكستان، بنغلاديش، الهند)
    ISNA(15.0, 15.0, false),                 // الجمعية الإسلامية لأمريكا الشمالية
    MWL(18.0, 17.0, false),                  // رابطة العالم الإسلامي (أوروبا وأمريكا والشرق الأقصى)
    DIYANET(18.0, 17.0, false),              // رئاسة الشؤون الدينية التركية
    MAKKAH_UMM_AL_QURA(18.5, 90.0, true),    // جامعة أم القرى بمكة المكرمة (السعودية والخليج واليمن)
    EGYPT_SURVEY(19.5, 17.5, false),         // الهيئة المصرية العامة للمساحة
    TEHRAN(17.7, 14.0, false),               // معهد الجيوفيزياء بجامعة طهران
    UOIF_FRANCE(12.0, 12.0, false),          // اتحاد المنظمات الإسلامية بفرنسا (12 درجة)
    EGYPT_BIS(20.0, 18.0, false),            // الهيئة المصرية المعدلة
    JAKIM_MALAYSIA(20.0, 18.0, false),       // مصلحة التطوير الإسلامي بماليزيا
    KEMENAG_INDONESIA(20.0, 18.0, false),    // وزارة الشؤون الدينية الإندونيسية
    MUIS_SINGAPORE(20.0, 18.0, false),       // المجلس الإسلامي السنغافوري
    FIXED_ISHA(19.5, 90.0, true),            // عشاء ثابت 90 دقيقة
    AWQAF_UAE(19.5, 90.0, true),             // الهيئة العامة للشؤون الإسلامية والأوقاف بالإمارات
    UIPTL_ITALY(0.0, 0.0, false),            // اتحاد المنظمات الإسلامية في إيطاليا
    JAFARI(16.0, 14.0, false),               // المذهب الجعفري الشيعي
    FRANCE_15(15.0, 15.0, false),            // فرنسا بزاوية 15 درجة
    ALGERIA(18.0, 17.0, false),              // وزارة الشؤون الدينية بالجزائر
    FRANCE_18(18.0, 18.0, false),            // فرنسا بزاوية 18 درجة
    TUNISIA(18.0, 18.0, false);              // وزارة الشؤون الدينية بتونس
}

enum class AsrJuristicMethod(val shadowFactor: Double) {
    STANDARD(1.0), // الشافعي، المالكي، الحنبلي (طول الظل = 1)
    HANAFI(2.0)    // الحنفي (طول الظل = 2)
}

enum class HighLatitudeRule {
    ANGLE_BASED,   // زاوية نسبية (1/60 من الليل أو الزاوية/60)
    MIDNIGHT,      // منتصف الليل
    ONE_SEVENTH    // سبع الليل الأخير
}

enum class PrayerType {
    FAJR, SUNRISE, DHUHR, ASR, MAGHRIB, ISHA
}

data class PrayerTimesResult(
    val fajr: Date,
    val sunrise: Date,
    val dhuhr: Date,
    val asr: Date,
    val maghrib: Date,
    val isha: Date
)

class PrayerCalculationEngine(
    private val method: PrayerMethod = PrayerMethod.MAKKAH_UMM_AL_QURA,
    private val asrJuristic: AsrJuristicMethod = AsrJuristicMethod.STANDARD,
    private val highLatitudeRule: HighLatitudeRule = HighLatitudeRule.MIDNIGHT,
    private val isRamadan: Boolean = false,
    private val manualOffsetsMinutes: Map<PrayerType, Int> = emptyMap()
) {

    /**
     * حساب اليوم الفلكي اليولياني (Julian Day)
     * [REF: setSharedElementEnterTransition.java L735-L745]
     */
    private fun calculateJulianDay(year: Int, month: Int, day: Int, hour: Int, minute: Int): Double {
        var y = year
        var m = month
        if (m <= 2) {
            y -= 1
            m += 12
        }
        val a = floor(y / 100.0)
        val b = 2.0 - a + floor(a / 4.0)
        return floor(365.25 * (y + 4716)) + floor(30.6001 * (m + 1)) + day + b - 1524.5 + (hour + minute / 60.0) / 24.0
    }

    /**
     * تصحيح زوايا الدوران في نطاق 0..360 درجة
     */
    private fun fixAngle(deg: Double): Double {
        val a = deg - 360.0 * floor(deg / 360.0)
        return if (a < 0.0) a + 360.0 else a
    }

    /**
     * حساب موقع الشمس (معادلة الوقت وميل الشمس Declination)
     * [REF: setSharedElementEnterTransition.java L720-L730]
     */
    private fun calculateSunCoordinates(d: Double): Pair<Double, Double> {
        val q = fixAngle(280.459 + 0.98564736 * d)
        val g = fixAngle(357.529 + 0.98560028 * d)
        val gRad = Math.toRadians(g)

        // خط الطول الحقيقي للشمس
        val lambda = fixAngle(q + 1.915 * sin(gRad) + 0.020 * sin(2.0 * gRad))
        val lambdaRad = Math.toRadians(lambda)

        // ميل دائرة البروج (Obliquity of the Ecliptic)
        val epsilon = 23.439 - 0.00000036 * d
        val epsilonRad = Math.toRadians(epsilon)

        // الميل الشمسي (Declination)
        val delta = Math.toDegrees(asin(sin(epsilonRad) * sin(lambdaRad)))

        // المطلع المستقيم (Right Ascension)
        var alpha = Math.toDegrees(atan2(cos(epsilonRad) * sin(lambdaRad), cos(lambdaRad)))
        alpha = fixAngle(alpha)

        // معادلة الوقت (Equation of Time بالدقائق مقسومة على 15 = ساعات)
        val equationOfTime = (q - alpha) / 15.0

        return Pair(delta, equationOfTime)
    }

    /**
     * حساب مواقيت الصلاة ليوم وموقع محدد
     */
    fun calculate(
        date: Date,
        latitude: Double,
        longitude: Double,
        altitudeMeters: Double = 0.0,
        timeZone: TimeZone = TimeZone.getDefault()
    ): PrayerTimesResult {
        val cal = Calendar.getInstance(timeZone).apply { time = date }
        val year = cal.get(Calendar.YEAR)
        val month = cal.get(Calendar.MONTH) + 1
        val day = cal.get(Calendar.DAY_OF_MONTH)

        // حساب الأيام الفلكية منذ مطلع عام 2000 (J2000.0)
        val jd = calculateJulianDay(year, month, day, 12, 0)
        val d = jd - 2451545.0

        val (delta, eot) = calculateSunCoordinates(d)
        val deltaRad = Math.toRadians(delta)
        val latRad = Math.toRadians(latitude)

        // زوال الشمس (منتصف النهار الفلكي / وقت الظهر)
        val timezoneOffsetHours = timeZone.getOffset(date.time) / 3600000.0
        val solarNoon = 12.0 + timezoneOffsetHours - (longitude / 15.0) - eot

        // تصحيح الارتفاع عن سطح البحر للشروق والغروب
        val altitudeDipAngle = if (altitudeMeters > 0) 0.0347 * sqrt(altitudeMeters) else 0.0
        val sunsetAngle = 0.8333 + altitudeDipAngle

        // زاوية نصف قوس النهار (Hour Angle) لزاوية محددة
        fun computeHourAngle(alphaDeg: Double): Double {
            val alphaRad = Math.toRadians(alphaDeg)
            val cosH = (-sin(alphaRad) - sin(latRad) * sin(deltaRad)) / (cos(latRad) * cos(deltaRad))
            return if (cosH < -1.0 || cosH > 1.0) {
                // تجاوز خطوط العرض العالية
                Double.NaN
            } else {
                Math.toDegrees(acos(cosH)) / 15.0
            }
        }

        // 1. وقت الشروق والغروب
        val hSunset = computeHourAngle(sunsetAngle)
        val sunriseHours = solarNoon - hSunset
        val sunsetHours = solarNoon + hSunset

        // 2. وقت الفجر
        var hFajr = computeHourAngle(method.fajrAngle)
        if (hFajr.isNaN()) {
            // معالجة خطوط العرض العالية
            val nightLength = 24.0 - (sunsetHours - sunriseHours)
            hFajr = when (highLatitudeRule) {
                HighLatitudeRule.MIDNIGHT -> (nightLength / 2.0)
                HighLatitudeRule.ONE_SEVENTH -> (nightLength / 7.0)
                HighLatitudeRule.ANGLE_BASED -> (nightLength * (method.fajrAngle / 60.0))
            }
        }
        val fajrHours = solarNoon - hFajr

        // 3. وقت الظهر (إضافة دقيقة احتياطية بعد الزوال التام)
        val dhuhrHours = solarNoon + (1.0 / 60.0)

        // 4. وقت العصر (معادلة ظل الزوال)
        val asrAngleRad = atan(1.0 / (asrJuristic.shadowFactor + tan(abs(latRad - deltaRad))))
        val cosHAsr = (sin(asrAngleRad) - sin(latRad) * sin(deltaRad)) / (cos(latRad) * cos(deltaRad))
        val hAsr = Math.toDegrees(acos(cosHAsr.coerceIn(-1.0, 1.0))) / 15.0
        val asrHours = solarNoon + hAsr

        // 5. وقت المغرب
        val maghribHours = sunsetHours

        // 6. وقت العشاء
        val ishaHours = if (method.isIshaInterval) {
            val extraMinutes = if (isRamadan && method == PrayerMethod.MAKKAH_UMM_AL_QURA) 30.0 else 0.0
            maghribHours + ((method.ishaAngleOrInterval + extraMinutes) / 60.0)
        } else {
            var hIsha = computeHourAngle(method.ishaAngleOrInterval)
            if (hIsha.isNaN()) {
                val nightLength = 24.0 - (sunsetHours - sunriseHours)
                hIsha = when (highLatitudeRule) {
                    HighLatitudeRule.MIDNIGHT -> (nightLength / 2.0)
                    HighLatitudeRule.ONE_SEVENTH -> (nightLength / 7.0)
                    HighLatitudeRule.ANGLE_BASED -> (nightLength * (method.ishaAngleOrInterval / 60.0))
                }
            }
            solarNoon + hIsha
        }

        fun hoursToDate(hours: Double, type: PrayerType): Date {
            val totalMinutes = (hours * 60.0).roundToInt() + (manualOffsetsMinutes[type] ?: 0)
            val h = (totalMinutes / 60) % 24
            val m = totalMinutes % 60
            return (cal.clone() as Calendar).apply {
                set(Calendar.HOUR_OF_DAY, h)
                set(Calendar.MINUTE, m)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }.time
        }

        return PrayerTimesResult(
            fajr = hoursToDate(fajrHours, PrayerType.FAJR),
            sunrise = hoursToDate(sunriseHours, PrayerType.SUNRISE),
            dhuhr = hoursToDate(dhuhrHours, PrayerType.DHUHR),
            asr = hoursToDate(asrHours, PrayerType.ASR),
            maghrib = hoursToDate(maghribHours, PrayerType.MAGHRIB),
            isha = hoursToDate(ishaHours, PrayerType.ISHA)
        )
    }
}
