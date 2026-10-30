-- ============================================================================
-- مخطط قاعدة بيانات القرآن الكريم وعلامات القراءة (Quran SQLite Schema)
-- مستخلص بالهندسة العكسية من فئات:
-- [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/o/handleOnBackPressed.java]
-- [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/quran/]
-- ============================================================================

CREATE TABLE IF NOT EXISTS `suras` (
    `_id` INTEGER PRIMARY KEY,
    `sura_number` INTEGER NOT NULL,
    `name_ar` TEXT NOT NULL,
    `name_en` TEXT NOT NULL,
    `name_transliteration` TEXT,
    `ayah_count` INTEGER NOT NULL,
    `revelation_type` TEXT, -- 'Meccan' أو 'Medinan'
    `page_start` INTEGER,
    `juz_start` INTEGER
);

CREATE TABLE IF NOT EXISTS `ayahs` (
    `_id` INTEGER PRIMARY KEY,
    `sura_id` INTEGER NOT NULL,
    `ayah_number` INTEGER NOT NULL,
    `text_uthmani` TEXT NOT NULL,
    `text_indopak` TEXT,
    `text_clean` TEXT NOT NULL,
    `page_number` INTEGER NOT NULL,
    `juz_number` INTEGER NOT NULL,
    `hizb_quarter` INTEGER,
    `sajdah` INTEGER DEFAULT 0,
    FOREIGN KEY (`sura_id`) REFERENCES `suras`(`_id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_bookmarks` (
    `_id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `sura_id` INTEGER NOT NULL,
    `ayah_number` INTEGER NOT NULL,
    `created_at` INTEGER NOT NULL,
    `note` TEXT,
    FOREIGN KEY (`sura_id`) REFERENCES `suras`(`_id`)
);

CREATE TABLE IF NOT EXISTS `user_highlights` (
    `_id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `sura_id` INTEGER NOT NULL,
    `ayah_number` INTEGER NOT NULL,
    `color_hex` TEXT NOT NULL,
    `created_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `reading_progress` (
    `_id` INTEGER PRIMARY KEY,
    `last_sura_id` INTEGER NOT NULL,
    `last_ayah_number` INTEGER NOT NULL,
    `last_page_number` INTEGER NOT NULL,
    `updated_at` INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `idx_ayahs_sura_ayah` ON `ayahs` (`sura_id`, `ayah_number`);
CREATE INDEX IF NOT EXISTS `idx_ayahs_page` ON `ayahs` (`page_number`);
CREATE INDEX IF NOT EXISTS `idx_ayahs_juz` ON `ayahs` (`juz_number`);
