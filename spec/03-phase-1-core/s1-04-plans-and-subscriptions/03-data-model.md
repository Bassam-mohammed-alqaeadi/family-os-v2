---
id: S1-04
title: نموذج البيانات والمخططات — الخطط والاشتراكات
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-04/00-analysis, D-005, D-020, D-021, D-025]
last_updated: 2026-10-30
---
# S1-04: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-04 — plans-and-subscriptions`  
> **البيئة المعمارية:** خادم TypeScript (PostgreSQL مع RLS بحسب D-005 و D-021) + ذاكرة Redis الساخنة لفحص الحصص السريع + تطبيق Flutter العميل (Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/qustodio/01_architecture_and_manifest/permissions_strategy.md]` (جداول التراخيص وتتبع إيصالات المتاجر).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema)

تُعزل الجداول ضمن المخطط المعماري `billing.*` مع ربط الاشتراك بـ `family_id` كمرجع موحد:

```sql
-- 1. جدول تعريف الخطط والباقات المتاحة (Plans Catalog)
CREATE TABLE billing.plans_catalog (
    plan_id VARCHAR(40) PRIMARY KEY, -- 'plan_free_starter', 'plan_premium_monthly', 'plan_premium_annual'
    tier_level VARCHAR(20) NOT NULL, -- 'FREE', 'PREMIUM'
    title_ar VARCHAR(80) NOT NULL,
    description_ar TEXT,
    price_cents INT NOT NULL DEFAULT 0, -- السعر بالهللات/السنتات
    currency VARCHAR(3) NOT NULL DEFAULT 'SAR',
    billing_interval VARCHAR(20) NOT NULL, -- 'LIFETIME_FREE', 'MONTHLY', 'ANNUAL'
    max_family_members SMALLINT NOT NULL DEFAULT 5, -- 0 تعني غير محدود
    max_reward_items SMALLINT NOT NULL DEFAULT 5,
    has_extended_location_history BOOLEAN NOT NULL DEFAULT FALSE,
    has_advanced_ai_study BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. جدول اشتراكات العائلات الفعالة (Family Active Subscriptions)
CREATE TABLE billing.family_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL UNIQUE REFERENCES identity.families(id) ON DELETE CASCADE,
    plan_id VARCHAR(40) NOT NULL REFERENCES billing.plans_catalog(plan_id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'IN_GRACE_PERIOD', 'EXPIRED', 'CANCELLED'
    billing_provider VARCHAR(20) NOT NULL DEFAULT 'SYSTEM_FREE', -- 'SYSTEM_FREE', 'GOOGLE_PLAY', 'APPLE_APP_STORE'
    provider_original_transaction_id VARCHAR(120), -- معرّف المعاملة الأصلي من المتجر
    provider_subscription_id VARCHAR(120),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ, -- فارغ للخطة المجانية الدائمة
    auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
    purchased_by_user_id UUID REFERENCES identity.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_family ON billing.family_subscriptions(family_id);

-- 3. جدول سجل إيصالات الشراء والتدقيق المالي (Receipts & Purchases Audit)
CREATE TABLE billing.purchase_receipts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id),
    provider VARCHAR(20) NOT NULL,
    product_id VARCHAR(80) NOT NULL,
    receipt_data TEXT NOT NULL, -- الحمولة المشفرة للإيصال للتحقق
    validation_status VARCHAR(20) NOT NULL, -- 'VALIDATED_SUCCESS', 'FRAUD_SUSPECT', 'EXPIRED'
    server_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw_provider_response JSONB
);

CREATE INDEX idx_receipts_family ON billing.purchase_receipts_log(family_id, server_verified_at DESC);
```

---

## 2. بنية كاش فحص الحصص السريع في Redis (Quota Cache)

لفحص مسموحات الحساب في أقل من **5ms** قبل تنفيذ أي إجراء في أي خدمة:
- **المفتاح:** `family:{familyId}:quota_state`
- **البيانات السريعة:**
```json
{
  "tier": "PREMIUM",
  "plan_id": "plan_premium_annual",
  "max_members": 0, // غير محدود
  "has_extended_location": true,
  "has_advanced_ai": true,
  "expires_at": 1761800000
}
```

---

## 3. مخطط التخزين المحلي في Drift لتطبيق Flutter

```dart
// جدول حالة الخطة المحلية المخزنة في Drift
class LocalFamilyPlanTable extends Table {
  TextColumn get familyId => text()();
  TextColumn get planId => text()();
  TextColumn get tierLevel => text()(); // 'FREE' | 'PREMIUM'
  TextColumn get planTitleAr => text()();
  IntColumn get maxMembers => integer()();
  BoolColumn get isPremium => boolean()();
  DateTimeColumn get expiryDate => dateTime().nullable()();
  DateTimeColumn get lastSyncedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {familyId};
}
```
