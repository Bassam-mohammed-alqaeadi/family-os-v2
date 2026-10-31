---
id: S1-04
title: عقود الواجهات والشبكة — الخطط والاشتراكات
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-04/03-data-model, D-020, D-025]
last_updated: 2026-10-30
---
# S1-04: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-04 — plans-and-subscriptions`  
> **البروتوكول:** RESTful JSON عبر HTTPS + أحداث Transactional Outbox (D-020) + تكامل Webhooks لمتاجري Google و Apple.

---

## 1. نقاط النهاية للاشتراكات والترقية (Subscription Endpoints)

### أ) جلب حالة الخطة الحالية والحصص: `GET /v1/billing/subscription/current`
- **المصادقة:** Bearer Token مطلوب.
- **الاستجابة (Response 200 OK):**
```json
{
  "family_id": "fam-uuid-1",
  "plan": {
    "plan_id": "plan_premium_annual",
    "tier_level": "PREMIUM",
    "title_ar": "باقة عائلتي السنوية المميزة ⭐️",
    "status": "ACTIVE",
    "billing_provider": "GOOGLE_PLAY",
    "current_period_end": "2027-10-30T18:00:00Z",
    "auto_renew": true
  },
  "quotas": {
    "members_used": 5,
    "members_limit": 0,
    "can_add_more_members": true,
    "location_history_days": 30,
    "has_advanced_study_ai": true
  }
}
```

### ب) التحقق من إيصال الشراء وتفعيل الترقية: `POST /v1/billing/purchase/verify-receipt`
- **المصادقة:** Bearer Token مطلوب (مالك الأسرة حصراً / Owner).
- **الطلب (Request Body):**
```json
{
  "provider": "GOOGLE_PLAY",
  "product_id": "fos_premium_annual_sub",
  "purchase_token": "token-string-from-in-app-purchase-sdk...",
  "father_pin": "982143"
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "UPGRADE_SUCCESSFUL",
  "plan_id": "plan_premium_annual",
  "tier_level": "PREMIUM",
  "expires_at": "2027-10-30T18:00:00Z",
  "verified_at": "2026-10-30T18:05:00Z"
}
```

### ج) استعلام كتالوج الخطط والأسعار: `GET /v1/billing/plans`
- **المعلمات:** `currency=SAR`.
- **الاستجابة (Response 200 OK):**
```json
{
  "currency": "SAR",
  "plans": [
    {
      "plan_id": "plan_free_starter",
      "title_ar": "باقة البداية المجانية",
      "price_display": "مجاناً للأبد",
      "price_cents": 0,
      "max_members": 5,
      "is_current": false
    },
    {
      "plan_id": "plan_premium_annual",
      "title_ar": "الباقة السنوية الشاملة",
      "price_display": "199.99 ر.س / سنوياً",
      "price_cents": 19999,
      "max_members": 0,
      "badge_ar": "وفر 30%",
      "is_current": true
    }
  ]
}
```

---

## 2. ويب هوك إشعارات المتاجر السحابية (Server-to-Server Webhooks)

تستقبل المنصة إشعارات التجديد والإلغاء المباشرة من المتاجر:
- `POST /v1/billing/webhooks/google-play` (Google Cloud Pub/Sub).
- `POST /v1/billing/webhooks/apple-app-store` (App Store Server Notifications V2).
- تقوم المعالجة بتحديث حالة السجل في `billing.family_subscriptions` فوراً دون أي تدخل من المستخدم.

---

## 3. أحداث المجال عبر Transactional Outbox

1. `billing.subscription.upgraded`: يُبث عبر WebSocket لكافة أجهزة أفراد الأسرة لتحديث كاش Drift وفتح الميزات فورياً على أجهزة الأب والأم والأبناء.
2. `billing.subscription.downgraded`: يُبث عند انتهاء الاشتراك لتفعيل الرجوع اللبق للخطة المجانية دون مساس بخدمة SOS.
