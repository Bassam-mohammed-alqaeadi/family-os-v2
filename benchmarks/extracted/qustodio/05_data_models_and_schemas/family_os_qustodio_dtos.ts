/**
 * ============================================================================
 * Family OS — Qustodio Reverse-Engineered Data Transfer Objects (DTOs)
 * Target Application: Qustodio Parental Control (PASA - Parents App Super App)
 * Source References:
 *   - 105 Immutable.js Records: src/records/ (Account, Profile, Device, Routine, Policy, Event, Place, etc.)
 *   - Redux Ducks & State: src/ducks/ (persistentStorage, routines, profileRules, account, etc.)
 *   - API Mappings & Constants: src/constants/index.ts, src/api/mappings/
 * Purpose: Production-ready, type-safe TypeScript interfaces and schemas for
 *          ingesting benchmarked parental control policies, data models, and
 *          offline enforcement structures into Family OS backend (NestJS/PostgreSQL).
 * ============================================================================
 */

// ============================================================================
// 1. COMMON PRIMITIVES & ENUMERATIONS
// ============================================================================

/** ISO-8601 UTC Date String (e.g., '2026-10-27T23:00:00.000Z') */
export type ISODateString = string;

/** Supported ISO language codes */
export enum ISOLanguage {
  NotSet = 'not_set',
  En = 'en',
  Es = 'es',
  Fr = 'fr',
  De = 'de',
  It = 'it',
  Pt = 'pt',
  Ja = 'ja',
  Ar = 'ar',
}

/** Standard days of the week in canonical lowercase format */
export type Weekday =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thr'
  | 'fri'
  | 'sat'
  | 'sun';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/** Supported operating system platforms */
export enum Platform {
  Unknown = 'PLATFORM_UNKNOWN',
  Windows = 'PLATFORM_WINDOWS',
  Mac = 'PLATFORM_MAC',
  Android = 'PLATFORM_ANDROID',
  IOS = 'PLATFORM_IOS',
  Chrome = 'PLATFORM_CHROME',
}

/** Child gender classification */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

/** Online/Protected status of a child profile */
export enum ProfileStatus {
  NoDevice = 'PROFILE_STATUS_NO_DEVICE',
  Active = 'PROFILE_STATUS_ACTIVE',
  Offline = 'PROFILE_STATUS_OFFLINE',
  Paused = 'PROFILE_STATUS_PAUSED',
  Restricted = 'PROFILE_STATUS_RESTRICTED',
}

/** Linking state of school-managed student accounts (Linewize integration) */
export enum SchoolLinkedStatus {
  Linked = 'linked',
  Unlinked = 'unlinked',
  PendingStudentsValidation = 'pending_students_validation',
  NoLinkedStudents = 'no_linked_students',
  PendingExtraStudentsValidation = 'pending_extra_students_validation',
}


// ============================================================================
// 2. ACCOUNT DATA MODELS
// ============================================================================

/** Cryptographic token key for AES request signing and secure payload storage */
export interface TokenKeyDto {
  initVector: string;
  key: string;
}

/**
 * AccountDto
 * Source: src/records/account.ts (AccountRecord)
 * Represents the primary parent/family account holder.
 */
export interface AccountDto {
  id?: number;
  uid: string;
  name: string;
  email: string;
  surname: string;
  fullname: string;
  locale: ISOLanguage | string;
  timezone: string;
  devicesCount: number;
  profilesCount: number;
  country: string;
  isDailyReport: boolean;
  isWeeklyReport: boolean;
  tokenKey: TokenKeyDto;
  created: ISODateString;
  masterAccountId: number | null;
  masterAccountUid: string | null;
  schoolLinkedStatus: SchoolLinkedStatus | null;
  telephone: string;
  routines: boolean;
  twoFactorAuthEnabled: boolean;
  twoFactorAuthEnabledAt: ISODateString | null;
  validated: boolean;
  telephoneValidated: boolean;
  accountRecoveryEnabledAt: ISODateString | null;
}

export interface AccountOptionsDto {
  isMasterAccount: boolean;
  hasProtectedDevices: boolean;
  maxProfiles: number;
  maxDevices: number;
  licenseTier: string;
}


// ============================================================================
// 3. PROFILE DATA MODELS
// ============================================================================

/**
 * ProfileDto
 * Source: src/records/profile/profile.ts (ProfileRecord)
 * Represents a child profile within the family ecosystem.
 */
export interface ProfileDto {
  id: number;
  uid: string;
  name: string;
  status: ProfileStatus;
  pictureUrl: string | null;
  deviceCount: number;
  gender: Gender;
  birthDate: ISODateString;
  location?: LocationDto;
  lastseen: ISODateString | '';
  created: ISODateString | '';
  deviceIds: number[];
  isLinewizestudentLinked: boolean;
  activeRoutine: string | null;
  schoolUid: string | null;
}

export interface ProfileDeviceStatsDto {
  profileId: number;
  activeDevicesCount: number;
  onlineDevicesCount: number;
  tamperedDevicesCount: number;
  totalScreenTimeMinutesToday: number;
}


// ============================================================================
// 4. DEVICE & MDM DATA MODELS
// ============================================================================

export interface UserDeviceStatusDto {
  disableProtection: {
    status: boolean;
  };
  vpnDisable: {
    status: boolean;
  };
}

export interface UserDeviceDto {
  id: number;
  uid: string;
  name: string;
  status: UserDeviceStatusDto;
  profileId: number;
  isOnline: boolean | null;
  lastseen: ISODateString | null;
}

export interface DeviceSettingsDto {
  lockNavigation: boolean;
  lockComputer: boolean;
  trayIconHidden: boolean;
  uninstallProtection: boolean;
}

export interface DeviceOptionsDto {
  canLockDevice: boolean;
  canLockNavigation: boolean;
  supportsVpn: boolean;
  supportsAccessibility: boolean;
  supportsUsageStats: boolean;
}

export interface DeviceMdmDto {
  status: 'enrolled' | 'unenrolled' | 'pending' | 'removed';
  serverUrl?: string;
  enrolledAt?: ISODateString;
  lastHeartbeat?: ISODateString;
}

/**
 * DeviceDto
 * Source: src/records/device/device.ts (DeviceRecord)
 * Represents an enrolled physical device (Android, iOS, Windows, Mac, etc.).
 */
export interface DeviceDto {
  id: number;
  uid: string;
  name: string;
  platform: Platform;
  location: LocationDto;
  type: string;
  users: UserDeviceDto[];
  defaultProfileId: number | null;
  settings: DeviceSettingsDto;
  hideTrayicon: number;
  lastseen: ISODateString;
  created: ISODateString;
  alerts: {
    unauthorizedRemove: boolean;
  };
  version: string;
  options: DeviceOptionsDto;
  isDelegated: boolean;
  mdm?: DeviceMdmDto;
}


// ============================================================================
// 5. ROUTINES, SCHEDULES & POLICIES
// ============================================================================

export enum RoutineType {
  Management = 'ROUTINE_TYPE_MANAGEMENT',
  Blocked = 'ROUTINE_TYPE_BLOCKED',
}

export enum RoutineIconType {
  Sleep = 'sleep',
  Study = 'study',
  Free = 'free',
  Play = 'play',
  School = 'school',
  Custom = 'custom',
}

export enum PolicyBlockType {
  None = 'POLICY_BLOCK_TYPE_NONE',
  Device = 'POLICY_BLOCK_TYPE_DEVICE',
  Navigation = 'POLICY_BLOCK_TYPE_NAVIGATION',
}

export enum PolicyAction {
  Allow = 'POLICY_ACTION_ALLOW',
  Block = 'POLICY_ACTION_BLOCK',
  Alert = 'POLICY_ACTION_ALERT',
  Ignore = 'POLICY_ACTION_IGNORE',
}

export interface PolicyApplicationDto {
  name: string;
  exe: string;
  platform: Platform;
  action: PolicyAction;
}

export interface PolicyApplicationRulesDto {
  defaultAction: PolicyAction | null;
  appRulesList: PolicyApplicationDto[];
  appCategoryRulesList?: Array<{
    categoryId: string;
    action: PolicyAction;
  }>;
}

export interface PolicyWebCategoryDto {
  category: number | string;
  action: PolicyAction;
}

export interface PolicyWebCategoryRulesDto {
  defaultAction: PolicyAction | null;
  categoryRulesList: PolicyWebCategoryDto[];
}

export interface PolicyDto {
  countsTowardsDailyTimeQuota: boolean;
  blockType: PolicyBlockType;
  appRules: PolicyApplicationRulesDto;
  webRules: PolicyWebCategoryRulesDto;
}

/**
 * RoutineDto
 * Source: src/records/routines/routine.ts (RoutineOperations)
 * Represents a logical routine mode (e.g., Bedtime, School, Homework, Free Time).
 */
export interface RoutineDto {
  uid: string;
  name: string;
  description?: string;
  icon: RoutineIconType;
  color: string;
  type: RoutineType;
  paused: boolean;
  enabled: boolean;
  policy: PolicyDto;
  schedules?: ScheduleDto[];
}

/**
 * ScheduleDto
 * Source: src/records/routines/schedule/schedule.ts (ScheduleOperations)
 * Weekly recurrence time slot mapped to a specific routine.
 */
export interface ScheduleDto {
  uid: string;
  routineUid: string;
  weekdays: Weekday[];
  overrides: boolean;
  startTime: string; // 'HH:mm:ss' format
  durationMinutes: number; // Duration in minutes (e.g. 480 for 8 hours)
  fromDate: ISODateString | null;
  toDate: ISODateString | null;
}


// ============================================================================
// 6. TIME QUOTAS & RESTRICTIONS
// ============================================================================

/**
 * WeekdayTimeMappingDto
 * Exact 7-day integer minute map enforcing the 1440-minute daily ceiling constraint.
 */
export type WeekdayTimeMappingDto = Record<Weekday, number>;

export interface TimeQuotaDto {
  activeTimeLimit: boolean;
  activeTamperedTimeLimit: boolean;
  applyDailyTimeLimits: boolean;
  quotas: WeekdayTimeMappingDto; // 0 to 1440 minutes allowed per day
  usageTodayMinutes: number;
  remainingMinutesToday: number;
}

export interface TimeSettingsDto {
  timeRanges: WeekdayTimeMappingDto;
  quotas: WeekdayTimeMappingDto;
  usage: Record<Weekday, number>;
  isMultiDevices: boolean;
  isDailyLimit: boolean;
  isLockNavigation: boolean;
  isLockComputer: boolean;
  isReportAlerts: boolean;
}

export interface ExtraTimeRequestDto {
  uid: string;
  profileUid: string;
  seconds: number;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  requestedAt: ISODateString;
  resolvedAt?: ISODateString;
}


// ============================================================================
// 7. APPLICATION & WEB RULES
// ============================================================================

export type ApplicationAction = 'ALLOW' | 'BLOCK' | 'LIMIT';

export interface AppRuleDto {
  id: string | null;
  exe: string; // Android package name or Desktop executable (e.g. 'com.instagram.android')
  name: string;
  action: ApplicationAction;
  platform: Platform;
  quotas: WeekdayTimeMappingDto; // Default: 1440 mins per day
  thumbnail: string;
  blockable: boolean;
  isUnsupportedBrowser: boolean;
  ageRating: number | null;
  categoryId: string;
  appInstalledAt: ISODateString | null;
  timeRestrictionsEnabled: boolean;
}

export interface AppCategoryRuleDto {
  categoryId: string;
  action: ApplicationAction;
}

export interface UnsupportedBrowserDto {
  name: string;
  androidName: string;
  osxName: string;
  windowsName: string;
  iosName: string;
  chromebookName: string;
}

export type WebfilterAction = 'ALLOW' | 'BLOCK' | 'ALERT' | 'IGNORE';

export interface WebCategoryRuleDto {
  category: number;
  categoryName?: string;
  action: WebfilterAction;
}

export interface DomainRuleDto {
  domain: string;
  action: WebfilterAction;
}

export interface WebRulesDto {
  isCategoryList: boolean;
  isAllowUnknownSites: boolean;
  isSafeSearch: boolean;
  isReportBlockedSites: boolean;
  isSearchAlertsNotificationsEnabled: boolean;
  categories: WebCategoryRuleDto[];
  domains: Record<string, WebfilterAction>;
}

export type VideoAction = 'ALLOW' | 'BLOCK';

export interface VideoRulesDto {
  youtube: {
    videoIds: Record<string, VideoAction>;
  };
}


// ============================================================================
// 8. GEOFENCING & SAVED PLACES
// ============================================================================

export interface LocationDto {
  latitude: number;
  longitude: number;
  time: ISODateString;
  accuracy?: number;
  addressLines?: string[];
  deviceId?: number;
}

export interface GeofenceAlertsDto {
  onEntry: boolean;
  onExit: boolean;
}

/**
 * PlaceDto
 * Source: src/records/place.ts (PlaceRecord)
 * Minimum geofence radius enforced: 100 meters.
 */
export interface PlaceDto {
  uid: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // Minimum 100 meters
  address: string;
  alerts?: GeofenceAlertsDto;
  profileUid?: string;
}


// ============================================================================
// 9. PANIC / SOS EMERGENCY SYSTEM
// ============================================================================

export enum PanicContactType {
  Phone = 'PHONE',
  Email = 'EMAIL',
}

export enum PanicContactStatus {
  Pending = 'PENDING',
  Verified = 'VERIFIED',
}

/**
 * PanicContactDto
 * Source: src/records/contact.ts (ContactRecord)
 * Maximum contacts allowed: 4 (PANIC_RULES_MAX_CONTACTS = 4)
 */
export interface PanicContactDto {
  id: number;
  name: string;
  contact: string; // Phone number (E.164) or email address
  type: PanicContactType;
  status: PanicContactStatus;
  phone?: string;
}

export interface PanicRulesDto {
  enabled: boolean;
  maxContacts: 4;
  contacts: PanicContactDto[];
  accountHolder: {
    name: string;
    contact: string;
  };
}

export interface PanicAlertDto {
  alertId: string;
  profileId: number;
  deviceId: number;
  triggeredAt: ISODateString;
  location: LocationDto;
  resolved: boolean;
  resolvedAt?: ISODateString;
}


// ============================================================================
// 10. ACTIVITY EVENTS & MONITORING TIMELINE
// ============================================================================

export enum EventType {
  Unknown = 0,
  Twitter = 1,
  Web = 101,
  Sms = 102,
  Search = 103,
  FacebookSocial = 200,
  Calls = 201,
  CallsIncoming = 280,
  CallsOutgoing = 281,
  CallsMissed = 282,
  CallsUnanswered = 283,
  SmsIncoming = 284,
  SmsOutgoing = 285,
  CallsBlockedIncoming = 286,
  CallsBlockedOutgoing = 287,
  SmsBlockedIncoming = 288,
  SmsBlockedOutgoing = 289,
  App = 301,
  Location = 400,
  LocationUnavailable = 401,
  LocationLast = 402,
  Panic = 500,
  SafeNetworkDisablingProtection = 703,
  SafeNetworkEnablingProtection = 704,
  MessageAlert = 4281,
  WhatsappAlert = 4282,
  InstagramAlert = 4283,
  LineAlert = 4284,
  SnapchatAlert = 4285,
  TiktokAlert = 4286,
  TwitterxAlert = 4287,
  VoiceAlert = 4288,
  SocialMonitoringAlert = 4289,
  Youtube = -100,
}

export enum EventBlockReason {
  None = 0,
  CategoryBlock = 1,
  DomainListBlock = 2,
  NotAllowUnknownSites = 3,
  TimeRestrictionsQuota = 4,
  TimeRestrictionsRange = 5,
  AppBlock = 6,
  CategoryAlert = 7,
  DomainListAlert = 8,
  DomainListAllow = 9,
}

export enum SearchEngine {
  Youtube = 'youtube',
  Google = 'google',
  Bing = 'bing',
  Unknown = 'unknown',
}

export interface SafeNetworkDto {
  ssid: string;
  bssid: string;
  protectionEnabled: boolean;
}

/**
 * ActivityEventDto
 * Source: src/records/event.ts (EventRecord)
 * Unified timeline event capturing web, app, call, SMS, YouTube, geofence, and SOS activity.
 */
export interface ActivityEventDto {
  key: string;
  label: string;
  time: ISODateString;
  timestamp: number;
  badge: string;
  type: EventType;
  action: {
    action: 'ALLOW' | 'BLOCK' | 'ALERT' | 'IGNORE';
    reason: EventBlockReason | null;
  };
  device: string;
  platform: Platform;
  appName: string;
  minutes: number;
  name: string;
  accountId: number;
  profileId: number;
  deviceId: number;
  socialContactId?: string;
  text?: string;
  socialContactName?: string;
  blockedPages: number;
  pages: number;
  location?: LocationDto;
  panicMode: boolean;
  thumbnail?: string;
  host?: string;
  url?: string;
  reason: number;
  categories: number[];
  searchEngineName?: string;
  searchEngine?: SearchEngine;
  network?: SafeNetworkDto;
  packageName?: string;
  isInRoutine: boolean;
  threatCategories?: string[];
  threatMessages?: string[];
  contactName?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
}


// ============================================================================
// 11. PERSISTENT STORAGE DTO
// ============================================================================

export interface LockStateDto {
  state: 'locked' | 'unlocked' | 'disabled';
  timestamp: number;
}

/**
 * PersistentStorageDto
 * Source: src/ducks/persistentStorage.ts (storageKeys)
 * Represents the 26 audited persistent storage fields.
 */
export interface PersistentStorageDto {
  authorizationApplication: string;
  welcomeModalShown: boolean;
  accessToken: string;
  refreshToken: string;
  parentDeviceId: string;
  paymentProvider: 'googleplay' | 'apple' | 'chargebee' | 'disable';
  installationTs: ISODateString;
  sessionStartTs: ISODateString;
  appRateRateTs: ISODateString;
  appRateFeedbackTs: ISODateString;
  appRateRemindMeLaterTs: ISODateString;
  lastAppVersion: string;
  lastPushPermission: string;
  lastRegistrationId: string;
  panicRulesTourShown: boolean;
  externalNavigationAccepted: boolean;
  lastInteractionTs: ISODateString;
  purchaseStartedTs: ISODateString;
  appOnboardingFinished: boolean;
  track: string;
  userClosedSmartAppBanner: boolean;
  parentAppStandaloneConfirmed: boolean;
  lockState: LockStateDto;
  onboardingTokenData: string;
  onboardingLiveActivityLastSuccessfulUpdateAt: ISODateString;
  state: string; // Serialized Redux state
}


// ============================================================================
// 12. INGESTION & CONVERSION HELPERS FOR FAMILY OS
// ============================================================================

/**
 * Normalizes daily quotas to guarantee the strict 1440-minute ceiling constraint.
 */
export function normalizeDailyQuotas(
  rawQuotas: Partial<Record<Weekday, number>>
): WeekdayTimeMappingDto {
  const weekdays: Weekday[] = ['mon', 'tue', 'wed', 'thr', 'fri', 'sat', 'sun'];
  const normalized: Partial<WeekdayTimeMappingDto> = {};

  for (const day of weekdays) {
    const value = rawQuotas[day];
    if (typeof value === 'number' && !Number.isNaN(value)) {
      normalized[day] = Math.max(0, Math.min(1440, Math.round(value)));
    } else {
      normalized[day] = 1440; // Default full day allowance (no quota lock)
    }
  }

  return normalized as WeekdayTimeMappingDto;
}

/**
 * Type guard for ActivityEventDto
 */
export function isActivityEventDto(obj: unknown): obj is ActivityEventDto {
  if (typeof obj !== 'object' || obj === null) return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.key === 'string' &&
    typeof candidate.time === 'string' &&
    typeof candidate.type === 'number'
  );
}

/**
 * Type guard for RoutineDto
 */
export function isRoutineDto(obj: unknown): obj is RoutineDto {
  if (typeof obj !== 'object' || obj === null) return false;
  const candidate = obj as Record<string, unknown>;
  return (
    typeof candidate.uid === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.policy === 'object'
  );
}
