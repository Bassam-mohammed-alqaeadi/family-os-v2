/**
 * Wondershare FamiSafe — TypeScript Data Transfer Objects (DTOs) & Network Schemas
 *
 * Reverse-Engineered from:
 * - `com.wondershare.famisafe.common.bean.*`
 * - `com.wondershare.famisafe.parent.*.bean.*`
 */

export interface WondershareAuthUser {
  userId: string;
  email: string;
  nickname: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
  avatarUrl?: string;
  isVip: boolean;
  vipExpireDate?: string;
}

export interface ChildDeviceProfile {
  memberId: string;
  childName: string;
  childAge: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  avatarId: number;
  deviceUuid: string;
  deviceModel: string;
  osVersion: string;
  batteryLevel: number;
  isCharging: boolean;
  isOnline: boolean;
  lastActiveTime: number;
  currentRuleSetVersion: number;
}

export interface ScreenTimeRuleDto {
  ruleId: string;
  memberId: string;
  dayOfWeek: number; // 1 (Mon) .. 7 (Sun)
  dailyAllowanceMinutes: number;
  bonusMinutes: number;
  instantBlockActive: boolean;
  curfewSchedules: CurfewScheduleDto[];
}

export interface CurfewScheduleDto {
  curfewId: string;
  name: string;
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  repeatDaysBitmask: number;
  associatedGeofenceId?: string;
  isEnabled: boolean;
}

export interface AppRuleDto {
  packageName: string;
  appName: string;
  category: 'GAMES' | 'SOCIAL' | 'VIDEO' | 'EDUCATION' | 'PRODUCTIVITY' | 'UNCLASSIFIED';
  ruleType: 'ALWAYS_ALLOWED' | 'ALWAYS_BLOCKED' | 'DAILY_LIMIT';
  dailyLimitMinutes: number;
  usedSecondsToday: number;
  isCategoryBlocked: boolean;
}

export interface GeofenceZoneDto {
  zoneId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  polygonPoints?: Array<{ lat: number; lng: number }>;
  notifyOnEnter: boolean;
  notifyOnExit: boolean;
  isActive: boolean;
}

export interface LocationBreadcrumbDto {
  memberId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  timestamp: number;
  addressString?: string;
}

export interface DrivingTripDto {
  tripId: string;
  memberId: string;
  startTime: number;
  endTime: number;
  totalDistanceKm: number;
  topSpeedKmh: number;
  averageSpeedKmh: number;
  hardBrakingCount: number;
  rapidAccelCount: number;
  speedingCount: number;
  phoneUsageSeconds: number;
  safetyScore: number;
}

export interface WebFilterPolicyDto {
  memberId: string;
  enforceSafeSearch: boolean;
  blockedCategories: string[];
  whitelistDomains: string[];
  blacklistDomains: string[];
}

export interface SuspiciousAlertDto {
  alertId: string;
  memberId: string;
  alertType: 'TEXT_EXPLICIT' | 'PHOTO_NSFW' | 'YOUTUBE_RESTRICTED' | 'BATTERY_CRITICAL' | 'SOS_EMERGENCY';
  sourceApp?: string;
  senderName?: string;
  rawSnippet?: string;
  threatCategory: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: number;
  isReviewed: boolean;
}

export interface AudioRecordSessionDto {
  sessionId: string;
  memberId: string;
  durationSeconds: number;
  fileDownloadUrl?: string;
  averageDecibels: number;
  status: 'RECORDING' | 'UPLOADED' | 'FAILED';
  createdAt: number;
}
