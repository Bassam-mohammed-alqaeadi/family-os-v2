package com.familyos.engine.identity

import java.security.MessageDigest

/**
 * ============================================================================
 * Family OS — Reconstructed Digital Safety & Data Breach Monitoring Engine
 * Derived from Life360 Identity Architecture (com.life360.android.safety & premium)
 *
 * Implements:
 * 1. Compromised Credential Verification via SHA-1 Prefix K-Anonymity
 * 2. Dark Web Leak Analysis (Email, Phone, SSN, Credit Cards)
 * 3. Family Circle Cyber-Vulnerability Index (0 - 100 Risk Scoring)
 * 4. Step-by-Step Security Remediation Engine
 * ============================================================================
 */

enum class BreachSeverity {
    LOW,        // Non-sensitive site leak
    MEDIUM,     // Password / username hash exposed
    HIGH,       // Financial / credit card details exposed
    CRITICAL    // Full Social Security / National ID exposed
}

data class BreachRecord(
    val breachTitle: String,
    val domain: String,
    val breachDate: String,
    val compromisedFields: List<String>,
    val severity: BreachSeverity,
    val remediationStep: String
)

data class MemberBreachSummary(
    val memberEmail: String,
    val totalBreachesCount: Int,
    val highestSeverity: BreachSeverity,
    val vulnerabilityScore: Int, // 0 (Safe) to 100 (Extremely Vulnerable)
    val breaches: List<BreachRecord>
)

class DigitalSafetyEngine(
    private val onCriticalBreachDetected: (memberEmail: String, breach: BreachRecord) -> Unit
) {
    /**
     * Generates a K-Anonymity SHA-1 hash prefix (5 characters) for privacy-preserving breach queries
     */
    fun generateKAnonymityPrefix(input: String): Pair<String, String> {
        val md = MessageDigest.getInstance("SHA-1")
        val digest = md.digest(input.trim().lowercase().toByteArray())
        val fullHash = digest.joinToString("") { "%02X".format(it) }
        val prefix = fullHash.substring(0, 5)
        val suffix = fullHash.substring(5)
        return Pair(prefix, suffix)
    }

    /**
     * Evaluates breach records returned by server and computes the circle member's risk index
     */
    fun evaluateBreachesForMember(email: String, rawBreaches: List<BreachRecord>): MemberBreachSummary {
        val total = rawBreaches.size

        var highest = BreachSeverity.LOW
        var riskScore = 0

        for (b in rawBreaches) {
            when (b.severity) {
                BreachSeverity.CRITICAL -> {
                    highest = BreachSeverity.CRITICAL
                    riskScore += 40
                    onCriticalBreachDetected(email, b)
                }
                BreachSeverity.HIGH -> {
                    if (highest != BreachSeverity.CRITICAL) highest = BreachSeverity.HIGH
                    riskScore += 25
                }
                BreachSeverity.MEDIUM -> {
                    if (highest == BreachSeverity.LOW) highest = BreachSeverity.MEDIUM
                    riskScore += 15
                }
                BreachSeverity.LOW -> {
                    riskScore += 5
                }
            }
        }

        val normalizedRisk = minOf(100, riskScore)

        return MemberBreachSummary(
            memberEmail = email,
            totalBreachesCount = total,
            highestSeverity = highest,
            vulnerabilityScore = normalizedRisk,
            breaches = rawBreaches
        )
    }
}
