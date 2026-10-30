---
id: S1-05
title: نموذج البيانات والمخططات — المكافآت وسلاسل الإنجاز
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-05/00-analysis, D-005, D-012, D-020, D-021]
last_updated: 2026-10-30
---
# S1-05: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-05 — rewards-children`  
> **البيئة المعمارية:** خادم TypeScript (PostgreSQL مع RLS بحسب D-005 و D-021) + ذاكرة Redis الساخنة للأرصدة وسلاسل الإنجاز + تطبيق Flutter العميل (Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/familywall/05_data_models_and_schemas/]` (جداول رصيد النقاط وكتالوج الجوائز).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema)

تُعزل الجداول ضمن المخطط المعماري `rewards.*` مع تطبيق مبدأ D-012 (حصر المحافظ بالأطفال):

```sql
-- 1. جدول محافظ رصيد الأطفال وسلاسل الإنجاز (Child Wallets & Streaks)
CREATE TABLE rewards.child_wallets (
    child_user_id UUID PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    balance_stars INT NOT NULL DEFAULT 0 CHECK (balance_stars >= 0),
    total_earned_all_time INT NOT NULL DEFAULT 0,
    current_streak_days INT NOT NULL DEFAULT 0,
    longest_streak_days INT NOT NULL DEFAULT 0,
    last_streak_date DATE,
    is_streak_frozen_today BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_family ON rewards.child_wallets(family_id);

-- 2. جدول كتالوج الجوائز العائلية المتاح للطلب (Rewards Catalog)
CREATE TABLE rewards.catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    title_ar VARCHAR(100) NOT NULL,
    description_ar TEXT,
    cost_stars INT NOT NULL CHECK (cost_stars > 0),
    icon_name VARCHAR(50) NOT NULL DEFAULT 'star_reward',
    category VARCHAR(30) NOT NULL DEFAULT 'ACTIVITY', -- 'ACTIVITY', 'ENTERTAINMENT', 'ITEM', 'SPECIAL'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_user_id UUID NOT NULL REFERENCES identity.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catalog_family_active ON rewards.catalog(family_id, is_active);

-- 3. جدول طلبات استبدال وصرف الجوائز (Redemption Requests Queue)
CREATE TABLE rewards.redemption_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    child_user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards.catalog(id) ON DELETE CASCADE,
    cost_stars INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CLAIMED'
    idempotency_key VARCHAR(64) NOT NULL UNIQUE, -- لمنع الخصم المكرر
    approved_by_user_id UUID REFERENCES identity.users(id),
    decision_notes TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_family_status ON rewards.redemption_requests(family_id, status);

-- 4. جدول حركات وسجل دفتر الأستاذ للنقاط (Points Ledger History)
CREATE TABLE rewards.points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    child_user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    amount_stars INT NOT NULL, -- موجب للإيداع، سالب للخصم
    transaction_type VARCHAR(30) NOT NULL, -- 'TASK_COMPLETED', 'STREAK_BONUS', 'MANUAL_GRANT', 'REWARD_REDEEMED'
    reference_id VARCHAR(64), -- مثل taskId أو requestId
    notes_ar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_child ON rewards.points_ledger(child_user_id, created_at DESC);
```

---

## 2. بنية الذاكرة الساخنة في Redis (Hot Wallets & Streaks Cache)

- **المفتاح:** `family:{familyId}:wallet:{childUserId}`
- **البيانات السريعة:**
```json
{
  "balance": 120,
  "streak_days": 7,
  "streak_frozen": false,
  "pending_requests_count": 1
}
```

---

## 3. مخطط التخزين المحلي في Drift لتطبيق Flutter

```dart
// جدول محفظة الطفل وسلاسل الإنجاز محلياً
class LocalChildWalletTable extends Table {
  TextColumn get childUserId => text()();
  IntColumn get balanceStars => integer()();
  IntColumn get currentStreakDays => integer()();
  BoolColumn get isStreakFrozenToday => boolean()();
  DateTimeColumn get lastUpdated => dateTime()();

  @override
  Set<Column> get primaryKey => {childUserId};
}

// جدول كاش الجوائز المحلية لتصفح المتجر دون اتصال
class LocalRewardsCatalogTable extends Table {
  TextColumn get rewardId => text()();
  TextColumn get familyId => text()();
  TextColumn get titleAr => text()();
  TextColumn get descriptionAr => text().nullable()();
  IntColumn get costStars => integer()();
  TextColumn get iconName => text()();
  TextColumn get category => text()();
  BoolColumn get isActive => boolean()();

  @override
  Set<Column> get primaryKey => {rewardId};
}
```
