---
id: S1-09
title: نموذج البيانات والمخططات — مركز القيادة والإعدادات
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-09/00-analysis, D-005, D-016, D-017, D-020, D-021]
last_updated: 2026-10-30
---
# S1-09: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-09 — command-center-and-settings`  
> **البيئة المعمارية:** خادم TypeScript (PostgreSQL مع عزل RLS بحسب D-005 و D-021) + ذاكرة كاش Redis للملخصات السريعة + تطبيق Flutter العميل (Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/familywall/05_data_models_and_schemas/local_db_schema.sql]` (جداول كاش اللوحة التجميعية).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema)

تُعزل الجداول ضمن المخطط المعماري `command_center.*` مع حماية RLS لبيانات كل أسرة:

```sql
-- 1. جدول تسجيل البطاقات والويدجات المعتمدة في المنظومة (Widget Catalog)
CREATE TABLE command_center.widget_catalog (
    widget_id VARCHAR(50) PRIMARY KEY, -- مثل: 'widget.location_mini', 'widget.tasks_today'
    source_system_id VARCHAR(10) NOT NULL, -- 'S1-07', 'S1-06', 'S1-05', إلخ
    title_ar VARCHAR(80) NOT NULL,
    description_ar TEXT,
    min_role_level VARCHAR(10) NOT NULL DEFAULT 'L1', -- أدنى دور مؤهل لمشاهدة الويدجت
    default_order SMALLINT NOT NULL DEFAULT 10,
    is_removable BOOLEAN NOT NULL DEFAULT TRUE, -- هل يمكن للمستخدم إخفاؤها
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. جدول تفضيلات وترتيب الويدجات المخصصة لكل مستخدم (User Widget Preferences)
CREATE TABLE command_center.user_widget_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    widget_id VARCHAR(50) NOT NULL REFERENCES command_center.widget_catalog(widget_id) ON DELETE CASCADE,
    display_order SMALLINT NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, widget_id)
);

CREATE INDEX idx_user_widgets ON command_center.user_widget_preferences(user_id, display_order);

-- 3. جدول بطاقات الانتباه والطلبات المعلقة السريعة (Needs Attention Queue)
CREATE TABLE command_center.needs_attention_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    source_system_id VARCHAR(10) NOT NULL, -- 'S1-05' (مكافأة)، 'S1-06' (مهمة)، إلخ
    target_user_id UUID REFERENCES identity.users(id) ON DELETE CASCADE, -- الطفل صاحب الطلب
    title_ar VARCHAR(120) NOT NULL,
    summary_ar TEXT,
    severity VARCHAR(15) NOT NULL DEFAULT 'INFO', -- 'INFO', 'WARNING', 'ACTION_REQUIRED'
    action_type VARCHAR(30) NOT NULL, -- 'APPROVE_REWARD', 'APPROVE_TASK', 'CHECK_BATTERY'
    action_payload JSONB NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by_user_id UUID REFERENCES identity.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attention_unresolved ON command_center.needs_attention_items(family_id, is_resolved) WHERE is_resolved = FALSE;
```

---

## 2. بنية كاش التجميع في Redis (Aggregated Summary Cache Structure)

لضمان تحميل مركز القيادة في أقل من **50ms** من الخادم دون استعلام متكرر لـ 6 جداول مختلفة:
- **المفتاح:** `family:{familyId}:dashboard_summary:{userId}`
- **صلاحية الكاش (TTL):** 60 ثانية مع الإبطال التلقائي الفوري (`Cache Invalidation`) عند استلام أحداث التغيير عبر Transactional Outbox (D-020).
- **الهيكل التجميعي:**
```json
{
  "last_updated": "2026-10-30T07:15:00Z",
  "needs_attention_count": 2,
  "needs_attention_items": [ ... ],
  "widgets_payload": {
    "location_summary": { "all_safe_at_home": true, "members_count": 4 },
    "tasks_summary": { "today_total": 5, "completed": 3, "pending": 2 },
    "rewards_summary": { "top_child": "عمر", "points_earned_today": 30 }
  }
}
```

---

## 3. مخطط التخزين المحلي في Drift لتطبيق Flutter

```dart
// جدول الكاش المحلي لبطاقات مركز القيادة
class LocalDashboardWidgetsTable extends Table {
  TextColumn get widgetId => text()();
  TextColumn get userId => text()();
  IntColumn get displayOrder => integer()();
  BoolColumn get isVisible => boolean().withDefault(const Constant(true))();
  TextColumn get cachedPayloadJson => text().nullable()();
  DateTimeColumn get lastUpdated => dateTime()();

  @override
  Set<Column> get primaryKey => {widgetId, userId};
}

// جدول كاش بنود يتطلب انتباهك المحلية
class LocalNeedsAttentionTable extends Table {
  TextColumn get itemId => text()();
  TextColumn get familyId => text()();
  TextColumn get sourceSystemId => text()();
  TextColumn get titleAr => text()();
  TextColumn get summaryAr => text().nullable()();
  TextColumn get severity => text()();
  TextColumn get actionType => text()();
  TextColumn get actionPayloadJson => text()();
  BoolColumn get isResolved => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {itemId};
}
```
