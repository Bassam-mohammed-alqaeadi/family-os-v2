-- ============================================================================
-- مخطط قاعدة بيانات حصن المسلم (Hisnul Muslim SQLite Schema)
-- مستخلص بالهندسة العكسية من فئة:
-- [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/hisnul/data/db/HisnulDb_Impl.java L36-L40]
-- ============================================================================

CREATE TABLE IF NOT EXISTS `hisnul_categories` (
    `_id` INTEGER PRIMARY KEY,
    `id` TEXT,
    `ar` TEXT,
    `en` TEXT,
    `ms` TEXT,
    `az` TEXT,
    `de` TEXT,
    `fr` TEXT,
    `ru` TEXT
);

CREATE TABLE IF NOT EXISTS `hisnul_chapters` (
    `_id` INTEGER PRIMARY KEY,
    `category_id` INTEGER,
    `id` TEXT,
    `ar` TEXT,
    `en` TEXT,
    `ms` TEXT,
    `az` TEXT,
    `de` TEXT,
    `fr` TEXT,
    `ru` TEXT,
    FOREIGN KEY (`category_id`) REFERENCES `hisnul_categories`(`_id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `hisnul_items` (
    `_id` INTEGER PRIMARY KEY,
    `chapterid` INTEGER,
    `id` TEXT,
    `ar` TEXT,
    `trans` TEXT,
    `en` TEXT,
    `ms` TEXT,
    `az` TEXT,
    `de` TEXT,
    `fr` TEXT,
    `ru` TEXT,
    `ref` TEXT,
    FOREIGN KEY (`chapterid`) REFERENCES `hisnul_chapters`(`_id`) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS `index_hisnul_chapters_category_id` ON `hisnul_chapters` (`category_id`);
CREATE INDEX IF NOT EXISTS `index_hisnul_items_chapterid` ON `hisnul_items` (`chapterid`);
