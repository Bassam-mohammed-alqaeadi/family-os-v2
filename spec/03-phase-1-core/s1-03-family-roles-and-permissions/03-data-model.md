---
id: S1-03
title: نموذج البيانات والمخططات — الأدوار والصلاحيات
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-03/00-analysis, D-005, D-012, D-020, D-021]
last_updated: 2026-10-30
---
# S1-03: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-03 — family-roles-and-permissions`  
> **البيئة المعمارية:** خادم TypeScript (PostgreSQL مع عزل Row-Level Security بحسب D-005 و D-021) + تطبيق Flutter العميل (مكتبة Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/qustodio/01_architecture_and_manifest/permissions_strategy.md]` (فصل جدول الصلاحيات وقفل التدقيق غير القابل للتعديل).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema)

تُعزل الجداول الخاصة بالأدوار والتفويضات ضمن المخطط المعماري `permissions.*` مع تفعيل سياسة RLS الصارمة:

```sql
-- 1. جدول تعريف الصلاحيات المتاحة في النظام (Permission Catalog)
CREATE TABLE permissions.catalog (
    permission_key VARCHAR(60) PRIMARY KEY, -- مثل: 'tasks.approve_completion', 'members.invite'
    domain VARCHAR(30) NOT NULL, -- 'members', 'settings', 'tasks', 'calendar', 'chat', إلخ
    title_ar VARCHAR(100) NOT NULL,
    description_ar TEXT,
    min_role VARCHAR(20) NOT NULL DEFAULT 'adult', -- أدنى دور يُسمح بتفويض هذه الصلاحية له
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE, -- تتطلب تأكيد بـ Father PIN
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. جدول تفويضات الصلاحيات المخصصة للأفراد (Member Permission Grants)
CREATE TABLE permissions.member_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    permission_key VARCHAR(60) NOT NULL REFERENCES permissions.catalog(permission_key) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = تفويض، FALSE = حجب صريح
    granted_by_user_id UUID NOT NULL REFERENCES identity.users(id),
    version INT NOT NULL DEFAULT 1, -- للقفل التفاؤلي (Optimistic Locking)
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(family_id, user_id, permission_key)
);

CREATE INDEX idx_grants_lookup ON permissions.member_grants(family_id, user_id);

-- 3. جدول القوالب الجاهزة للأدوار (Role Presets)
CREATE TABLE permissions.role_presets (
    preset_id VARCHAR(40) PRIMARY KEY, -- 'preset_partner_full', 'preset_adult_member', 'preset_teen_safe'
    target_role VARCHAR(20) NOT NULL, -- 'adult', 'teen'
    title_ar VARCHAR(80) NOT NULL,
    description_ar TEXT,
    granted_keys JSONB NOT NULL, -- مصفوفة بمفاتيح الصلاحيات الممنوحة
    is_system_default BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. جدول سجل التدقيق غير القابل للتعديل (Immutable Permission Audit Trail)
CREATE TABLE permissions.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    actor_user_id UUID NOT NULL REFERENCES identity.users(id),
    action_type VARCHAR(30) NOT NULL, -- 'ROLE_LEVEL_CHANGED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'OWNERSHIP_TRANSFERRED'
    details JSONB NOT NULL, -- السجل القديم والجديد والمفاتيح المعدلة
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_family ON permissions.audit_log(family_id, created_at DESC);
```

---

## 2. مخطط التخزين المحلي لتطبيق Flutter (Drift / SQLite Schema)

لتوفير استجابة فورية أقل من 50ms عند فحص الأذونات دون انتظار الشبكة، تُخزن الصلاحيات محلياً:

```dart
// جدول الكاش المحلي للصلاحيات المفوضة للمستخدم النشط
class LocalMemberPermissionsTable extends Table {
  TextColumn get userId => text()();
  TextColumn get permissionKey => text()();
  BoolColumn get isGranted => boolean()();
  IntColumn get version => integer().withDefault(const Constant(1))();
  DateTimeColumn get lastSyncedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {userId, permissionKey};
}

// جدول شجرة العائلة والأدوار للعرض السريع في الغلاف
class LocalFamilyRoleTreeTable extends Table {
  TextColumn get userId => text()();
  TextColumn get familyId => text()();
  TextColumn get displayName => text()();
  TextColumn get role => text()(); // 'owner' | 'adult' | 'teen' | 'child'
  TextColumn get roleTitle => text()();
  TextColumn get avatarColorHex => text()();
  BoolColumn get isOwner => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {userId};
}
```
