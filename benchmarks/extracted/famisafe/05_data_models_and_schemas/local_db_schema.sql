-- ============================================================================
-- Wondershare FamiSafe — Complete Local Database Schema (Room / SQLite)
-- Package: com.wondershare.famisafe
-- Version: 7.2.5.9669
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Audio Surrounding Recordings Cache (Room Database: AudioFileDataBase)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audio_file` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `filename` TEXT,
    `duration` INTEGER,
    `time` INTEGER,
    `filePath` TEXT,
    `isLocal` INTEGER,
    `file_id` INTEGER,
    `serviceJson` TEXT,
    `download_state` INTEGER,
    `member_id` TEXT
);

CREATE INDEX IF NOT EXISTS `index_audio_file_member_id` ON `audio_file` (`member_id`);
CREATE INDEX IF NOT EXISTS `index_audio_file_file_id` ON `audio_file` (`file_id`);

-- ----------------------------------------------------------------------------
-- 2. Resilient Background Job Scheduling (Evernote Job Engine)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
    `_id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `tag` TEXT NOT NULL,
    `startMs` INTEGER NOT NULL,
    `endMs` INTEGER NOT NULL,
    `backoffMs` INTEGER NOT NULL,
    `backoffPolicy` TEXT NOT NULL,
    `intervalMs` INTEGER NOT NULL,
    `requirementsEnforced` INTEGER NOT NULL,
    `requiresCharging` INTEGER NOT NULL,
    `requiresDeviceIdle` INTEGER NOT NULL,
    `exact` INTEGER NOT NULL,
    `networkType` TEXT NOT NULL,
    `extras` TEXT,
    `persisted` INTEGER NOT NULL,
    `numFailures` INTEGER NOT NULL,
    `scheduledAt` INTEGER NOT NULL,
    `started` INTEGER NOT NULL,
    `flexMs` INTEGER NOT NULL,
    `transient` INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS `index_jobs_tag` ON `jobs` (`tag`);

-- ----------------------------------------------------------------------------
-- 3. Screen Time Rules & Daily Quotas Offline Policy Cache
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `screen_time_rules` (
    `rule_id` TEXT PRIMARY KEY NOT NULL,
    `member_id` TEXT NOT NULL,
    `day_of_week` INTEGER NOT NULL, -- 1=Monday .. 7=Sunday
    `allowed_minutes` INTEGER NOT NULL,
    `bonus_minutes` INTEGER DEFAULT 0,
    `is_instant_blocked` INTEGER DEFAULT 0,
    `updated_at` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `scheduled_curfews` (
    `curfew_id` TEXT PRIMARY KEY NOT NULL,
    `member_id` TEXT NOT NULL,
    `curfew_name` TEXT NOT NULL,
    `start_time` TEXT NOT NULL, -- HH:mm:ss
    `end_time` TEXT NOT NULL,   -- HH:mm:ss
    `repeat_days_mask` INTEGER NOT NULL, -- Bitmask 0x7F
    `associated_geofence_id` TEXT,
    `is_enabled` INTEGER DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- 4. Application Blocker & Individual App Quotas Cache
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `app_control_rules` (
    `package_name` TEXT NOT NULL,
    `member_id` TEXT NOT NULL,
    `app_name` TEXT NOT NULL,
    `category` TEXT NOT NULL,
    `rule_type` TEXT NOT NULL, -- ALWAYS_ALLOWED, ALWAYS_BLOCKED, DAILY_LIMIT
    `daily_limit_minutes` INTEGER DEFAULT 0,
    `is_category_blocked` INTEGER DEFAULT 0,
    `updated_at` INTEGER NOT NULL,
    PRIMARY KEY (`package_name`, `member_id`)
);

CREATE TABLE IF NOT EXISTS `app_usage_daily` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `member_id` TEXT NOT NULL,
    `package_name` TEXT NOT NULL,
    `date_str` TEXT NOT NULL, -- YYYY-MM-DD
    `foreground_seconds` INTEGER DEFAULT 0,
    `launch_count` INTEGER DEFAULT 0,
    `last_opened_timestamp` INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS `index_app_usage_unique` ON `app_usage_daily` (`member_id`, `package_name`, `date_str`);

-- ----------------------------------------------------------------------------
-- 5. Location Breadcrumbs & Geofence Boundaries Cache
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `location_history` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `member_id` TEXT NOT NULL,
    `latitude` REAL NOT NULL,
    `longitude` REAL NOT NULL,
    `accuracy` REAL,
    `speed` REAL,
    `altitude` REAL,
    `timestamp` INTEGER NOT NULL,
    `is_uploaded` INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS `index_location_member_time` ON `location_history` (`member_id`, `timestamp`);

CREATE TABLE IF NOT EXISTS `geofence_zones` (
    `zone_id` TEXT PRIMARY KEY NOT NULL,
    `member_id` TEXT NOT NULL,
    `zone_name` TEXT NOT NULL,
    `center_lat` REAL NOT NULL,
    `center_lng` REAL NOT NULL,
    `radius_meters` REAL NOT NULL,
    `polygon_geojson` TEXT,
    `notify_on_enter` INTEGER DEFAULT 1,
    `notify_on_exit` INTEGER DEFAULT 1,
    `is_active` INTEGER DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- 6. Driving Safety Trip Telemetry
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `driving_trips` (
    `trip_id` TEXT PRIMARY KEY NOT NULL,
    `member_id` TEXT NOT NULL,
    `start_time` INTEGER NOT NULL,
    `end_time` INTEGER NOT NULL,
    `total_distance_km` REAL NOT NULL,
    `top_speed_kmh` REAL NOT NULL,
    `average_speed_kmh` REAL NOT NULL,
    `hard_braking_count` INTEGER DEFAULT 0,
    `rapid_accel_count` INTEGER DEFAULT 0,
    `speeding_count` INTEGER DEFAULT 0,
    `phone_usage_seconds` INTEGER DEFAULT 0,
    `safety_score` INTEGER NOT NULL,
    `route_geojson` TEXT
);

-- ----------------------------------------------------------------------------
-- 7. Explicit Content & Suspicious Activity Alerts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suspicious_alerts` (
    `alert_id` TEXT PRIMARY KEY NOT NULL,
    `member_id` TEXT NOT NULL,
    `alert_type` TEXT NOT NULL, -- TEXT_EXPLICIT, PHOTO_NSFW, YOUTUBE_KEYWORD
    `source_app` TEXT,          -- WhatsApp, Instagram, TikTok, Camera
    `sender_name` TEXT,
    `raw_content` TEXT,
    `threat_category` TEXT NOT NULL,
    `severity` TEXT NOT NULL,   -- LOW, MEDIUM, HIGH, CRITICAL
    `timestamp` INTEGER NOT NULL,
    `is_reviewed` INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS `index_alerts_member_type` ON `suspicious_alerts` (`member_id`, `alert_type`, `timestamp`);
