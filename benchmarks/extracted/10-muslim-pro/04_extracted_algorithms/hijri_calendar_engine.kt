package com.familyos.core.prayer.calendar

import java.util.Calendar
import java.util.Date
import kotlin.math.floor

/**
 * محرك التقويم الهجري والمناسبات الإسلامية وتخصيص الدول (Hijri Calendar Engine)
 *
 * مستخلص بالهندسة العكسية من فئتي:
 * 1. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/o/onCreateAnimation.java]
 * 2. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/o/onDestroyOptionsMenu.java L5265-L5280]
 * 3. يدعم القرار المعماري D-031 (تأثير ملفات الدول في الخليج واليمن).
 */
data class HijriDate(
    val year: Int,
    val month: Int,
    val day: Int,
    val monthNameAr: String,
    val monthNameEn: String,
    val holiday: IslamicHoliday? = null
)

enum class IslamicHoliday(val titleAr: String, val titleEn: String) {
    ISLAMIC_NEW_YEAR("رأس السنة الهجرية", "Islamic New Year"),
    ASHURA("عاشوراء", "Day of Ashura"),
    MAWLID_AL_NABI("المولد النبوي الشريف", "Prophet's Birthday"),
    ISRA_WAL_MIRAJ("الإسراء والمعراج", "Isra and Mi'raj"),
    MID_SHABAN("ليلة النصف من شعبان", "Mid-Sha'ban"),
    RAMADAN_START("أول أيام شهر رمضان المبارك", "Start of Ramadan"),
    LAYLAT_AL_QADR("ليلة القدر المباركة", "Laylat al-Qadr"),
    EID_AL_FITR("عيد الفطر المبارك", "Eid al-Fitr"),
    DAY_OF_ARAFAH("يوم عرفة", "Day of Arafah"),
    EID_AL_ADHA("عيد الأضحى المبارك", "Eid al-Adha")
}

class HijriCalendarEngine(
    private val countryCode: String = "SA", // رمز الدولة لتطبيق القرار D-031
    private val manualDayOffset: Int = 0    // تعديل المستخدم اليدوي (-2 .. +2 أيام)
) {

    companion object {
        val HIJRI_MONTHS_AR = listOf(
            "محرم", "صفر", "ربيع الأول", "ربيع الآخر",
            "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
            "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
        )

        val HIJRI_MONTHS_EN = listOf(
            "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
            "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
            "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
        )
    }

    /**
     * تحويل التاريخ الميلادي إلى التاريخ الهجري باستخدام الخوارزمية الفلكية المعيارية
     * مع دمج التعديلات الإقليمية بحسب الدولة (D-031)
     */
    fun convertGregorianToHijri(date: Date): HijriDate {
        val cal = Calendar.getInstance().apply {
            time = date
            // إضافة التعديل التراكمي (تعديل الدولة + التعديل اليدوي)
            val countryOffset = getCountrySpecificHijriOffset(countryCode)
            add(Calendar.DAY_OF_MONTH, countryOffset + manualDayOffset)
        }

        val y = cal.get(Calendar.YEAR)
        val m = cal.get(Calendar.MONTH) + 1
        val d = cal.get(Calendar.DAY_OF_MONTH)

        // حساب اليوم اليولياني المعدل (MJD)
        var jd = if (m <= 2) {
            val y1 = y - 1
            val m1 = m + 12
            floor(365.25 * (y1 + 4716)) + floor(30.6001 * (m1 + 1)) + d - 1524.5
        } else {
            floor(365.25 * (y + 4716)) + floor(30.6001 * (m + 1)) + d - 1524.5
        }
        val b = 2 - floor(y / 100.0) + floor(y / 400.0)
        jd += b

        // معادلة التقويم الهجري الاصطلاحي (Kuwaiti / Umm Al-Qura Algorithm)
        val l = (jd - 1948440 + 10632).toInt()
        val n = ((l - 1) / 10631).toInt()
        val l1 = l - 10631 * n + 354
        val j = (floor((10985 - l1) / 5316.0) * floor((50 * l1) / 17719.0) + floor(l1 / 5670.0) * floor((43 * l1) / 15238.0)).toInt()
        val l2 = l1 - (floor((30 - j) / 15.0) * floor((17719 * j) / 50.0) + floor(j / 16.0) * floor((15238 * j) / 43.0)).toInt() + 29
        val hijriMonth = floor((24 * l2) / 709.0).toInt()
        val hijriDay = l2 - floor((709 * hijriMonth) / 24.0).toInt()
        val hijriYear = (30 * n + j - 30).toInt()

        val safeMonth = hijriMonth.coerceIn(1, 12)
        val holiday = detectHoliday(safeMonth, hijriDay)

        return HijriDate(
            year = hijriYear,
            month = safeMonth,
            day = hijriDay,
            monthNameAr = HIJRI_MONTHS_AR[safeMonth - 1],
            monthNameEn = HIJRI_MONTHS_EN[safeMonth - 1],
            holiday = holiday
        )
    }

    /**
     * إرجاع تعديل الدولة الافتراضي بناءً على القرار D-031
     */
    private fun getCountrySpecificHijriOffset(country: String): Int {
        return when (country.uppercase()) {
            "SA" -> 0   // المملكة العربية السعودية: تقويم أم القرى هو المرجع الصفري
            "AE" -> 0   // الإمارات العربية المتحدة
            "QA" -> 0   // قطر
            "KW" -> 0   // الكويت
            "BH" -> 0   // البحرين
            "OM" -> -1  // سلطنة عمان (تعتمد الرؤية المحلية الصارمة غالباً)
            "YE" -> 0   // اليمن
            else -> 0
        }
    }

    private fun detectHoliday(month: Int, day: Int): IslamicHoliday? {
        return when (month) {
            1 -> if (day == 1) IslamicHoliday.ISLAMIC_NEW_YEAR else if (day == 10) IslamicHoliday.ASHURA else null
            3 -> if (day == 12) IslamicHoliday.MAWLID_AL_NABI else null
            7 -> if (day == 27) IslamicHoliday.ISRA_WAL_MIRAJ else null
            8 -> if (day == 15) IslamicHoliday.MID_SHABAN else null
            9 -> if (day == 1) IslamicHoliday.RAMADAN_START else if (day == 27) IslamicHoliday.LAYLAT_AL_QADR else null
            10 -> if (day in 1..3) IslamicHoliday.EID_AL_FITR else null
            12 -> if (day == 9) IslamicHoliday.DAY_OF_ARAFAH else if (day in 10..13) IslamicHoliday.EID_AL_ADHA else null
            else -> null
        }
    }
}
