/**
 * ============================================================================
 * Bark Parental Controls — Algorithmic Engine Extraction
 * Engine 1: Content Scanning & Accessibility Traversal Engine
 * Package: cm.pt.barkparent.algorithms.content_scanning
 * File: content_scanning_accessibility_engine.kt
 * ============================================================================
 *
 * Architectural Purpose:
 * Reconstructed production-grade engine responsible for on-device real-time
 * screen text extraction and notification stream interception across monitored
 * messaging and social media applications (WhatsApp, Instagram, Snapchat, TikTok).
 *
 * Key Capabilities:
 * 1. AccessibilityNodeInfo tree traversal with iterative DFS and depth bounding.
 * 2. NotificationListenerService hooks extracting multi-line & MessagingStyle messages.
 * 3. App-specific scraping hooks targeting chat bubbles, author labels, and input fields.
 * 4. High-performance deduplication ring buffer using 64-bit MurmurHash3 / FNV-1a
 *    with a 60-second sliding expiration window.
 * 5. Reactive asynchronous event pipeline powered by Kotlin Coroutines and SharedFlow.
 */

package cm.pt.barkparent.algorithms.content_scanning

import android.app.Notification
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.service.notification.StatusBarNotification
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import java.util.ArrayDeque
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantReadWriteLock
import kotlin.concurrent.read
import kotlin.concurrent.write

// ============================================================================
// 1. Data Models & Event Structures
// ============================================================================

/**
 * Encapsulates a raw extracted text node from the Accessibility hierarchy.
 */
data class CapturedTextNode(
    val text: String,
    val normalizedText: String,
    val nodeHash: Long,
    val packageName: String,
    val viewIdResourceName: String?,
    val className: String?,
    val isEditable: Boolean,
    val isSecretOrEphemeral: Boolean,
    val boundsInScreen: Rect,
    val timestampEpochMs: Long = System.currentTimeMillis()
)

/**
 * Structured notification event payload extracted from StatusBarNotification.
 */
data class CapturedNotification(
    val notificationKey: String,
    val packageName: String,
    val title: String?,
    val body: String?,
    val subText: String?,
    val bigText: String?,
    val messages: List<String>,
    val isGroupConversation: Boolean,
    val postTimeEpochMs: Long,
    val notificationHash: Long
)

/**
 * Common event interface emitted to the downstream Risk Detection Pipeline.
 */
sealed class CapturedContentEvent {
    abstract val eventId: String
    abstract val packageName: String
    abstract val timestampEpochMs: Long

    data class ChatMessage(
        override val eventId: String,
        override val packageName: String,
        override val timestampEpochMs: Long,
        val appName: String,
        val sender: String?,
        val messageText: String,
        val conversationContext: String?,
        val isOutgoing: Boolean,
        val contentHash: Long
    ) : CapturedContentEvent()

    data class NotificationAlert(
        override val eventId: String,
        override val packageName: String,
        override val timestampEpochMs: Long,
        val notificationData: CapturedNotification
    ) : CapturedContentEvent()

    data class SocialMediaFeed(
        override val eventId: String,
        override val packageName: String,
        override val timestampEpochMs: Long,
        val platform: String,
        val authorHandle: String?,
        val captionOrComment: String,
        val contentHash: Long
    ) : CapturedContentEvent()
}

// ============================================================================
// 2. High-Performance Hashing Algorithms (MurmurHash3 & FNV-1a 64-bit)
// ============================================================================

/**
 * 64-bit MurmurHash3 implementation designed for zero-allocation hashing of
 * normalized text strings and message metadata.
 */
object MurmurHash3 {
    private const val C1 = -0x7a303e2300000000L or 0x6e7eL // 0x87c37b91114253d5L
    private const val C2 = 0x4cf5ad432745937fL

    fun hash64(input: String, seed: Long = 0x9747b28c): Long {
        val bytes = input.toByteArray(Charsets.UTF_8)
        val length = bytes.size
        var h1 = seed xor (length.toLong() * C1)

        val nblocks = length / 16
        for (i in 0 until nblocks) {
            val index = i * 16
            var k1 = getLittleEndianLong(bytes, index)
            var k2 = getLittleEndianLong(bytes, index + 8)

            // Block 1
            k1 *= C1
            k1 = (k1 shl 31) or (k1 ushr 33)
            k1 *= C2
            h1 = h1 xor k1
            h1 = (h1 shl 27) or (h1 ushr 37)
            h1 = h1 * 5 + 0x52dce729L

            // Block 2
            k2 *= C2
            k2 = (k2 shl 33) or (k2 ushr 31)
            k2 *= C1
            h1 = h1 xor k2
            h1 = (h1 shl 31) or (h1 ushr 33)
            h1 = h1 * 5 + 0x38495ab5L
        }

        // Tail processing for remaining bytes
        val tailIndex = nblocks * 16
        var k1 = 0L
        var k2 = 0L
        val rem = length and 15

        when (rem) {
            15 -> k2 = k2 xor ((bytes[tailIndex + 14].toLong() and 0xff) shl 48)
            14 -> k2 = k2 xor ((bytes[tailIndex + 13].toLong() and 0xff) shl 40)
            13 -> k2 = k2 xor ((bytes[tailIndex + 12].toLong() and 0xff) shl 32)
            12 -> k2 = k2 xor ((bytes[tailIndex + 11].toLong() and 0xff) shl 24)
            11 -> k2 = k2 xor ((bytes[tailIndex + 10].toLong() and 0xff) shl 16)
            10 -> k2 = k2 xor ((bytes[tailIndex + 9].toLong() and 0xff) shl 8)
            9 -> {
                k2 = k2 xor (bytes[tailIndex + 8].toLong() and 0xff)
                k2 *= C2
                k2 = (k2 shl 33) or (k2 ushr 31)
                k2 *= C1
                h1 = h1 xor k2
            }
        }
        if (rem >= 8) {
            k1 = k1 xor ((bytes[tailIndex + 7].toLong() and 0xff) shl 56)
        }
        if (rem >= 7) {
            k1 = k1 xor ((bytes[tailIndex + 6].toLong() and 0xff) shl 48)
        }
        if (rem >= 6) {
            k1 = k1 xor ((bytes[tailIndex + 5].toLong() and 0xff) shl 40)
        }
        if (rem >= 5) {
            k1 = k1 xor ((bytes[tailIndex + 4].toLong() and 0xff) shl 32)
        }
        if (rem >= 4) {
            k1 = k1 xor ((bytes[tailIndex + 3].toLong() and 0xff) shl 24)
        }
        if (rem >= 3) {
            k1 = k1 xor ((bytes[tailIndex + 2].toLong() and 0xff) shl 16)
        }
        if (rem >= 2) {
            k1 = k1 xor ((bytes[tailIndex + 1].toLong() and 0xff) shl 8)
        }
        if (rem >= 1) {
            k1 = k1 xor (bytes[tailIndex].toLong() and 0xff)
            k1 *= C1
            k1 = (k1 shl 31) or (k1 ushr 33)
            k1 *= C2
            h1 = h1 xor k1
        }

        // Finalization avalanche
        h1 = h1 xor length.toLong()
        h1 = h1 xor (h1 ushr 33)
        h1 *= -0xae502812aa7333L // 0xff51afd7ed558ccd
        h1 = h1 xor (h1 ushr 33)
        h1 *= -0x3b314601e57a13adL // 0xc4ceb9fe1a85ec53
        h1 = h1 xor (h1 ushr 33)

        return h1
    }

    private fun getLittleEndianLong(data: ByteArray, offset: Int): Long {
        return (data[offset].toLong() and 0xff) or
                ((data[offset + 1].toLong() and 0xff) shl 8) or
                ((data[offset + 2].toLong() and 0xff) shl 16) or
                ((data[offset + 3].toLong() and 0xff) shl 24) or
                ((data[offset + 4].toLong() and 0xff) shl 32) or
                ((data[offset + 5].toLong() and 0xff) shl 40) or
                ((data[offset + 6].toLong() and 0xff) shl 48) or
                ((data[offset + 7].toLong() and 0xff) shl 56)
    }
}

/**
 * 64-bit Fowler-Noll-Vo (FNV-1a) Hash implementation.
 * Used for secondary verification and fast string digest calculations.
 */
object Fnv1a64 {
    private const val FNV_OFFSET_BASIS = -0x340d631b7bdddcdbL // 0xcbf29ce484222325L
    private const val FNV_PRIME = 0x100000001b3L

    fun hash(input: String): Long {
        var hash = FNV_OFFSET_BASIS
        val bytes = input.toByteArray(Charsets.UTF_8)
        for (b in bytes) {
            hash = hash xor (b.toLong() and 0xff)
            hash *= FNV_PRIME
        }
        return hash
    }
}

// ============================================================================
// 3. Text Normalizer & Deduplication Ring Buffer
// ============================================================================

/**
 * Cleans and normalizes scraped text before hashing and analysis.
 * Removes invisible control characters, collapses whitespace, and preserves alphanumeric tokens and emoji.
 */
object TextNormalizer {
    // Regex matching zero-width space, joiners, BOM and directional marks
    private val ZERO_WIDTH_REGEX = Regex("[\u200B\u200C\u200D\uFEFF\u200E\u200F\u00A0]")
    private val MULTI_SPACE_REGEX = Regex("\\s+")

    fun normalize(rawText: String): String {
        if (rawText.isBlank()) return ""
        val cleaned = ZERO_WIDTH_REGEX.replace(rawText, " ")
        return MULTI_SPACE_REGEX.replace(cleaned, " ").trim().lowercase()
    }
}

/**
 * Thread-safe LRU Ring Buffer with a 60-second sliding expiration window.
 * Avoids redundant re-processing and re-transmission of identical text nodes
 * when users scroll through chat feeds or when the Accessibility tree refreshes.
 */
class DeduplicationRingBuffer(
    private val maxCapacity: Int = 2048,
    private val expirationWindowMs: Long = 60_000L
) {
    private val lock = ReentrantReadWriteLock()
    private val cache = object : LinkedHashMap<Long, Long>(maxCapacity, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<Long, Long>?): Boolean {
            return size > maxCapacity
        }
    }

    /**
     * Checks if a hash exists within the sliding expiration window.
     * If not present, records the current timestamp and returns false (not duplicate).
     * If present and valid, returns true (is duplicate).
     */
    fun isDuplicateOrRecord(hash: Long, currentTimeMs: Long = System.currentTimeMillis()): Boolean {
        lock.write {
            pruneExpiredEntries(currentTimeMs)
            val existingTimestamp = cache[hash]
            if (existingTimestamp != null && (currentTimeMs - existingTimestamp) <= expirationWindowMs) {
                return true // Duplicate found within the window
            }
            cache[hash] = currentTimeMs
            return false // First time seen in window
        }
    }

    private fun pruneExpiredEntries(currentTimeMs: Long) {
        val iterator = cache.entries.iterator()
        while (iterator.hasNext()) {
            val entry = iterator.next()
            if ((currentTimeMs - entry.value) > expirationWindowMs) {
                iterator.remove()
            } else {
                // Since LinkedHashMap maintains access order, once we encounter a fresh entry
                // in an access-ordered map, older entries may still be scattered, so we check continuously.
            }
        }
    }

    fun size(): Int = lock.read { cache.size }
    fun clear() = lock.write { cache.clear() }
}

// ============================================================================
// 4. App-Specific Scraper Hooks
// ============================================================================

interface AppScraperHook {
    val targetPackage: String
    fun isTarget(packageName: String): Boolean = packageName == targetPackage
    fun extractChatEvents(
        nodes: List<CapturedTextNode>,
        packageName: String
    ): List<CapturedContentEvent.ChatMessage>
}

/**
 * Scraper Hook for WhatsApp (com.whatsapp and com.whatsapp.w4b).
 * Identifies incoming vs. outgoing chat bubbles via view IDs and bounding geometry.
 */
class WhatsAppScraperHook : AppScraperHook {
    override val targetPackage: String = "com.whatsapp"

    companion object {
        const val WHATSAPP_BUSINESS = "com.whatsapp.w4b"
        private val MESSAGE_TEXT_IDS = setOf(
            "com.whatsapp:id/message_text",
            "com.whatsapp:id/caption",
            "com.whatsapp:id/quoted_text",
            "com.whatsapp:id/conversation_text"
        )
        private val SENDER_TITLE_IDS = setOf(
            "com.whatsapp:id/conversation_contact_name",
            "com.whatsapp:id/group_name",
            "com.whatsapp:id/title"
        )
    }

    override fun isTarget(packageName: String): Boolean {
        return packageName == targetPackage || packageName == WHATSAPP_BUSINESS
    }

    override fun extractChatEvents(
        nodes: List<CapturedTextNode>,
        packageName: String
    ): List<CapturedContentEvent.ChatMessage> {
        val events = mutableListOf<CapturedContentEvent.ChatMessage>()
        var activeSender: String? = null

        // Pass 1: Extract conversation header/author
        for (node in nodes) {
            val id = node.viewIdResourceName ?: continue
            if (SENDER_TITLE_IDS.any { id.contains(it) }) {
                activeSender = node.text
                break
            }
        }

        // Pass 2: Extract message bubbles
        for (node in nodes) {
            val id = node.viewIdResourceName ?: ""
            val isBubble = MESSAGE_TEXT_IDS.any { id.contains(it) } ||
                    node.className == "android.widget.TextView" && node.text.length > 2

            if (isBubble && !node.isEditable) {
                // In WhatsApp, outgoing messages are positioned towards the right side of the screen
                val isOutgoing = node.boundsInScreen.left > 300

                events.add(
                    CapturedContentEvent.ChatMessage(
                        eventId = "wa_${node.nodeHash}",
                        packageName = packageName,
                        timestampEpochMs = node.timestampEpochMs,
                        appName = "WhatsApp",
                        sender = if (isOutgoing) "Me" else (activeSender ?: "Contact"),
                        messageText = node.text,
                        conversationContext = activeSender,
                        isOutgoing = isOutgoing,
                        contentHash = node.nodeHash
                    )
                )
            }
        }
        return events
    }
}

/**
 * Scraper Hook for Instagram Direct Messages & Threads (com.instagram.android).
 */
class InstagramScraperHook : AppScraperHook {
    override val targetPackage: String = "com.instagram.android"

    companion object {
        private val IG_MESSAGE_IDS = setOf(
            "com.instagram.android:id/direct_text_message_bubble",
            "com.instagram.android:id/row_thread_composer_textarea",
            "com.instagram.android:id/message_content",
            "com.instagram.android:id/direct_message_text"
        )
        private val IG_HEADER_IDS = setOf(
            "com.instagram.android:id/action_bar_title",
            "com.instagram.android:id/thread_title"
        )
    }

    override fun extractChatEvents(
        nodes: List<CapturedTextNode>,
        packageName: String
    ): List<CapturedContentEvent.ChatMessage> {
        val events = mutableListOf<CapturedContentEvent.ChatMessage>()
        var threadPartner: String? = null

        for (node in nodes) {
            val id = node.viewIdResourceName ?: ""
            if (IG_HEADER_IDS.any { id.contains(it) }) {
                threadPartner = node.text
                break
            }
        }

        for (node in nodes) {
            val id = node.viewIdResourceName ?: ""
            val isDirectMessage = IG_MESSAGE_IDS.any { id.contains(it) }

            if (isDirectMessage && !node.isEditable) {
                val isOutgoing = node.boundsInScreen.left > 350
                events.add(
                    CapturedContentEvent.ChatMessage(
                        eventId = "ig_${node.nodeHash}",
                        packageName = packageName,
                        timestampEpochMs = node.timestampEpochMs,
                        appName = "Instagram",
                        sender = if (isOutgoing) "Me" else (threadPartner ?: "InstagramUser"),
                        messageText = node.text,
                        conversationContext = threadPartner,
                        isOutgoing = isOutgoing,
                        contentHash = node.nodeHash
                    )
                )
            }
        }
        return events
    }
}

/**
 * Scraper Hook for Snapchat (com.snapchat.android).
 * Detects ephemeral chat events and friend feed dialogues.
 */
class SnapchatScraperHook : AppScraperHook {
    override val targetPackage: String = "com.snapchat.android"

    companion object {
        private val CHAT_CONTAINER_TAGS = setOf("chat_message", "chat_item", "chat_text_view")
    }

    override fun extractChatEvents(
        nodes: List<CapturedTextNode>,
        packageName: String
    ): List<CapturedContentEvent.ChatMessage> {
        val events = mutableListOf<CapturedContentEvent.ChatMessage>()

        for (node in nodes) {
            val id = node.viewIdResourceName ?: ""
            val isChatNode = CHAT_CONTAINER_TAGS.any { id.contains(it, ignoreCase = true) } ||
                    (node.className?.contains("TextView") == true && node.text.isNotBlank() && !node.isEditable)

            if (isChatNode) {
                events.add(
                    CapturedContentEvent.ChatMessage(
                        eventId = "sc_${node.nodeHash}",
                        packageName = packageName,
                        timestampEpochMs = node.timestampEpochMs,
                        appName = "Snapchat",
                        sender = if (node.boundsInScreen.left > 300) "Me" else "Friend",
                        messageText = node.text,
                        conversationContext = "Snapchat Conversation",
                        isOutgoing = node.boundsInScreen.left > 300,
                        contentHash = node.nodeHash
                    )
                )
            }
        }
        return events
    }
}

/**
 * Scraper Hook for TikTok (com.zhiliaoapp.musically).
 * Captures direct messages and active comment stream overlay texts.
 */
class TikTokScraperHook : AppScraperHook {
    override val targetPackage: String = "com.zhiliaoapp.musically"

    companion object {
        private val TIKTOK_MSG_IDS = setOf("msg_text", "comment_text", "desc_text", "tv_content")
    }

    override fun extractChatEvents(
        nodes: List<CapturedTextNode>,
        packageName: String
    ): List<CapturedContentEvent.ChatMessage> {
        val events = mutableListOf<CapturedContentEvent.ChatMessage>()

        for (node in nodes) {
            val id = node.viewIdResourceName ?: ""
            if (TIKTOK_MSG_IDS.any { id.contains(it, ignoreCase = true) }) {
                events.add(
                    CapturedContentEvent.ChatMessage(
                        eventId = "tt_${node.nodeHash}",
                        packageName = packageName,
                        timestampEpochMs = node.timestampEpochMs,
                        appName = "TikTok",
                        sender = "TikTokUser",
                        messageText = node.text,
                        conversationContext = "TikTok Direct/Comment Feed",
                        isOutgoing = false,
                        contentHash = node.nodeHash
                    )
                )
            }
        }
        return events
    }
}

// ============================================================================
// 5. Core Content Scanning Accessibility Engine
// ============================================================================

/**
 * Orchestrates real-time tree traversal, notification parsing, deduplication,
 * and routing to the Risk Pipeline.
 */
class ContentScanningAccessibilityEngine(
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    private val deduplicationBuffer = DeduplicationRingBuffer(maxCapacity = 4096, expirationWindowMs = 60_000L)
    private val _eventFlow = MutableSharedFlow<CapturedContentEvent>(replay = 0, extraBufferCapacity = 256)
    val eventFlow: SharedFlow<CapturedContentEvent> = _eventFlow.asSharedFlow()

    // Registered scraper hooks indexed by package name
    private val scraperHooks: List<AppScraperHook> = listOf(
        WhatsAppScraperHook(),
        InstagramScraperHook(),
        SnapchatScraperHook(),
        TikTokScraperHook()
    )

    private val monitoredPackages: Set<String> = setOf(
        "com.whatsapp",
        "com.whatsapp.w4b",
        "com.instagram.android",
        "com.snapchat.android",
        "com.zhiliaoapp.musically",
        "com.google.android.apps.messaging",
        "com.facebook.orca"
    )

    /**
     * Entry point invoked from Android AccessibilityService.onAccessibilityEvent().
     */
    fun onAccessibilityEvent(event: AccessibilityEvent, rootNode: AccessibilityNodeInfo?) {
        val packageName = event.packageName?.toString() ?: return
        if (!monitoredPackages.contains(packageName) && scraperHooks.none { it.isTarget(packageName) }) {
            return
        }

        val eventType = event.eventType
        val isContentChange = eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED ||
                eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED ||
                eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED

        if (!isContentChange || rootNode == null) return

        coroutineScope.launch {
            processAccessibilityHierarchy(rootNode, packageName)
        }
    }

    /**
     * Traverses the AccessibilityNodeInfo hierarchy using Depth-First Search with a bounded stack.
     */
    private suspend fun processAccessibilityHierarchy(rootNode: AccessibilityNodeInfo, packageName: String) {
        val capturedNodes = mutableListOf<CapturedTextNode>()
        val stack = ArrayDeque<Pair<AccessibilityNodeInfo, Int>>()
        val maxTraversalDepth = 30
        var totalNodesEvaluated = 0
        val maxNodeLimit = 400

        stack.push(Pair(rootNode, 0))

        try {
            while (stack.isNotEmpty() && totalNodesEvaluated < maxNodeLimit) {
                val (currentNode, depth) = stack.pop()
                totalNodesEvaluated++

                // Extract textual contents
                val rawText = currentNode.text?.toString()
                val contentDesc = currentNode.contentDescription?.toString()
                val targetText = if (!rawText.isNullOrBlank()) rawText else contentDesc

                if (!targetText.isNullOrBlank() && targetText.length >= 2) {
                    val normalized = TextNormalizer.normalize(targetText)
                    if (normalized.isNotBlank()) {
                        val nodeHash = MurmurHash3.hash64("$packageName:$normalized")

                        // Fast-path deduplication: check if already observed within 60 seconds
                        if (!deduplicationBuffer.isDuplicateOrRecord(nodeHash)) {
                            val bounds = Rect()
                            currentNode.getBoundsInScreen(bounds)

                            capturedNodes.add(
                                CapturedTextNode(
                                    text = targetText,
                                    normalizedText = normalized,
                                    nodeHash = nodeHash,
                                    packageName = packageName,
                                    viewIdResourceName = currentNode.viewIdResourceName,
                                    className = currentNode.className?.toString(),
                                    isEditable = currentNode.isEditable,
                                    isSecretOrEphemeral = false,
                                    boundsInScreen = bounds
                                )
                            )
                        }
                    }
                }

                // Push child nodes if depth allows
                if (depth < maxTraversalDepth) {
                    val childCount = currentNode.childCount
                    for (i in childCount - 1 downTo 0) {
                        val child = currentNode.getChild(i)
                        if (child != null) {
                            stack.push(Pair(child, depth + 1))
                        }
                    }
                }
            }

            // Route captured nodes to matching scraper hook
            if (capturedNodes.isNotEmpty()) {
                val matchingHook = scraperHooks.firstOrNull { it.isTarget(packageName) }
                if (matchingHook != null) {
                    val chatEvents = matchingHook.extractChatEvents(capturedNodes, packageName)
                    for (chatEvent in chatEvents) {
                        _eventFlow.emit(chatEvent)
                    }
                } else {
                    // Generic fallback emitter for other monitored apps
                    for (node in capturedNodes) {
                        if (!node.isEditable) {
                            _eventFlow.emit(
                                CapturedContentEvent.ChatMessage(
                                    eventId = "generic_${node.nodeHash}",
                                    packageName = packageName,
                                    timestampEpochMs = node.timestampEpochMs,
                                    appName = packageName,
                                    sender = "Unknown",
                                    messageText = node.text,
                                    conversationContext = null,
                                    isOutgoing = false,
                                    contentHash = node.nodeHash
                                )
                            )
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Defensive logging in production systems
        }
    }

    /**
     * Entry point invoked from Android NotificationListenerService.onNotificationPosted().
     */
    fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName ?: return
        if (!monitoredPackages.contains(packageName) && scraperHooks.none { it.isTarget(packageName) }) {
            return
        }

        val notification = sbn.notification ?: return
        val extras = notification.extras ?: return

        coroutineScope.launch {
            val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
            val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
            val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()

            val messagesList = mutableListOf<String>()

            // Extract MessagingStyle messages if present (Android 7.0+)
            val rawMessages = extras.getParcelableArray(Notification.EXTRA_MESSAGES)
            if (rawMessages != null) {
                for (item in rawMessages) {
                    if (item is Bundle) {
                        val msgText = item.getCharSequence("text")?.toString()
                        if (!msgText.isNullOrBlank()) {
                            messagesList.add(msgText)
                        }
                    }
                }
            }

            val bodyToAnalyze = bigText ?: text ?: messagesList.lastOrNull() ?: ""
            if (bodyToAnalyze.isBlank()) return@launch

            val normalized = TextNormalizer.normalize(bodyToAnalyze)
            val notifHash = MurmurHash3.hash64("notif:$packageName:$normalized")

            if (!deduplicationBuffer.isDuplicateOrRecord(notifHash)) {
                val capturedNotification = CapturedNotification(
                    notificationKey = sbn.key ?: "key_${System.currentTimeMillis()}",
                    packageName = packageName,
                    title = title,
                    body = text,
                    subText = subText,
                    bigText = bigText,
                    messages = messagesList,
                    isGroupConversation = extras.getBoolean(Notification.EXTRA_IS_GROUP_CONVERSATION, false),
                    postTimeEpochMs = sbn.postTime,
                    notificationHash = notifHash
                )

                _eventFlow.emit(
                    CapturedContentEvent.NotificationAlert(
                        eventId = "notif_$notifHash",
                        packageName = packageName,
                        timestampEpochMs = sbn.postTime,
                        notificationData = capturedNotification
                    )
                )
            }
        }
    }

    fun getBufferStats(): Map<String, Any> {
        return mapOf(
            "activeBufferedHashes" to deduplicationBuffer.size(),
            "monitoredPackagesCount" to monitoredPackages.size,
            "registeredHooksCount" to scraperHooks.size
        )
    }

    fun shutdown() {
        coroutineScope.cancel()
        deduplicationBuffer.clear()
    }
}
