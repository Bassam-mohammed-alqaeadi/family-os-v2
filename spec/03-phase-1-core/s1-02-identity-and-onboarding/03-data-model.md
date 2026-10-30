---
id: S1-02
title: نموذج البيانات والمخططات — الهوية والتهيئة
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-02/00-analysis, D-005, D-006, D-020, D-021]
last_updated: 2026-10-30
---
# S1-02: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-02 — identity-and-onboarding`  
> **البيئة المعتمدة:** خادم TypeScript (PostgreSQL مع عزل Row-Level Security بحسب D-005 و D-021) + تطبيق Flutter العميل (مكتبة Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/familywall/05_data_models_and_schemas/local_db_schema.sql]` (جداول العائلة والأعضاء وتفاصيل الأطفال).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema)

يتم عزل كافة الجداول ضمن المخطط المعماري `identity.*`، مع فرض سياسة `RLS` الصارمة على مستوى `family_id`:

```sql
-- 1. جدول المستخدمين الأساسي (Users)
CREATE TABLE identity.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 VARCHAR(20) UNIQUE, -- فارغ لحسابات الأطفال الخالصة (D-006)
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    avatar_color_hex VARCHAR(7) DEFAULT '#1F3A6B',
    birth_year SMALLINT,
    is_kid_account BOOLEAN NOT NULL DEFAULT FALSE,
    father_pin_hash VARCHAR(255), -- مشفر بـ Argon2id (للأب فقط)
    preferred_locale VARCHAR(10) DEFAULT 'ar',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON identity.users(phone_e164) WHERE phone_e164 IS NOT NULL;

-- 2. جدول العائلات (Families)
CREATE TABLE identity.families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_name VARCHAR(120) NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES identity.users(id),
    country_code VARCHAR(3) NOT NULL DEFAULT 'SA', -- 'SA', 'YE', 'AE', إلخ (D-031)
    tier_level VARCHAR(10) NOT NULL DEFAULT 'TIER_A', -- 'TIER_A', 'TIER_B'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. جدول أعضاء العائلة والارتباط (Family Memberships)
CREATE TABLE identity.family_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    role_level VARCHAR(10) NOT NULL DEFAULT 'L2', -- 'L0', 'L1', 'L2', 'L3', 'L4', 'L5'
    role_title VARCHAR(50), -- 'أب', 'أم', 'ابن', 'مشرف'
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

CREATE INDEX idx_memberships_family ON identity.family_memberships(family_id);
CREATE INDEX idx_memberships_user ON identity.family_memberships(user_id);

-- 4. جدول جلسات المصادقة وتوثيق الأجهزة (User Devices & Sessions)
CREATE TABLE identity.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES identity.families(id),
    device_id VARCHAR(100) NOT NULL, -- UUID فريد لكل جهاز
    device_platform VARCHAR(20) NOT NULL, -- 'ANDROID', 'IOS', 'WEB'
    device_name VARCHAR(100),
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_public_key TEXT, -- المفتاح العام لتشفير اقتران الأجهزة
    push_token TEXT, -- FCM / APNs Token
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_refresh ON identity.user_sessions(refresh_token_hash);

-- 5. جدول رموز التحقق المؤقتة (OTP Verification Log)
CREATE TABLE identity.otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 VARCHAR(20) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'SMS', -- 'SMS', 'WHATSAPP', 'VOICE_CALL'
    attempts_count SMALLINT NOT NULL DEFAULT 0,
    is_consumed BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON identity.otp_codes(phone_e164, is_consumed);

-- 6. جدول رموز دعوة العائلة المؤقتة (Family Invitations)
CREATE TABLE identity.family_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES identity.users(id),
    invite_code VARCHAR(12) NOT NULL UNIQUE, -- مثل: 'FAM-849-210'
    target_role_level VARCHAR(10) NOT NULL DEFAULT 'L2',
    max_uses INT NOT NULL DEFAULT 1,
    uses_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 2. مخطط التخزين المحلي لتطبيق Flutter (Drift / SQLite Schema)

```dart
// تعريف جدول الجلسة المحلية وبيانات العائلة النشطة
class LocalUserSessionTable extends Table {
  TextColumn get userId => text()();
  TextColumn get familyId => text().nullable()();
  TextColumn get phoneE164 => text().nullable()();
  TextColumn get displayName => text()();
  TextColumn get avatarUrl => text().nullable()();
  TextColumn get avatarColorHex => text().withDefault(const Constant('#1F3A6B'))();
  TextColumn get activeRoleLevel => text().withDefault(const Constant('L0'))();
  BoolColumn get isKidAccount => boolean().withDefault(const Constant(false))();
  TextColumn get accessToken => text()();
  TextColumn get refreshToken => text()();
  DateTimeColumn get tokenExpiry => dateTime()();
  BoolColumn get biometricLockEnabled => boolean().withDefault(const Constant(false))();

  @override
  Set<Column> get primaryKey => {userId};
}

// تعريف جدول قائمة أفراد العائلة المخزنة محلياً للغلاف
class LocalFamilyMembersTable extends Table {
  TextColumn get memberId => text()();
  TextColumn get familyId => text()();
  TextColumn get displayName => text()();
  TextColumn get avatarUrl => text().nullable()();
  TextColumn get avatarColorHex => text()();
  TextColumn get roleLevel => text()();
  TextColumn get roleTitle => text()();
  BoolColumn get isKidAccount => boolean()();
  IntColumn get pointsBalance => integer().withDefault(const Constant(0))();

  @override
  Set<Column> get primaryKey => {memberId};
}
```
