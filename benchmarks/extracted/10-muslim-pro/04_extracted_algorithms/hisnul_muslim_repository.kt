package com.familyos.core.prayer.duas

/**
 * مستودع حصن المسلم والأذكار اليومية ومتابعة الورد والسلاسل
 *
 * مستخلص بالهندسة العكسية من فئات:
 * 1. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/hisnul/data/db/HisnulDb_Impl.java]
 * 2. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/hisnul/model/entities/HisnulItem.java]
 */
data class HisnulCategory(
    val id: Int,
    val identifier: String,
    val titleAr: String,
    val titleEn: String
)

data class HisnulChapter(
    val id: Int,
    val categoryId: Int,
    val identifier: String,
    val titleAr: String,
    val titleEn: String
)

data class HisnulItem(
    val id: Int,
    val chapterId: Int,
    val identifier: String,
    val arabicText: String,
    val transliteration: String,
    val translationEn: String,
    val translationAr: String?,
    val reference: String,
    val targetCount: Int = 1,
    var currentCount: Int = 0,
    var isFavorite: Boolean = false
)

data class DailyDhikrStreak(
    val dateEpochDays: Long,
    val morningDhikrCompleted: Boolean,
    val eveningDhikrCompleted: Boolean,
    val totalCount: Int,
    val streakDays: Int
)

interface HisnulMuslimRepository {
    suspend fun getCategories(): List<HisnulCategory>
    suspend fun getChaptersByCategory(categoryId: Int): List<HisnulChapter>
    suspend fun getItemsByChapter(chapterId: Int): List<HisnulItem>
    suspend fun searchItems(query: String): List<HisnulItem>
    suspend fun toggleFavorite(itemId: Int, isFavorite: Boolean)
    suspend fun recordDhikrCount(itemId: Int, countIncrement: Int): DailyDhikrStreak
}
