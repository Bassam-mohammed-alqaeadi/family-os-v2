/**
 * ============================================================================
 * Family OS — Bark Reverse-Engineered Data Transfer Objects (DTOs)
 * Target Application: Bark Parental Controls (v6.5.1 Build 600500103) & Bark Kids Sentinel
 * Sources:
 *   - Android Multi-DEX decompiled sources (classes.dex - classes4.dex)
 *   - Hermes Bytecode v98 string tables & Redux state keys ('bark/@state')
 *   - Bark Guard VPN loopback engine & WorkManager sync schemas
 * Purpose: Production-ready, type-safe TypeScript interfaces, enums, validation
 *          types, and API schemas for ingesting Bark parental control policies,
 *          risk signals, and offline enforcement rules into Family OS NestJS backend.
 * ============================================================================
 */

// ============================================================================
// 1. COMMON PRIMITIVES & ENUMERATIONS
// ============================================================================

/** ISO-8601 UTC timestamp string (e.g., '2026-10-29T18:00:00.000Z') */
export type ISODateString = string;

/** Primary Bark subscription tier offerings */
export enum SubscriptionPlan {
  BARK_JR = 'bark_jr',           // Screen time and location filtering only
  BARK_PREMIUM = 'bark_premium', // Full AI content monitoring + screen time + location
  BARK_PHONE = 'bark_phone',     // Dedicated Bark-hardened Android hardware device
  TRIAL = 'trial',               // Active 7-day free trial period
}

/** Subscription billing lifecycle states */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
}

/** Billing frequency */
export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  LIFETIME = 'lifetime',
}

/** Account authority classification */
export enum AccountType {
  PARENT = 'parent',
  GUARDIAN = 'guardian',
  TRIAL = 'trial',
}

/** Gender classification */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNSPECIFIED = 'unspecified',
}

/** Child monitoring capability tier */
export enum MonitoringTier {
  FULL = 'full',                     // Content scanning + screen time + location
  SCREEN_TIME_ONLY = 'screen_time_only', // Screen time + web filtering + location
}

/** Physical device hardware category */
export enum DeviceType {
  PHONE = 'phone',
  TABLET = 'tablet',
  CHROMEBOOK = 'chromebook',
  PC = 'pc',
  MAC = 'mac',
}

/** Operating system family running on child device */
export enum DeviceOsFamily {
  ANDROID = 'android',
  IOS = 'ios',
  CHROME_OS = 'chrome_os',
  WINDOWS = 'windows',
  MACOS = 'macos',
}

/** Hardware pairing status */
export enum PairingStatus {
  PENDING_PAIRING = 'pending_pairing',
  PAIRED = 'paired',
  UNPAIRED = 'unpaired',
  REVOKED = 'revoked',
}

/** Monitored social media and messaging platforms supported by Bark */
export enum BarkPlatform {
  WHATSAPP = 'whatsapp',
  WHATSAPP_BUSINESS = 'whatsapp_business',
  INSTAGRAM = 'instagram',
  SNAPCHAT = 'snapchat',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  DISCORD = 'discord',
  TWITTER = 'twitter',
  SMS = 'sms',
  BROWSER = 'browser',
  SYSTEM = 'system',
}

/** Communication channel modality */
export enum ChannelType {
  DIRECT_MESSAGE = 'direct_message',
  GROUP_CHAT = 'group_chat',
  POST_COMMENT = 'post_comment',
  SEARCH_QUERY = 'search_query',
  NOTIFICATION = 'notification',
}

/** On-device text acquisition mechanism */
export enum ExtractionSource {
  ACCESSIBILITY_SCRAPE = 'accessibility_scrape',
  NOTIFICATION_LISTENER = 'notification_listener',
  VPN_DNS_QUERY = 'vpn_dns_query',
}

/** Bark core danger classifications detected by AI heuristics */
export enum BarkDangerCategory {
  CYBERBULLYING = 'cyberbullying',
  DEPRESSION_SUICIDE = 'depression_suicide',
  SEXUAL_CONTENT_SEXTING = 'sexual_content_sexting',
  PREDATORY_CONTACT = 'predatory_contact',
  DRUGS_ALCOHOL = 'drugs_alcohol',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE_WEAPONS = 'violence_weapons',
  PROFANITY = 'profanity',
  ANXIETY_MENTAL_HEALTH = 'anxiety_mental_health',
}

/** Risk severity rating [1 to 5] */
export enum RiskSeverity {
  NOTICE = 1,
  LOW = 2,
  MODERATE = 3,
  HIGH = 4,
  SEVERE_EMERGENCY = 5,
}

/** Risk signal processing status */
export enum SignalStatus {
  DETECTED = 'detected',
  ENCRYPTED_QUEUED = 'encrypted_queued',
  UPLOADED = 'uploaded',
  DISMISSED = 'dismissed',
}

/** Parent alert triage and review status */
export enum AlertStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ESCALATED = 'escalated',
}

/** Screen time ruleset profile modes */
export enum RulesetType {
  DEFAULT = 'default',
  SCHOOL = 'school',
  BEDTIME = 'bedtime',
  BONUS = 'bonus',
  PAUSED = 'paused',
  CUSTOM = 'custom',
}

/** Day of week enumeration (0 = Sunday to 6 = Saturday) */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/** Action executed by Bark Guard local loopback DNS VPN */
export enum FilterAction {
  ALLOW = 'allow',
  BLOCK = 'block',
  WARN = 'warn',
}

/** Type of custom filtering exception */
export enum ExceptionType {
  DOMAIN = 'domain',
  APP = 'app',
}

/** Explicit exception action override */
export enum ExceptionAction {
  ALWAYS_ALLOW = 'always_allow',
  ALWAYS_BLOCK = 'always_block',
}

/** Geofence zone classification */
export enum ZoneType {
  HOME = 'home',
  SCHOOL = 'school',
  ACTIVITIES = 'activities',
  CUSTOM = 'custom',
}

/** Trigger origin for location check-ins */
export enum CheckinType {
  MANUAL = 'manual',
  PARENT_REQUESTED = 'parent_requested',
  GEOFENCE_TRIGGER = 'geofence_trigger',
  PERIODIC = 'periodic',
}

/** Geofence boundary transition type */
export enum GeofenceTransition {
  ENTER = 'enter',
  EXIT = 'exit',
  DWELL = 'dwell',
}

/** Database sync mutation operation */
export enum SyncOperation {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
  TELEMETRY = 'telemetry',
}

/** Offline queue dispatch state */
export enum SyncStatus {
  PENDING = 'pending',
  IN_FLIGHT = 'in_flight',
  FAILED = 'failed',
  SYNCED = 'synced',
}

/** Diagnostic telemetry event classification */
export enum TelemetryLogType {
  BATTERY = 'battery',
  VPN_STATUS = 'vpn_status',
  ACCESSIBILITY_HEARTBEAT = 'accessibility_heartbeat',
  APP_CRASH = 'app_crash',
  ANTI_TAMPER_ALERT = 'anti_tamper_alert',
}

/** Telemetry log severity level */
export enum TelemetrySeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}


// ============================================================================
// 2. CRYPTOGRAPHIC & SECURITY DTOs
// ============================================================================

/**
 * Google Tink AEAD encrypted envelope for transporting sensitive risk signals
 * and monitored chat snippets over untrusted networks.
 */
export interface EncryptedEnvelopeDto {
  keyId: string;             // Google Tink KeySet ID
  initializationVector: string; // Base64 encoded 12-byte IV/nonce
  ciphertext: string;        // Base64 encoded AES-256-GCM ciphertext
  authenticationTag: string; // Base64 encoded 16-byte Poly1305/GCM tag
  associatedData?: string;   // Optional authenticated additional data (AAD)
}


// ============================================================================
// 3. ACCOUNTS & FAMILY PROFILES DTOs
// ============================================================================

export interface AccountDto {
  accountId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  accountType: AccountType;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  billingCycle: BillingCycle;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastActiveAt?: ISODateString;
  sessionToken?: string;
}

export interface CreateAccountDto {
  email: string;
  fullName: string;
  phoneNumber?: string;
  subscriptionPlan?: SubscriptionPlan;
  billingCycle?: BillingCycle;
}

export interface UpdateAccountDto {
  fullName?: string;
  phoneNumber?: string;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  billingCycle?: BillingCycle;
}

export interface ChildProfileDto {
  childId: string;
  accountId: string;
  firstName: string;
  lastName?: string;
  birthYear: number;
  gender: Gender;
  avatarUrl?: string;
  schoolName?: string;
  timeZone: string;
  monitoringTier: MonitoringTier;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateChildProfileDto {
  firstName: string;
  lastName?: string;
  birthYear: number;
  gender?: Gender;
  avatarUrl?: string;
  schoolName?: string;
  timeZone?: string;
  monitoringTier?: MonitoringTier;
}

export interface UpdateChildProfileDto {
  firstName?: string;
  lastName?: string;
  birthYear?: number;
  gender?: Gender;
  avatarUrl?: string;
  schoolName?: string;
  timeZone?: string;
  monitoringTier?: MonitoringTier;
  isActive?: boolean;
}

export interface PairedDeviceDto {
  deviceId: string;
  childId: string;
  deviceName: string;
  deviceType: DeviceType;
  osFamily: DeviceOsFamily;
  osVersion: string;
  barkAgentVersion: string;
  pairingCode?: string;
  pairingStatus: PairingStatus;
  pairingTimestamp: ISODateString;
  batteryLevel: number;
  isVpnActive: boolean;
  isAccessibilityGranted: boolean;
  isNotificationGranted: boolean;
  lastHeartbeat?: ISODateString;
}

export interface PairDeviceRequestDto {
  childId: string;
  deviceName: string;
  deviceType: DeviceType;
  osFamily: DeviceOsFamily;
  osVersion: string;
  barkAgentVersion: string;
  pairingCode: string;
}

export interface PairDeviceResponseDto {
  deviceId: string;
  childId: string;
  pairingStatus: PairingStatus;
  authToken: string;
  issuedAt: ISODateString;
}

export interface DeviceHeartbeatDto {
  deviceId: string;
  batteryLevel: number;
  isVpnActive: boolean;
  isAccessibilityGranted: boolean;
  isNotificationGranted: boolean;
  timestamp: ISODateString;
}


// ============================================================================
// 4. CAPTURED CHAT & DEDUPLICATION DTOs
// ============================================================================

export interface MonitoredMessageDto {
  messageId: string;
  deviceId: string;
  childId: string;
  platform: BarkPlatform;
  channelType: ChannelType;
  senderIdentifier: string;
  recipientIdentifier?: string;
  messageBody: string;
  rawContentHash: string;
  timestampEpochMs: number;
  capturedAt: ISODateString;
  extractionSource: ExtractionSource;
  isIncoming: boolean;
  mediaUrls?: string[];
}

export interface CreateMonitoredMessageDto {
  deviceId: string;
  childId: string;
  platform: BarkPlatform;
  channelType: ChannelType;
  senderIdentifier: string;
  recipientIdentifier?: string;
  messageBody: string;
  rawContentHash: string;
  timestampEpochMs: number;
  extractionSource: ExtractionSource;
  isIncoming: boolean;
  mediaUrls?: string[];
}

export interface BatchMonitoredMessagesDto {
  deviceId: string;
  childId: string;
  messages: CreateMonitoredMessageDto[];
  batchTimestamp: ISODateString;
}

export interface DeduplicationEntryDto {
  hashId: string;
  deviceId: string;
  rawHash: string;
  channelId: string;
  normalizedSnippet: string;
  bucketWindow: number;
  firstSeenAt: ISODateString;
  lastSeenAt: ISODateString;
  hitCount: number;
}

export interface DeduplicationCheckRequestDto {
  deviceId: string;
  rawHash: string;
  channelId: string;
  bucketWindow: number;
}

export interface DeduplicationCheckResponseDto {
  isDuplicate: boolean;
  suppressReason?: string;
}


// ============================================================================
// 5. RISK SIGNALS & ALERTS DTOs
// ============================================================================

export interface RiskSignalDto {
  signalId: string;
  deviceId: string;
  childId: string;
  messageId?: string;
  dangerCategory: BarkDangerCategory;
  severityScore: RiskSeverity;
  confidenceScore: number;
  matchedKeywords: string[];
  contextSnippet: string;
  status: SignalStatus;
  encryptionKeyId?: string;
  detectedAt: ISODateString;
  uploadedAt?: ISODateString;
}

export interface CreateRiskSignalDto {
  deviceId: string;
  childId: string;
  messageId?: string;
  dangerCategory: BarkDangerCategory;
  severityScore: RiskSeverity;
  confidenceScore: number;
  matchedKeywords: string[];
  contextSnippet: string;
  encryptedEnvelope?: EncryptedEnvelopeDto;
  detectedAt: ISODateString;
}

export interface RiskSignalBatchDto {
  deviceId: string;
  childId: string;
  signals: CreateRiskSignalDto[];
  dispatchedAt: ISODateString;
}

export interface AlertHistoryDto {
  alertId: string;
  signalId?: string;
  accountId: string;
  childId: string;
  title: string;
  category: BarkDangerCategory;
  severityLevel: RiskSeverity;
  parentStatus: AlertStatus;
  parentNotes?: string;
  notificationSentAt?: ISODateString;
  reviewedAt?: ISODateString;
  resolvedAt?: ISODateString;
  conversationSuggestions?: ConversationSuggestionDto[];
}

export interface UpdateAlertStatusDto {
  alertId: string;
  status: AlertStatus;
  parentNotes?: string;
}

export interface ConversationSuggestionDto {
  suggestionId: string;
  alertId: string;
  riskCategory: BarkDangerCategory;
  title: string;
  empathyPrompt: string;
  discussionGuideMarkdown: string;
  recommendedAction: string;
  childPsychologyNotes?: string;
  createdAt: ISODateString;
}

export interface GenerateSuggestionsRequestDto {
  alertId: string;
  childAge: number;
  riskCategory: BarkDangerCategory;
  severityScore: RiskSeverity;
}


// ============================================================================
// 6. SCREEN TIME & VPN RULESETS DTOs
// ============================================================================

export interface ScreenTimeRulesetDto {
  rulesetId: string;
  childId: string;
  rulesetName: string;
  rulesetType: RulesetType;
  isActive: boolean;
  allowInternet: boolean;
  enforceSafesearch: boolean;
  blockAllApps: boolean;
  scheduleBlocks: ScheduleBlockDto[];
  categoryBlockRules: CategoryBlockRuleDto[];
  customExceptions: CustomExceptionDto[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateScreenTimeRulesetDto {
  childId: string;
  rulesetName: string;
  rulesetType: RulesetType;
  allowInternet?: boolean;
  enforceSafesearch?: boolean;
  blockAllApps?: boolean;
}

export interface UpdateScreenTimeRulesetDto {
  rulesetName?: string;
  rulesetType?: RulesetType;
  isActive?: boolean;
  allowInternet?: boolean;
  enforceSafesearch?: boolean;
  blockAllApps?: boolean;
}

export interface ScheduleBlockDto {
  blockId: string;
  rulesetId: string;
  childId: string;
  dayOfWeek: DayOfWeek;
  startTimeMinutes: number; // [0 - 1439]
  endTimeMinutes: number;   // [0 - 1439]
  isEnabled: boolean;
  recurringRule: string;
}

export interface CreateScheduleBlockDto {
  rulesetId: string;
  childId: string;
  dayOfWeek: DayOfWeek;
  startTimeMinutes: number;
  endTimeMinutes: number;
  isEnabled?: boolean;
  recurringRule?: string;
}

export interface CategoryBlockRuleDto {
  ruleId: string;
  rulesetId: string;
  categoryCode: string;
  categoryName: string;
  action: FilterAction;
  dnsSinkholeIp: string;
  createdAt: ISODateString;
}

export interface CustomExceptionDto {
  exceptionId: string;
  rulesetId?: string;
  childId: string;
  domainPattern?: string;
  packageName?: string;
  exceptionType: ExceptionType;
  action: ExceptionAction;
  reason?: string;
  createdAt: ISODateString;
}

export interface CreateCustomExceptionDto {
  rulesetId?: string;
  childId: string;
  domainPattern?: string;
  packageName?: string;
  exceptionType: ExceptionType;
  action: ExceptionAction;
  reason?: string;
}

export interface ActiveRulesetEvaluationDto {
  childId: string;
  activeRulesetId: string;
  activeRulesetType: RulesetType;
  allowInternet: boolean;
  enforceSafesearch: boolean;
  blockAllApps: boolean;
  evaluatedAt: ISODateString;
  nextTransitionAt?: ISODateString;
}


// ============================================================================
// 7. GEOFENCING & LOCATION CHECK-INS DTOs
// ============================================================================

export interface GeofenceZoneDto {
  zoneId: string;
  childId: string;
  zoneName: string;
  zoneType: ZoneType;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateGeofenceZoneDto {
  childId: string;
  zoneName: string;
  zoneType?: ZoneType;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  notifyOnEntry?: boolean;
  notifyOnExit?: boolean;
}

export interface UpdateGeofenceZoneDto {
  zoneName?: string;
  zoneType?: ZoneType;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  notifyOnEntry?: boolean;
  notifyOnExit?: boolean;
  isActive?: boolean;
}

export interface LocationCheckinDto {
  checkinId: string;
  childId: string;
  deviceId: string;
  checkinType: CheckinType;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitude?: number;
  batteryPercentage?: number;
  checkinTimestamp: ISODateString;
  addressReverseGeo?: string;
  note?: string;
}

export interface SubmitLocationCheckinDto {
  childId: string;
  deviceId: string;
  checkinType: CheckinType;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitude?: number;
  batteryPercentage?: number;
  checkinTimestamp: ISODateString;
  note?: string;
}

export interface GeofenceEventDto {
  eventId: string;
  zoneId: string;
  childId: string;
  deviceId: string;
  transitionType: GeofenceTransition;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  eventTimestamp: ISODateString;
  isNotified: boolean;
}

export interface ReportGeofenceEventDto {
  zoneId: string;
  childId: string;
  deviceId: string;
  transitionType: GeofenceTransition;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  eventTimestamp: ISODateString;
}


// ============================================================================
// 8. SYNC QUEUE & TELEMETRY DTOs
// ============================================================================

export interface OfflineSyncItemDto {
  mutationId: string;
  deviceId: string;
  entityType: 'risk_signal' | 'checkin' | 'geofence_event' | 'telemetry' | 'ruleset_ack';
  entityId: string;
  operation: SyncOperation;
  payloadBase64: string;
  priority: number; // 1 to 5
  attemptCount: number;
  maxRetries: number;
  createdAt: ISODateString;
  lastAttemptAt?: ISODateString;
  errorMessage?: string;
  status: SyncStatus;
}

export interface BatchSyncRequestDto {
  deviceId: string;
  mutations: OfflineSyncItemDto[];
  syncTimestamp: ISODateString;
}

export interface BatchSyncResponseDto {
  deviceId: string;
  acknowledgedMutationIds: string[];
  failedMutationIds: { mutationId: string; error: string; shouldRetry: boolean }[];
  serverTimestamp: ISODateString;
}

export interface TelemetryLogDto {
  logId: string;
  deviceId: string;
  logType: TelemetryLogType;
  payload: Record<string, unknown>;
  severity: TelemetrySeverity;
  recordedAt: ISODateString;
  syncedAt?: ISODateString;
}

export interface BatchTelemetryDto {
  deviceId: string;
  logs: TelemetryLogDto[];
  dispatchedAt: ISODateString;
}
