package com.familyos.benchmarks.famisafe.engine

import java.time.LocalDate

/**
 * Wondershare FamiSafe — App Blocker & Usage Tracking Engine
 *
 * Reverse-Engineered from:
 * - `com.wondershare.famisafe.parent.appusage.block.*`
 * - `com.wondershare.famisafe.parent.apprules.*`
 * - `com.wondershare.famisafe.parent.screenv5.applimit.*`
 *
 * Core Capabilities:
 * 1. Hybrid Detection: High-speed Accessibility window changes (<50ms) + UsageStatsManager aggregation.
 * 2. Category-Level Enforcement (Games, Social, Adult, Shopping).
 * 3. Individual App Daily Quotas (e.g. 30m TikTok, 45m YouTube).
 * 4. Automatic New App Quarantine on install.
 * 5. Full-Screen Blocking Overlay Interception.
 */

enum class AppCategory {
    GAMES,
    SOCIAL_MEDIA,
    VIDEO_ENTERTAINMENT,
    MESSAGING,
    EDUCATION,
    PRODUCTIVITY,
    SYSTEM_CRITICAL, // Whitelisted: Phone dialer, Settings, FamiSafe itself
    UNCLASSIFIED
}

enum class AppRuleType {
    ALWAYS_ALLOWED,
    ALWAYS_BLOCKED,
    DAILY_LIMIT,
    SCHEDULE_CONTROLLED
}

data class AppRule(
    val packageName: String,
    val appName: String,
    val category: AppCategory,
    val ruleType: AppRuleType,
    val dailyLimitMinutes: Int = 0,
    val isCategoryBlocked: Boolean = false
)

data class AppUsageRecord(
    val packageName: String,
    val date: LocalDate,
    var totalForegroundSeconds: Long = 0,
    var launchCount: Int = 0,
    var lastLaunchTimestamp: Long = 0
)

class FamiSafeAppBlockerEngine {

    // Whitelist essential packages to prevent bricking child device
    private val systemWhitelist = setOf(
        "com.android.dialer",
        "com.google.android.dialer",
        "com.samsung.android.dialer",
        "com.android.emergency",
        "com.wondershare.famisafe",
        "com.wondershare.famisafe.junior"
    )

    private val appRules = mutableMapOf<String, AppRule>()
    private val categoryBlockState = mutableMapOf<AppCategory, Boolean>()
    private val todayUsage = mutableMapOf<String, AppUsageRecord>()

    private var activeForegroundPackage: String? = null
    private var activeForegroundStartTime: Long = 0

    fun setCategoryBlocked(category: AppCategory, blocked: Boolean) {
        categoryBlockState[category] = blocked
    }

    fun configureAppRule(rule: AppRule) {
        appRules[rule.packageName] = rule
    }

    /**
     * Called whenever AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED fires
     * or UsageStatsManager detects a package transition.
     */
    fun onForegroundPackageChanged(newPackageName: String, timestampMs: Long): Boolean {
        // Accumulate time spent in previous foreground app
        activeForegroundPackage?.let { prevPkg ->
            if (activeForegroundStartTime > 0 && timestampMs > activeForegroundStartTime) {
                val durationSec = (timestampMs - activeForegroundStartTime) / 1000
                val record = todayUsage.getOrPut(prevPkg) {
                    AppUsageRecord(prevPkg, LocalDate.now())
                }
                record.totalForegroundSeconds += durationSec
            }
        }

        activeForegroundPackage = newPackageName
        activeForegroundStartTime = timestampMs

        val record = todayUsage.getOrPut(newPackageName) {
            AppUsageRecord(newPackageName, LocalDate.now())
        }
        record.launchCount++
        record.lastLaunchTimestamp = timestampMs

        // Check if new package should be blocked immediately
        return shouldBlockApp(newPackageName)
    }

    /**
     * Determines whether an application should be blocked right now.
     */
    fun shouldBlockApp(packageName: String): Boolean {
        if (systemWhitelist.contains(packageName)) {
            return false // Whitelisted critical apps cannot be locked
        }

        val rule = appRules[packageName]

        // 1. Check Always Blocked
        if (rule?.ruleType == AppRuleType.ALWAYS_BLOCKED) {
            return true
        }

        // 2. Check Category-level Ban
        val category = rule?.category ?: AppCategory.UNCLASSIFIED
        if (categoryBlockState[category] == true) {
            return true
        }

        // 3. Check Individual Daily Limit
        if (rule?.ruleType == AppRuleType.DAILY_LIMIT && rule.dailyLimitMinutes > 0) {
            val usedSeconds = todayUsage[packageName]?.totalForegroundSeconds ?: 0
            val limitSeconds = rule.dailyLimitMinutes * 60L
            if (usedSeconds >= limitSeconds) {
                return true
            }
        }

        return false
    }

    /**
     * Hook triggered when Android BroadcastReceiver receives ACTION_PACKAGE_ADDED.
     */
    fun onNewAppInstalled(packageName: String, appName: String, category: AppCategory): AppRule {
        // By default, FamiSafe alerts parent and can automatically quarantine unknown apps
        val defaultRule = AppRule(
            packageName = packageName,
            appName = appName,
            category = category,
            ruleType = if (categoryBlockState[category] == true) AppRuleType.ALWAYS_BLOCKED else AppRuleType.DAILY_LIMIT,
            dailyLimitMinutes = 60
        )
        appRules[packageName] = defaultRule
        return defaultRule
    }
}
