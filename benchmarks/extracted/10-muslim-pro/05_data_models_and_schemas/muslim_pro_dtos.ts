/**
 * عقود البيانات والواجهات البرمجية للمنظومة الدينية لمنصة Family OS
 *
 * مستخلصة بالهندسة العكسية من دراسة Muslim Pro v11.2.9
 * ومطابقة لمعايير خصوصية وحوكمة الأسرة (المرحلة 2 والمرحلة 5)
 */

export type CalculationMethod =
  | 'MAKKAH_UMM_AL_QURA'
  | 'EGYPT_SURVEY'
  | 'MWL'
  | 'ISNA'
  | 'KARACHI'
  | 'DIYANET'
  | 'AWQAF_UAE'
  | 'JAKIM_MALAYSIA'
  | 'KEMENAG_INDONESIA'
  | 'MUIS_SINGAPORE'
  | 'TEHRAN'
  | 'CUSTOM_ANGLE';

export type AsrJuristic = 'STANDARD' | 'HANAFI';

export type HighLatitudeRule = 'ANGLE_BASED' | 'MIDNIGHT' | 'ONE_SEVENTH';

export interface PrayerTimesDTO {
  date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  fajr: string; // ISO 8601
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  calculationMethod: CalculationMethod;
  asrJuristic: AsrJuristic;
  manualMinuteOffsets: Record<string, number>;
}

export interface QiblaDirectionDTO {
  userLatitude: number;
  userLongitude: number;
  kaabaBearingDegrees: number; // 0..360
  magneticDeclinationDegrees?: number;
  isSensorCalibrated: boolean;
  distanceToKaabaKm: number;
}

export interface HijriDateDTO {
  gregorianDate: string;
  hijriYear: number;
  hijriMonth: number;
  hijriDay: number;
  monthNameAr: string;
  monthNameEn: string;
  holidayTitleAr?: string;
  countryOffsetApplied: number;
}

export interface AzanAudioConfigDTO {
  prayerName: 'FAJR' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA';
  alertType: 'FULL_AZAN' | 'SHORT_BEEP' | 'SILENT_NOTIFICATION';
  muezzinId: string;
  preAdhanReminderMinutes: number; // 0 = disabled, 10, 15
  stopOnInteraction: boolean;
}

export interface DailyDhikrStreakDTO {
  userId: string;
  date: string;
  morningDhikrDone: boolean;
  eveningDhikrDone: boolean;
  totalTasbihCount: number;
  currentStreakDays: number;
  rewardPointsEarned: number; // عملة العائلة family_coin
}

/**
 * عقد حوكمة جهاز الطفل (Child Device Religious Mode)
 * حماية تربوية تمنع استغلال الصلاة للعقاب أو المراقبة التلصصية
 */
export interface ChildReligiousExperienceDTO {
  childProfileId: string;
  allowGentleAzan: boolean;
  muteDuringSchoolHours: boolean;
  encourageDailyPrayerCards: boolean; // تشجيع عبر بطاقات ورسوم متحركة
  awardedFamilyCoinsPerPrayer: number; // نقاط تحفيزية إيجابية
  prohibitPunitiveScreenLock: boolean; // منع صريح: لا يجوز قفل الهاتف كعقاب لعدم الصلاة
}
