/**
 * FamilyWall Reconstructed Data Transfer Objects (DTOs) & Data Models (Enriched)
 * Re-engineered for Family OS (NestJS Backend + Flutter Frontend)
 */

export enum MemberRole {
  ORGANIZER = 'ORGANIZER',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  TEEN = 'TEEN',
  GUEST = 'GUEST'
}

export interface FamilyMemberDTO {
  id: string;
  familyId: string;
  displayName: string;
  avatarUrl?: string;
  colorHex: string; // اللون التعريفي الخاص بالعضو في التقويم والقوائم (Hex Code)
  role: MemberRole;
  birthday?: string;
  email?: string;
  phoneNumber?: string;
  isKidAccount: boolean;
  hasPinSet: boolean;
  isLocationSharingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KidAccountSetupDTO {
  displayName: string;
  avatarUrl?: string;
  colorHex: string;
  role: MemberRole.CHILD | MemberRole.TEEN;
  pin: string; // رمز 4 أرقام
  parentAuthorizationToken: string;
}

export enum EventRecurrenceFrequency {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface RecurrencePatternDTO {
  frequency: EventRecurrenceFrequency;
  interval: number;
  byDays?: ('MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU')[];
  until?: string;
  count?: number;
  exceptionDates?: string[];
}

export interface CalendarEventDTO {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  assignedMemberIds: string[];
  recurrence?: RecurrencePatternDTO;
  reminderMinutesBefore: number[];
  colorHexOverride?: string;
  createdByMemberId: string;
}

// 4. الجداول الدراسية للأبناء (School Timetable DTO)
export interface SchoolTimetablePeriodDTO {
  id: string;
  studentMemberId: string;
  dayOfWeek: number; // 1 = Monday .. 7 = Sunday
  periodNumber: number; // الحصة 1، 2، 3...
  subjectName: string;
  roomNumber?: string;
  teacherName?: string;
  startTime: string; // '08:00'
  endTime: string;   // '08:45'
  weekCycle: 'ALL' | 'WEEK_A' | 'WEEK_B';
  colorHex: string;
}

// 5. الخزنة العائلية للوثائق (Family Vault Document DTO)
export enum VaultDocumentCategory {
  PASSPORT = 'PASSPORT',
  VACCINATION = 'VACCINATION',
  INSURANCE = 'INSURANCE',
  NATIONAL_ID = 'NATIONAL_ID',
  SCHOOL_RECORD = 'SCHOOL_RECORD',
  OTHER = 'OTHER'
}

export interface FamilyVaultDocumentDTO {
  id: string;
  familyId: string;
  title: string;
  category: VaultDocumentCategory;
  fileUrl: string;
  fileSizeBytes: number;
  fileType: 'PDF' | 'IMAGE';
  belongsToMemberId?: string;
  expiryDate?: string; // تاريخ انتهاء الجواز أو التأمين
  notes?: string;
  createdAt: string;
}

// 6. القوائم والمهام المشتركة
export enum ListType {
  SHOPPING = 'SHOPPING',
  TODO = 'TODO',
  PACKING = 'PACKING',
  CUSTOM = 'CUSTOM'
}

export interface FamilyListDTO {
  id: string;
  familyId: string;
  title: string;
  type: ListType;
  iconName?: string;
  colorHex?: string;
  isArchived: boolean;
  assignedMemberIds?: string[];
  itemCount: number;
  completedItemCount: number;
}

export interface ListItemDTO {
  id: string;
  listId: string;
  title: string;
  quantity?: string;
  category?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedByMemberId?: string;
  assignedToMemberId?: string;
  dueDate?: string;
  position: number; // الترتيب الكسري Fractional Indexing
  note?: string;
}

// 7. الوجبات الأسبوعية
export interface MealPlanDayDTO {
  id: string;
  familyId: string;
  date: string; // YYYY-MM-DD
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
  notes?: string;
  cookMemberId?: string;
}

// 8. نداء الطوارئ و SOS
export interface EmergencySosAlertDTO {
  alertId: string;
  senderMemberId: string;
  senderName: string;
  triggeredAt: string;
  latitude: number;
  longitude: number;
  batteryLevel?: number;
  status: 'ACTIVE' | 'RESOLVED' | 'FALSE_ALARM';
}

// 9. اشتراكات التقاويم الخارجية (Google / Outlook Sync)
export interface ExternalCalendarFeedDTO {
  id: string;
  memberId: string;
  provider: 'GOOGLE_CALENDAR' | 'OUTLOOK' | 'APPLE_ICAL' | 'CUSTOM_URL';
  feedUrl: string;
  calendarName: string;
  colorHex: string;
  lastSyncedAt?: string;
  isEnabled: boolean;
}

// 10. المناسبات والذكرى السنوية
export interface FamilyMilestoneDTO {
  id: string;
  familyId: string;
  title: string;
  milestoneType: 'BIRTHDAY' | 'ANNIVERSARY' | 'MEMORIAL';
  eventDate: string; // MM-DD
  targetMemberId?: string;
  reminderDaysBefore: number;
  giftIdeasNote?: string;
}
