package com.qustodio.engine.sos

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.location.Location
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.telephony.SmsManager
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

/**
 * ============================================================================
 * QUSTODIO BENCHMARK: PANIC / SOS EMERGENCY SYSTEM ENGINE
 * ============================================================================
 *
 * Reverse-engineered from Qustodio Parental Control:
 * - TypeScript references: `src/constants/index.ts`, `src/components/Modal/PanicRulesTourModal.tsx`,
 *   `src/components/Icons/IconSos.tsx`, `src/records/device/types/Device.types.ts`
 *
 * Core Capabilities:
 * ------------------
 * 1. Emergency Panic Mode Trigger:
 *    - Central event identifier: `EventType.Panic = 500`.
 *    - 5-second countdown safety cancel window to prevent accidental button taps.
 * 2. High-Frequency GPS Tracking (`location--panicMode`):
 *    - Automatically forces `PRIORITY_HIGH_ACCURACY` with 3-5s update cadence while active.
 *    - Captures continuous track-point trail.
 * 3. Emergency Contacts Management:
 *    - Max 4 trusted contacts constraint (`PANIC_RULES_MAX_CONTACTS = 4`).
 *    - Contact verification status (`PENDING`, `VERIFIED`).
 * 4. Dual Emergency Broadcast:
 *    - Channel A: Immediate high-priority FCM notification to parents' devices
 *      with high-importance sound and vibration bypassing Do Not Disturb.
 *    - Channel B: Direct SMS distress messages dispatched to verified phone contacts
 *      containing live geolocation coordinates and emergency web tracking links.
 * 5. De-escalation State Machine:
 *    - States: `IDLE`, `COUNTDOWN`, `ACTIVE_PANIC`, `RESOLVED`.
 *    - Stop action (`PANIC_ACTION_STOP`) restores normal power-saving location frequency.
 */

// ============================================================================
// 1. CONSTANTS & DATA STRUCTURES
// ============================================================================

object PanicConstants {
    // Event code matching Qustodio constants/index.ts
    const val EVENT_TYPE_PANIC = 500

    // Maximum trusted emergency contacts
    const val PANIC_RULES_MAX_CONTACTS = 4

    // Panic mode high-frequency GPS interval (3 seconds)
    const val PANIC_GPS_INTERVAL_MS = 3000L
    const val PANIC_GPS_FASTEST_INTERVAL_MS = 1000L
    const val PANIC_GPS_MIN_DISPLACEMENT_METERS = 2.0f

    // Safety countdown duration in seconds
    const val COUNTDOWN_SECONDS = 5

    // Notification channel ID
    const val EMERGENCY_CHANNEL_ID = "qustodio_sos_emergency_channel"
}

enum class PanicContactType {
    PHONE,
    EMAIL
}

enum class PanicContactStatus {
    PENDING,
    VERIFIED
}

data class EmergencyContact(
    val uid: String,
    val name: String,
    val contactType: PanicContactType,
    val value: String, // Phone number or Email address
    val status: PanicContactStatus = PanicContactStatus.PENDING
)

enum class PanicState {
    IDLE,
    COUNTDOWN,
    ACTIVE_PANIC,
    RESOLVED
}

data class PanicSessionRecord(
    val sessionId: String,
    val childProfileId: String,
    val childName: String,
    val startTime: Long,
    var endTime: Long? = null,
    val initialLocation: Location?,
    val breadcrumbLocations: MutableList<Location> = mutableListOf(),
    val notifiedContacts: MutableList<String> = mutableListOf()
)

data class EmergencyBroadcastPayload(
    val eventType: Int = PanicConstants.EVENT_TYPE_PANIC,
    val sessionId: String,
    val childProfileId: String,
    val childName: String,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val trackingUrl: String,
    val timestamp: Long
)

// ============================================================================
// 2. PANIC SOS ENGINE IMPLEMENTATION
// ============================================================================

class PanicSosEngine(
    private val context: Context,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
) {
    private val contacts = ConcurrentHashMap<String, EmergencyContact>()
    private val currentState = AtomicReference(PanicState.IDLE)
    private var activeSession: PanicSessionRecord? = null
    private var countdownJob: Job? = null

    // Callbacks
    var onPanicStateChanged: ((PanicState, PanicSessionRecord?) -> Unit)? = null
    var onHighAccuracyLocationRequested: ((Boolean) -> Unit)? = null
    var onBroadcastDispatched: ((EmergencyBroadcastPayload) -> Unit)? = null

    init {
        createEmergencyNotificationChannel()
    }

    // ------------------------------------------------------------------------
    // Emergency Contacts Management (Max 4 contacts)
    // ------------------------------------------------------------------------

    fun addContact(contact: EmergencyContact) {
        require(contacts.size < PanicConstants.PANIC_RULES_MAX_CONTACTS) {
            "Cannot add more than ${PanicConstants.PANIC_RULES_MAX_CONTACTS} emergency contacts"
        }
        contacts[contact.uid] = contact
    }

    fun removeContact(uid: String) {
        contacts.remove(uid)
    }

    fun setContactStatus(uid: String, status: PanicContactStatus) {
        val existing = contacts[uid] ?: return
        contacts[uid] = existing.copy(status = status)
    }

    fun getContacts(): List<EmergencyContact> = contacts.values.toList()

    // ------------------------------------------------------------------------
    // Panic Activation Workflow
    // ------------------------------------------------------------------------

    /**
     * Step 1: Trigger the SOS activation sequence.
     * Enters a 5-second countdown cancel window before broadcasting alerts.
     */
    fun triggerSos(childProfileId: String, childName: String, initialLocation: Location?) {
        if (currentState.get() == PanicState.ACTIVE_PANIC || currentState.get() == PanicState.COUNTDOWN) {
            return
        }

        currentState.set(PanicState.COUNTDOWN)
        val session = PanicSessionRecord(
            sessionId = UUID.randomUUID().toString(),
            childProfileId = childProfileId,
            childName = childName,
            startTime = System.currentTimeMillis(),
            initialLocation = initialLocation
        )
        activeSession = session
        onPanicStateChanged?.invoke(PanicState.COUNTDOWN, session)

        countdownJob = coroutineScope.launch {
            for (sec in PanicConstants.COUNTDOWN_SECONDS downTo 1) {
                delay(1000)
            }
            if (currentState.get() == PanicState.COUNTDOWN) {
                activateEmergencyMode()
            }
        }
    }

    /**
     * Cancels the SOS during the countdown window.
     */
    fun cancelCountdown() {
        if (currentState.get() != PanicState.COUNTDOWN) return
        countdownJob?.cancel()
        currentState.set(PanicState.IDLE)
        activeSession = null
        onPanicStateChanged?.invoke(PanicState.IDLE, null)
    }

    /**
     * Step 2: Emergency mode officially armed.
     * Starts high-frequency GPS tracking and broadcasts to parents and contacts.
     */
    private fun activateEmergencyMode() {
        currentState.set(PanicState.ACTIVE_PANIC)
        val session = activeSession ?: return
        onPanicStateChanged?.invoke(PanicState.ACTIVE_PANIC, session)

        // 1. Switch GPS Engine to High-Accuracy Panic Mode (`location--panicMode`)
        onHighAccuracyLocationRequested?.invoke(true)

        // 2. Dispatch High-Priority Emergency Broadcast
        val lat = session.initialLocation?.latitude ?: 0.0
        val lon = session.initialLocation?.longitude ?: 0.0
        val acc = session.initialLocation?.accuracy ?: 0.0f
        val trackingUrl = "https://family.qustodio.com/locator/sos?sid=${session.sessionId}&lat=$lat&lon=$lon"

        val payload = EmergencyBroadcastPayload(
            eventType = PanicConstants.EVENT_TYPE_PANIC,
            sessionId = session.sessionId,
            childProfileId = session.childProfileId,
            childName = session.childName,
            latitude = lat,
            longitude = lon,
            accuracy = acc,
            trackingUrl = trackingUrl,
            timestamp = System.currentTimeMillis()
        )

        // 3. Dispatch Parent Notification
        showLocalEmergencyAlarm(session.childName, lat, lon)
        onBroadcastDispatched?.invoke(payload)

        // 4. Send Direct SMS to Verified Emergency Contacts
        dispatchEmergencySms(session, trackingUrl)
    }

    /**
     * Ingests real-time coordinate updates from the GPS engine during active panic.
     */
    fun onLocationUpdateDuringPanic(location: Location) {
        if (currentState.get() != PanicState.ACTIVE_PANIC) return
        val session = activeSession ?: return

        session.breadcrumbLocations.add(location)

        val payload = EmergencyBroadcastPayload(
            eventType = PanicConstants.EVENT_TYPE_PANIC,
            sessionId = session.sessionId,
            childProfileId = session.childProfileId,
            childName = session.childName,
            latitude = location.latitude,
            longitude = location.longitude,
            accuracy = location.accuracy,
            trackingUrl = "https://family.qustodio.com/locator/sos?sid=${session.sessionId}&lat=${location.latitude}&lon=${location.longitude}",
            timestamp = location.time
        )
        onBroadcastDispatched?.invoke(payload)
    }

    /**
     * Step 3: De-escalation & Stop Protocol (`PANIC_ACTION_STOP`).
     */
    fun stopPanic() {
        if (currentState.get() != PanicState.ACTIVE_PANIC) return

        currentState.set(PanicState.RESOLVED)
        val session = activeSession
        session?.endTime = System.currentTimeMillis()

        // Restore normal battery-saving GPS tracking
        onHighAccuracyLocationRequested?.invoke(false)

        onPanicStateChanged?.invoke(PanicState.RESOLVED, session)
        currentState.set(PanicState.IDLE)
        activeSession = null
    }

    // ------------------------------------------------------------------------
    // Emergency Notification & SMS Channels
    // ------------------------------------------------------------------------

    private fun dispatchEmergencySms(session: PanicSessionRecord, trackingUrl: String) {
        CoroutineScope(Dispatchers.IO).launch {
            val verifiedPhoneContacts = contacts.values.filter {
                it.contactType == PanicContactType.PHONE && it.status == PanicContactStatus.VERIFIED
            }

            val smsText = "EMERGENCY SOS: ${session.childName} has triggered an emergency alert! " +
                    "Live Location Map: $trackingUrl"

            try {
                val smsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    context.getSystemService(SmsManager::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    SmsManager.getDefault()
                }

                for (contact in verifiedPhoneContacts) {
                    try {
                        smsManager.sendTextMessage(contact.value, null, smsText, null, null)
                        session.notifiedContacts.add(contact.value)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun showLocalEmergencyAlarm(childName: String, lat: Double, lon: Double) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)

        val notification = NotificationCompat.Builder(context, PanicConstants.EMERGENCY_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("EMERGENCY SOS: $childName")
            .setContentText("Emergency alert triggered! Lat: $lat, Lon: $lon")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setSound(alarmSound)
            .setVibrate(longArrayOf(0, 1000, 500, 1000, 500, 1000))
            .setOngoing(true)
            .setAutoCancel(false)
            .build()

        notificationManager.notify(PanicConstants.EVENT_TYPE_PANIC, notification)
    }

    private fun createEmergencyNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Qustodio SOS Emergency Alerts"
            val descriptionText = "High priority alarms for child emergency SOS panic triggers"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(PanicConstants.EMERGENCY_CHANNEL_ID, name, importance).apply {
                description = descriptionText
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000, 500, 1000)
                setBypassDnd(true)
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .build()
                setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM), audioAttributes)
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}
