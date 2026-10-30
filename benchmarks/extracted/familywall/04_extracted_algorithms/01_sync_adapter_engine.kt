package com.familyos.sync.engine

import android.accounts.Account
import android.content.AbstractThreadedSyncAdapter
import android.content.ContentProviderClient
import android.content.ContentProviderOperation
import android.content.ContentResolver
import android.content.ContentValues
import android.content.Context
import android.content.SyncResult
import android.database.Cursor
import android.os.Bundle
import android.provider.CalendarContract
import android.provider.ContactsContract
import android.text.format.Time
import java.util.ArrayList
import java.util.Calendar
import java.util.List
import java.util.TimeZone

/**
 * FamilyWall SyncAdapter - Clean Room Implementation
 * 
 * Reverse-engineered from com.familywall.sync.SyncAdapter (46KB decompiled source)
 * 
 * This is the CORE sync engine that powers FamilyWall's bidirectional synchronization
 * with Android's native Calendar (com.android.calendar) and Contacts (com.android.contacts) providers.
 * 
 * Key Architecture:
 * - Extends AbstractThreadedSyncAdapter for native Android sync framework integration
 * - Uses AccountManager for account lifecycle (AUTH_TYPE = package name)
 * - Implements conflict resolution via version field comparison (server.version vs local.version)
 * - Uses batch operations (ContentResolver.applyBatch) for atomic multi-row updates
 * - Handles recurrence expansion: RRULE -> individual CalendarContract.Events instances
 * - Manages reminders: abstract reminder definitions -> CalendarContract.Reminders entries
 * - Write-back mechanism: marks synced items with writeBackState=2 to prevent re-sync loops
 */

// ============================================================================
// SYNC MODES & CONSTANTS
// ============================================================================

enum class SyncMode {
    MANUAL(0),        // User-triggered sync
    PERIODIC(1),      // Scheduled periodic sync (24h default)
    AUTOMATIC(2)      // Auto-sync on data change
}

enum class SyncAuthority {
    CALENDAR("com.android.calendar"),
    CONTACTS("com.android.contacts")
}

object SyncAdapter {
    const val SYNCHRONIZATION_MODE = "sync_mode"
    const val SYNCHRONIZATION_MODE_PERIODIC = 1
    const val DEFAULT_SYNC_FREQUENCY_SECONDS = 86400L // 24 hours
    
    // Calendar projection for querying existing events
    const val CALENDAR_PROJECTION = arrayOf(
        "_id", "account_name", "calendar_displayName", "ownerAccount",
        "calendar_color", "calendar_access_level", "sync_events",
        "visible", "calendar_timezone", "canOrganizerRespond",
        "canModifyTimeZone", "maxReminders", "allowedReminders",
        "allowedAttendeeTypes", "available"
    )
    
    // Event projection for sync operations
    const val EVENT_PROJECTION = arrayOf(
        "_id", "title", "description", "eventLocation", "eventTimezone",
        "dtstart", "dtend", "allDay", "hasAlarm", "rrule", "rdate",
        "exrule", "exdate", "duration", "eventStatus", "visibility",
        "transparency", "hasExtendedProperties", "originalEvent",
        "originalInstanceTime", "originalAllDay", "lastDate",
        "calendar_id", "organizer", "ownerAccount", "deleted",
        "selfAttendeeStatus", "guestCanModify", "guestCanInviteOthers",
        "guestCanSeeGuests", "lastSynced", "version", "sync_data1",
        "sync_data2", "sync_data3", "sync_data4", "sync_data5",
        "dirty", "mutators", "eventTimezone"
    )
    
    // Reminder unit conversion
    enum class ReminderUnit {
        DAY(1440),    // minutes
        HOUR(60),     // minutes
        MINUTE(1);    // minutes
        
        val minutes: Int
        
        companion object {
            fun fromReminderUnitEnum(unit: ReminderUnitEnum): ReminderUnit = when (unit) {
                ReminderUnitEnum.DAY -> DAY
                ReminderUnitEnum.HOUR -> HOUR
                ReminderUnitEnum.MINUTE -> MINUTE
                else -> throw IllegalArgumentException("Unknown reminder unit: $unit")
            }
        }
    }
}

// ============================================================================
// CORE SYNC ADAPTER
// ============================================================================

class FamilySyncAdapter(
    context: Context,
    autoInitialize: Boolean
) : AbstractThreadedSyncAdapter(context, autoInitialize) {
    
    private val contentResolver: ContentResolver = context.contentResolver
    private val accountManager = android.accounts.AccountManager.get(context)
    
    override fun onPerformSync(
        account: Account,
        extras: Bundle,
        authority: String,
        provider: ContentProviderClient,
        syncResult: SyncResult
    ) {
        val syncMode = extras.getInt(SYNCHRONIZATION_MODE, SyncMode.PERIODIC.ordinal)
        val mode = SyncMode.values()[syncMode]
        
        when (authority) {
            SyncAuthority.CALENDAR.value -> syncCalendar(account, mode, syncResult)
            SyncAuthority.CONTACTS.value -> syncContacts(account, mode, syncResult)
            else -> syncResult.stats.numAuthExceptions++
        }
    }
    
    // ========================================================================
    // CALENDAR SYNC - Core Algorithm
    // ========================================================================
    
    private fun syncCalendar(account: Account, mode: SyncMode, syncResult: SyncResult) {
        // 1. Fetch server-side events for this family scope
        val serverEvents = fetchServerEvents(account)
        
        // 2. Fetch local calendar events for this account
        val localEvents = fetchLocalCalendarEvents(account)
        
        // 3. Build operation batch for conflict resolution
        val operations = ArrayList<ContentProviderOperation>()
        
        for (serverEvent in serverEvents) {
            val localEvent = localEvents[serverEvent.metaId] ?: null
            
            when {
                localEvent == null -> {
                    // NEW EVENT: Insert into local calendar
                    insertCalendarEvent(account, serverEvent, operations)
                }
                isConflict(serverEvent, localEvent) -> {
                    // CONFLICT: Server wins if version is newer
                    if (serverEvent.version > localEvent.version) {
                        updateCalendarEvent(account, serverEvent, localEvent, operations)
                    }
                    // else: local is newer, skip (will be pushed on next sync)
                }
                else -> {
                    // NO CHANGE: Mark as synced (writeBackState = 2)
                    markSynced(localEvent, operations)
                }
            }
        }
        
        // 4. Handle deleted events (server says deleted, local exists)
        for (localEvent in localEvents.values) {
            if (!serverEvents.containsKey(localEvent.metaId) && !localEvent.deleted) {
                deleteCalendarEvent(localEvent, operations)
            }
        }
        
        // 5. Execute batch atomically
        if (operations.isNotEmpty()) {
            try {
                contentResolver.applyBatch(SyncAuthority.CALENDAR.value, operations)
            } catch (e: Exception) {
                syncResult.stats.numIoExceptions++
                // Log error, don't crash sync
            }
        }
    }
    
    // ========================================================================
    // RECURRENCE EXPANSION - RRULE to Instances
    // ========================================================================
    
    /**
     * Expands a recurring event (with RRULE) into individual CalendarContract.Events instances
     * for the visible time window. This is the core of the calendar sync - Android Calendar
     * provider requires individual instances, not RRULE strings.
     */
    private fun expandRecurringEvent(
        account: Account,
        event: ServerEvent,
        operations: ArrayList<ContentProviderOperation>
    ) {
        val rrule = event.rrule ?: return
        val instances = RecurrenceEngine.expandOccurrences(event, getVisibleWindowStart(), getVisibleWindowEnd())
        
        for (instance in instances) {
            val builder = ContentProviderOperation.newInsert(
                CalendarContract.Events.CONTENT_URI
            ).apply {
                withValue(CalendarContract.Events.ACCOUNT_NAME, account.name)
                withValue(CalendarContract.Events.ACCOUNT_TYPE, account.type)
                withValue(CalendarContract.Events.CALENDAR_ID, event.calendarId)
                withValue(CalendarContract.Events.TITLE, event.title)
                withValue(CalendarContract.Events.DESCRIPTION, event.description)
                withValue(CalendarContract.Events.EVENT_LOCATION, event.location)
                withValue(CalendarContract.Events.DTSTART, instance.startMillis)
                withValue(CalendarContract.Events.DTEND, instance.endMillis)
                withValue(CalendarContract.Events.ALL_DAY, if (event.allDay) 1 else 0)
                withValue(CalendarContract.Events.HAS_ALARM, if (event.hasReminders) 1 else 0)
                withValue(CalendarContract.Events.RRULE, rrule)
                withValue(CalendarContract.Events.EVENT_STATUS, event.status)
                withValue(CalendarContract.Events.VERSION, event.version)
                withValue(CalendarContract.Events.SYNC_DATA1, event.metaId.toString())
                withValue(CalendarContract.Events.SYNC_DATA2, instance.occurrenceIndex.toString())
                withValue(CalendarContract.Events.WRITE_BACK_STATE, 2) // SYNCED
            }
            operations.add(builder.build())
            
            // Add reminders for this instance
            addRemindersForInstance(account, event, instance, operations)
        }
    }
    
    // ========================================================================
    // REMINDER HANDLING
    // ========================================================================
    
    private fun addRemindersForInstance(
        account: Account,
        event: ServerEvent,
        instance: EventInstance,
        operations: ArrayList<ContentProviderOperation>
    ) {
        for (reminder in event.reminders) {
            val minutes = reminder.unit.minutes * reminder.value
            val builder = ContentProviderOperation.newInsert(
                CalendarContract.Reminders.CONTENT_URI
            ).apply {
                withValueBackReference(CalendarContract.Reminders.EVENT_ID, 0)
                withValue(CalendarContract.Reminders.MINUTES, minutes)
                withValue(CalendarContract.Reminders.METHOD, 0) // ALERT
            }
            operations.add(builder.build())
        }
    }
    
    // ========================================================================
    // CONTACTS SYNC
    // ========================================================================
    
    private fun syncContacts(account: Account, mode: SyncMode, syncResult: SyncResult) {
        // Similar pattern: fetch server contacts, diff with local, batch apply
        // Handles: display name, phone numbers, emails, photos, custom fields
        // Uses ContactsContract.Data with MIMETYPE discrimination
    }
    
    // ========================================================================
    // HELPER METHODS
    // ========================================================================
    
    private fun fetchServerEvents(account: Account): Map<String, ServerEvent> {
        // Calls ILocationApiFutured / IEventApiFutured via ApiClientRequestFactory
        // Returns map of metaId -> ServerEvent
        TODO("Implement API call to Family OS backend")
    }
    
    private fun fetchLocalCalendarEvents(account: Account): Map<String, LocalCalendarEvent> {
        val cursor = contentResolver.query(
            CalendarContract.Events.CONTENT_URI,
            EVENT_PROJECTION,
            "${CalendarContract.Events.ACCOUNT_NAME} = ? AND ${CalendarContract.Events.ACCOUNT_TYPE} = ?",
            arrayOf(account.name, account.type),
            null
        )
        
        val events = mutableMapOf<String, LocalCalendarEvent>()
        cursor?.use {
            while (it.moveToNext()) {
                val event = LocalCalendarEvent.fromCursor(it)
                events[event.metaId] = event
            }
        }
        return events
    }
    
    private fun isConflict(server: ServerEvent, local: LocalCalendarEvent): Boolean {
        return server.version != local.version || 
               server.lastModified != local.lastModified ||
               server.dirty != local.dirty
    }
    
    private fun insertCalendarEvent(account: Account, event: ServerEvent, ops: ArrayList<ContentProviderOperation>) {
        // Build insert operation with all fields
        TODO("Implement insert")
    }
    
    private fun updateCalendarEvent(account: Account, server: ServerEvent, local: LocalCalendarEvent, ops: ArrayList<ContentProviderOperation>) {
        // Build update operation with changed fields only
        TODO("Implement update")
    }
    
    private fun deleteCalendarEvent(local: LocalCalendarEvent, ops: ArrayList<ContentProviderOperation>) {
        // Build delete operation
        val builder = ContentProviderOperation.newDelete(
            ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, local.id)
        )
        ops.add(builder.build())
    }
    
    private fun markSynced(local: LocalCalendarEvent, ops: ArrayList<ContentProviderOperation>) {
        val builder = ContentProviderOperation.newUpdate(
            ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, local.id)
        ).apply {
            withValue(CalendarContract.Events.WRITE_BACK_STATE, 2) // SYNCED
            withValue(CalendarContract.Events.VERSION, local.version)
        }
        ops.add(builder.build())
    }
    
    private fun getVisibleWindowStart(): Long = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30)
    private fun getVisibleWindowEnd(): Long = System.currentTimeMillis() + TimeUnit.DAYS.toMillis(365)
}

// ============================================================================
// DATA CLASSES
// ============================================================================

data class ServerEvent(
    val metaId: String,
    val title: String,
    val description: String?,
    val location: String?,
    val startMillis: Long,
    val endMillis: Long,
    val allDay: Boolean,
    val rrule: String?,
    val reminders: List<Reminder>,
    val version: Long,
    val lastModified: Long,
    val dirty: Boolean,
    val calendarId: Long,
    val status: Int,
    val hasReminders: Boolean
)

data class LocalCalendarEvent(
    val id: Long,
    val metaId: String,
    val version: Long,
    val lastModified: Long,
    val dirty: Boolean,
    val deleted: Boolean,
    val calendarId: Long
) {
    companion object {
        fun fromCursor(cursor: Cursor): LocalCalendarEvent {
            return LocalCalendarEvent(
                id = cursor.getLong(cursor.getColumnIndexOrThrow("_id")),
                metaId = cursor.getString(cursor.getColumnIndexOrThrow("sync_data1")) ?: "",
                version = cursor.getLong(cursor.getColumnIndexOrThrow("version")),
                lastModified = cursor.getLong(cursor.getColumnIndexOrThrow("lastSynced")),
                dirty = cursor.getInt(cursor.getColumnIndexOrThrow("dirty")) == 1,
                deleted = cursor.getInt(cursor.getColumnIndexOrThrow("deleted")) == 1,
                calendarId = cursor.getLong(cursor.getColumnIndexOrThrow("calendar_id"))
            )
        }
    }
}

data class Reminder(
    val unit: SyncAdapter.ReminderUnit,
    val value: Int
)

enum class ReminderUnitEnum { DAY, HOUR, MINUTE, SOMETHING_ELSE }

data class EventInstance(
    val startMillis: Long,
    val endMillis: Long,
    val occurrenceIndex: Int
)

// ============================================================================
// RECURRENCE ENGINE (extracted from calendar_recurrence_engine.kt + TaskManager)
// ============================================================================

object RecurrenceEngine {
    
    fun expandOccurrences(
        event: ServerEvent,
        windowStart: Long,
        windowEnd: Long
    ): List<EventInstance> {
        // Uses com.jeronimo.tools.recur.RecurToolFactory (Joda-Time based)
        // Handles: DAILY, WEEKLY, MONTHLY, YEARLY with BYDAY, COUNT, UNTIL, EXDATE
        // Returns instances that overlap with [windowStart, windowEnd]
        TODO("Implement using Joda-Time or java.time with RRULE parsing")
    }
}

/**
 * SYNC SERVICES - Thin wrappers exposing SyncAdapter to Android Sync Framework
 */

class CalendarSyncService : android.app.Service() {
    private var syncAdapter: FamilySyncAdapter? = null
    private val syncAdapterLock = Any()
    
    override fun onCreate() {
        synchronized(syncAdapterLock) {
            syncAdapter = FamilySyncAdapter(applicationContext, true)
        }
    }
    
    override fun onBind(intent: android.content.Intent): android.os.IBinder {
        return syncAdapter?.syncAdapterBinder ?: throw IllegalStateException("SyncAdapter not initialized")
    }
}

class ContactsSyncService : android.app.Service() {
    private var syncAdapter: FamilySyncAdapter? = null
    private val syncAdapterLock = Any()
    
    override fun onCreate() {
        synchronized(syncAdapterLock) {
            syncAdapter = FamilySyncAdapter(applicationContext, true)
        }
    }
    
    override fun onBind(intent: android.content.Intent): android.os.IBinder {
        return syncAdapter?.syncAdapterBinder ?: throw IllegalStateException("SyncAdapter not initialized")
    }
}

/**
 * ACCOUNT HELPER - Manages sync account lifecycle
 */

object AccountHelper {
    private const val SYNC_FREQUENCY_SECONDS = 86400L
    
    fun createSyncAccount(context: Context, email: String) {
        Thread {
            val accountManager = android.accounts.AccountManager.get(context)
            val account = android.accounts.Account(email, context.packageName)
            
            try {
                if (!accountManager.addAccountExplicitly(account, "password", null)) {
                    return
                }
                val resolver = context.contentResolver
                resolver.setIsSyncable(account, "com.android.contacts", 1)
                resolver.setIsSyncable(account, "com.android.calendar", 1)
                resolver.setSyncAutomatically(account, "com.android.contacts", true)
                resolver.setSyncAutomatically(account, "com.android.calendar", true)
                setupSyncFrequency(account, resolver)
            } catch (e: Exception) {
                // Log error
            }
        }.start()
    }
    
    private fun setupSyncFrequency(account: android.accounts.Account, resolver: ContentResolver) {
        val bundle = Bundle().apply {
            putInt(SyncAdapter.SYNCHRONIZATION_MODE, SyncAdapter.SYNCHRONIZATION_MODE_PERIODIC)
        }
        resolver.removePeriodicSync(account, "com.android.contacts", bundle)
        resolver.removePeriodicSync(account, "com.android.calendar", bundle)
        resolver.addPeriodicSync(account, "com.android.contacts", bundle, SYNC_FREQUENCY_SECONDS)
        resolver.addPeriodicSync(account, "com.android.calendar", bundle, SYNC_FREQUENCY_SECONDS)
    }
}