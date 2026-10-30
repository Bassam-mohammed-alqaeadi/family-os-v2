-- ====================================================================
-- FamilyWall Reconstructed SQLite / Room Database Schema (Enriched)
-- Re-engineered for Family OS Offline-First Local Storage & Sync Engine
-- ====================================================================

-- 1. جدول أفراد العائلة وحسابات الأطفال (Family Members & Kid Profiles)
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER', -- 'PARENT', 'CHILD', 'TEEN', 'ORGANIZER'
    color_hex TEXT NOT NULL DEFAULT '#1E88E5',
    avatar_url TEXT,
    birthday TEXT,
    email TEXT,
    phone_number TEXT,
    is_kid_account INTEGER NOT NULL DEFAULT 0,
    kid_pin_hash TEXT, -- رمز PIN المكون من 4 أرقام لدخول الأطفال الصغار بدون بريد
    is_location_sharing_enabled INTEGER NOT NULL DEFAULT 1,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL
);

-- 2. جدول فعاليات ومواعيد التقويم (Calendar Events)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT,
    latitude REAL,
    longitude REAL,
    start_time INTEGER NOT NULL,
    end_time INTEGER NOT NULL,
    is_all_day INTEGER NOT NULL DEFAULT 0,
    rrule TEXT, -- قاعدة التكرار بصيغة iCalendar (e.g. FREQ=WEEKLY;INTERVAL=1;BYDAY=MO)
    color_override TEXT,
    created_by_member_id TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL
);

-- 3. جدول الربط بين الفعاليات والأعضاء (Event Member Assignments)
CREATE TABLE IF NOT EXISTS event_assigned_members (
    event_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    PRIMARY KEY (event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 4. جدول الجداول المدرسية للأبناء (School Timetables - Module timetables)
CREATE TABLE IF NOT EXISTS school_timetables (
    id TEXT PRIMARY KEY NOT NULL,
    student_member_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL, -- 1=Monday .. 7=Sunday
    period_number INTEGER NOT NULL, -- الحصة 1، 2، 3...
    subject_name TEXT NOT NULL, -- رياضيات، لغة عربية، علوم...
    room_number TEXT,
    teacher_name TEXT,
    start_time TEXT NOT NULL, -- '08:00'
    end_time TEXT NOT NULL,   -- '08:45'
    week_cycle TEXT DEFAULT 'ALL', -- 'ALL', 'WEEK_A', 'WEEK_B'
    color_hex TEXT DEFAULT '#4CAF50',
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (student_member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 5. جدول الخزنة العائلية للوثائق المشفرة (Family Document Vault - Module filer)
CREATE TABLE IF NOT EXISTS family_vault_documents (
    id TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'PASSPORT', 'VACCINE', 'INSURANCE', 'ID_CARD', 'SCHOOL'
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'PDF', 'IMAGE'
    file_size_bytes INTEGER NOT NULL,
    is_encrypted INTEGER NOT NULL DEFAULT 1,
    encryption_iv TEXT,
    belongs_to_member_id TEXT, -- الشخص صاحب الوثيقة
    expiry_date TEXT, -- تاريخ انتهاء الجواز أو التأمين
    notes TEXT,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL
);

-- 6. جدول قوائم المهام والتسوق (Family Lists)
CREATE TABLE IF NOT EXISTS family_lists (
    id TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'SHOPPING', 'TODO', 'PACKING', 'CUSTOM'
    icon_name TEXT,
    color_hex TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL
);

-- 7. جدول عناصر القوائم (List Items with Conflict-Free Fractional Indexing)
CREATE TABLE IF NOT EXISTS list_items (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT NOT NULL,
    title TEXT NOT NULL,
    quantity TEXT,
    category TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at INTEGER,
    completed_by_member_id TEXT,
    assigned_to_member_id TEXT,
    due_date INTEGER,
    position REAL NOT NULL DEFAULT 0.0, -- ترتيب كسري لمنع التعارض اللحظي أثناء السحب والإفلات
    note TEXT,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (list_id) REFERENCES family_lists(id) ON DELETE CASCADE
);

-- 8. جدول تخطيط الوجبات الأسبوعي (Meal Planner)
CREATE TABLE IF NOT EXISTS meal_plans (
    id TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL,
    plan_date TEXT NOT NULL, -- YYYY-MM-DD
    breakfast TEXT,
    lunch TEXT,
    dinner TEXT,
    snacks TEXT,
    cook_member_id TEXT,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL,
    UNIQUE (family_id, plan_date)
);

-- 9. جدول أحداث الطوارئ والبث المباشر للموقع (Emergency SOS - Module panic/shout)
CREATE TABLE IF NOT EXISTS emergency_sos_logs (
    id TEXT PRIMARY KEY NOT NULL,
    sender_member_id TEXT NOT NULL,
    triggered_at INTEGER NOT NULL,
    resolved_at INTEGER,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESOLVED', 'FALSE_ALARM'
    trigger_latitude REAL NOT NULL,
    trigger_longitude REAL NOT NULL,
    battery_level INTEGER,
    notes TEXT,
    sync_status TEXT NOT NULL DEFAULT 'PENDING'
);

-- 10. جدول مزامنة التقاويم الخارجية (External Calendar Sync - Google & Outlook)
CREATE TABLE IF NOT EXISTS external_calendar_subscriptions (
    id TEXT PRIMARY KEY NOT NULL,
    member_id TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'GOOGLE_CALENDAR', 'OUTLOOK', 'APPLE_ICAL', 'CUSTOM_URL'
    feed_url TEXT NOT NULL, -- رابط الـ webcal أو .ics
    calendar_name TEXT NOT NULL,
    color_hex TEXT DEFAULT '#78909C',
    last_synced_at INTEGER,
    sync_interval_minutes INTEGER DEFAULT 60,
    is_enabled INTEGER NOT NULL DEFAULT 1
);

-- 11. جدول المناسبات والذكرى السنوية (Birthday & Anniversary Tracker - Module bdaytracker)
CREATE TABLE IF NOT EXISTS family_milestones (
    id TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL,
    title TEXT NOT NULL,
    milestone_type TEXT NOT NULL, -- 'BIRTHDAY', 'ANNIVERSARY', 'MEMORIAL'
    event_date TEXT NOT NULL, -- MM-DD أو YYYY-MM-DD
    target_member_id TEXT,
    reminder_days_before INTEGER DEFAULT 7,
    gift_ideas_note TEXT,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED',
    updated_at INTEGER NOT NULL
);

-- مؤشرات البحث والسرعة (Indexes for High-Performance Queries)
CREATE INDEX IF NOT EXISTS idx_events_start ON events(family_id, start_time);
CREATE INDEX IF NOT EXISTS idx_timetables_student ON school_timetables(student_member_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_vault_family ON family_vault_documents(family_id, category);
CREATE INDEX IF NOT EXISTS idx_list_items_list ON list_items(list_id, is_completed, position);
CREATE INDEX IF NOT EXISTS idx_milestones_family ON family_milestones(family_id, event_date);
