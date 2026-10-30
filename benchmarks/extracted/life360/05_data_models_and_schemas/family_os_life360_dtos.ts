/**
 * Life360 — TypeScript Data Transfer Objects (DTOs) & Network Models
 *
 * Reverse-Engineered from:
 * - `com.life360.android.Core360Api`
 * - `com.life360.android.driving.network.DriverBehaviorApi`
 * - `com.life360.android.awarenessengine.network.TileAdvertisementApi`
 */

export interface Life360User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface Life360Circle {
  id: string;
  name: string;
  color: string;
  unreadMessagesCount: number;
  members: CircleMemberDto[];
  places: PlaceDto[];
}

export interface CircleMemberDto {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  batteryLevel: number;
  isCharging: boolean;
  isDriving: boolean;
  location: {
    latitude: Double;
    longitude: Double;
    accuracyMeters: number;
    speedKmh: number;
    timestamp: number;
    addressString?: string;
  };
}

export interface PlaceDto {
  id: string;
  circleId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  alertOnArrival: boolean;
  alertOnDeparture: boolean;
}

export interface DriveTripSummaryDto {
  tripId: string;
  userId: string;
  startTime: number;
  endTime: number;
  distanceMeters: number;
  topSpeedKmh: number;
  averageSpeedKmh: number;
  hardBrakingCount: number;
  rapidAccelCount: number;
  highSpeedCount: number;
  phoneUsageMinutes: number;
  driveScore: number; // 0 to 100
  encodedPolyline: string;
}

export interface CrashEventDto {
  crashId: string;
  userId: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  peakGForce: number;
  preCollisionSpeedKmh: number;
  status: 'PENDING_COUNTDOWN' | 'CANCELLED' | 'DISPATCHED';
}

export interface TileSightingDto {
  tileMacAddress: string;
  latitude: number;
  longitude: number;
  horizontalAccuracy: number;
  rssi: number;
  timestamp: number;
}
