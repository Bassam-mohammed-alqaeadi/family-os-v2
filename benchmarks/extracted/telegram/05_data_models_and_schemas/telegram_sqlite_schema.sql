-- =========================================================================
-- Telegram Client Local SQLite Database Master Schema (DDL)
-- =========================================================================
-- Source: org/telegram/messenger/MessagesStorage.java (lines 1931-1978, createTables)
-- Native Engine: Custom SQLite with Write-Ahead Logging (WAL) in libtmessages.49.so
-- Schema Version: PRAGMA user_version = 179;
-- Total Tables: 96 Production Tables + High-Throughput Performance Indexes
-- Benchmark: Family OS Reverse Engineering Extraction (Decision D-019)
-- =========================================================================

PRAGMA foreign_keys = OFF;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA user_version = 179;

-- =========================================================================
-- SECTION 1: Core Messaging Store, Sequencers, & Outbox Holes
-- =========================================================================

-- 1. messages_v2: Primary message table storing metadata and MTProto TL binary payload
CREATE TABLE IF NOT EXISTS messages_v2 (
    mid INTEGER,
    uid INTEGER,
    read_state INTEGER,
    send_state INTEGER,
    date INTEGER,
    data BLOB,
    out INTEGER,
    ttl INTEGER,
    media INTEGER,
    replydata BLOB,
    imp INTEGER,
    mention INTEGER,
    forwards INTEGER,
    replies_data BLOB,
    thread_reply_id INTEGER,
    is_channel INTEGER,
    reply_to_message_id INTEGER,
    custom_params BLOB,
    group_id INTEGER,
    reply_to_story_id INTEGER,
    PRIMARY KEY (mid, uid)
);

CREATE INDEX IF NOT EXISTS uid_mid_read_out_idx_messages_v2 ON messages_v2(uid, mid, read_state, out);
CREATE INDEX IF NOT EXISTS uid_date_mid_idx_messages_v2 ON messages_v2(uid, date, mid);
CREATE INDEX IF NOT EXISTS mid_out_idx_messages_v2 ON messages_v2(mid, out);
CREATE INDEX IF NOT EXISTS task_idx_messages_v2 ON messages_v2(uid, out, read_state, ttl, date, send_state);
CREATE INDEX IF NOT EXISTS send_state_idx_messages_v2 ON messages_v2(mid, send_state, date);
CREATE INDEX IF NOT EXISTS uid_mention_idx_messages_v2 ON messages_v2(uid, mention, read_state);
CREATE INDEX IF NOT EXISTS is_channel_idx_messages_v2 ON messages_v2(mid, is_channel);
CREATE INDEX IF NOT EXISTS reply_to_idx_messages_v2 ON messages_v2(mid, reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_to_reply_messages_v2 ON messages_v2(reply_to_message_id, mid);
CREATE INDEX IF NOT EXISTS uid_mid_groupid_messages_v2 ON messages_v2(uid, mid, group_id);

-- 2. messages_holes: Tracks missing contiguous message ranges for background hole filling
CREATE TABLE IF NOT EXISTS messages_holes (
    uid INTEGER,
    start INTEGER,
    end INTEGER,
    PRIMARY KEY (uid, start)
);

CREATE INDEX IF NOT EXISTS uid_end_messages_holes_4_dialogs ON messages_holes(uid, end);

-- 3. messages_seq: Tracks strict monotonic in/out sequence numbers
CREATE TABLE IF NOT EXISTS messages_seq (
    mid INTEGER PRIMARY KEY,
    seq_in INTEGER,
    seq_out INTEGER
);

CREATE INDEX IF NOT EXISTS seq_idx_messages_seq ON messages_seq(seq_in, seq_out);

-- 4. params: Global synchronization progression state (seq, pts, qts, date)
CREATE TABLE IF NOT EXISTS params (
    id INTEGER PRIMARY KEY,
    seq INTEGER,
    pts INTEGER,
    date INTEGER,
    qts INTEGER,
    lsv INTEGER,
    sg INTEGER,
    pbytes BLOB
);

-- 5. randoms_v2: Deduplication store for client-generated 64-bit random_id
CREATE TABLE IF NOT EXISTS randoms_v2 (
    random_id INTEGER,
    mid INTEGER,
    uid INTEGER,
    PRIMARY KEY (random_id, mid, uid)
);

CREATE INDEX IF NOT EXISTS mid_idx_randoms_v2 ON randoms_v2(mid, uid);

-- 6. scheduled_messages_v2: Outbox queue for scheduled and delayed messages
CREATE TABLE IF NOT EXISTS scheduled_messages_v2 (
    mid INTEGER,
    uid INTEGER,
    send_state INTEGER,
    date INTEGER,
    data BLOB,
    ttl INTEGER,
    replydata BLOB,
    reply_to_message_id INTEGER,
    PRIMARY KEY (mid, uid)
);

CREATE INDEX IF NOT EXISTS send_state_idx_scheduled_messages_v2 ON scheduled_messages_v2(mid, send_state, date);
CREATE INDEX IF NOT EXISTS uid_date_idx_scheduled_messages_v2 ON scheduled_messages_v2(uid, date);
CREATE INDEX IF NOT EXISTS reply_to_idx_scheduled_messages_v2 ON scheduled_messages_v2(mid, reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_to_reply_scheduled_messages_v2 ON scheduled_messages_v2(reply_to_message_id, mid);

-- 7. requested_holes: Tracks in-flight gap recovery requests
CREATE TABLE IF NOT EXISTS requested_holes (
    uid INTEGER,
    seq_out_start INTEGER,
    seq_out_end INTEGER,
    PRIMARY KEY (uid, seq_out_start, seq_out_end)
);

-- 8. ephemeral_messages: Time-to-live temporary self-destructing messages
CREATE TABLE IF NOT EXISTS ephemeral_messages (
    id INTEGER,
    dialog_id INTEGER,
    topic_id INTEGER,
    date INTEGER,
    data BLOB,
    PRIMARY KEY (dialog_id, id)
);

CREATE INDEX IF NOT EXISTS ephemeral_messages_date_idx ON ephemeral_messages(date);

-- =========================================================================
-- SECTION 2: Dialogs, Folders, Pins, & Saved Messages
-- =========================================================================

-- 9. dialogs: Master dialogs list (direct chats, supergroups, broadcast channels)
CREATE TABLE IF NOT EXISTS dialogs (
    did INTEGER PRIMARY KEY,
    date INTEGER,
    unread_count INTEGER,
    last_mid INTEGER,
    inbox_max INTEGER,
    outbox_max INTEGER,
    last_mid_i INTEGER,
    unread_count_i INTEGER,
    pts INTEGER,
    date_i INTEGER,
    pinned INTEGER,
    flags INTEGER,
    folder_id INTEGER,
    data BLOB,
    unread_reactions INTEGER,
    last_mid_group INTEGER,
    ttl_period INTEGER,
    unread_poll_votes INTEGER
);

CREATE INDEX IF NOT EXISTS date_idx_4_dialogs ON dialogs(date);
CREATE INDEX IF NOT EXISTS last_mid_idx_4_dialogs ON dialogs(last_mid);
CREATE INDEX IF NOT EXISTS unread_count_idx_dialogs ON dialogs(unread_count);
CREATE INDEX IF NOT EXISTS last_mid_i_idx_dialogs ON dialogs(last_mid_i);
CREATE INDEX IF NOT EXISTS unread_count_i_idx_dialogs ON dialogs(unread_count_i);
CREATE INDEX IF NOT EXISTS folder_id_idx_4_dialogs ON dialogs(folder_id);
CREATE INDEX IF NOT EXISTS flags_idx_4_dialogs ON dialogs(flags);

-- 10. saved_dialogs: Saved messages (cloud notes per user/topic)
CREATE TABLE IF NOT EXISTS saved_dialogs (
    did INTEGER,
    date INTEGER,
    last_mid INTEGER,
    pinned INTEGER,
    flags INTEGER,
    folder_id INTEGER,
    last_mid_group INTEGER,
    count INTEGER,
    forumChatId INTEGER,
    unread_count INTEGER,
    max_read_id INTEGER,
    read_outbox INTEGER,
    PRIMARY KEY (did, forumChatId)
);

CREATE INDEX IF NOT EXISTS date_idx_4_saved_dialogs ON saved_dialogs(date);
CREATE INDEX IF NOT EXISTS last_mid_idx_4_saved_dialogs ON saved_dialogs(last_mid);
CREATE INDEX IF NOT EXISTS folder_id_idx_4_saved_dialogs ON saved_dialogs(folder_id);
CREATE INDEX IF NOT EXISTS flags_idx_4_saved_dialogs ON saved_dialogs(flags);
CREATE INDEX IF NOT EXISTS forum_idx_dialogs ON saved_dialogs(forumChatId);

-- 11. dialog_filter: Chat folders/tabs configuration
CREATE TABLE IF NOT EXISTS dialog_filter (
    id INTEGER PRIMARY KEY,
    ord INTEGER,
    unread_count INTEGER,
    flags INTEGER,
    title TEXT,
    color INTEGER DEFAULT -1,
    entities BLOB,
    noanimate INTEGER
);

-- 12. dialog_filter_ep: Dialogs explicitly included in folder
CREATE TABLE IF NOT EXISTS dialog_filter_ep (
    id INTEGER,
    peer INTEGER,
    PRIMARY KEY (id, peer)
);

-- 13. dialog_filter_pin_v2: Pinned chats within folder tabs
CREATE TABLE IF NOT EXISTS dialog_filter_pin_v2 (
    id INTEGER,
    peer INTEGER,
    pin INTEGER,
    PRIMARY KEY (id, peer)
);

-- 14. dialog_settings: Per-dialog notification and mute preferences
CREATE TABLE IF NOT EXISTS dialog_settings (
    did INTEGER PRIMARY KEY,
    flags INTEGER
);

-- 15. dialog_photos: Cached profile picture history for dialogs
CREATE TABLE IF NOT EXISTS dialog_photos (
    uid INTEGER,
    id INTEGER,
    num INTEGER,
    data BLOB,
    PRIMARY KEY (uid, id)
);

-- 16. dialog_photos_count: Total profile photos count
CREATE TABLE IF NOT EXISTS dialog_photos_count (
    uid INTEGER PRIMARY KEY,
    count INTEGER
);

-- =========================================================================
-- SECTION 3: Users, Chats, Contacts, & Secret End-to-End Encryption
-- =========================================================================

-- 17. users: User entities and serialized TL profile data
CREATE TABLE IF NOT EXISTS users (
    uid INTEGER PRIMARY KEY,
    name TEXT,
    status INTEGER,
    data BLOB
);

-- 18. users_data: Extended user biography and details
CREATE TABLE IF NOT EXISTS users_data (
    uid INTEGER PRIMARY KEY,
    about TEXT
);

-- 19. user_settings: Pinned user settings
CREATE TABLE IF NOT EXISTS user_settings (
    uid INTEGER PRIMARY KEY,
    info BLOB,
    pinned INTEGER
);

CREATE INDEX IF NOT EXISTS user_settings_pinned_idx ON user_settings(uid, pinned) WHERE pinned != 0;

-- 20. user_contacts_v7: Imported address book contacts
CREATE TABLE IF NOT EXISTS user_contacts_v7 (
    key TEXT PRIMARY KEY,
    uid INTEGER,
    fname TEXT,
    sname TEXT,
    imported INTEGER
);

-- 21. user_phones_v7: Contact phone number mappings
CREATE TABLE IF NOT EXISTS user_phones_v7 (
    key TEXT,
    phone TEXT,
    sphone TEXT,
    deleted INTEGER,
    PRIMARY KEY (key, phone)
);

CREATE INDEX IF NOT EXISTS sphone_deleted_idx_user_phones ON user_phones_v7(sphone, deleted);

-- 22. contacts: Mutual contact flags
CREATE TABLE IF NOT EXISTS contacts (
    uid INTEGER PRIMARY KEY,
    mutual INTEGER
);

-- 23. chats: Groups and supergroup chat entities
CREATE TABLE IF NOT EXISTS chats (
    uid INTEGER PRIMARY KEY,
    name TEXT,
    data BLOB
);

-- 24. chat_settings_v2: Group settings, invite links, online members
CREATE TABLE IF NOT EXISTS chat_settings_v2 (
    uid INTEGER PRIMARY KEY,
    info BLOB,
    pinned INTEGER,
    online INTEGER,
    inviter INTEGER,
    links INTEGER,
    participants_count INTEGER
);

CREATE INDEX IF NOT EXISTS chat_settings_pinned_idx ON chat_settings_v2(uid, pinned) WHERE pinned != 0;

-- 25. chat_pinned_v2: Pinned messages history in chats
CREATE TABLE IF NOT EXISTS chat_pinned_v2 (
    uid INTEGER,
    mid INTEGER,
    data BLOB,
    PRIMARY KEY (uid, mid)
);

-- 26. chat_pinned_count: Total count of pinned messages
CREATE TABLE IF NOT EXISTS chat_pinned_count (
    uid INTEGER PRIMARY KEY,
    count INTEGER,
    end INTEGER
);

-- 27. chat_hints: Suggested contacts rating algorithm based on usage frequency
CREATE TABLE IF NOT EXISTS chat_hints (
    did INTEGER,
    type INTEGER,
    rating REAL,
    date INTEGER,
    PRIMARY KEY (did, type)
);

CREATE INDEX IF NOT EXISTS chat_hints_rating_idx ON chat_hints(rating);

-- 28. channel_users_v2: Channel and supergroup participants list
CREATE TABLE IF NOT EXISTS channel_users_v2 (
    did INTEGER,
    uid INTEGER,
    date INTEGER,
    data BLOB,
    PRIMARY KEY (did, uid)
);

-- 29. channel_admins_v3: Channel and supergroup administrator privileges
CREATE TABLE IF NOT EXISTS channel_admins_v3 (
    did INTEGER,
    uid INTEGER,
    data BLOB,
    PRIMARY KEY (did, uid)
);

-- 30. enc_chats: Secret Chats state machine and Diffie-Hellman keys
CREATE TABLE IF NOT EXISTS enc_chats (
    uid INTEGER PRIMARY KEY,
    user INTEGER,
    name TEXT,
    data BLOB,
    g BLOB,
    authkey BLOB,
    ttl INTEGER,
    layer INTEGER,
    seq_in INTEGER,
    seq_out INTEGER,
    use_count INTEGER,
    exchange_id INTEGER,
    key_date INTEGER,
    fprint INTEGER,
    fauthkey BLOB,
    khash BLOB,
    in_seq_no INTEGER,
    admin_id INTEGER,
    mtproto_seq INTEGER
);

-- 31. enc_tasks_v4: Self-destruct destruction queue for secret chat messages
CREATE TABLE IF NOT EXISTS enc_tasks_v4 (
    mid INTEGER,
    uid INTEGER,
    date INTEGER,
    media INTEGER,
    PRIMARY KEY (mid, uid, media)
);

CREATE INDEX IF NOT EXISTS date_idx_enc_tasks_v4 ON enc_tasks_v4(date);

-- =========================================================================
-- SECTION 4: Media Caching, Download Queue, & Sent Files
-- =========================================================================

-- 32. media_v4: Media gallery indexing (photos, videos, audio, documents)
CREATE TABLE IF NOT EXISTS media_v4 (
    mid INTEGER,
    uid INTEGER,
    date INTEGER,
    type INTEGER,
    data BLOB,
    PRIMARY KEY (mid, uid, type)
);

CREATE INDEX IF NOT EXISTS uid_mid_type_date_idx_media_v4 ON media_v4(uid, mid, type, date);
CREATE INDEX IF NOT EXISTS uid_type_date_mid_idx_media_v4 ON media_v4(uid, type, date DESC, mid DESC);
CREATE INDEX IF NOT EXISTS media_v4_music_browse_idx ON media_v4(uid, date DESC, mid DESC) WHERE type = 4 AND mid > 0 AND uid != 0;

-- 33. media_holes_v2: Unsynced gaps in media gallery
CREATE TABLE IF NOT EXISTS media_holes_v2 (
    uid INTEGER,
    type INTEGER,
    start INTEGER,
    end INTEGER,
    PRIMARY KEY (uid, type, start)
);

CREATE INDEX IF NOT EXISTS uid_end_media_holes_v2 ON media_holes_v2(uid, type, end);

-- 34. media_counts_v2: Aggregate counts per media tab (Photos, Files, Voice, Links)
CREATE TABLE IF NOT EXISTS media_counts_v2 (
    uid INTEGER,
    type INTEGER,
    count INTEGER,
    old INTEGER,
    PRIMARY KEY (uid, type)
);

-- 35. download_queue: Background file download manager
CREATE TABLE IF NOT EXISTS download_queue (
    uid INTEGER,
    type INTEGER,
    date INTEGER,
    data BLOB,
    parent TEXT,
    PRIMARY KEY (uid, type)
);

CREATE INDEX IF NOT EXISTS type_date_idx_download_queue ON download_queue(type, date);

-- 36. downloading_documents: Active chunks download coordinator
CREATE TABLE IF NOT EXISTS downloading_documents (
    data BLOB,
    hash INTEGER,
    id INTEGER,
    state INTEGER,
    date INTEGER,
    PRIMARY KEY (hash, id)
);

-- 37. sent_files_v2: Upload cache preventing re-uploading identical file hashes
CREATE TABLE IF NOT EXISTS sent_files_v2 (
    uid TEXT,
    type INTEGER,
    data BLOB,
    parent TEXT,
    PRIMARY KEY (uid, type)
);

-- =========================================================================
-- SECTION 5: Forum Topics & Threaded Sub-Channels
-- =========================================================================

-- 38. topics: Supergroup forum topics metadata
CREATE TABLE IF NOT EXISTS topics (
    did INTEGER,
    topic_id INTEGER,
    data BLOB,
    top_message INTEGER,
    topic_message BLOB,
    unread_count INTEGER,
    max_read_id INTEGER,
    unread_mentions INTEGER,
    unread_reactions INTEGER,
    read_outbox INTEGER,
    pinned INTEGER,
    total_messages_count INTEGER,
    hidden INTEGER,
    edit_date INTEGER,
    nopaid_messages_exception INTEGER,
    unread_poll_votes INTEGER,
    PRIMARY KEY (did, topic_id)
);

CREATE INDEX IF NOT EXISTS did_top_message_topics ON topics(did, top_message);
CREATE INDEX IF NOT EXISTS did_topics ON topics(did);

-- 39. messages_topics: Messages partitioned by forum topic
CREATE TABLE IF NOT EXISTS messages_topics (
    mid INTEGER,
    uid INTEGER,
    topic_id INTEGER,
    read_state INTEGER,
    send_state INTEGER,
    date INTEGER,
    data BLOB,
    out INTEGER,
    ttl INTEGER,
    media INTEGER,
    replydata BLOB,
    imp INTEGER,
    mention INTEGER,
    forwards INTEGER,
    replies_data BLOB,
    thread_reply_id INTEGER,
    is_channel INTEGER,
    reply_to_message_id INTEGER,
    custom_params BLOB,
    reply_to_story_id INTEGER,
    PRIMARY KEY (mid, topic_id, uid)
);

CREATE INDEX IF NOT EXISTS uid_date_mid_idx_messages_topics ON messages_topics(uid, date, mid);
CREATE INDEX IF NOT EXISTS mid_out_idx_messages_topics ON messages_topics(mid, out);
CREATE INDEX IF NOT EXISTS task_idx_messages_topics ON messages_topics(uid, out, read_state, ttl, date, send_state);
CREATE INDEX IF NOT EXISTS send_state_idx_messages_topics ON messages_topics(mid, send_state, date);
CREATE INDEX IF NOT EXISTS is_channel_idx_messages_topics ON messages_topics(mid, is_channel);
CREATE INDEX IF NOT EXISTS reply_to_idx_messages_topics ON messages_topics(mid, reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_to_reply_messages_topics ON messages_topics(reply_to_message_id, mid);
CREATE INDEX IF NOT EXISTS mid_uid_messages_topics ON messages_topics(mid, uid);
CREATE INDEX IF NOT EXISTS uid_mid_read_out_idx_messages_topics ON messages_topics(uid, topic_id, mid, read_state, out);
CREATE INDEX IF NOT EXISTS uid_mention_idx_messages_topics ON messages_topics(uid, topic_id, mention, read_state);
CREATE INDEX IF NOT EXISTS uid_topic_id_messages_topics ON messages_topics(uid, topic_id);
CREATE INDEX IF NOT EXISTS uid_topic_id_date_mid_messages_topics ON messages_topics(uid, topic_id, date, mid);
CREATE INDEX IF NOT EXISTS uid_topic_id_mid_messages_topics ON messages_topics(uid, topic_id, mid);

-- 40. messages_holes_topics: Topic message gap tracking
CREATE TABLE IF NOT EXISTS messages_holes_topics (
    uid INTEGER,
    topic_id INTEGER,
    start INTEGER,
    end INTEGER,
    PRIMARY KEY (uid, topic_id, start)
);

CREATE INDEX IF NOT EXISTS uid_end_messages_holes_4_topics ON messages_holes_topics(uid, topic_id, end);

-- 41. media_topics: Topic-scoped media indexing
CREATE TABLE IF NOT EXISTS media_topics (
    mid INTEGER,
    uid INTEGER,
    topic_id INTEGER,
    date INTEGER,
    type INTEGER,
    data BLOB,
    PRIMARY KEY (mid, uid, topic_id, type)
);

CREATE INDEX IF NOT EXISTS uid_mid_type_date_idx_media_topics ON media_topics(uid, topic_id, mid, type, date);

-- 42. media_holes_topics: Topic-scoped media gap tracking
CREATE TABLE IF NOT EXISTS media_holes_topics (
    uid INTEGER,
    topic_id INTEGER,
    type INTEGER,
    start INTEGER,
    end INTEGER,
    PRIMARY KEY (uid, topic_id, type, start)
);

CREATE INDEX IF NOT EXISTS uid_end_media_holes_topics ON media_holes_topics(uid, topic_id, type, end);

-- 43. media_counts_topics: Media counts per topic
CREATE TABLE IF NOT EXISTS media_counts_topics (
    uid INTEGER,
    topic_id INTEGER,
    type INTEGER,
    count INTEGER,
    old INTEGER,
    PRIMARY KEY (uid, topic_id, type)
);

-- =========================================================================
-- SECTION 6: Live Location, Bots, Stickers, & Interactive Components
-- =========================================================================

-- 44. sharing_locations: Real-time GPS location sharing and proximity alerts
CREATE TABLE IF NOT EXISTS sharing_locations (
    uid INTEGER PRIMARY KEY,
    mid INTEGER,
    date INTEGER,
    period INTEGER,
    message BLOB,
    proximity INTEGER
);

-- 45. bot_info_v2: Bot command menus and descriptions
CREATE TABLE IF NOT EXISTS bot_info_v2 (
    uid INTEGER,
    dialogId INTEGER,
    info BLOB,
    PRIMARY KEY (uid, dialogId)
);

-- 46. bot_keyboard: Reply markup inline keyboards
CREATE TABLE IF NOT EXISTS bot_keyboard (
    uid INTEGER PRIMARY KEY,
    mid INTEGER,
    info BLOB
);

CREATE INDEX IF NOT EXISTS bot_keyboard_idx_mid_v2 ON bot_keyboard(mid, uid);

-- 47. bot_keyboard_topics: Reply markup keyboards scoped by topic
CREATE TABLE IF NOT EXISTS bot_keyboard_topics (
    uid INTEGER,
    tid INTEGER,
    mid INTEGER,
    info BLOB,
    PRIMARY KEY (uid, tid)
);

CREATE INDEX IF NOT EXISTS bot_keyboard_topics_idx_mid_v2 ON bot_keyboard_topics(mid, uid, tid);

-- 48. botcache: Cached inline bot query responses
CREATE TABLE IF NOT EXISTS botcache (
    id TEXT PRIMARY KEY,
    date INTEGER,
    data BLOB
);

CREATE INDEX IF NOT EXISTS botcache_date_idx ON botcache(date);

-- 49. attach_menu_bots: Web app bots registered in attachment clip menu
CREATE TABLE IF NOT EXISTS attach_menu_bots (
    data BLOB,
    hash INTEGER,
    date INTEGER
);

-- 50. popular_bots: Popular discoverable bots ranking
CREATE TABLE IF NOT EXISTS popular_bots (
    uid INTEGER PRIMARY KEY,
    time INTEGER,
    offset TEXT,
    pos INTEGER
);

-- 51. stickers_v2: Installed sticker packs
CREATE TABLE IF NOT EXISTS stickers_v2 (
    id INTEGER PRIMARY KEY,
    data BLOB,
    date INTEGER,
    hash INTEGER
);

-- 52. stickers_featured: Trending stickers promoted in store
CREATE TABLE IF NOT EXISTS stickers_featured (
    id INTEGER PRIMARY KEY,
    data BLOB,
    unread BLOB,
    date INTEGER,
    hash INTEGER,
    premium INTEGER,
    emoji INTEGER
);

CREATE INDEX IF NOT EXISTS stickers_featured_emoji_index ON stickers_featured(emoji);

-- 53. stickers_dice: Random animated dice and dart games
CREATE TABLE IF NOT EXISTS stickers_dice (
    emoji TEXT PRIMARY KEY,
    data BLOB,
    date INTEGER
);

-- 54. stickersets2: Sticker sets catalog with slug lookup
CREATE TABLE IF NOT EXISTS stickersets2 (
    id INTEGER PRIMARY KEY,
    data BLOB,
    hash INTEGER,
    date INTEGER,
    short_name TEXT
);

CREATE INDEX IF NOT EXISTS stickersets2_id_index ON stickersets2(id);
CREATE INDEX IF NOT EXISTS stickersets2_id_short_name ON stickersets2(id, short_name);

-- 55. animated_emoji: TGS/Lottie animated emoji vector documents
CREATE TABLE IF NOT EXISTS animated_emoji (
    document_id INTEGER PRIMARY KEY,
    data BLOB
);

-- 56. emoji_keywords_v2: Multilingual emoji search keywords index
CREATE TABLE IF NOT EXISTS emoji_keywords_v2 (
    lang TEXT,
    keyword TEXT,
    emoji TEXT,
    PRIMARY KEY (lang, keyword, emoji)
);

CREATE INDEX IF NOT EXISTS emoji_keywords_v2_keyword ON emoji_keywords_v2(keyword);

-- 57. emoji_keywords_info_v2: Version info for emoji localization dictionary
CREATE TABLE IF NOT EXISTS emoji_keywords_info_v2 (
    lang TEXT PRIMARY KEY,
    alias TEXT,
    version INTEGER,
    date INTEGER
);

-- 58. emoji_groups: Standard Unicode emoji categories
CREATE TABLE IF NOT EXISTS emoji_groups (
    type INTEGER PRIMARY KEY,
    data BLOB
);

-- 59. emoji_statuses: User profile animated emoji badges
CREATE TABLE IF NOT EXISTS emoji_statuses (
    data BLOB,
    type INTEGER
);

-- =========================================================================
-- SECTION 7: Polls, Reactions, Push Messages, & Stories
-- =========================================================================

-- 60. polls_v2: Interactive quizzes and multiple-choice polls
CREATE TABLE IF NOT EXISTS polls_v2 (
    mid INTEGER,
    uid INTEGER,
    id INTEGER,
    PRIMARY KEY (mid, uid)
);

CREATE INDEX IF NOT EXISTS polls_id_v2 ON polls_v2(id);

-- 61. poll_votes_mentions: Unread poll vote notification tracking
CREATE TABLE IF NOT EXISTS poll_votes_mentions (
    message_id INTEGER,
    state INTEGER,
    dialog_id INTEGER,
    PRIMARY KEY (message_id, dialog_id)
);

CREATE INDEX IF NOT EXISTS poll_votes_mentions_did ON poll_votes_mentions(dialog_id);

-- 62. poll_votes_mentions_topics: Topic-scoped poll vote notifications
CREATE TABLE IF NOT EXISTS poll_votes_mentions_topics (
    message_id INTEGER,
    state INTEGER,
    dialog_id INTEGER,
    topic_id INTEGER,
    PRIMARY KEY (message_id, dialog_id, topic_id)
);

CREATE INDEX IF NOT EXISTS poll_votes_mentions_topics_did ON poll_votes_mentions_topics(dialog_id, topic_id);

-- 63. reactions: Available reaction emojis and animations
CREATE TABLE IF NOT EXISTS reactions (
    data BLOB,
    hash INTEGER,
    date INTEGER
);

-- 64. reaction_mentions: User mentions in message reactions
CREATE TABLE IF NOT EXISTS reaction_mentions (
    message_id INTEGER,
    state INTEGER,
    dialog_id INTEGER,
    PRIMARY KEY (message_id, dialog_id)
);

CREATE INDEX IF NOT EXISTS reaction_mentions_did ON reaction_mentions(dialog_id);

-- 65. reaction_mentions_topics: User mentions in topic reactions
CREATE TABLE IF NOT EXISTS reaction_mentions_topics (
    message_id INTEGER,
    state INTEGER,
    dialog_id INTEGER,
    topic_id INTEGER,
    PRIMARY KEY (message_id, dialog_id, topic_id)
);

CREATE INDEX IF NOT EXISTS reaction_mentions_topics_did ON reaction_mentions_topics(dialog_id, topic_id);

-- 66. unread_push_messages: Pending push notifications queue
CREATE TABLE IF NOT EXISTS unread_push_messages (
    uid INTEGER,
    mid INTEGER,
    random INTEGER,
    date INTEGER,
    data BLOB,
    fm TEXT,
    name TEXT,
    uname TEXT,
    flags INTEGER,
    topicId INTEGER,
    is_reaction INTEGER,
    PRIMARY KEY (uid, mid)
);

CREATE INDEX IF NOT EXISTS unread_push_messages_idx_date ON unread_push_messages(date);
CREATE INDEX IF NOT EXISTS unread_push_messages_idx_random ON unread_push_messages(random);

-- 67. stories: Ephemeral 24-hour stories stream
CREATE TABLE IF NOT EXISTS stories (
    dialog_id INTEGER,
    story_id INTEGER,
    data BLOB,
    custom_params BLOB,
    PRIMARY KEY (dialog_id, story_id)
);

-- 68. stories_counter: Seen/unseen story rings tracker
CREATE TABLE IF NOT EXISTS stories_counter (
    dialog_id INTEGER PRIMARY KEY,
    count INTEGER,
    max_read INTEGER
);

-- 69. profile_stories: User profile permanent story highlights
CREATE TABLE IF NOT EXISTS profile_stories (
    dialog_id INTEGER,
    story_id INTEGER,
    data BLOB,
    type INTEGER,
    seen INTEGER,
    pin INTEGER,
    PRIMARY KEY (dialog_id, story_id, type)
);

-- 70. profile_stories_albums: Story album organization
CREATE TABLE IF NOT EXISTS profile_stories_albums (
    dialog_id INTEGER,
    album_id INTEGER,
    order_index INTEGER,
    data BLOB,
    PRIMARY KEY (dialog_id, album_id)
);

-- 71. profile_stories_albums_links: Story to album relationships
CREATE TABLE IF NOT EXISTS profile_stories_albums_links (
    dialog_id INTEGER,
    album_id INTEGER,
    story_id INTEGER,
    order_index INTEGER,
    PRIMARY KEY (dialog_id, album_id, story_id)
);

-- 72. story_drafts: Unsent story editor drafts
CREATE TABLE IF NOT EXISTS story_drafts (
    id INTEGER PRIMARY KEY,
    date INTEGER,
    data BLOB,
    type INTEGER
);

-- 73. story_pushes: Story notification pushes
CREATE TABLE IF NOT EXISTS story_pushes (
    uid INTEGER,
    sid INTEGER,
    date INTEGER,
    localName TEXT,
    flags INTEGER,
    expire_date INTEGER,
    live INTEGER,
    PRIMARY KEY (uid, sid)
);

-- =========================================================================
-- SECTION 8: Telegram Business, Quick Replies, & System Settings
-- =========================================================================

-- 74. business_replies: Telegram Business quick reply category definitions
CREATE TABLE IF NOT EXISTS business_replies (
    topic_id INTEGER PRIMARY KEY,
    name TEXT,
    order_value INTEGER,
    count INTEGER
);

-- 75. quick_replies_messages: Quick reply message shortcuts
CREATE TABLE IF NOT EXISTS quick_replies_messages (
    mid INTEGER,
    topic_id INTEGER,
    send_state INTEGER,
    date INTEGER,
    data BLOB,
    ttl INTEGER,
    replydata BLOB,
    reply_to_message_id INTEGER,
    PRIMARY KEY (mid, topic_id)
);

CREATE INDEX IF NOT EXISTS send_state_idx_quick_replies_messages ON quick_replies_messages(mid, send_state, date);
CREATE INDEX IF NOT EXISTS topic_date_idx_quick_replies_messages ON quick_replies_messages(topic_id, date);
CREATE INDEX IF NOT EXISTS reply_to_idx_quick_replies_messages ON quick_replies_messages(mid, reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_to_reply_quick_replies_messages ON quick_replies_messages(reply_to_message_id, mid);

-- 76. welcome_messages: Automated greeting/away messages for business chats
CREATE TABLE IF NOT EXISTS welcome_messages (
    mid INTEGER,
    dialog_id INTEGER,
    send_state INTEGER,
    date INTEGER,
    data BLOB,
    ttl INTEGER,
    replydata BLOB,
    reply_to_message_id INTEGER,
    PRIMARY KEY (mid, dialog_id)
);

CREATE INDEX IF NOT EXISTS send_state_idx_welcome_messages ON welcome_messages(mid, send_state, date);
CREATE INDEX IF NOT EXISTS dialog_date_idx_welcome_messages ON welcome_messages(dialog_id, date);
CREATE INDEX IF NOT EXISTS reply_to_idx_welcome_messages ON welcome_messages(mid, reply_to_message_id);
CREATE INDEX IF NOT EXISTS idx_to_reply_welcome_messages ON welcome_messages(reply_to_message_id, mid);

-- 77. business_links: Shareable pre-filled business chat links
CREATE TABLE IF NOT EXISTS business_links (
    data BLOB,
    order_value INTEGER
);

-- 78. tag_message_id: Searchable message tags
CREATE TABLE IF NOT EXISTS tag_message_id (
    mid INTEGER,
    topic_id INTEGER,
    tag INTEGER,
    text TEXT
);

CREATE INDEX IF NOT EXISTS tag_idx_tag_message_id ON tag_message_id(tag);
CREATE INDEX IF NOT EXISTS tag_text_idx_tag_message_id ON tag_message_id(tag, text COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS tag_topic_idx_tag_message_id ON tag_message_id(topic_id, tag);
CREATE INDEX IF NOT EXISTS tag_topic_text_idx_tag_message_id ON tag_message_id(topic_id, tag, text COLLATE NOCASE);

-- 79. saved_reaction_tags: Pinned reaction tags for Saved Messages
CREATE TABLE IF NOT EXISTS saved_reaction_tags (
    topic_id INTEGER PRIMARY KEY,
    data BLOB
);

-- 80. fact_checks: Independent fact-check labels attached to public claims
CREATE TABLE IF NOT EXISTS fact_checks (
    hash INTEGER PRIMARY KEY,
    data BLOB,
    expires INTEGER
);

-- 81. star_gifts2: Telegram Stars digital gift store
CREATE TABLE IF NOT EXISTS star_gifts2 (
    id INTEGER PRIMARY KEY,
    data BLOB,
    hash INTEGER,
    time INTEGER,
    pos INTEGER
);

-- 82. gift_themes: Star gift animation themes
CREATE TABLE IF NOT EXISTS gift_themes (
    slug TEXT PRIMARY KEY,
    data BLOB
);

-- 83. wallpapers2: Custom chat backgrounds and color patterns
CREATE TABLE IF NOT EXISTS wallpapers2 (
    uid INTEGER PRIMARY KEY,
    data BLOB,
    num INTEGER
);

CREATE INDEX IF NOT EXISTS wallpapers_num ON wallpapers2(num);

-- 84. web_recent_v3: In-app web search image/GIF history
CREATE TABLE IF NOT EXISTS web_recent_v3 (
    id TEXT,
    type INTEGER,
    image_url TEXT,
    thumb_url TEXT,
    local_url TEXT,
    width INTEGER,
    height INTEGER,
    size INTEGER,
    date INTEGER,
    document BLOB,
    PRIMARY KEY (id, type)
);

-- 85. hashtag_recent_v2: Recent autocomplete hashtag history
CREATE TABLE IF NOT EXISTS hashtag_recent_v2 (
    id TEXT PRIMARY KEY,
    date INTEGER
);

-- 86. webpage_pending_v2: In-flight link preview generation requests
CREATE TABLE IF NOT EXISTS webpage_pending_v2 (
    id INTEGER,
    mid INTEGER,
    uid INTEGER,
    PRIMARY KEY (id, mid, uid)
);

-- 87. search_recent: Global search recent clicks
CREATE TABLE IF NOT EXISTS search_recent (
    did INTEGER PRIMARY KEY,
    date INTEGER
);

-- 88. keyvalue: General client-side configuration key-value store
CREATE TABLE IF NOT EXISTS keyvalue (
    id TEXT PRIMARY KEY,
    value TEXT
);

-- 89. pending_tasks: Background queued async workers (e.g. read sync, drafts)
CREATE TABLE IF NOT EXISTS pending_tasks (
    id INTEGER PRIMARY KEY,
    data BLOB
);

-- 90. shortcut_widget: Android home screen conversation launcher shortcuts
CREATE TABLE IF NOT EXISTS shortcut_widget (
    id INTEGER,
    did INTEGER,
    ord INTEGER,
    PRIMARY KEY (id, did)
);

CREATE INDEX IF NOT EXISTS shortcut_widget_did ON shortcut_widget(did);

-- 91. premium_promo: Telegram Premium upsell banners configuration
CREATE TABLE IF NOT EXISTS premium_promo (
    data BLOB,
    date INTEGER
);

-- 92. app_config: Remote feature flags and server configuration
CREATE TABLE IF NOT EXISTS app_config (
    data BLOB
);

-- 93. web_browser_settings: In-app browser settings
CREATE TABLE IF NOT EXISTS web_browser_settings (
    data BLOB
);

-- 94. effects: Message send animations and full-screen effects
CREATE TABLE IF NOT EXISTS effects (
    data BLOB
);

-- 95. unconfirmed_auth: Pending login session authorizations
CREATE TABLE IF NOT EXISTS unconfirmed_auth (
    data BLOB
);
