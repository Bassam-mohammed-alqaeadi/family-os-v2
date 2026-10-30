---
id: S1-06
title: نموذج البيانات والمخططات — المهام والتقويم المشترك
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-06/00-analysis, D-005, D-012, D-020, D-021]
last_updated: 2026-10-30
---
# S1-06: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-06 — tasks-and-calendar`  
> **البيئة المعمارية:** خادم TypeScript (PostgreSQL مع RLS بحسب D-005 و D-021) + ذاكرة Redis الساخنة لمهام اليوم + تطبيق Flutter العميل (Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/familywall/05_data_models_and_schemas/local_db_schema.sql]` (جداول التقويم iCalendar والمهام المتكررة).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema - RFC 5545)

تُعزل الجداول ضمن المخطط المعماري `calendar_tasks.*` مع تفعيل سياسة RLS الصارمة:

```sql
-- 1. جدول أحداث ومواعيد التقويم العائلي (Calendar Events)
CREATE TABLE calendar_tasks.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    title_ar VARCHAR(120) NOT NULL,
    description_ar TEXT,
    location_text VARCHAR(150),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    rrule VARCHAR(255), -- قاعدة التكرار القياسية RFC 5545 (مثل: FREQ=WEEKLY;BYDAY=SU)
    assigned_user_id UUID REFERENCES identity.users(id) ON DELETE SET NULL, -- فارغ = لكامل العائلة
    created_by_user_id UUID NOT NULL REFERENCES identity.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_family_time ON calendar_tasks.events(family_id, start_time, end_time);

-- 2. جدول مهام الأسرة والواجبات المدرسية (Family Tasks)
CREATE TABLE calendar_tasks.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    title_ar VARCHAR(150) NOT NULL,
    description_ar TEXT,
    assigned_user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    reward_stars INT NOT NULL DEFAULT 0 CHECK (reward_stars >= 0), -- النقاط الممنوحة في S1-05
    due_date DATE NOT NULL,
    due_time TIME,
    rrule VARCHAR(255), -- لتكرار المهمة يومياً أو في أيام الدراسة
    category VARCHAR(30) NOT NULL DEFAULT 'HOME', -- 'HOME', 'SCHOOL', 'PRAYER_QURAN', 'SELF_CARE'
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SUBMITTED_BY_CHILD', 'APPROVED', 'CANCELLED'
    submitted_at TIMESTAMPTZ,
    approved_by_user_id UUID REFERENCES identity.users(id),
    approved_at TIMESTAMPTZ,
    created_by_user_id UUID NOT NULL REFERENCES identity.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_family_due ON calendar_tasks.tasks(family_id, due_date, status);
CREATE INDEX idx_tasks_assigned_user ON calendar_tasks.tasks(assigned_user_id, status);

-- 3. جدول بنود قائمة الفحص الفرعية داخل المهمة (Task Checklists)
CREATE TABLE calendar_tasks.task_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES calendar_tasks.tasks(id) ON DELETE CASCADE,
    item_title_ar VARCHAR(150) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order SMALLINT NOT NULL DEFAULT 1
);
```

---

## 2. بنية الذاكرة الساخنة في Redis (Today's Tasks & Events Cache)

- **المفتاح:** `family:{familyId}:today_brief:{dateStr}`
- **البيانات السريعة:**
```json
{
  "date": "2026-10-30",
  "hijri_date": "1448-04-20",
  "events_count": 2,
  "tasks": {
    "total": 6,
    "completed": 4,
    "pending_approval": 1,
    "todo": 1
  }
}
```

---

## 3. مخطط التخزين المحلي في Drift لتطبيق Flutter

```dart
// جدول المهام المحلي في Drift للعمل دون اتصال
class LocalTasksTable extends Table {
  TextColumn get taskId => text()();
  TextColumn get familyId => text()();
  TextColumn get titleAr => text()();
  TextColumn get assignedUserId => text()();
  IntColumn get rewardStars => integer()();
  DateTimeColumn get dueDate => dateTime()();
  TextColumn get category => text()();
  TextColumn get status => text()(); // 'PENDING', 'SUBMITTED_BY_CHILD', 'APPROVED'
  DateTimeColumn get lastUpdated => dateTime()();

  @override
  Set<Column> get primaryKey => {taskId};
}

// جدول أحداث التقويم المحلي في Drift
class LocalEventsTable extends Table {
  TextColumn get eventId => text()();
  TextColumn get familyId => text()();
  TextColumn get titleAr => text()();
  DateTimeColumn get startTime => dateTime()();
  DateTimeColumn get endTime => dateTime()();
  TextColumn get assignedUserId => text().nullable()();
  TextColumn get rrule => text().nullable()();

  @override
  Set<Column> get primaryKey => {eventId};
}
```
