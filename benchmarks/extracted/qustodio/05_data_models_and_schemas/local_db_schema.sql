-- ==============================================================================
-- Qustodio Local Database Schema (SQLite Offline Cache & Native Storage)
-- Benchmark Target: com.qustodio.family.parental.control.app.screentime
-- Source: Decompiled Android DEX (classes.dex, classes2.dex, classes3.dex, classes4.dex)
-- Engines: Firebase Cloud Firestore Local Persistence, Android DataTransport EventStore,
--          Jetpack DataStore & Cordova NativeStorage / SharedPreferences Key-Value Store.
-- Extraction Milestone: M5 (Data Models, Database & Schemas Extraction)
-- ==============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA encoding = 'UTF-8';

-- ==============================================================================
-- 1. FIREBASE CLOUD FIRESTORE OFFLINE PERSISTENCE SCHEMA (Version 16)
-- Engine: com.google.firebase.firestore.local.SQLiteSchema
-- Purpose: Provides 100% offline-first persistence for family rules, account states,
--          child profile policies, device linkages, schedules, and offline mutation queues.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 1.1: remote_documents
-- Purpose: Caches raw documents received from Firestore cloud collections (e.g.,
--          accounts, profiles, routines, devices, rules) as binary Protocol Buffers.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS remote_documents (
    path TEXT PRIMARY KEY,                       -- Slash-delimited canonical document resource path (e.g., 'accounts/{uid}/profiles/{puid}')
    contents BLOB,                               -- Serialized protobuf of the document data (com.google.firestore.v1.Document)
    read_time_seconds INTEGER DEFAULT 0,         -- Snapshot read timestamp (seconds part) for multi-version read consistency
    read_time_nanos INTEGER DEFAULT 0,           -- Snapshot read timestamp (nanoseconds part)
    path_length INTEGER                          -- Segment count of the path used for hierarchical prefix/collection filtering
);

CREATE INDEX IF NOT EXISTS read_time 
    ON remote_documents (read_time_seconds, read_time_nanos);

CREATE INDEX IF NOT EXISTS path_length_idx 
    ON remote_documents (path_length);

-- ------------------------------------------------------------------------------
-- Table 1.2: document_overlays
-- Purpose: Tracks pending local modifications (mutations) layered on top of base
--          remote documents before they are acknowledged by the cloud backend.
--          Enables instant UI and policy updates while offline.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_overlays (
    uid TEXT NOT NULL,                           -- Authenticated parent/child account UID
    collection_path TEXT NOT NULL,               -- Path to the containing collection
    document_id TEXT NOT NULL,                   -- Unique document ID inside collection
    collection_group TEXT,                       -- Collection group name for collection group queries
    largest_batch_id INTEGER NOT NULL,           -- Highest mutation batch ID covering this document overlay
    overlay_mutation BLOB NOT NULL,              -- Serialized mutation protobuf representing the effective local delta
    PRIMARY KEY (uid, collection_path, document_id)
);

CREATE INDEX IF NOT EXISTS batch_id_overlay 
    ON document_overlays (uid, largest_batch_id);

CREATE INDEX IF NOT EXISTS collection_group_overlay 
    ON document_overlays (uid, collection_group);

-- ------------------------------------------------------------------------------
-- Table 1.3: mutations
-- Purpose: Durable offline mutation queue. Stores uncommitted local write batches
--          (e.g., policy updates, routine edits, lock commands, child rule adjustments)
--          accumulated during offline operation for sequential replay upon reconnect.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mutations (
    uid TEXT NOT NULL,                           -- Owner account UID
    batch_id INTEGER NOT NULL,                   -- Monotonically increasing local batch ID
    mutations BLOB NOT NULL,                     -- Serialized WriteBatch protobuf containing atomic Write operations
    PRIMARY KEY (uid, batch_id)
);

-- ------------------------------------------------------------------------------
-- Table 1.4: document_mutations
-- Purpose: Inverted index mapping each modified document path to mutation batches.
--          Allows efficient lookup of all pending batches affecting a specific document.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_mutations (
    uid TEXT NOT NULL,                           -- Owner account UID
    path TEXT NOT NULL,                          -- Resource path of the target document
    batch_id INTEGER NOT NULL,                   -- Mutation batch ID referencing mutations(batch_id)
    PRIMARY KEY (uid, path, batch_id),
    FOREIGN KEY (uid, batch_id) REFERENCES mutations(uid, batch_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- Table 1.5: mutation_queues
-- Purpose: Per-user tracking of the last acknowledged mutation batch and stream token
--          to ensure reliable resumed handshake with the backend.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mutation_queues (
    uid TEXT PRIMARY KEY,                        -- Account UID
    last_acknowledged_batch_id INTEGER,          -- Highest batch ID confirmed by backend server
    last_stream_token BLOB                       -- Opaque streaming handshake token from Google Cloud Firestore
);

-- ------------------------------------------------------------------------------
-- Table 1.6: targets
-- Purpose: Active and cached query targets (e.g., active listeners for profile rules,
--          geofence places, routine schedules, live device status).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS targets (
    target_id INTEGER PRIMARY KEY,               -- Unique integer identifier for the listen query
    canonical_id TEXT,                           -- Canonicalized query signature string for target deduplication
    snapshot_version_seconds INTEGER,            -- Snapshot version seconds of latest consistent view
    snapshot_version_nanos INTEGER,              -- Snapshot version nanoseconds
    resume_token BLOB,                           -- Opaque resume token returned by Firestore streaming API
    last_listen_sequence_number INTEGER,         -- Sequence number tracking target LRU eviction priority
    target_type INTEGER,                         -- 0 = Query Target, 1 = Documents Target
    target_proto BLOB                            -- Serialized Target protobuf (query filters, order-by, limits)
);

CREATE INDEX IF NOT EXISTS query_targets 
    ON targets (canonical_id, target_id);

-- ------------------------------------------------------------------------------
-- Table 1.7: target_globals
-- Purpose: Global singleton metadata tracking target IDs, sequence numbers, and
--          global snapshot versions across the Firestore client instance.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS target_globals (
    highest_target_id INTEGER NOT NULL DEFAULT 0,
    highest_listen_sequence_number INTEGER NOT NULL DEFAULT 0,
    last_remote_snapshot_version_seconds INTEGER NOT NULL DEFAULT 0,
    last_remote_snapshot_version_nanos INTEGER NOT NULL DEFAULT 0,
    target_count INTEGER DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- Table 1.8: target_documents
-- Purpose: Junction table binding active listen targets to document resource paths.
--          Used for GC reference counting and cache invalidation.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS target_documents (
    target_id INTEGER NOT NULL,                  -- Target ID (0 = sentinel target for retained documents)
    path TEXT NOT NULL,                          -- Document resource path
    sequence_number INTEGER,                     -- LRU sequence number when document was linked
    PRIMARY KEY (target_id, path)
);

CREATE INDEX IF NOT EXISTS document_targets 
    ON target_documents (path, target_id);

-- ------------------------------------------------------------------------------
-- Table 1.9: named_queries
-- Purpose: Stores pre-compiled named queries bundled into the application assets
--          or loaded from cloud bundles for fast offline initialization.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS named_queries (
    name TEXT PRIMARY KEY,                       -- Unique query name
    read_time_seconds INTEGER,                   -- Read time timestamp (seconds)
    read_time_nanos INTEGER,                     -- Read time timestamp (nanoseconds)
    bundled_query_proto BLOB                     -- Serialized NamedQuery protobuf
);

-- ------------------------------------------------------------------------------
-- Table 1.10: bundles
-- Purpose: Metadata catalog of offline data bundles downloaded or embedded in the APK.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bundles (
    bundle_id TEXT PRIMARY KEY,                  -- Unique bundle identifier
    create_time_seconds INTEGER,                 -- Bundle creation timestamp (seconds)
    create_time_nanos INTEGER,                   -- Bundle creation timestamp (nanoseconds)
    schema_version INTEGER,                      -- Bundle schema version
    total_documents INTEGER,                     -- Number of documents in bundle
    total_bytes INTEGER                          -- Total payload size in bytes
);

-- ------------------------------------------------------------------------------
-- Table 1.11: collection_parents
-- Purpose: Pre-computed index mapping child collections to their parent paths for
--          efficient collection group queries across all families/profiles.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_parents (
    collection_id TEXT NOT NULL,                 -- Subcollection name (e.g., 'routines', 'places')
    parent TEXT NOT NULL,                        -- Encoded parent resource path
    PRIMARY KEY (collection_id, parent)
);

-- ------------------------------------------------------------------------------
-- Table 1.12: index_configuration
-- Purpose: Configuration for field indexes used in composite querying.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS index_configuration (
    index_id INTEGER PRIMARY KEY,                -- Monotonic index ID
    collection_group TEXT NOT NULL,              -- Target collection group
    index_proto BLOB NOT NULL                    -- Serialized Index protobuf defining fields and orders
);

-- ------------------------------------------------------------------------------
-- Table 1.13: index_state
-- Purpose: Tracks indexing progress and backfill state per user.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS index_state (
    index_id INTEGER NOT NULL,                   -- Index ID referencing index_configuration(index_id)
    uid TEXT NOT NULL,                           -- Account UID
    sequence_number INTEGER,                     -- Last processed sequence number
    read_time_seconds INTEGER,                   -- Last indexed snapshot seconds
    read_time_nanos INTEGER,                     -- Last indexed snapshot nanos
    document_key TEXT,                           -- Last processed document key
    largest_batch_id INTEGER,                    -- Highest mutation batch ID covered
    PRIMARY KEY (index_id, uid)
);

-- ------------------------------------------------------------------------------
-- Table 1.14: index_entries
-- Purpose: B-Tree index entries for lightning-fast offline query evaluation.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS index_entries (
    index_id INTEGER NOT NULL,                   -- Index ID
    uid TEXT NOT NULL,                           -- Account UID
    array_value BLOB NOT NULL,                   -- Serialized array values for array-contains queries
    directional_value BLOB NOT NULL,             -- Serialized ordered scalar values
    document_key TEXT NOT NULL,                  -- Matching document key
    PRIMARY KEY (index_id, uid, array_value, directional_value, document_key)
);

-- ------------------------------------------------------------------------------
-- Table 1.15: data_migrations
-- Purpose: Tracks internal database schema and data migration phases.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_migrations (
    migration_name TEXT PRIMARY KEY              -- e.g., 'build_overlays'
);


-- ==============================================================================
-- 2. ANDROID DATATRANSPORT EVENT STORE SCHEMA (Version 7)
-- Engine: com.google.android.datatransport.runtime.scheduling.persistence.SchemaManager
-- Database: com.google.android.datatransport.events
-- Purpose: Durable offline buffering of metrics, telemetry, and critical compliance events.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 2.1: transport_contexts
-- Purpose: Routing contexts for asynchronous telemetry and event reporting destinations.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transport_contexts (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,       -- Context primary key
    backend_name TEXT NOT NULL,                  -- Backend destination name (e.g., 'cct', 'qustodio-metrics')
    priority INTEGER NOT NULL,                   -- QoS Priority: 0 = DEFAULT, 1 = VERY_LOW, 2 = HIGHEST
    next_request_ms INTEGER NOT NULL             -- Epoch millisecond timestamp of next allowed upload attempt
);

CREATE UNIQUE INDEX IF NOT EXISTS contexts_backend_priority 
    ON transport_contexts (backend_name, priority);

-- ------------------------------------------------------------------------------
-- Table 2.2: events
-- Purpose: Durable storage for pending telemetry events queued offline.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,       -- Event primary key
    context_id INTEGER NOT NULL,                 -- Foreign key referencing transport_contexts(_id)
    transport_name TEXT NOT NULL,                -- Logical transport channel name
    timestamp_ms INTEGER NOT NULL,               -- Event generation wall-clock timestamp
    uptime_ms INTEGER NOT NULL,                  -- Device monotonic uptime timestamp
    payload BLOB NOT NULL,                       -- Serialized event payload bytes
    code INTEGER,                                -- Optional status/error code
    num_attempts INTEGER NOT NULL DEFAULT 0,     -- Transmission retry attempt counter
    payload_encoding TEXT,                       -- Payload format (e.g., 'proto', 'json')
    product_id INTEGER,                          -- Target product/application identifier
    FOREIGN KEY (context_id) REFERENCES transport_contexts(_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS events_backend_id 
    ON events (context_id);

-- ------------------------------------------------------------------------------
-- Table 2.3: event_metadata
-- Purpose: Key-value metadata annotations attached to persisted events.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_metadata (
    _id INTEGER PRIMARY KEY AUTOINCREMENT,       -- Metadata record key
    event_id INTEGER NOT NULL,                   -- Foreign key referencing events(_id)
    name TEXT NOT NULL,                          -- Metadata key name
    value TEXT NOT NULL,                         -- Metadata string value
    FOREIGN KEY (event_id) REFERENCES events(_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS event_metadata_event_id 
    ON event_metadata (event_id);

-- ------------------------------------------------------------------------------
-- Table 2.4: event_payloads
-- Purpose: Chunked storage for large binary payloads exceeding inline buffer limits.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_payloads (
    sequence_num INTEGER NOT NULL,               -- Chunk sequence index (0-based)
    event_id INTEGER NOT NULL,                   -- Foreign key referencing events(_id)
    bytes BLOB NOT NULL,                         -- Binary chunk payload
    PRIMARY KEY (sequence_num, event_id),
    FOREIGN KEY (event_id) REFERENCES events(_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- Table 2.5: log_event_dropped
-- Purpose: Health metric tracking of events dropped due to storage quota exhaustion.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS log_event_dropped (
    log_source VARCHAR(45) NOT NULL,             -- Event source identifier
    reason INTEGER NOT NULL,                     -- Drop reason (1 = CACHE_FULL, 2 = EXPIRED, 3 = PAYLOAD_TOO_BIG)
    events_dropped_count BIGINT NOT NULL,        -- Counter of dropped events
    PRIMARY KEY (log_source, reason)
);

-- ------------------------------------------------------------------------------
-- Table 2.6: global_log_event_state
-- Purpose: Singleton table tracking global metric upload timestamps.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_log_event_state (
    last_metrics_upload_ms BIGINT PRIMARY KEY    -- Epoch millisecond of last health metrics upload
);


-- ==============================================================================
-- 3. JETPACK DATASTORE & CORDOVA NATIVESTORAGE PERSISTENT STORAGE SCHEMA
-- Engine: Android Jetpack DataStore / androidx.datastore.preferences
-- Native Companion: libdatastore_shared_counter.so (Multi-process Atomic Mutex/Counter)
-- Backing Store: SharedPreferences / DataStore Protobuf & XML Files
-- TypeScript Redux Duck: src/ducks/persistentStorage.ts (storageKeys)
-- Purpose: Fast, low-latency, cross-process persistent key-value configuration.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table 3.1: native_storage_kv (SQL representation of SharedPreferences/DataStore)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS native_storage_kv (
    storage_key TEXT PRIMARY KEY,                -- Canonical storage key string from storageKeys
    value_type TEXT NOT NULL,                    -- 'STRING', 'INTEGER', 'BOOLEAN', 'JSON'
    string_value TEXT,                           -- String value or JSON string
    int_value INTEGER,                           -- Numeric/epoch representation
    updated_at_ms INTEGER NOT NULL,              -- Last modification timestamp (UTC epoch ms)
    is_protected BOOLEAN DEFAULT 0               -- 1 = Retained across logout/cache clear (persistentStorageKeys)
);

-- Seed all 26 audited persistent storage keys observed in Qustodio's persistentStorage.ts
INSERT OR IGNORE INTO native_storage_kv (storage_key, value_type, is_protected, updated_at_ms) VALUES
    ('state', 'JSON', 1, 0),                                       -- Full serialized Redux state snapshot
    ('accessToken', 'STRING', 0, 0),                               -- OAuth2 Bearer Access Token
    ('refreshToken', 'STRING', 0, 0),                              -- OAuth2 Refresh Token
    ('authorizationApplication', 'STRING', 0, 0),                  -- Application Auth Client ID (e.g., 'family-parent_only_app_android')
    ('welcomeModalShown', 'BOOLEAN', 0, 0),                        -- Flag: Onboarding welcome modal status
    ('parentDeviceId', 'STRING', 0, 0),                            -- Unique hardware ID of the parent managing device
    ('paymentProvider', 'STRING', 0, 0),                           -- Provider: 'googleplay', 'apple', 'chargebee', 'disable'
    ('installationTs', 'STRING', 0, 0),                            -- ISO8601 installation timestamp
    ('sessionStartTs', 'STRING', 0, 0),                            -- ISO8601 session start timestamp
    ('appRateRateTs', 'STRING', 0, 0),                             -- ISO8601 timestamp child/parent rated the app
    ('appRateFeedbackTs', 'STRING', 0, 0),                         -- ISO8601 timestamp feedback submitted
    ('appRateRemindMeLaterTs', 'STRING', 0, 0),                    -- ISO8601 timestamp reminder scheduled
    ('lastAppVersion', 'STRING', 0, 0),                            -- Version code (e.g., '182.41.0')
    ('lastPushPermission', 'STRING', 0, 0),                        -- Push notification permission status
    ('lastRegistrationId', 'STRING', 0, 0),                        -- FCM / Braze push registration token
    ('panicRulesTourShown', 'BOOLEAN', 0, 0),                      -- Flag: SOS panic button guide shown
    ('externalNavigationAccepted', 'BOOLEAN', 0, 0),               -- Flag: External link opening consent
    ('lastInteractionTs', 'STRING', 0, 0),                         -- ISO8601 timestamp of last user action
    ('purchaseStartedTs', 'STRING', 0, 0),                         -- ISO8601 timestamp of in-app subscription attempt
    ('appOnboardingFinished', 'BOOLEAN', 0, 0),                    -- Flag: Complete onboarding wizard finished
    ('track', 'STRING', 0, 0),                                     -- Analytics/attribution tracking identifier
    ('userClosedSmartAppBanner', 'BOOLEAN', 0, 0),                 -- Flag: Smart app banner dismissed
    ('parentAppStandaloneConfirmed', 'BOOLEAN', 0, 0),             -- Flag: Standalone parent mode confirmed
    ('lockState', 'JSON', 0, 0),                                   -- JSON: { state: 'locked'|'unlocked'|'disabled', timestamp: number }
    ('onboardingTokenData', 'JSON', 0, 0),                         -- QR/Link device pairing token payload
    ('onboardingLiveActivityLastSuccessfulUpdateAt', 'STRING', 0, 0);-- Live activity sync timestamp


-- ==============================================================================
-- 4. TRIGGERS & INTEGRITY CONSTRAINTS
-- ==============================================================================

-- Trigger: Enforce target_globals.target_count consistency upon target addition
CREATE TRIGGER IF NOT EXISTS trg_targets_insert_count
AFTER INSERT ON targets
BEGIN
    UPDATE target_globals 
    SET target_count = target_count + 1,
        highest_target_id = MAX(highest_target_id, NEW.target_id);
END;

-- Trigger: Enforce target_globals.target_count consistency upon target deletion
CREATE TRIGGER IF NOT EXISTS trg_targets_delete_count
AFTER DELETE ON targets
BEGIN
    UPDATE target_globals 
    SET target_count = MAX(0, target_count - 1);
END;

-- Trigger: Automatically cascade target_documents deletion when targets are removed
CREATE TRIGGER IF NOT EXISTS trg_cascade_target_documents
AFTER DELETE ON targets
BEGIN
    DELETE FROM target_documents WHERE target_id = OLD.target_id;
END;

-- Trigger: Auto-populate path_length on remote_documents insertion if null
CREATE TRIGGER IF NOT EXISTS trg_remote_documents_path_length
AFTER INSERT ON remote_documents
WHEN NEW.path_length IS NULL
BEGIN
    UPDATE remote_documents 
    SET path_length = (LENGTH(NEW.path) - LENGTH(REPLACE(NEW.path, '/', '')) + 1)
    WHERE path = NEW.path;
END;
