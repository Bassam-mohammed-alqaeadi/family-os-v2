/**
 * كائنات نقل البيانات لمجموعات وبطاقات Quizlet بصيغة TypeScript Type-Safe
 * المسار: benchmarks/extracted/quizlet/05_data_models_and_schemas/family_os_quizlet_dtos.ts
 */

export type StudyAccessType = 'PUBLIC' | 'PASSWORD' | 'CLASS_ONLY' | 'PRIVATE';
export type CardMasteryLevel = 'UNSEEN' | 'STILL_LEARNING' | 'MASTERED';
export type StudyModeType = 'FLASHCARDS' | 'LEARN' | 'WRITE' | 'TEST' | 'MATCH';
export type ClassMemberRole = 'TEACHER' | 'ADMIN' | 'STUDENT';

export interface StudySetDTO {
  id: string;
  title: string;
  description?: string;
  wordCount: number;
  creatorId: string;
  creatorUsername: string;
  accessType: StudyAccessType;
  hasImages: boolean;
  hasAudio: boolean;
  isStarred: boolean;
  createdTimestamp: number;
  lastModifiedTimestamp: number;
  lastStudiedTimestamp?: number;
  cards?: FlashcardDTO[];
}

export interface FlashcardDTO {
  id: string;
  setId: string;
  cardOrder: number;
  term: string;
  definition: string;
  imageUrl?: string;
  audioRemoteUrl?: string;
  audioLocalPath?: string;
  isStarred: boolean;
  createdAt: number;
  mastery?: CardMasteryStateDTO;
}

export interface CardMasteryStateDTO {
  cardId: string;
  setId: string;
  userId: string;
  masteryLevel: CardMasteryLevel;
  repetitionCount: number;
  consecutiveCorrect: number;
  easinessFactor: number;
  intervalDays: number;
  lastReviewedAt?: number;
  nextReviewDueAt: number;
  totalMistakes: number;
}

export interface StudyFolderDTO {
  id: string;
  name: string;
  description?: string;
  userId: string;
  setCount: number;
  createdAt: number;
  updatedAt: number;
  setIds?: string[];
}

export interface ClassDTO {
  id: string;
  name: string;
  schoolName?: string;
  teacherId: string;
  teacherName: string;
  memberCount: number;
  setCount: number;
  inviteCode?: string;
  createdAt: number;
}

export interface OfflineStudyEventDTO {
  eventId: string;
  userId: string;
  cardId: string;
  setId: string;
  mode: StudyModeType;
  isCorrect: boolean;
  responseDurationMs: number;
  timestampMs: number;
  syncedStatus: boolean;
}

export interface DailyStreakDTO {
  userId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  streakFreezeCount: number;
  updatedAt: number;
}
