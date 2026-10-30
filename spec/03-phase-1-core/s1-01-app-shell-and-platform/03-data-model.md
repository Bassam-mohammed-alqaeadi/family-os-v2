---
id: S1-01
title: نماذج البيانات والمخطط المحلي — غلاف التطبيق والمنصة
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-01/00-analysis, D-026, D-029, D-031]
last_updated: 2026-10-30
---
# S1-01: نماذج البيانات والمخطط المحلي (Data Models & Local Storage Schema)

> **النظام:** `S1-01 — app-shell-and-platform`  
> **الاستخلاص المرجعي:** `[REF:benchmarks/extracted/quizlet/]` (جدول أحداث المزامنة المعلقة `offline_action_queue`)، `[REF:benchmarks/extracted/life360/]` (جدول الرسائل المستلمة وحالة الجهاز).

---

## 1. الكيانات البرمجية الأساسية في الذاكرة (In-Memory Entities)

### 1.1 حالة جلسة الغلاف (`ShellSessionState`)
```typescript
interface ShellSessionState {
  session_id: string;              // معرف الجلسة الحالية
  active_family_id: string;        // معرف العائلة النشطة
  active_member_id: string;        // معرف الفرد المستخدم للجهاز حالياً
  role: RoleType; // 'owner' | 'adult' | 'teen' | 'child'
  display_template: DisplayTemplateType; // 'standard' | 'compact' | 'minimal'
  active_tab_index: number;        // الفهرس النشط في شريط التنقل السفلي
  theme_mode: 'system' | 'light' | 'dark' | 'child_playful';
  locale: string;                  // 'ar-SA' | 'ar-YE' | 'en-US'
  is_offline: boolean;             // هل الجهاز غير متصل بالإنترنت حالياً؟
  pending_sync_count: number;      // عدد العمليات المعلقة في Outbox
  parent_gate_locked: boolean;     // هل وضع الأطفال مقفل بـ Parent Gate؟
}
```

### 1.2 كائن ملف التجربة (`ExperienceProfileDefinition`)
```typescript
interface ExperienceProfileDefinition {
  role: 'owner' | 'adult' | 'teen' | 'child';
  display_template: 'standard' | 'compact' | 'minimal';
  display_name_i18n: string;
  allowed_nav_tabs: Array<{
    tab_id: string;
    label_i18n: string;
    icon_name: string;
    route_path: string;
    required_permission?: string;
  }>;
  parent_gate_required: boolean;   // إلزامي لدور child في قالب minimal
  max_session_duration_minutes?: number; // للأطفال الصغار
  theme_preset: 'executive_navy' | 'modern_slate' | 'playful_pastel';
}
```

### 1.3 كائن ملف الدولة الإقليمي (`CountryProfile` — D-031)
```typescript
interface CountryProfile {
  country_code: string;            // 'SA' | 'AE' | 'KW' | 'QA' | 'BH' | 'OM' | 'YE'
  tier: 'TIER_A' | 'TIER_B' | 'TIER_C';
  primary_currency: string;        // 'SAR' | 'AED' | 'YER'
  low_bandwidth_enforced: boolean; // إلزامي في اليمن (Tier B)
  allowed_otp_channels: Array<'SMS' | 'WHATSAPP' | 'VOICE_CALL'>;
  emergency_numbers: {
    police: string;                // '999' أو '199'
    ambulance: string;             // '997' أو '191'
    civil_defense: string;         // '998'
  };
  outbox_batch_interval_seconds: number; // فترة تفريغ الطابور
}
```

---

## 2. مخطط قاعدة البيانات المحلية (Local SQLite / Drift Schema)

يستضيف S1-01 جداول المنصة المشتركة داخل قاعدة البيانات المحلية المشفرة على الجهاز (`family_os_local.db`):

```sql
-- 1. جدول طابور المزامنة دون اتصال (Transactional Outbox Engine)
CREATE TABLE IF NOT EXISTS platform_offline_outbox (
    event_id TEXT PRIMARY KEY NOT NULL,
    family_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    domain TEXT NOT NULL,              -- 'messaging', 'chores', 'learning', 'controls'
    action_type TEXT NOT NULL,         -- 'TASK_COMPLETED', 'MESSAGE_SENT', 'CARD_REVIEWED'
    payload_json TEXT NOT NULL,        -- محتوى الحدث المشفر
    created_timestamp INTEGER NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    synced_status INTEGER NOT NULL DEFAULT 0, -- 0: معلق, 1: قيد الرفع, 2: فشل
    last_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_outbox_sync ON platform_offline_outbox(synced_status, created_timestamp ASC);

-- 2. جدول إعدادات أعلام الميزات والتهيئة عن بُعد (Feature Flags & Remote Config)
CREATE TABLE IF NOT EXISTS platform_feature_flags (
    flag_key TEXT PRIMARY KEY NOT NULL,
    flag_value_json TEXT NOT NULL,
    min_version TEXT,
    is_kill_switch INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
);

-- 3. جدول مراقبة صحة الجهاز والخدمات الصامتة (Device Health & Telemetry Buffer)
CREATE TABLE IF NOT EXISTS platform_device_health_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    battery_percentage INTEGER NOT NULL,
    is_charging INTEGER NOT NULL,
    network_type TEXT NOT NULL,        -- 'WIFI', 'CELLULAR_4G', 'CELLULAR_3G', 'NONE'
    available_storage_mb INTEGER NOT NULL,
    background_service_alive INTEGER NOT NULL DEFAULT 1,
    recorded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_health_time ON platform_device_health_log(recorded_at DESC);
```

---

## 3. السجلات المركزية الأربعة المشتركة (D-026 Registries Schema)

تُخزن السجلات المركزية الأربعة كهياكل برمجية موحدة في الذاكرة مع تخزين مؤقت على القرص لضمان سرعة الوصول (< 1ms):

```typescript
// 1. سجل التحكمات (ControlRegistry)
interface ControlRegistryEntry {
  control_key: string;             // مثال: 'location.live_sharing'
  domain: string;                  // 'location'
  kind: 'boolean' | 'enum' | 'number' | 'range' | 'duration';
  default_value: any;
  merge_strategy: 'RESTRICTIVE' | 'PERMISSIVE' | 'LAST_WRITE';
  safety_class: 'CRITICAL' | 'NORMAL' | 'COSMETIC';
  child_writable: boolean;
  required_permission: string;
}

// 2. سجل الصلاحيات (PermissionRegistry)
interface PermissionRegistryEntry {
  permission_key: string;          // مثال: 'chores.approve'
  domain: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  delegatable: boolean;            // هل يمكن للأب تفويضها للأم أو المشرف؟
  description_i18n: string;
}

// 3. سجل ودجات الشاشة الرئيسية (WidgetRegistry)
interface WidgetRegistryEntry {
  widget_id: string;               // مثال: 'widget_today_chores'
  domain: string;
  supported_sizes: Array<'SMALL' | 'MEDIUM' | 'LARGE'>;
  eligible_profiles: Array<ExperienceProfileType>;
  render_priority: number;         // 1 (الأعلى) إلى 100
}

// 4. سجل قنوات التنبيهات (NotificationRegistry)
interface NotificationRegistryEntry {
  notification_type: string;       // مثال: 'EMERGENCY_SOS'
  category: 'C1_SAFETY' | 'C2_COMMUNICATION' | 'C3_ACADEMIC' | 'C4_CHORES';
  urgency: 'IMMEDIATE' | 'BATCHED' | 'SILENT';
  bypasses_dnd: boolean;           // تجاوز وضع الصامت في الطوارئ
  default_sound: string;
}
```
