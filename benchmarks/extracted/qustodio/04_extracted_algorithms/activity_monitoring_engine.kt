package com.qustodio.engine.monitoring

import android.content.ContentResolver
import android.content.Context
import android.database.ContentObserver
import android.database.Cursor
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.CallLog
import android.provider.Telephony
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.view.accessibility.AccessibilityNodeInfo
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean
import java.util.regex.Pattern

/**
 * ============================================================================
 * QUSTODIO BENCHMARK: ACTIVITY MONITORING & SOCIAL SUPERVISION ENGINE
 * ============================================================================
 *
 * Reverse-engineered from Qustodio Parental Control:
 * - TypeScript references: `src/constants/index.ts`, `src/actions/YoutubeRuleActions.ts`,
 *   `src/ducks/youtubeSummary/index.ts`,
 *   `src/businessLogic/profileRules/socialMonitoringRule/services/gamingVoiceAlerts.ts`,
 *   `src/businessLogic/profileRules/socialMonitoringRule/socialMonitoring.ts`
 *
 * Core Capabilities:
 * ------------------
 * 1. Call Log Monitor & Interceptor:
 *    - Inbound (`CallsIncoming = 280`), Outbound (`CallsOutgoing = 281`),
 *      Missed (`CallsMissed = 282`), Blocked (`CallsBlockedIncoming = 286`).
 *    - Rule evaluation for allowed/blocked contacts (`CALLSMS_RULES_BLOCK = 1`, `ALLOW = 0`).
 * 2. SMS Activity Observer:
 *    - Inbound (`SmsIncoming = 284`), Outbound (`SmsOutgoing = 285`),
 *      Blocked (`SmsBlockedIncoming = 288`, `SmsBlockedOutgoing = 289`).
 * 3. YouTube Search & Video Playback Inspection:
 *    - Video playback detection (Video ID extraction, channel, title).
 *    - Search query capture (`EventType.Search = 103` with `SearchEngine.Youtube`).
 *    - Enforcement of video restrictions (`VideoActions.Blocked = 1`).
 * 4. Social & Messaging Alerts (Smart Supervision):
 *    - WhatsApp (`4282`), Instagram (`4283`), Line (`4284`),
 *      Snapchat (`4285`), TikTok (`4286`), Twitter/X (`4287`).
 *    - Keyword detection for cyberbullying, self-harm, adult solicitation.
 * 5. Gaming Voice Chat Alerts:
 *    - Real-time toxicity detection in Discord, Steam, Roblox, Fortnite (`VoiceAlert = 4288`).
 */

// ============================================================================
// 1. CONSTANTS & EVENT DEFINITIONS
// ============================================================================

object ActivityConstants {
    // Call Event Types matching Qustodio constants/index.ts
    const val EVENT_CALLS_INCOMING = 280
    const val EVENT_CALLS_OUTGOING = 281
    const val EVENT_CALLS_MISSED = 282
    const val EVENT_CALLS_UNANSWERED = 283
    const val EVENT_CALLS_BLOCKED_INCOMING = 286
    const val EVENT_CALLS_BLOCKED_OUTGOING = 287

    // SMS Event Types matching Qustodio
    const val EVENT_SMS_INCOMING = 284
    const val EVENT_SMS_OUTGOING = 285
    const val EVENT_SMS_BLOCKED_INCOMING = 288
    const val EVENT_SMS_BLOCKED_OUTGOING = 289

    // Social & Messaging Alerts matching Qustodio
    const val EVENT_MESSAGE_ALERT = 4281
    const val EVENT_WHATSAPP_ALERT = 4282
    const val EVENT_INSTAGRAM_ALERT = 4283
    const val EVENT_LINE_ALERT = 4284
    const val EVENT_SNAPCHAT_ALERT = 4285
    const val EVENT_TIKTOK_ALERT = 4286
    const val EVENT_TWITTERX_ALERT = 4287
    const val EVENT_VOICE_ALERT = 4288 // Gaming voice alerts
    const val EVENT_SOCIAL_MONITORING_ALERT = 4289

    // YouTube Event Types
    const val EVENT_YOUTUBE = -100
    const val EVENT_SEARCH = 103

    // Call/SMS Actions
    const val CALLSMS_RULES_ALLOW = 0
    const val CALLSMS_RULES_BLOCK = 1

    // Video Actions matching Qustodio VideoActions enum
    const val VIDEO_ACTION_ALLOWED = 0
    const val VIDEO_ACTION_BLOCKED = 1
    const val VIDEO_ACTION_PLAY = 800

    // YouTube Domains
    const val DOMAIN_YOUTUBE = "youtube.com"
    const val SUBDOMAIN_MOBILE_YOUTUBE = "m.youtube.com"
    const val PACKAGE_YOUTUBE = "com.google.android.youtube"
}

data class CallActivity(
    val eventType: Int,
    val phoneNumber: String,
    val contactName: String?,
    val durationSeconds: Long,
    val timestamp: Long,
    val isBlocked: Boolean
)

data class SmsActivity(
    val eventType: Int,
    val address: String,
    val body: String,
    val timestamp: Long,
    val isBlocked: Boolean
)

data class YoutubeActivity(
    val videoId: String?,
    val videoTitle: String?,
    val channelTitle: String?,
    val searchQuery: String?,
    val action: Int,
    val timestamp: Long
)

enum class AlertSeverity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

data class SocialMessageAlert(
    val eventType: Int,
    val serviceName: String,
    val sender: String,
    val textSnippet: String,
    val detectedKeywords: List<String>,
    val severity: AlertSeverity,
    val timestamp: Long
)

data class GamingVoiceAlert(
    val eventType: Int = ActivityConstants.EVENT_VOICE_ALERT,
    val gamingService: String, // "discord", "steam", "roblox", "fortnite"
    val detectedPhrase: String,
    val category: String, // "bullying", "hate_speech", "inappropriate"
    val timestamp: Long
)

// ============================================================================
// 2. CALL LOG & SMS OBSERVER
// ============================================================================

class CallAndSmsMonitor(
    private val context: Context,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
) {
    private val contentResolver: ContentResolver = context.contentResolver
    private val contactRules = ConcurrentHashMap<String, Int>() // normalized phone -> action

    private var lastObservedCallId: Long = 0L
    private var lastObservedSmsId: Long = 0L

    var onCallActivity: ((CallActivity) -> Unit)? = null
    var onSmsActivity: ((SmsActivity) -> Unit)? = null

    private val callLogObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
        override fun onChange(selfChange: Boolean, uri: Uri?) {
            super.onChange(selfChange, uri)
            coroutineScope.launch {
                queryLatestCalls()
            }
        }
    }

    private val smsObserver = object : ContentObserver(Handler(Looper.getMainLooper())) {
        override fun onChange(selfChange: Boolean, uri: Uri?) {
            super.onChange(selfChange, uri)
            coroutineScope.launch {
                queryLatestSms()
            }
        }
    }

    fun startMonitoring() {
        try {
            contentResolver.registerContentObserver(
                CallLog.Calls.CONTENT_URI,
                true,
                callLogObserver
            )
            contentResolver.registerContentObserver(
                Telephony.Sms.CONTENT_URI,
                true,
                smsObserver
            )
            initializeLastIds()
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    fun stopMonitoring() {
        contentResolver.unregisterContentObserver(callLogObserver)
        contentResolver.unregisterContentObserver(smsObserver)
    }

    fun setContactRule(phoneNumber: String, action: Int) {
        val normalized = normalizePhoneNumber(phoneNumber)
        contactRules[normalized] = action
    }

    private fun initializeLastIds() {
        // Find latest call ID
        try {
            contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                arrayOf(CallLog.Calls._ID),
                null,
                null,
                "${CallLog.Calls.DATE} DESC LIMIT 1"
            )?.use { cursor ->
                if (cursor.moveToFirst()) {
                    lastObservedCallId = cursor.getLong(0)
                }
            }

            // Find latest SMS ID
            contentResolver.query(
                Telephony.Sms.CONTENT_URI,
                arrayOf(Telephony.Sms._ID),
                null,
                null,
                "${Telephony.Sms.DATE} DESC LIMIT 1"
            )?.use { cursor ->
                if (cursor.moveToFirst()) {
                    lastObservedSmsId = cursor.getLong(0)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun queryLatestCalls() {
        try {
            val projection = arrayOf(
                CallLog.Calls._ID,
                CallLog.Calls.NUMBER,
                CallLog.Calls.CACHED_NAME,
                CallLog.Calls.TYPE,
                CallLog.Calls.DURATION,
                CallLog.Calls.DATE
            )
            val selection = "${CallLog.Calls._ID} > ?"
            val selectionArgs = arrayOf(lastObservedCallId.toString())
            val sortOrder = "${CallLog.Calls.DATE} ASC"

            contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                sortOrder
            )?.use { cursor ->
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls._ID))
                    val number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER)) ?: "Unknown"
                    val name = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.CACHED_NAME))
                    val type = cursor.getInt(cursor.getColumnIndexOrThrow(CallLog.Calls.TYPE))
                    val duration = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION))
                    val date = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE))

                    val normalizedNumber = normalizePhoneNumber(number)
                    val rule = contactRules[normalizedNumber] ?: ActivityConstants.CALLSMS_RULES_ALLOW
                    val isBlocked = (rule == ActivityConstants.CALLSMS_RULES_BLOCK)

                    val eventType = when (type) {
                        CallLog.Calls.INCOMING_TYPE -> if (isBlocked) ActivityConstants.EVENT_CALLS_BLOCKED_INCOMING else ActivityConstants.EVENT_CALLS_INCOMING
                        CallLog.Calls.OUTGOING_TYPE -> if (isBlocked) ActivityConstants.EVENT_CALLS_BLOCKED_OUTGOING else ActivityConstants.EVENT_CALLS_OUTGOING
                        CallLog.Calls.MISSED_TYPE -> ActivityConstants.EVENT_CALLS_MISSED
                        else -> ActivityConstants.EVENT_CALLS_UNANSWERED
                    }

                    if (id > lastObservedCallId) {
                        lastObservedCallId = id
                    }

                    val activity = CallActivity(
                        eventType = eventType,
                        phoneNumber = number,
                        contactName = name,
                        durationSeconds = duration,
                        timestamp = date,
                        isBlocked = isBlocked
                    )
                    onCallActivity?.invoke(activity)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun queryLatestSms() {
        try {
            val projection = arrayOf(
                Telephony.Sms._ID,
                Telephony.Sms.ADDRESS,
                Telephony.Sms.BODY,
                Telephony.Sms.TYPE,
                Telephony.Sms.DATE
            )
            val selection = "${Telephony.Sms._ID} > ?"
            val selectionArgs = arrayOf(lastObservedSmsId.toString())
            val sortOrder = "${Telephony.Sms.DATE} ASC"

            contentResolver.query(
                Telephony.Sms.CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                sortOrder
            )?.use { cursor ->
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(cursor.getColumnIndexOrThrow(Telephony.Sms._ID))
                    val address = cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)) ?: "Unknown"
                    val body = cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.BODY)) ?: ""
                    val type = cursor.getInt(cursor.getColumnIndexOrThrow(Telephony.Sms.TYPE))
                    val date = cursor.getLong(cursor.getColumnIndexOrThrow(Telephony.Sms.DATE))

                    val normalized = normalizePhoneNumber(address)
                    val rule = contactRules[normalized] ?: ActivityConstants.CALLSMS_RULES_ALLOW
                    val isBlocked = (rule == ActivityConstants.CALLSMS_RULES_BLOCK)

                    val eventType = when (type) {
                        Telephony.Sms.MESSAGE_TYPE_INBOX -> if (isBlocked) ActivityConstants.EVENT_SMS_BLOCKED_INCOMING else ActivityConstants.EVENT_SMS_INCOMING
                        Telephony.Sms.MESSAGE_TYPE_SENT -> if (isBlocked) ActivityConstants.EVENT_SMS_BLOCKED_OUTGOING else ActivityConstants.EVENT_SMS_OUTGOING
                        else -> ActivityConstants.EVENT_SMS_INCOMING
                    }

                    if (id > lastObservedSmsId) {
                        lastObservedSmsId = id
                    }

                    val activity = SmsActivity(
                        eventType = eventType,
                        address = address,
                        body = body,
                        timestamp = date,
                        isBlocked = isBlocked
                    )
                    onSmsActivity?.invoke(activity)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun normalizePhoneNumber(raw: String): String {
        return raw.replace(Regex("[^0-9+]"), "")
    }
}

// ============================================================================
// 3. YOUTUBE MONITORING & RESTRICTION ENFORCEMENT
// ============================================================================

class YoutubeMonitor {
    var isYoutubeWebBlocked: Boolean = false
    var isYoutubeAppBlocked: Boolean = false

    var onYoutubeActivity: ((YoutubeActivity) -> Unit)? = null
    var onRestrictedVideoDetected: ((videoId: String, title: String) -> Unit)? = null

    // Blocked video channels or video keywords
    private val blockedChannels = ConcurrentHashMap.newKeySet<String>()
    private val blockedKeywords = ConcurrentHashMap.newKeySet<String>()

    fun blockChannel(channelName: String) {
        blockedChannels.add(channelName.lowercase())
    }

    fun blockKeyword(keyword: String) {
        blockedKeywords.add(keyword.lowercase())
    }

    /**
     * Inspects URLs accessed in browsers matching YouTube
     */
    fun inspectUrl(url: String): Boolean {
        if (!url.contains(ActivityConstants.DOMAIN_YOUTUBE)) return true

        if (isYoutubeWebBlocked) {
            return false // Block whole YouTube web
        }

        val videoId = extractVideoId(url)
        val searchQuery = extractSearchQuery(url)

        val action = if (videoId != null && isVideoRestricted(videoId, null)) {
            ActivityConstants.VIDEO_ACTION_BLOCKED
        } else {
            ActivityConstants.VIDEO_ACTION_PLAY
        }

        val activity = YoutubeActivity(
            videoId = videoId,
            videoTitle = null,
            channelTitle = null,
            searchQuery = searchQuery,
            action = action,
            timestamp = System.currentTimeMillis()
        )
        onYoutubeActivity?.invoke(activity)

        return action != ActivityConstants.VIDEO_ACTION_BLOCKED
    }

    /**
     * Inspects YouTube Native App UI via Accessibility node hierarchy
     */
    fun inspectAccessibilityNode(rootNode: AccessibilityNodeInfo): Boolean {
        if (isYoutubeAppBlocked) return false

        // Extract Title node and Channel node
        var videoTitle: String? = null
        var channelName: String? = null

        val titleNodes = rootNode.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/video_title")
        if (titleNodes.isNotEmpty()) {
            videoTitle = titleNodes[0].text?.toString()
        }

        val channelNodes = rootNode.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/channel_name")
        if (channelNodes.isNotEmpty()) {
            channelName = channelNodes[0].text?.toString()
        }

        if (videoTitle != null) {
            val isRestricted = isTitleOrChannelRestricted(videoTitle, channelName)
            val action = if (isRestricted) ActivityConstants.VIDEO_ACTION_BLOCKED else ActivityConstants.VIDEO_ACTION_PLAY

            val activity = YoutubeActivity(
                videoId = null,
                videoTitle = videoTitle,
                channelTitle = channelName,
                searchQuery = null,
                action = action,
                timestamp = System.currentTimeMillis()
            )
            onYoutubeActivity?.invoke(activity)

            if (isRestricted) {
                onRestrictedVideoDetected?.invoke("unknown", videoTitle)
                return false
            }
        }
        return true
    }

    private fun extractVideoId(url: String): String? {
        val pattern = Pattern.compile("(?:v=|/v/|youtu\\.be/|/embed/|/shorts/)([a-zA-Z0-9_-]{11})")
        val matcher = pattern.matcher(url)
        return if (matcher.find()) matcher.group(1) else null
    }

    private fun extractSearchQuery(url: String): String? {
        val uri = Uri.parse(url)
        return uri.getQueryParameter("search_query") ?: uri.getQueryParameter("q")
    }

    private fun isVideoRestricted(videoId: String, title: String?): Boolean {
        return false // Extensible for restricted ID lists
    }

    private fun isTitleOrChannelRestricted(title: String, channel: String?): Boolean {
        channel?.let { ch ->
            if (blockedChannels.contains(ch.lowercase())) return true
        }

        val lowerTitle = title.lowercase()
        return blockedKeywords.any { lowerTitle.contains(it) }
    }
}

// ============================================================================
// 4. SOCIAL MESSAGING & GAMING VOICE ALERTS (SMART SUPERVISION)
// ============================================================================

class SocialSupervisionEngine {

    // Package Name to Event Type mapping matching Qustodio
    private val socialPackageEventMap = mapOf(
        "com.whatsapp" to ActivityConstants.EVENT_WHATSAPP_ALERT,
        "com.whatsapp.w4b" to ActivityConstants.EVENT_WHATSAPP_ALERT,
        "com.instagram.android" to ActivityConstants.EVENT_INSTAGRAM_ALERT,
        "jp.naver.line.android" to ActivityConstants.EVENT_LINE_ALERT,
        "com.snapchat.android" to ActivityConstants.EVENT_SNAPCHAT_ALERT,
        "com.zhiliaoapp.musically" to ActivityConstants.EVENT_TIKTOK_ALERT,
        "com.ss.android.ugc.trill" to ActivityConstants.EVENT_TIKTOK_ALERT,
        "com.twitter.android" to ActivityConstants.EVENT_TWITTERX_ALERT
    )

    // Gaming services matching Qustodio `gamingVoiceAlerts.ts`
    private val gamingPackages = mapOf(
        "com.discord" to "discord",
        "com.valvesoftware.android.steam.community" to "steam",
        "com.roblox.client" to "roblox",
        "com.epicgames.fortnite" to "fortnite"
    )

    // Sensitive keyword dictionary for detecting cyberbullying, self-harm, predatory messages
    private val flaggedKeywords = mapOf(
        "kill yourself" to AlertSeverity.CRITICAL,
        "die" to AlertSeverity.HIGH,
        "hate you" to AlertSeverity.MEDIUM,
        "ugly" to AlertSeverity.MEDIUM,
        "loser" to AlertSeverity.LOW,
        "drugs" to AlertSeverity.HIGH,
        "send pics" to AlertSeverity.CRITICAL,
        "secret" to AlertSeverity.LOW,
        "meet alone" to AlertSeverity.CRITICAL
    )

    var onSocialAlert: ((SocialMessageAlert) -> Unit)? = null
    var onGamingVoiceAlert: ((GamingVoiceAlert) -> Unit)? = null

    /**
     * Inspects incoming status bar notifications from Android NotificationListenerService
     */
    fun processNotification(sbn: StatusBarNotification) {
        val packageName = sbn.packageName ?: return
        val extras = sbn.notification.extras ?: return

        val title = extras.getCharSequence("android.title")?.toString() ?: "Unknown"
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        // 1. Check Supported Social Messaging Services
        val eventType = socialPackageEventMap[packageName]
        if (eventType != null) {
            val matchedKeywords = mutableListOf<String>()
            var maxSeverity = AlertSeverity.LOW

            val combined = "$title $text".lowercase()
            for ((keyword, severity) in flaggedKeywords) {
                if (combined.contains(keyword)) {
                    matchedKeywords.add(keyword)
                    if (severity.ordinal > maxSeverity.ordinal) {
                        maxSeverity = severity
                    }
                }
            }

            if (matchedKeywords.isNotEmpty()) {
                val alert = SocialMessageAlert(
                    eventType = eventType,
                    serviceName = resolveServiceName(packageName),
                    sender = title,
                    textSnippet = text,
                    detectedKeywords = matchedKeywords,
                    severity = maxSeverity,
                    timestamp = sbn.postTime
                )
                onSocialAlert?.invoke(alert)
            }
        }

        // 2. Check Gaming Voice Chat Services
        val gamingService = gamingPackages[packageName]
        if (gamingService != null) {
            val combined = "$title $text".lowercase()
            for ((keyword, _) in flaggedKeywords) {
                if (combined.contains(keyword)) {
                    val alert = GamingVoiceAlert(
                        gamingService = gamingService,
                        detectedPhrase = keyword,
                        category = "toxic_speech",
                        timestamp = sbn.postTime
                    )
                    onGamingVoiceAlert?.invoke(alert)
                    break
                }
            }
        }
    }

    private fun resolveServiceName(pkg: String): String {
        return when {
            pkg.contains("whatsapp") -> "WhatsApp"
            pkg.contains("instagram") -> "Instagram"
            pkg.contains("line") -> "LINE"
            pkg.contains("snapchat") -> "Snapchat"
            pkg.contains("musically") || pkg.contains("trill") -> "TikTok"
            pkg.contains("twitter") -> "Twitter/X"
            else -> "Messaging"
        }
    }
}
