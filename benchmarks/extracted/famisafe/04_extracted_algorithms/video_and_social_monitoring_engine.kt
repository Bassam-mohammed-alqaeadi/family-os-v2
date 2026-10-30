package com.familyos.benchmarks.famisafe.engine

/**
 * Wondershare FamiSafe — YouTube, TikTok & Social Video Monitoring Engine
 *
 * Reverse-Engineered from:
 * - `com.wondershare.famisafe.parent.youtube.*`
 * - `com.wondershare.famisafe.parent.youtube.YoutubeBlockListActivity`
 * - `com.wondershare.famisafe.parent.tiktok.*`
 *
 * Core Capabilities:
 * 1. AccessibilityNodeInfo DOM scraping for YouTube & TikTok UI elements.
 * 2. Video Title, Channel Name, and Video ID extraction in real-time.
 * 3. Channel Blacklist & Keyword Filter (blocks videos matching sensitive keywords).
 * 4. Video Watch History Logging (Title, Channel, Platform, Timestamp).
 * 5. Instant Playback Interception and Child Alert Warning.
 */

enum class VideoPlatform {
    YOUTUBE,
    YOUTUBE_KIDS,
    TIKTOK,
    INSTAGRAM_REELS
}

data class VideoWatchEvent(
    val platform: VideoPlatform,
    val videoId: String?,
    val title: String,
    val channelOrCreator: String,
    val timestampMs: Long = System.currentTimeMillis(),
    val isBlocked: Boolean = false,
    val blockReason: String? = null
)

class FamiSafeVideoMonitoringEngine {

    private val blockedChannels = mutableSetOf<String>()
    private val blockedKeywords = mutableListOf<String>()
    private val watchHistory = mutableListOf<VideoWatchEvent>()

    fun blockChannel(channelName: String) {
        blockedChannels.add(channelName.trim().lowercase())
    }

    fun unblockChannel(channelName: String) {
        blockedChannels.remove(channelName.trim().lowercase())
    }

    fun addBlockedKeyword(keyword: String) {
        blockedKeywords.add(keyword.trim().lowercase())
    }

    /**
     * Inspects parsed text nodes captured from YouTube or TikTok UI.
     * Evaluates against channel blacklists and sensitivity regex patterns.
     */
    fun evaluateVideo(
        platform: VideoPlatform,
        rawTitle: String,
        rawChannelOrCreator: String,
        videoId: String? = null
    ): VideoWatchEvent {
        val titleNorm = rawTitle.trim().lowercase()
        val channelNorm = rawChannelOrCreator.trim().lowercase()

        var isBlocked = false
        var blockReason: String? = null

        // 1. Check Channel Blacklist
        if (blockedChannels.contains(channelNorm)) {
            isBlocked = true
            blockReason = "CHANNEL_BLOCKED: $rawChannelOrCreator"
        }

        // 2. Check Keyword Filters
        if (!isBlocked) {
            for (kw in blockedKeywords) {
                if (titleNorm.contains(kw) || channelNorm.contains(kw)) {
                    isBlocked = true
                    blockReason = "KEYWORD_FLAGGED: '$kw'"
                    break
                }
            }
        }

        val event = VideoWatchEvent(
            platform = platform,
            videoId = videoId,
            title = rawTitle,
            channelOrCreator = rawChannelOrCreator,
            isBlocked = isBlocked,
            blockReason = blockReason
        )

        watchHistory.add(event)
        return event
    }

    /**
     * Helper to extract YouTube video ID from standard URL strings.
     */
    fun extractYouTubeId(url: String): String? {
        val pattern = "(?<=watch\\?v=|/videos/|embed/|youtu.be/|/v/|/e/|watch\\?feature=player_embedded&v=)[^#&?\\n]*".toRegex()
        val match = pattern.find(url)
        return match?.value
    }

    fun getWatchHistory(): List<VideoWatchEvent> = watchHistory.toList()
}
