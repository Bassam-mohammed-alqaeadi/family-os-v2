---
id: S1-08
title: نموذج البيانات والمخططات — الدردشة العائلية
phase: 1
file: 03-data-model
status: drafted
depends_on: [S1-08/00-analysis, D-005, D-011, D-019, D-020, D-021]
last_updated: 2026-10-30
---
# S1-08: نموذج البيانات والمخططات (Data Models & Schemas)

> **النظام:** `S1-08 — chat-basic`  
> **البيئة المعمارية:** خادم TypeScript (PostgreSQL مع RLS بحسب D-005 و D-021) + ذاكرة Redis للرسائل الساخنة والمؤشرات + تطبيق Flutter العميل (Drift / SQLite).  
> **الاستخلاص المرجعي:** `[REF: benchmarks/extracted/telegram/]` (جداول الرسائل وقنوات المحادثة والترتيب بـ Sequence ID).

---

## 1. مخطط قاعدة بيانات الخادم (Server PostgreSQL Schema)

تُعزل الجداول ضمن المخطط المعماري `chat.*` وتطبق معايير D-011 و D-019 (فصل المحتوى المعمى عن الـ Metadata):

```sql
-- 1. جدول قنوات وغرف المحادثة (Chat Channels)
CREATE TABLE chat.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    channel_type VARCHAR(20) NOT NULL, -- 'FAMILY_LOUNGE', 'PARENTS_SANCTUARY', 'DIRECT_1ON1'
    title_ar VARCHAR(100),
    is_protected_by_pin BOOLEAN NOT NULL DEFAULT FALSE, -- لقناة الوالدين
    min_role_level VARCHAR(10) NOT NULL DEFAULT 'L5', -- أدنى دور مصرح له بالدخول
    last_message_seq_id BIGINT NOT NULL DEFAULT 0,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channels_family ON chat.channels(family_id);

-- 2. جدول أعضاء المحادثة والاشتراك (Channel Members)
CREATE TABLE chat.channel_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat.channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    last_read_seq_id BIGINT NOT NULL DEFAULT 0,
    is_muted BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_channel_members_user ON chat.channel_members(user_id);

-- 3. جدول الرسائل المعمارية الجاهزة للتشفير E2E (Messages Store - D-011 & D-019)
CREATE TABLE chat.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat.channels(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES identity.families(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES identity.users(id),
    client_message_id VARCHAR(64) NOT NULL, -- random_id لتفادي التكرار (Deduplication)
    server_seq_id BIGINT NOT NULL, -- رقم تسلسلي متزايد داخل كل قناة لضمان الترتيب
    
    -- فصل المحتوى المعمى عن البيانات الوصفية (D-011)
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT', -- 'TEXT', 'EMOJI', 'SYSTEM_EVENT'
    encrypted_payload TEXT NOT NULL, -- المحتوى المشفر بـ Envelope Encryption في م1
    encryption_key_epoch INT NOT NULL DEFAULT 1, -- لدعم تدوير المفاتيح لاحقاً
    
    is_deleted_globally BOOLEAN NOT NULL DEFAULT FALSE, -- للحذف الإشرافي من الأب
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_messages_seq ON chat.messages(channel_id, server_seq_id);
CREATE INDEX idx_messages_client_id ON chat.messages(client_message_id);

-- 4. تسلسل أرقام الرسائل لكل قناة
CREATE SEQUENCE chat.channel_seq_generator;
```

---

## 2. مخطط التخزين المحلي في Drift لتطبيق Flutter (Offline-First Store)

```dart
// جدول الرسائل المحلي لتطبيق Flutter في Drift
class LocalMessagesTable extends Table {
  TextColumn get messageId => text()();
  TextColumn get channelId => text()();
  TextColumn get senderUserId => text()();
  TextColumn get senderName => text()();
  TextColumn get senderAvatarUrl => text().nullable()();
  TextColumn get senderColorHex => text()();
  TextColumn get clientMessageId => text()();
  Int64Column get serverSeqId => int64().nullable()();
  TextColumn get messageType => text()();
  TextColumn get decryptedText => text()(); // النص المفكوك محلياً بعد القراءة
  IntColumn get deliveryStatus => integer()(); // 0 = Pending (ساعة), 1 = Sent (صح), 2 = Read (صحان)
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {messageId};
}

// جدول قنوات المحادثة المحلي
class LocalChannelsTable extends Table {
  TextColumn get channelId => text()();
  TextColumn get channelType => text()();
  TextColumn get titleAr => text()();
  BoolColumn get isProtectedByPin => boolean()();
  TextColumn get lastMessagePreview => text().nullable()();
  DateTimeColumn get lastMessageTime => dateTime()();
  IntColumn get unreadCount => integer().withDefault(const Constant(0))();

  @override
  Set<Column> get primaryKey => {channelId};
}
```
