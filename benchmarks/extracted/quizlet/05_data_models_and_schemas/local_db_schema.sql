-- ==============================================================================
-- سكيما قاعدة البيانات المحلية لتطبيق Quizlet Android (Room / SQLite Database)
-- المسار: benchmarks/extracted/quizlet/05_data_models_and_schemas/local_db_schema.sql
-- مستخرج من حزمة: com.quizlet.db و com.quizlet.data
-- ==============================================================================

-- 1. جدول المجموعات الدراسية (Study Sets)
CREATE TABLE IF NOT EXISTS study_sets (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    word_count INTEGER NOT NULL DEFAULT 0,
    creator_id TEXT NOT NULL,
    creator_username TEXT NOT NULL,
    access_type TEXT NOT NULL DEFAULT 'PUBLIC', -- 'PUBLIC', 'PASSWORD', 'CLASS_ONLY', 'PRIVATE'
    has_images INTEGER NOT NULL DEFAULT 0,
    has_audio INTEGER NOT NULL DEFAULT 0,
    is_starred INTEGER NOT NULL DEFAULT 0,
    created_timestamp INTEGER NOT NULL,
    last_modified_timestamp INTEGER NOT NULL,
    last_studied_timestamp INTEGER,
    cached_offline INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_study_sets_creator ON study_sets(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_sets_last_studied ON study_sets(last_studied_timestamp DESC);

-- 2. جدول البطاقات والمصطلحات (Studiable Items / Flashcards)
CREATE TABLE IF NOT EXISTS studiable_items (
    id TEXT PRIMARY KEY NOT NULL,
    set_id TEXT NOT NULL,
    card_order INTEGER NOT NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    image_url TEXT,
    audio_remote_url TEXT,
    audio_local_path TEXT,
    is_starred INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(set_id) REFERENCES study_sets(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_studiable_items_set_order ON studiable_items(set_id, card_order ASC);
CREATE INDEX IF NOT EXISTS idx_studiable_items_starred ON studiable_items(set_id, is_starred);

-- 3. جدول حالة إتقان الذاكرة والتكرار المتباعد (Card Mastery & Spaced Repetition)
CREATE TABLE IF NOT EXISTS card_mastery_states (
    card_id TEXT NOT NULL,
    set_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    mastery_level TEXT NOT NULL DEFAULT 'UNSEEN', -- 'UNSEEN', 'STILL_LEARNING', 'MASTERED'
    repetition_count INTEGER NOT NULL DEFAULT 0,
    consecutive_correct INTEGER NOT NULL DEFAULT 0,
    easiness_factor REAL NOT NULL DEFAULT 2.5,
    interval_days REAL NOT NULL DEFAULT 0.0,
    last_reviewed_at INTEGER,
    next_review_due_at INTEGER NOT NULL,
    total_mistakes INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(card_id, user_id),
    FOREIGN KEY(card_id) REFERENCES studiable_items(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_card_mastery_due ON card_mastery_states(user_id, next_review_due_at ASC);
CREATE INDEX IF NOT EXISTS idx_card_mastery_level ON card_mastery_states(set_id, mastery_level);

-- 4. جدول المجلدات الدراسية (Folders)
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    set_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);

-- 5. جدول ربط المجلدات بالمجموعات (Folder Sets Cross Reference)
CREATE TABLE IF NOT EXISTS folder_sets_cross_ref (
    folder_id TEXT NOT NULL,
    set_id TEXT NOT NULL,
    added_at INTEGER NOT NULL,
    PRIMARY KEY(folder_id, set_id),
    FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY(set_id) REFERENCES study_sets(id) ON DELETE CASCADE
);

-- 6. جدول الفصول الدراسية (Classes)
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    school_name TEXT,
    teacher_id TEXT NOT NULL,
    teacher_name TEXT NOT NULL,
    member_count INTEGER NOT NULL DEFAULT 1,
    set_count INTEGER NOT NULL DEFAULT 0,
    invite_code TEXT UNIQUE,
    created_at INTEGER NOT NULL
);

-- 7. جدول أعضاء الفصل (Class Members)
CREATE TABLE IF NOT EXISTS class_members (
    class_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT', -- 'TEACHER', 'ADMIN', 'STUDENT'
    joined_at INTEGER NOT NULL,
    PRIMARY KEY(class_id, user_id),
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 8. جدول طابور أحداث المذاكرة غير المتصلة (Offline Action Queue)
CREATE TABLE IF NOT EXISTS offline_action_queue (
    event_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL,
    set_id TEXT NOT NULL,
    mode TEXT NOT NULL, -- 'FLASHCARDS', 'LEARN', 'WRITE', 'TEST', 'MATCH'
    is_correct INTEGER NOT NULL,
    response_duration_ms INTEGER NOT NULL,
    timestamp_ms INTEGER NOT NULL,
    synced_status INTEGER NOT NULL DEFAULT 0 -- 0: معلق, 1: تم الرفع
);
CREATE INDEX IF NOT EXISTS idx_offline_queue_synced ON offline_action_queue(synced_status, timestamp_ms ASC);

-- 9. جدول سلاسل التعلم اليومية (Daily Streaks)
CREATE TABLE IF NOT EXISTS daily_streaks (
    user_id TEXT PRIMARY KEY NOT NULL,
    current_streak_days INTEGER NOT NULL DEFAULT 0,
    longest_streak_days INTEGER NOT NULL DEFAULT 0,
    last_study_date TEXT NOT NULL, -- صيغة YYYY-MM-DD بالتوقيت المحلي
    streak_freeze_count INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
);
