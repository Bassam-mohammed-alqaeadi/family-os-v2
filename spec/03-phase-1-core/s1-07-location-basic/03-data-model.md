---
id: S1-07
title: نموذج البيانات والمخططات — الموقع وزر الاستغاثة
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-07/00-analysis, D-005, D-020, D-021, D-025]
last_updated: 2026-10-30
---
# S1-07: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-07 — location-basic`  
> **البيئة المعمارية:** خادم TypeScript (PostgreSQL مع ملحق PostGIS وعزل RLS بحسب D-005 و D-021) + ذاكرة Redis الساخنة للمواقع الحية + تطبيق Flutter العميل (Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/life360/05_data_models_and_schemas/]` (جداول الإحداثيات، أحداث SOS، وتاريخ المواقع).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema with PostGIS)

تُعزل الجداول ضمن المخطط المعماري `location.*` مع فرض سياسة RLS الصارمة:

```sql
-- 1. جدول آخر موقع معروف لكل جهاز وعضو (Last Known Location)
CREATE TABLE location.current_locations (
    user_id UUID PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    device_id VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326), -- نقطة PostGIS الجغرافية للإحداثيات
    accuracy_meters REAL NOT NULL, -- دقة القراءة بالأمتار
    altitude_meters REAL,
    speed_mps REAL, -- السرعة بالمتر/ثانية
    heading_degrees REAL,
    battery_level SMALLINT NOT NULL, -- نسبة البطارية 0-100
    is_charging BOOLEAN NOT NULL DEFAULT FALSE,
    is_fuzzy_mode BOOLEAN NOT NULL DEFAULT FALSE, -- هل الموقع مشوش لخصوصية L3
    recorded_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_family ON location.current_locations(family_id);
CREATE INDEX idx_locations_geom ON location.current_locations USING GIST(geom);

-- 2. جدول أحداث ونداءات الاستغاثة الطارئة (SOS Incidents Log - D-025)
CREATE TABLE location.sos_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    initiator_user_id UUID NOT NULL REFERENCES identity.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESOLVED_SAFE', 'FALSE_ALARM'
    initial_latitude DOUBLE PRECISION NOT NULL,
    initial_longitude DOUBLE PRECISION NOT NULL,
    initial_accuracy_meters REAL NOT NULL,
    trigger_channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP_LONG_PRESS', -- 'IN_APP_LONG_PRESS', 'SMS_FALLBACK'
    resolved_by_user_id UUID REFERENCES identity.users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sos_family_active ON location.sos_incidents(family_id, status) WHERE status = 'ACTIVE';

-- 3. جدول جهات الطوارئ العائلية (Emergency Contacts)
CREATE TABLE location.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    phone_e164 VARCHAR(20) NOT NULL,
    relationship_ar VARCHAR(50), -- 'الوالد', 'الوالدة', 'العم', 'الجار'
    priority_order SMALLINT NOT NULL DEFAULT 1,
    should_receive_sms_fallback BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 2. بنية الذاكرة الساخنة في Redis (Real-Time Location Cache)

لتوفير استجابة أقل من **20ms** عند فتح الخريطة العائلية دون استنزاف PostgreSQL:
- **المفتاح:** `family:{familyId}:locations:active` (Redis Hash)
- **الحقل:** `user:{userId}`
- **القيمة (JSON Payload مقتضب):**
```json
{
  "lat": 24.7136,
  "lng": 46.6753,
  "acc": 4.5,
  "bat": 82,
  "chg": false,
  "t": 1730280000
}
```

---

## 3. مخطط التخزين المحلي في Drift لتطبيق Flutter

```dart
// جدول المواقع المحلي وكاش الخريطة
class LocalMemberLocationTable extends Table {
  TextColumn get userId => text()();
  TextColumn get familyId => text()();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  RealColumn get accuracyMeters => real()();
  IntColumn get batteryLevel => integer()();
  BoolColumn get isCharging => boolean()();
  BoolColumn get isFuzzy => boolean().withDefault(const Constant(false))();
  DateTimeColumn get recordedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {userId};
}

// جدول طابور إرسال إحداثيات الموقع غير المتصلة (Transactional Outbox)
class LocalLocationOutboxTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  RealColumn get accuracyMeters => real()();
  IntColumn get batteryLevel => integer()();
  DateTimeColumn get recordedAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}
```
