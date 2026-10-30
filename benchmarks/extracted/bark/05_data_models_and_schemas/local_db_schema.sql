-- ==============================================================================
-- Bark Parental Controls Local Database Schema (SQLite & Room Storage)
-- Benchmark Target: cm.pt.barkparent (v6.5.1 Build 600500103) & Bark Kids Sentinel
-- Sources: Decompiled DEX (DEX 1-4, Room Runtime, WorkDatabase, OSDatabase, 
--          StorageDatabase / AsyncStorage, IterableDatabaseManager) & Hermes Bytecode v98
-- Extraction Milestone: M5 (Data Models, Database & Schemas Extraction)
-- ==============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA encoding = 'UTF-8';
PRAGMA page_size = 4096;

-- ==============================================================================
-- 1. ACCOUNTS & FAMILY PROFILES DOMAIN
-- Purpose: Persists the parent account, multi-child profiles, subscription state,
--          and paired child hardware devices for offline policy management.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 1.1: accounts
-- Purpose: Primary parent administrator account record, credentials, and billing state.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    account_id TEXT PRIMARY KEY NOT NULL,                   -- Canonical UUID / Bark Parent Account ID
    email TEXT UNIQUE NOT NULL,                             -- Primary authenticated parent email
    full_name TEXT NOT NULL,                                -- Parent full name
    phone_number TEXT,                                      -- Primary phone number for SMS emergency alerts
    account_type TEXT NOT NULL DEFAULT 'parent'             -- Account classification: 'parent', 'guardian', 'trial'
        CHECK (account_type IN ('parent', 'guardian', 'trial')),
    subscription_plan TEXT NOT NULL DEFAULT 'bark_premium'  -- 'bark_jr', 'bark_premium', 'bark_phone', 'trial'
        CHECK (subscription_plan IN ('bark_jr', 'bark_premium', 'bark_phone', 'trial')),
    subscription_status TEXT NOT NULL DEFAULT 'active'      -- 'active', 'trialing', 'past_due', 'canceled', 'incomplete'
        CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly'          -- 'monthly', 'annual', 'lifetime'
        CHECK (billing_cycle IN ('monthly', 'annual', 'lifetime')),
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    last_active_at TIMESTAMP,                               -- Epoch timestamp of last parent dashboard interaction
    session_token TEXT                                      -- Encrypted session / JWT token cached for offline auth validation
);

CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts (email);
CREATE INDEX IF NOT EXISTS idx_accounts_subscription ON accounts (subscription_plan, subscription_status);

-- ------------------------------------------------------------------------------
-- Table 1.2: children_profiles
-- Purpose: Individual child profiles monitored under the parent account.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS children_profiles (
    child_id TEXT PRIMARY KEY NOT NULL,                     -- Canonical UUID for child profile
    account_id TEXT NOT NULL,                               -- Foreign key referencing accounts(account_id)
    first_name TEXT NOT NULL,                               -- Child first name
    last_name TEXT,                                         -- Child last name
    birth_year INTEGER NOT NULL                             -- Birth year for age-appropriate rule presets
        CHECK (birth_year >= 2000 AND birth_year <= 2030),
    gender TEXT DEFAULT 'unspecified'                       -- 'male', 'female', 'unspecified'
        CHECK (gender IN ('male', 'female', 'unspecified')),
    avatar_url TEXT,                                        -- Local or cached remote avatar asset URI
    school_name TEXT,                                       -- School name (used for automated academic schedule binding)
    time_zone TEXT NOT NULL DEFAULT 'UTC',                  -- Canonical IANA timezone string (e.g., 'America/New_York')
    monitoring_tier TEXT NOT NULL DEFAULT 'full'            -- 'full' (Bark Premium: content + screen time + location), 'screen_time_only' (Bark Jr)
        CHECK (monitoring_tier IN ('full', 'screen_time_only')),
    is_active INTEGER NOT NULL DEFAULT 1                    -- 1 = Active monitoring, 0 = Paused
        CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_children_account_id ON children_profiles (account_id);
CREATE INDEX IF NOT EXISTS idx_children_active ON children_profiles (is_active);

-- ------------------------------------------------------------------------------
-- Table 1.3: paired_devices
-- Purpose: Hardware devices paired with a child's profile running the Bark Companion sentinel.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paired_devices (
    device_id TEXT PRIMARY KEY NOT NULL,                    -- Unique device hardware identifier (UUID / ANDROID_ID hash)
    child_id TEXT NOT NULL,                                 -- Foreign key referencing children_profiles(child_id)
    device_name TEXT NOT NULL,                              -- User-assigned device label (e.g., "Sarah's Galaxy S24")
    device_type TEXT NOT NULL DEFAULT 'phone'               -- 'phone', 'tablet', 'chromebook', 'pc', 'mac'
        CHECK (device_type IN ('phone', 'tablet', 'chromebook', 'pc', 'mac')),
    os_family TEXT NOT NULL DEFAULT 'android'               -- 'android', 'ios', 'chrome_os', 'windows', 'macos'
        CHECK (os_family IN ('android', 'ios', 'chrome_os', 'windows', 'macos')),
    os_version TEXT NOT NULL,                               -- Operating system version string (e.g., "Android 14")
    bark_agent_version TEXT NOT NULL,                       -- Installed Bark Sentinel / Companion APK version (e.g., "6.5.1")
    pairing_code TEXT,                                      -- Ephemeral 6-digit alphanumeric pairing token
    pairing_status TEXT NOT NULL DEFAULT 'paired'           -- 'pending_pairing', 'paired', 'unpaired', 'revoked'
        CHECK (pairing_status IN ('pending_pairing', 'paired', 'unpaired', 'revoked')),
    pairing_timestamp TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    battery_level INTEGER DEFAULT 100                       -- Current battery percentage [0-100]
        CHECK (battery_level >= 0 AND battery_level <= 100),
    is_vpn_active INTEGER NOT NULL DEFAULT 0                -- Bark Guard local loopback DNS VPN status
        CHECK (is_vpn_active IN (0, 1)),
    is_accessibility_granted INTEGER NOT NULL DEFAULT 0     -- AccessibilityService screen scraping permission granted
        CHECK (is_accessibility_granted IN (0, 1)),
    is_notification_granted INTEGER NOT NULL DEFAULT 0      -- NotificationListenerService permission granted
        CHECK (is_notification_granted IN (0, 1)),
    last_heartbeat TIMESTAMP,                               -- Timestamp of last telemetry heartbeat
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_devices_child_id ON paired_devices (child_id);
CREATE INDEX IF NOT EXISTS idx_devices_pairing_status ON paired_devices (pairing_status);
CREATE INDEX IF NOT EXISTS idx_devices_heartbeat ON paired_devices (last_heartbeat);


-- ==============================================================================
-- 2. CAPTURED CHAT & NOTIFICATION BUFFERS DOMAIN
-- Purpose: Temporary device-side ring-buffers for raw text extracted from social
--          media accessibility trees and notification listeners prior to evaluation.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 2.1: monitored_messages
-- Purpose: Intermediate buffer of extracted message events from monitored chat apps.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitored_messages (
    message_id TEXT PRIMARY KEY NOT NULL,                   -- Unique deterministic event hash (UUID)
    device_id TEXT NOT NULL,                                -- Source device ID referencing paired_devices(device_id)
    child_id TEXT NOT NULL,                                 -- Child profile ID referencing children_profiles(child_id)
    platform TEXT NOT NULL                                  -- 'whatsapp', 'instagram', 'snapchat', 'tiktok', 'youtube', 'discord', 'twitter', 'sms', 'browser'
        CHECK (platform IN ('whatsapp', 'whatsapp_business', 'instagram', 'snapchat', 'tiktok', 'youtube', 'discord', 'twitter', 'sms', 'browser', 'system')),
    channel_type TEXT NOT NULL DEFAULT 'direct_message'     -- 'direct_message', 'group_chat', 'post_comment', 'search_query', 'notification'
        CHECK (channel_type IN ('direct_message', 'group_chat', 'post_comment', 'search_query', 'notification')),
    sender_identifier TEXT NOT NULL,                        -- Extracted contact name, username, or phone number
    recipient_identifier TEXT,                              -- Recipient username or group chat title
    message_body TEXT NOT NULL,                             -- Raw extracted message text
    raw_content_hash TEXT NOT NULL,                         -- SHA-256 / xxHash digest of normalized text for fast dedup
    timestamp_epoch_ms INTEGER NOT NULL,                    -- Message creation/sent timestamp (epoch milliseconds)
    captured_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    extraction_source TEXT NOT NULL                         -- 'accessibility_scrape', 'notification_listener', 'vpn_dns_query'
        CHECK (extraction_source IN ('accessibility_scrape', 'notification_listener', 'vpn_dns_query')),
    is_incoming INTEGER NOT NULL DEFAULT 1                  -- 1 = Received by child, 0 = Sent by child
        CHECK (is_incoming IN (0, 1)),
    media_urls_json TEXT,                                   -- Optional JSON array of associated image/media URLs or cached paths
    FOREIGN KEY (device_id) REFERENCES paired_devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monitored_device ON monitored_messages (device_id);
CREATE INDEX IF NOT EXISTS idx_monitored_child ON monitored_messages (child_id);
CREATE INDEX IF NOT EXISTS idx_monitored_hash ON monitored_messages (raw_content_hash);
CREATE INDEX IF NOT EXISTS idx_monitored_timestamp ON monitored_messages (timestamp_epoch_ms);

-- ------------------------------------------------------------------------------
-- Table 2.2: deduplication_cache
-- Purpose: High-speed LRU ring-buffer maintaining rolling hashes of processed text
--          to prevent redundant regex matching and battery drain.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deduplication_cache (
    hash_id TEXT PRIMARY KEY NOT NULL,                      -- Primary key (raw_hash + channel_id)
    device_id TEXT NOT NULL,                                -- Source device ID
    raw_hash TEXT NOT NULL,                                 -- 64-bit xxHash or SHA-256 hex string
    channel_id TEXT NOT NULL,                               -- Package name or chat channel identifier
    normalized_snippet TEXT NOT NULL,                       -- First 64 characters of normalized text
    bucket_window INTEGER NOT NULL,                         -- 60-second rolling time bucket (epoch_sec / 60)
    first_seen_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    last_seen_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    hit_count INTEGER NOT NULL DEFAULT 1,                   -- Number of duplicate occurrences suppressed
    FOREIGN KEY (device_id) REFERENCES paired_devices(device_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dedup_hash_bucket ON deduplication_cache (raw_hash, bucket_window);
CREATE INDEX IF NOT EXISTS idx_dedup_device_last_seen ON deduplication_cache (device_id, last_seen_at);


-- ==============================================================================
-- 3. RISK SIGNALS & ALERTS QUEUE DOMAIN
-- Purpose: Evaluated risk detections, parent alert triage, and AI-powered
--          conversation suggestions for parental coaching.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 3.1: risk_signals
-- Purpose: Positive danger signal detections generated by on-device heuristics or cloud AI.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_signals (
    signal_id TEXT PRIMARY KEY NOT NULL,                    -- Unique signal UUID
    device_id TEXT NOT NULL,                                -- Source hardware device
    child_id TEXT NOT NULL,                                 -- Child profile ID
    message_id TEXT,                                        -- Source message ID (if derived from captured chat)
    danger_category TEXT NOT NULL                           -- Bark core danger classifications
        CHECK (danger_category IN (
            'cyberbullying', 
            'depression_suicide', 
            'sexual_content_sexting', 
            'predatory_contact', 
            'drugs_alcohol', 
            'hate_speech', 
            'violence_weapons', 
            'profanity',
            'anxiety_mental_health'
        )),
    severity_score INTEGER NOT NULL                         -- Danger level scale: 1 (Notice) to 5 (Urgent/Severe)
        CHECK (severity_score >= 1 AND severity_score <= 5),
    confidence_score REAL NOT NULL DEFAULT 0.0              -- Heuristic/AI confidence probability [0.0 - 1.0]
        CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    matched_keywords_json TEXT NOT NULL DEFAULT '[]',       -- JSON array of matched regex tokens / keywords
    context_snippet TEXT NOT NULL,                          -- Redacted context snippet (1-2 sentences surrounding risk)
    status TEXT NOT NULL DEFAULT 'detected'                 -- 'detected', 'encrypted_queued', 'uploaded', 'dismissed'
        CHECK (status IN ('detected', 'encrypted_queued', 'uploaded', 'dismissed')),
    encryption_key_id TEXT,                                 -- Google Tink KeySet ID used to encrypt the payload
    encrypted_payload_blob BLOB,                            -- AES-256-GCM encrypted envelope (Tink AEAD)
    detected_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    uploaded_at TIMESTAMP,                                  -- Timestamp of cloud synchronization
    FOREIGN KEY (device_id) REFERENCES paired_devices(device_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES monitored_messages(message_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_signals_child ON risk_signals (child_id);
CREATE INDEX IF NOT EXISTS idx_signals_category ON risk_signals (danger_category);
CREATE INDEX IF NOT EXISTS idx_signals_severity ON risk_signals (severity_score);
CREATE INDEX IF NOT EXISTS idx_signals_status ON risk_signals (status);

-- ------------------------------------------------------------------------------
-- Table 3.2: alert_history
-- Purpose: Parent-facing alert records shown in the Bark Parent dashboard.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alert_history (
    alert_id TEXT PRIMARY KEY NOT NULL,                     -- Unique Alert UUID
    signal_id TEXT,                                         -- Underlying risk signal referencing risk_signals(signal_id)
    account_id TEXT NOT NULL,                               -- Parent account ID referencing accounts(account_id)
    child_id TEXT NOT NULL,                                 -- Child profile ID referencing children_profiles(child_id)
    title TEXT NOT NULL,                                    -- Human-readable alert summary (e.g. "Potential Cyberbullying Detected")
    category TEXT NOT NULL,                                 -- Danger category
    severity_level INTEGER NOT NULL                         -- 1 to 5 scale
        CHECK (severity_level >= 1 AND severity_level <= 5),
    parent_status TEXT NOT NULL DEFAULT 'new'               -- 'new', 'reviewed', 'acknowledged', 'resolved', 'dismissed', 'escalated'
        CHECK (parent_status IN ('new', 'reviewed', 'acknowledged', 'resolved', 'dismissed', 'escalated')),
    parent_notes TEXT,                                      -- Private notes written by the parent
    notification_sent_at TIMESTAMP,                         -- Push notification delivery timestamp
    reviewed_at TIMESTAMP,                                  -- When the parent opened the alert
    resolved_at TIMESTAMP,                                  -- When the parent marked the alert resolved
    FOREIGN KEY (signal_id) REFERENCES risk_signals(signal_id) ON DELETE SET NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_account ON alert_history (account_id);
CREATE INDEX IF NOT EXISTS idx_alerts_child ON alert_history (child_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alert_history (parent_status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alert_history (severity_level);

-- ------------------------------------------------------------------------------
-- Table 3.3: conversation_suggestions
-- Purpose: Empathetic, child-psychology-backed coaching suggestions provided
--          to parents when triaging positive risk alerts.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_suggestions (
    suggestion_id TEXT PRIMARY KEY NOT NULL,                -- Suggestion UUID
    alert_id TEXT NOT NULL,                                 -- Foreign key referencing alert_history(alert_id)
    risk_category TEXT NOT NULL,                            -- Category of risk addressed
    title TEXT NOT NULL,                                    -- Suggestion heading (e.g., "How to talk about online exclusion")
    empathy_prompt TEXT NOT NULL,                           -- Opener sentence for parent to say
    discussion_guide_markdown TEXT NOT NULL,                -- Multi-step conversation guide formatted in Markdown
    recommended_action TEXT NOT NULL,                       -- Practical step: 'listen_first', 'review_settings', 'seek_counselor'
    child_psychology_notes TEXT,                            -- Developmental context for child's age group
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (alert_id) REFERENCES alert_history(alert_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_suggestions_alert ON conversation_suggestions (alert_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_category ON conversation_suggestions (risk_category);


-- ==============================================================================
-- 4. SCREEN TIME & VPN RULESETS DOMAIN
-- Purpose: Dynamic screen time policies, recurring schedules (Default / School / Bedtime),
--          DNS category block rules, and explicit application/domain exceptions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 4.1: screen_time_rulesets
-- Purpose: High-level policy configurations defining filtering postures.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS screen_time_rulesets (
    ruleset_id TEXT PRIMARY KEY NOT NULL,                   -- Ruleset UUID
    child_id TEXT NOT NULL,                                 -- Child profile ID referencing children_profiles(child_id)
    ruleset_name TEXT NOT NULL,                             -- Name (e.g., "Standard Free Time", "School Hours", "Bedtime")
    ruleset_type TEXT NOT NULL DEFAULT 'default'            -- 'default', 'school', 'bedtime', 'bonus', 'paused', 'custom'
        CHECK (ruleset_type IN ('default', 'school', 'bedtime', 'bonus', 'paused', 'custom')),
    is_active INTEGER NOT NULL DEFAULT 0                    -- 1 = Currently applied policy, 0 = Inactive
        CHECK (is_active IN (0, 1)),
    allow_internet INTEGER NOT NULL DEFAULT 1               -- Master internet switch: 1 = Online allowed, 0 = Complete lock
        CHECK (allow_internet IN (0, 1)),
    enforce_safesearch INTEGER NOT NULL DEFAULT 1           -- 1 = Force SafeSearch on Google, Bing, YouTube, DuckDuckGo
        CHECK (enforce_safesearch IN (0, 1)),
    block_all_apps INTEGER NOT NULL DEFAULT 0               -- 1 = Lock all third-party apps with overlay screen
        CHECK (block_all_apps IN (0, 1)),
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rulesets_child ON screen_time_rulesets (child_id);
CREATE INDEX IF NOT EXISTS idx_rulesets_active ON screen_time_rulesets (child_id, is_active);

-- ------------------------------------------------------------------------------
-- Table 4.2: schedule_blocks
-- Purpose: Weekly time-grid recurring schedule intervals activating specific rulesets.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_blocks (
    block_id TEXT PRIMARY KEY NOT NULL,                     -- Schedule interval UUID
    ruleset_id TEXT NOT NULL,                               -- Foreign key referencing screen_time_rulesets(ruleset_id)
    child_id TEXT NOT NULL,                                 -- Child profile ID referencing children_profiles(child_id)
    day_of_week INTEGER NOT NULL                            -- Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time_minutes INTEGER NOT NULL                     -- Start minute from midnight [0 - 1439] (e.g., 540 = 09:00 AM)
        CHECK (start_time_minutes >= 0 AND start_time_minutes <= 1439),
    end_time_minutes INTEGER NOT NULL                       -- End minute from midnight [0 - 1439] (e.g., 900 = 03:00 PM)
        CHECK (end_time_minutes >= 0 AND end_time_minutes <= 1439),
    is_enabled INTEGER NOT NULL DEFAULT 1                   -- 1 = Schedule active, 0 = Temporarily disabled
        CHECK (is_enabled IN (0, 1)),
    recurring_rule TEXT NOT NULL DEFAULT 'WEEKLY',          -- RFC 5545 RRULE string or recurrence flag
    FOREIGN KEY (ruleset_id) REFERENCES screen_time_rulesets(ruleset_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE,
    CHECK (start_time_minutes < end_time_minutes)
);

CREATE INDEX IF NOT EXISTS idx_schedule_child_day ON schedule_blocks (child_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_ruleset ON schedule_blocks (ruleset_id);

-- ------------------------------------------------------------------------------
-- Table 4.3: category_block_rules
-- Purpose: DNS-level web content filtering categories associated with a ruleset.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category_block_rules (
    rule_id TEXT PRIMARY KEY NOT NULL,                      -- Rule UUID
    ruleset_id TEXT NOT NULL,                               -- Foreign key referencing screen_time_rulesets(ruleset_id)
    category_code TEXT NOT NULL,                            -- Category identifier (e.g., 'adult', 'social_media', 'gaming', 'streaming')
    category_name TEXT NOT NULL,                            -- Human-readable category label
    action TEXT NOT NULL DEFAULT 'block'                    -- 'allow', 'block', 'warn'
        CHECK (action IN ('allow', 'block', 'warn')),
    dns_sinkhole_ip TEXT NOT NULL DEFAULT '0.0.0.0',        -- Returned IP when sinkholed (e.g., '0.0.0.0' or '127.0.0.1')
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (ruleset_id) REFERENCES screen_time_rulesets(ruleset_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_ruleset_code ON category_block_rules (ruleset_id, category_code);

-- ------------------------------------------------------------------------------
-- Table 4.4: custom_exceptions
-- Purpose: Explicit domain or application whitelists / blacklists overriding category rules.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_exceptions (
    exception_id TEXT PRIMARY KEY NOT NULL,                 -- Exception UUID
    ruleset_id TEXT,                                        -- Specific ruleset (or NULL for global child override)
    child_id TEXT NOT NULL,                                 -- Child profile ID
    domain_pattern TEXT,                                    -- FQDN or wildcard pattern (e.g., "*.khanacademy.org")
    package_name TEXT,                                      -- Android app package name (e.g., "com.duolingo")
    exception_type TEXT NOT NULL                            -- 'domain', 'app'
        CHECK (exception_type IN ('domain', 'app')),
    action TEXT NOT NULL DEFAULT 'always_allow'             -- 'always_allow', 'always_block'
        CHECK (action IN ('always_allow', 'always_block')),
    reason TEXT,                                            -- Parent memo explaining exception
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (ruleset_id) REFERENCES screen_time_rulesets(ruleset_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE,
    CHECK (domain_pattern IS NOT NULL OR package_name IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_exceptions_child ON custom_exceptions (child_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_domain ON custom_exceptions (domain_pattern);
CREATE INDEX IF NOT EXISTS idx_exceptions_package ON custom_exceptions (package_name);


-- ==============================================================================
-- 5. GEOFENCING & LOCATION CHECK-INS DOMAIN
-- Purpose: Circular geographic safety boundaries, real-time check-in coordinates,
--          and geofence entry/exit transition audit trails.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 5.1: geofence_zones
-- Purpose: Defined safety perimeters (Home, School, Sports Practice) for a child.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS geofence_zones (
    zone_id TEXT PRIMARY KEY NOT NULL,                      -- Zone UUID
    child_id TEXT NOT NULL,                                 -- Child profile ID referencing children_profiles(child_id)
    zone_name TEXT NOT NULL,                                -- Label (e.g., "Lincoln High School", "Home")
    zone_type TEXT NOT NULL DEFAULT 'custom'                -- 'home', 'school', 'activities', 'custom'
        CHECK (zone_type IN ('home', 'school', 'activities', 'custom')),
    latitude REAL NOT NULL                                  -- WGS84 latitude [-90.0 to 90.0]
        CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude REAL NOT NULL                                 -- WGS84 longitude [-180.0 to 180.0]
        CHECK (longitude >= -180.0 AND longitude <= 180.0),
    radius_meters REAL NOT NULL DEFAULT 150.0               -- Perimeter radius [50.0 to 5000.0 meters]
        CHECK (radius_meters >= 50.0 AND radius_meters <= 5000.0),
    notify_on_entry INTEGER NOT NULL DEFAULT 1              -- 1 = Send push alert when child enters zone
        CHECK (notify_on_entry IN (0, 1)),
    notify_on_exit INTEGER NOT NULL DEFAULT 1               -- 1 = Send push alert when child leaves zone
        CHECK (notify_on_exit IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1                    -- 1 = Enabled, 0 = Inactive
        CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geofence_child ON geofence_zones (child_id);
CREATE INDEX IF NOT EXISTS idx_geofence_active ON geofence_zones (is_active);

-- ------------------------------------------------------------------------------
-- Table 5.2: location_checkins
-- Purpose: GPS fixes generated via child check-in button, parent request, or geofence trip.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS location_checkins (
    checkin_id TEXT PRIMARY KEY NOT NULL,                   -- Check-in UUID
    child_id TEXT NOT NULL,                                 -- Child profile ID
    device_id TEXT NOT NULL,                                -- Source device ID
    checkin_type TEXT NOT NULL DEFAULT 'manual'             -- 'manual', 'parent_requested', 'geofence_trigger', 'periodic'
        CHECK (checkin_type IN ('manual', 'parent_requested', 'geofence_trigger', 'periodic')),
    latitude REAL NOT NULL                                  -- Latitude [-90.0 to 90.0]
        CHECK (latitude >= -90.0 AND latitude <= 90.0),
    longitude REAL NOT NULL                                 -- Longitude [-180.0 to 180.0]
        CHECK (longitude >= -180.0 AND longitude <= 180.0),
    accuracy_meters REAL NOT NULL                           -- Horizontal GPS accuracy in meters
        CHECK (accuracy_meters >= 0.0),
    altitude REAL,                                          -- Altitude in meters above sea level
    battery_percentage INTEGER                              -- Device battery state at time of check-in [0-100]
        CHECK (battery_percentage >= 0 AND battery_percentage <= 100),
    checkin_timestamp TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    address_reverse_geo TEXT,                               -- Reverse-geocoded human-readable street address
    note TEXT,                                              -- Optional message sent with manual check-in
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES paired_devices(device_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checkins_child_time ON location_checkins (child_id, checkin_timestamp);
CREATE INDEX IF NOT EXISTS idx_checkins_device ON location_checkins (device_id);

-- ------------------------------------------------------------------------------
-- Table 5.3: geofence_events
-- Purpose: Audit log of geographic boundary transition events.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS geofence_events (
    event_id TEXT PRIMARY KEY NOT NULL,                     -- Event UUID
    zone_id TEXT NOT NULL,                                  -- Associated geofence zone referencing geofence_zones(zone_id)
    child_id TEXT NOT NULL,                                 -- Child profile ID
    device_id TEXT NOT NULL,                                -- Source device ID
    transition_type TEXT NOT NULL                           -- 'enter', 'exit', 'dwell'
        CHECK (transition_type IN ('enter', 'exit', 'dwell')),
    latitude REAL NOT NULL,                                 -- Exact coordinate triggering the event
    longitude REAL NOT NULL,
    accuracy_meters REAL NOT NULL,
    event_timestamp TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    is_notified INTEGER NOT NULL DEFAULT 0                  -- 1 = Push alert dispatched to parent
        CHECK (is_notified IN (0, 1)),
    FOREIGN KEY (zone_id) REFERENCES geofence_zones(zone_id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children_profiles(child_id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES paired_devices(device_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geo_events_zone ON geofence_events (zone_id);
CREATE INDEX IF NOT EXISTS idx_geo_events_child_time ON geofence_events (child_id, event_timestamp);


-- ==============================================================================
-- 6. SYNC TRANSACTIONS QUEUE & TELEMETRY DOMAIN
-- Purpose: Offline write-ahead mutation queue (WorkManager replay) and device health logs.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 6.1: offline_sync_queue
-- Purpose: Durable queue buffering state mutations while offline for sequential cloud replay.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offline_sync_queue (
    mutation_id TEXT PRIMARY KEY NOT NULL,                  -- Mutation UUID
    device_id TEXT NOT NULL,                                -- Source device ID
    entity_type TEXT NOT NULL                               -- 'risk_signal', 'checkin', 'geofence_event', 'telemetry', 'ruleset_ack'
        CHECK (entity_type IN ('risk_signal', 'checkin', 'geofence_event', 'telemetry', 'ruleset_ack')),
    entity_id TEXT NOT NULL,                                -- Primary key of the entity being synced
    operation TEXT NOT NULL                                 -- 'insert', 'update', 'delete', 'telemetry'
        CHECK (operation IN ('insert', 'update', 'delete', 'telemetry')),
    payload_blob BLOB NOT NULL,                             -- Protobuf or compressed JSON payload
    priority INTEGER NOT NULL DEFAULT 3                     -- Priority tier: 1 (Urgent Emergency / SOS) to 5 (Passive Telemetry)
        CHECK (priority >= 1 AND priority <= 5),
    attempt_count INTEGER NOT NULL DEFAULT 0,               -- Retry counter
    max_retries INTEGER NOT NULL DEFAULT 10,                -- Maximum attempts before dead-letter quarantine
    created_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    last_attempt_at TIMESTAMP,                              -- Timestamp of most recent dispatch attempt
    error_message TEXT,                                     -- Last server or network failure error string
    status TEXT NOT NULL DEFAULT 'pending'                  -- 'pending', 'in_flight', 'failed', 'synced'
        CHECK (status IN ('pending', 'in_flight', 'failed', 'synced')),
    FOREIGN KEY (device_id) REFERENCES paired_devices(device_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sync_status_priority ON offline_sync_queue (status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_sync_device ON offline_sync_queue (device_id);

-- ------------------------------------------------------------------------------
-- Table 6.2: telemetry_logs
-- Purpose: Background device health diagnostics and anti-tamper security logs.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS telemetry_logs (
    log_id TEXT PRIMARY KEY NOT NULL,                       -- Telemetry log UUID
    device_id TEXT NOT NULL,                                -- Source device ID
    log_type TEXT NOT NULL                                  -- 'battery', 'vpn_status', 'accessibility_heartbeat', 'app_crash', 'anti_tamper_alert'
        CHECK (log_type IN ('battery', 'vpn_status', 'accessibility_heartbeat', 'app_crash', 'anti_tamper_alert')),
    payload_json TEXT NOT NULL DEFAULT '{}',                -- Structured diagnostic key-values (JSON)
    severity TEXT NOT NULL DEFAULT 'info'                   -- 'debug', 'info', 'warning', 'error', 'critical'
        CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    recorded_at TIMESTAMP NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    synced_at TIMESTAMP,                                    -- NULL if pending sync
    FOREIGN KEY (device_id) REFERENCES paired_devices(device_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON telemetry_logs (device_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_type ON telemetry_logs (log_type);


-- ==============================================================================
-- 7. FRAMEWORK PERSISTENCE SCHEMAS (Extracted from DEX Binaries)
-- Purpose: Reconstructed tables for React Native AsyncStorage, OneSignal, & Iterable.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 7.1: async_storage_entries
-- Source: org.asyncstorage.shared_storage.database.StorageDatabase_Impl
-- Purpose: Key-value persistence backing React Native Redux state ('bark/@state').
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS async_storage_entries (
    key TEXT PRIMARY KEY NOT NULL,                          -- Key name (e.g. 'bark/@state', 'user_token')
    value TEXT                                              -- Serialized JSON state tree
);

-- ------------------------------------------------------------------------------
-- Table 7.2: onesignal_notifications
-- Source: com.onesignal.core.internal.database.impl.OSDatabase
-- Purpose: Caches incoming push notifications, group threads, and expiration timestamps.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onesignal_notifications (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id TEXT,
    android_notification_id INTEGER,
    group_id TEXT,
    collapse_id TEXT,
    is_summary INTEGER DEFAULT 0,
    opened INTEGER DEFAULT 0,
    dismissed INTEGER DEFAULT 0,
    title TEXT,
    message TEXT,
    full_data TEXT,
    created_time TIMESTAMP DEFAULT (strftime('%s', 'now')),
    expire_time TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_os_notification_id ON onesignal_notifications (notification_id);
CREATE INDEX IF NOT EXISTS idx_os_created_time ON onesignal_notifications (created_time);

-- ------------------------------------------------------------------------------
-- Table 7.3: iterable_offline_tasks
-- Source: com.iterable.iterableapi.IterableDatabaseManager
-- Purpose: Background queue of Iterable mobile CRM and tracking tasks.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS iterable_offline_tasks (
    task_id TEXT PRIMARY KEY NOT NULL,
    name TEXT,
    version INTEGER,
    created BIGINT,
    modified BIGINT,
    last_attempt BIGINT,
    scheduled BIGINT,
    requested BIGINT,
    processing BOOLEAN,
    failed BOOLEAN,
    blocking BOOLEAN,
    data TEXT,
    error TEXT,
    type TEXT,
    attempts INTEGER
);


-- ==============================================================================
-- 8. TRIGGERS & AUTOMATED INTEGRITY CONSTRAINTS
-- Purpose: Automates timestamp updates, LRU cache eviction, and critical alert routing.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Trigger 8.1: accounts_updated_at_trg
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_accounts_updated_at
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    UPDATE accounts 
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE account_id = OLD.account_id;
END;

-- ------------------------------------------------------------------------------
-- Trigger 8.2: children_profiles_updated_at_trg
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_children_profiles_updated_at
AFTER UPDATE ON children_profiles
FOR EACH ROW
BEGIN
    UPDATE children_profiles 
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE child_id = OLD.child_id;
END;

-- ------------------------------------------------------------------------------
-- Trigger 8.3: screen_time_rulesets_updated_at_trg
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_rulesets_updated_at
AFTER UPDATE ON screen_time_rulesets
FOR EACH ROW
BEGIN
    UPDATE screen_time_rulesets 
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE ruleset_id = OLD.ruleset_id;
END;

-- ------------------------------------------------------------------------------
-- Trigger 8.4: geofence_zones_updated_at_trg
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_geofence_zones_updated_at
AFTER UPDATE ON geofence_zones
FOR EACH ROW
BEGIN
    UPDATE geofence_zones 
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE zone_id = OLD.zone_id;
END;

-- ------------------------------------------------------------------------------
-- Trigger 8.5: auto_queue_high_severity_signals
-- Purpose: Automatically inserts severe risk signals into the offline sync queue
--          with priority 1 (Urgent/Emergency).
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_auto_queue_severe_risk_signal
AFTER INSERT ON risk_signals
WHEN NEW.severity_score >= 4
BEGIN
    INSERT OR REPLACE INTO offline_sync_queue (
        mutation_id,
        device_id,
        entity_type,
        entity_id,
        operation,
        payload_blob,
        priority,
        status,
        created_at
    ) VALUES (
        'sync_' || NEW.signal_id,
        NEW.device_id,
        'risk_signal',
        NEW.signal_id,
        'insert',
        CAST(NEW.context_snippet AS BLOB),
        1,                                          -- Priority 1: Top Emergency
        'pending',
        strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    );
END;

-- ------------------------------------------------------------------------------
-- Trigger 8.6: deduplication_cache_lru_pruning
-- Purpose: Ensures deduplication cache does not exceed 10,000 entries by pruning
--          entries older than 24 hours when new hashes are inserted.
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_prune_deduplication_cache
AFTER INSERT ON deduplication_cache
WHEN (SELECT COUNT(*) FROM deduplication_cache) > 10000
BEGIN
    DELETE FROM deduplication_cache 
    WHERE hash_id IN (
        SELECT hash_id FROM deduplication_cache 
        ORDER BY last_seen_at ASC 
        LIMIT 500
    );
END;

-- ------------------------------------------------------------------------------
-- Trigger 8.7: enforce_single_active_ruleset_per_child
-- Purpose: Ensures only one screen time ruleset is active per child profile.
-- ------------------------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_single_active_ruleset
AFTER UPDATE OF is_active ON screen_time_rulesets
WHEN NEW.is_active = 1
BEGIN
    UPDATE screen_time_rulesets 
    SET is_active = 0 
    WHERE child_id = NEW.child_id 
      AND ruleset_id != NEW.ruleset_id;
END;
