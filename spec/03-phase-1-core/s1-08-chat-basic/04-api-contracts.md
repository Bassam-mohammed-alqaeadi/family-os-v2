---
id: S1-08
title: عقود الواجهات والشبكة — الدردشة العائلية
phase: 1
file: 04-api-contracts
status: drafted
depends_on: [S1-08/03-data-model, D-011, D-019, D-020, D-031]
last_updated: 2026-10-30
---
# S1-08: عقود الواجهات والشبكة (API Contracts)

> **النظام:** `S1-08 — chat-basic`  
> **البروتوكول:** RESTful JSON عبر HTTPS + بث WebSocket للأحداث اللحظية والمراسلة المباشرة.

---

## 1. نقاط النهاية لغرف ورسائل المحادثة (Chat Endpoints)

### أ) جلب رسائل القناة والمزامنة: `GET /v1/chat/channels/:channelId/messages`
- **المعلمات (Query Params):** `since_seq_id=120&limit=50`.
- **الاستجابة (Response 200 OK):**
```json
{
  "channel_id": "chan-uuid-family-lounge",
  "has_more": false,
  "messages": [
    {
      "message_id": "msg-uuid-1",
      "sender_user_id": "user-uuid-father",
      "sender_name": "سعد آل ناصر",
      "sender_color_hex": "#1F3A6B",
      "server_seq_id": 121,
      "message_type": "TEXT",
      "encrypted_payload": "U2FsdGVkX19G4K3n...", // يُفك تشفيره محلياً
      "created_at": "2026-10-30T16:00:00Z"
    },
    {
      "message_id": "msg-uuid-2",
      "sender_user_id": "user-uuid-child",
      "sender_name": "عمر",
      "sender_color_hex": "#CF5B2C",
      "server_seq_id": 122,
      "message_type": "EMOJI",
      "encrypted_payload": "U2FsdGVkX1+9b...",
      "created_at": "2026-10-30T16:01:10Z"
    }
  ]
}
```

### ب) إرسال رسالة جديدة: `POST /v1/chat/channels/:channelId/messages`
- **الطلب (Request Body):**
```json
{
  "client_message_id": "client-uuid-987654321", // random_id لمنع التكرار
  "message_type": "TEXT",
  "encrypted_payload": "U2FsdGVkX19G4K3n...",
  "encryption_key_epoch": 1
}
```
- **الاستجابة (Response 201 Created):**
```json
{
  "status": "SENT",
  "message_id": "msg-uuid-3",
  "client_message_id": "client-uuid-987654321",
  "server_seq_id": 123,
  "created_at": "2026-10-30T16:02:00Z"
}
```

### ج) تحديث إيصال القراءة: `POST /v1/chat/channels/:channelId/read-receipt`
- **الطلب (Request Body):**
```json
{
  "last_read_seq_id": 123
}
```
- **الاستجابة (Response 200 OK):**
```json
{
  "status": "READ_RECEIPT_ACKNOWLEDGED"
}
```

---

## 2. بروتوكول البث اللحظي عبر WebSocket Frames

تتبادل الأجهزة والخادم الإطارات التالية عبر قناة `chat:channel:{channelId}`:

1. **إرسال رسالة لحظية (`chat.message.new`):**
```json
{
  "event": "chat.message.new",
  "channel_id": "chan-uuid-family-lounge",
  "message": {
    "id": "msg-uuid-3",
    "sender_id": "user-uuid-father",
    "server_seq_id": 123,
    "encrypted_payload": "...",
    "created_at": "2026-10-30T16:02:00Z"
  }
}
```

2. **تحديث مؤشر الكتابة (`chat.typing`):**
```json
{
  "event": "chat.typing",
  "channel_id": "chan-uuid-family-lounge",
  "user_id": "user-uuid-child",
  "user_name": "عمر"
}
```

3. **إشعار قراءة الرسائل (`chat.read_update`):**
```json
{
  "event": "chat.read_update",
  "channel_id": "chan-uuid-family-lounge",
  "read_by_user_id": "user-uuid-mother",
  "last_read_seq_id": 123
}
```
