-- ============================================================================
-- Life360 — Complete Local Database Schema (Room / SQLite)
-- Package: com.life360.android
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Family Circles & Members Local Cache
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `circles` (
    `circle_id` TEXT PRIMARY KEY NOT NULL,
    `circle_name` TEXT NOT NULL,
    `circle_color` TEXT,
    `owner_id` TEXT NOT NULL,
    `member_count` INTEGER DEFAULT 1,
    `created_at` INTEGER NOT NULL,
    `is_active` INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS `circle_members` (
    `member_id` TEXT NOT NULL,
    `circle_id` TEXT NOT NULL,
    `first_name` TEXT NOT NULL,
    `last_name` TEXT,
    `avatar_url` TEXT,
    `battery_level` INTEGER DEFAULT 100,
    `is_charging` INTEGER DEFAULT 0,
    `is_driving` INTEGER DEFAULT 0,
    `last_latitude` REAL,
    `last_longitude` REAL,
    `last_speed_kmh` REAL,
    `last_seen_timestamp` INTEGER NOT NULL,
    PRIMARY KEY (`member_id`, `circle_id`)
);

CREATE INDEX IF NOT EXISTS `index_circle_members_circle` ON `circle_members` (`circle_id`);

-- ----------------------------------------------------------------------------
-- 2. Places & Geofences
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `places` (
    `place_id` TEXT PRIMARY KEY NOT NULL,
    `circle_id` TEXT NOT NULL,
    `name` TEXT NOT NULL,
    `latitude` REAL NOT NULL,
    `longitude` REAL NOT NULL,
    `radius_meters` REAL DEFAULT 150.0,
    `alert_on_arrival` INTEGER DEFAULT 1,
    `alert_on_departure` INTEGER DEFAULT 1,
    `created_by_user_id` TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS `index_places_circle` ON `places` (`circle_id`);

-- ----------------------------------------------------------------------------
-- 3. Driving Telemetry & Trip Segments (Room: TripBlock)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `TripBlock` (
    `TripBlockId` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `TripId` TEXT NOT NULL,
    `StartTimeMs` INTEGER NOT NULL,
    `EndTimeMs` INTEGER NOT NULL,
    `DistanceMeters` REAL NOT NULL,
    `TopSpeedKmh` REAL NOT NULL,
    `AverageSpeedKmh` REAL NOT NULL,
    `HardBrakeCount` INTEGER DEFAULT 0,
    `RapidAccelCount` INTEGER DEFAULT 0,
    `HighSpeedCount` INTEGER DEFAULT 0,
    `PhoneUsageMinutes` INTEGER DEFAULT 0,
    `DriveScore` INTEGER NOT NULL,
    `EncodedPolyline` TEXT
);

CREATE INDEX IF NOT EXISTS `index_TripBlock_TripId` ON `TripBlock` (`TripId`);

-- ----------------------------------------------------------------------------
-- 4. Vehicle Collision & Crash Records
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `crash_events` (
    `crash_id` TEXT PRIMARY KEY NOT NULL,
    `user_id` TEXT NOT NULL,
    `timestamp_ms` INTEGER NOT NULL,
    `peak_g_force` REAL NOT NULL,
    `pre_collision_speed_kmh` REAL NOT NULL,
    `latitude` REAL NOT NULL,
    `longitude` REAL NOT NULL,
    `status` TEXT NOT NULL, -- PENDING_COUNTDOWN, CANCELLED, DISPATCHED
    `dispatched_emergency_services` INTEGER DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 5. In-App Family Circle Messaging & Threads (Room Database)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `thread` (
    `_id` TEXT PRIMARY KEY NOT NULL,
    `circle_id` TEXT NOT NULL,
    `last_message_preview` TEXT,
    `last_message_timestamp` INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `message` (
    `_id` TEXT PRIMARY KEY NOT NULL,
    `client_id` TEXT,
    `thread_id` TEXT NOT NULL,
    `sender_id` TEXT NOT NULL,
    `body` TEXT,
    `created_at` INTEGER NOT NULL,
    `is_read` INTEGER DEFAULT 0,
    `status` TEXT -- SENDING, SENT, DELIVERED, FAILED
);

CREATE TABLE IF NOT EXISTS `message_media` (
    `_id` TEXT PRIMARY KEY NOT NULL,
    `message_id` TEXT NOT NULL,
    `photo_key` TEXT NOT NULL,
    `thumbnail_url` TEXT,
    `full_url` TEXT
);

CREATE INDEX IF NOT EXISTS `index_message_thread` ON `message` (`thread_id`, `created_at`);

-- ----------------------------------------------------------------------------
-- 6. Tile Crowd-Sourced BLE Sightings Buffer
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tile_sightings` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    `tile_mac_address` TEXT NOT NULL,
    `latitude` REAL NOT NULL,
    `longitude` REAL NOT NULL,
    `horizontal_accuracy` REAL NOT NULL,
    `rssi` INTEGER NOT NULL,
    `sighting_timestamp_ms` INTEGER NOT NULL,
    `is_uploaded` INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS `index_tile_unuploaded` ON `tile_sightings` (`is_uploaded`, `sighting_timestamp_ms`);

-- ----------------------------------------------------------------------------
-- 7. Real-Time MQTT Inbound Arrival Message Queue
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `MqttArrivedMessageTable` (
    `message_id` TEXT PRIMARY KEY NOT NULL,
    `topic` TEXT NOT NULL,
    `payload_json` TEXT NOT NULL,
    `arrived_timestamp` INTEGER NOT NULL,
    `processed_state` INTEGER DEFAULT 0
);
