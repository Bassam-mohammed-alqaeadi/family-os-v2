/**
 * نماذج واجهات الـ DTO المترجمة لمنصة Family OS (NestJS / TypeScript)
 * المستوحاة من بروتوكول الرسائل وقواعد بيانات Telegram
 */

export enum MessageMediaType {
  NONE = 0,
  VOICE_OPUS = 1,
  PHOTO = 2,
  VIDEO = 3,
  DOCUMENT = 4,
  LOCATION_LIVE = 5
}

export enum MessageSendState {
  SENT = 0,
  PENDING = 1,
  FAILED = 2
}

/**
 * كائن الرسالة العائلية الفورية
 */
export interface FamilyMessageDto {
  id: number;                          // معرف الرسالة (mid)
  dialogId: number;                    // معرف المحادثة أو الأسرة (uid)
  senderId: number;                    // مرسل الرسالة
  date: number;                        // وقت الإرسال
  messageText?: string;                // نص الرسالة
  mediaType: MessageMediaType;         // نوع الوسائط
  mediaPayload?: VoiceMediaDto | PhotoMediaDto;
  replyToMessageId?: number;           // الرد على رسالة
  isOut: boolean;                      // هل هي صادرة من المستخدم الحالي؟
  isRead: boolean;                     // هل قرأها المستلم؟
  ttlSeconds?: number;                 // تدمير ذاتي اختياري
}

/**
 * كائن الرسالة الصوتية المتقدمة متضمنة قمم الموجات
 */
export interface VoiceMediaDto {
  durationSeconds: number;             // مدة التسجيل
  waveform5BitBase64: string;          // مصفوفة بايتات قمم الصوت مشفرة كـ Base64 لرسمها في المتصفح وتطبيقات الجوال
  mimeType: 'audio/ogg; codecs=opus';  // التنسيق الصوتي المعتمد
  fileSizeBytes: number;               // حجم الملف
  url: string;                         // رابط تحميل ملف الصوت
}

/**
 * كائن صورة أو ملصق
 */
export interface PhotoMediaDto {
  width: number;
  height: number;
  thumbnailBase64?: string;            // صورة مصغرة ضبابية فورية BlurHash
  url: string;
}

/**
 * كائن قائمة المحادثات (Dialog Summary)
 */
export interface DialogSummaryDto {
  dialogId: number;
  title: string;
  avatarUrl?: string;
  lastMessage: FamilyMessageDto;
  unreadCount: number;
  isPinned: boolean;
  folderId: number;                    // 0 = General, 1 = Family Home, 2 = Kids Only
  updatedAt: number;
}

/**
 * طلب إرسال رسالة جديدة
 */
export interface SendMessageRequestDto {
  dialogId: number;
  randomId: string;                    // لمكافحة التكرار عند ضعف الشبكة
  text?: string;
  mediaType?: MessageMediaType;
  waveform5BitBase64?: string;
  replyToMessageId?: number;
}
