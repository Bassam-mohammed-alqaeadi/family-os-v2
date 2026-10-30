/**
 * ============================================================================
 * Bark Parental Controls — Algorithmic Engine Extraction
 * Engine 2: Risk Detection & Alerting Pipeline (Privacy-by-Design "Zero-Dump")
 * Package: cm.pt.barkparent.algorithms.risk_detection
 * File: risk_detection_and_alerting_pipeline.kt
 * ============================================================================
 *
 * Architectural Purpose:
 * Reconstructed production-grade engine responsible for on-device heuristic
 * risk evaluation, multi-factor severity scoring, privacy-preserving zero-dump
 * filtering, Google Tink AES-256-GCM payload encryption, and AI parent coaching
 * suggestion synthesis.
 *
 * Key Capabilities:
 * 1. Tier-1 on-device keyword and regex heuristic matcher covering 6 critical
 *    categories (Bullying, Self-Harm/Suicide, Sexual, Predators, Hate, Drugs).
 * 2. Multi-factor mathematical severity scoring (Levels 1 to 5) with contextual
 *    multipliers (late-night, secrecy triggers, predatory solicitation).
 * 3. Strict Zero-Dump filtering: Level 1 benign chatter is instantly purged from RAM;
 *    only confirmed risk signals with minimal snippets are retained.
 * 4. Google Tink / JCE AES-256-GCM authenticated envelope encryption with AAD.
 * 5. Parent Coaching & AI Conversation Suggestion engine generating empathetic,
 *    child-psychology-based dialogue guides and emergency hotline linkages.
 */

package cm.pt.barkparent.algorithms.risk_detection

import cm.pt.barkparent.algorithms.content_scanning.CapturedContentEvent
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.util.Calendar
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

// ============================================================================
// 1. Data Models, Enums & Risk Contracts
// ============================================================================

enum class RiskCategory(val displayName: String, val baseWeight: Double) {
    CYBERBULLYING("Cyberbullying & Harassment", 1.0),
    DEPRESSION_SUICIDE("Depression & Suicidal Ideation", 1.8),
    SEXUAL_CONTENT("Sexual Content & Sexting", 1.3),
    ONLINE_PREDATORS("Online Grooming & Predators", 1.7),
    HATE_SPEECH("Hate Speech & Discrimination", 1.1),
    SUBSTANCE_ABUSE("Substance Abuse, Vaping & Drugs", 1.2)
}

enum class SeverityLevel(val level: Int, val label: String) {
    LEVEL_1_LOW(1, "Low / Benign — Zero Dump Purge"),
    LEVEL_2_GUARDED(2, "Guarded — Potential Emerging Concern"),
    LEVEL_3_MODERATE(3, "Moderate — Clear Risk Indicators Detected"),
    LEVEL_4_HIGH(4, "High — Severe Safety Violation"),
    LEVEL_5_CRITICAL(5, "Critical — Immediate Life or Safety Threat")
}

data class HeuristicRule(
    val ruleId: String,
    val category: RiskCategory,
    val regexPattern: Regex,
    val baseSeverityPoints: Double,
    val isCriticalTrigger: Boolean = false
)

data class HeuristicMatch(
    val ruleId: String,
    val category: RiskCategory,
    val matchedSubstring: String,
    val severityPoints: Double,
    val isCriticalTrigger: Boolean
)

data class CrisisHotline(
    val name: String,
    val phone: String,
    val textShortCode: String?,
    val website: String,
    val description: String
)

data class ConversationSuggestion(
    val suggestionId: String,
    val category: RiskCategory,
    val severity: SeverityLevel,
    val empatheticApproach: String,
    val talkingPoints: List<String>,
    val pitfallWarnings: List<String>,
    val hotlines: List<CrisisHotline> = emptyList()
)

data class RiskSignal(
    val signalId: String,
    val category: RiskCategory,
    val severity: SeverityLevel,
    val calculatedScore: Double,
    val timestampEpochMs: Long,
    val sourceApp: String,
    val senderIdentity: String?,
    val minimalContextSnippet: String,
    val matchedRuleIds: List<String>,
    val coachingSuggestions: List<ConversationSuggestion>
)

data class EncryptedRiskPayload(
    val signalId: String,
    val iv: ByteArray,
    val ciphertext: ByteArray,
    val associatedData: ByteArray,
    val schemaVersion: Int = 1,
    val creationTimestampMs: Long = System.currentTimeMillis()
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is EncryptedRiskPayload) return false
        return signalId == other.signalId && iv.contentEquals(other.iv) &&
                ciphertext.contentEquals(other.ciphertext) &&
                associatedData.contentEquals(other.associatedData)
    }

    override fun hashCode(): Int {
        var result = signalId.hashCode()
        result = 31 * result + iv.contentHashCode()
        result = 31 * result + ciphertext.contentHashCode()
        result = 31 * result + associatedData.contentHashCode()
        return result
    }
}

// ============================================================================
// 2. Tier-1 On-Device Heuristic Engine
// ============================================================================

object HeuristicRuleRegistry {

    val rules: List<HeuristicRule> = listOf(
        // Category 1: Cyberbullying & Harassment
        HeuristicRule(
            ruleId = "BULLY_01",
            category = RiskCategory.CYBERBULLYING,
            regexPattern = Regex("\\b(kill\\s+your\\s*self|go\\s+die|drink\\s+bleach|nobody\\s+likes\\s+you)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 45.0,
            isCriticalTrigger = false
        ),
        HeuristicRule(
            ruleId = "BULLY_02",
            category = RiskCategory.CYBERBULLYING,
            regexPattern = Regex("\\b(ugly\\s+loser|fat\\s+pig|worthless\\s+freak|delete\\s+your\\s+account)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 30.0
        ),
        HeuristicRule(
            ruleId = "BULLY_03",
            category = RiskCategory.CYBERBULLYING,
            regexPattern = Regex("\\b(leak\\s+your\\s+(nudes|pics|address)|doxx(ing)?\\s+you)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 50.0
        ),

        // Category 2: Depression & Suicidal Ideation (Critical life safety)
        HeuristicRule(
            ruleId = "SUICIDE_01",
            category = RiskCategory.DEPRESSION_SUICIDE,
            regexPattern = Regex("\\b(want\\s+to\\s+(die|end\\s+it\\s+all|kill\\s+myself|hang\\s+myself))\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 95.0,
            isCriticalTrigger = true
        ),
        HeuristicRule(
            ruleId = "SUICIDE_02",
            category = RiskCategory.DEPRESSION_SUICIDE,
            regexPattern = Regex("\\b(better\\s+off\\s+dead|don'?t\\s+want\\s+to\\s+wake\\s+up|goodbye\\s+forever|slit\\s+my\\s+wrists)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 90.0,
            isCriticalTrigger = true
        ),
        HeuristicRule(
            ruleId = "SUICIDE_03",
            category = RiskCategory.DEPRESSION_SUICIDE,
            regexPattern = Regex("\\b(cutting\\s+myself|self[\\s-]harm|bleed\\s+out|overdose\\s+on\\s+pills)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 85.0,
            isCriticalTrigger = true
        ),

        // Category 3: Sexual Content & Sexting
        HeuristicRule(
            ruleId = "SEXT_01",
            category = RiskCategory.SEXUAL_CONTENT,
            regexPattern = Regex("\\b(send\\s+(nudes?|nudies?|nsfw\\s+pic|naked\\s+pic)|dirty\\s+snap)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 55.0
        ),
        HeuristicRule(
            ruleId = "SEXT_02",
            category = RiskCategory.SEXUAL_CONTENT,
            regexPattern = Regex("\\b(dtf|wanna\\s+hook\\s*up|send\\s+me\\s+your\\s+body|show\\s+me\\s+your)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 40.0
        ),

        // Category 4: Online Grooming & Predators (Age deception, secrecy, lures)
        HeuristicRule(
            ruleId = "PREDATOR_01",
            category = RiskCategory.ONLINE_PREDATORS,
            regexPattern = Regex("\\b(don'?t\\s+tell\\s+your\\s+(parents|mom|dad)|keep\\s+(this|it)\\s+a?\\s*secret\\s+between\\s+us)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 65.0
        ),
        HeuristicRule(
            ruleId = "PREDATOR_02",
            category = RiskCategory.ONLINE_PREDATORS,
            regexPattern = Regex("\\b(sneak\\s+out\\s+to\\s+meet|come\\s+over\\s+when\\s+you'?re\\s+alone|where\\s+do\\s+you\\s+live)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 75.0
        ),
        HeuristicRule(
            ruleId = "PREDATOR_03",
            category = RiskCategory.ONLINE_PREDATORS,
            regexPattern = Regex("\\b(switch\\s+to\\s+(telegram|kik|signal|snap)|i'?ll\\s+buy\\s+you\\s+(robux|v-?bucks|gift\\s+cards?))\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 60.0
        ),

        // Category 5: Hate Speech & Bigotry
        HeuristicRule(
            ruleId = "HATE_01",
            category = RiskCategory.HATE_SPEECH,
            regexPattern = Regex("\\b(nigger|faggot|kike|chink|retard|kill\\s+all\\s+(jews|muslims|blacks|gays))\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 70.0
        ),

        // Category 6: Substance Abuse, Vaping & Drugs
        HeuristicRule(
            ruleId = "DRUG_01",
            category = RiskCategory.SUBSTANCE_ABUSE,
            regexPattern = Regex("\\b(plug\\s+got\\s+(weed|carts?|percs?|xans?|lean|edibles?)|hit\\s+my\\s+vape|buy\\s+me\\s+alc(ohol)?)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 50.0
        ),
        HeuristicRule(
            ruleId = "DRUG_02",
            category = RiskCategory.SUBSTANCE_ABUSE,
            regexPattern = Regex("\\b(popping\\s+(pills?|percs?)|smoking\\s+weed|getting\\s+wasted|buying\\s+fent(anyl)?)\\b", RegexOption.IGNORE_CASE),
            baseSeverityPoints = 65.0
        )
    )

    fun evaluate(text: String): List<HeuristicMatch> {
        val matches = mutableListOf<HeuristicMatch>()
        for (rule in rules) {
            val findResult = rule.regexPattern.find(text)
            if (findResult != null) {
                matches.add(
                    HeuristicMatch(
                        ruleId = rule.ruleId,
                        category = rule.category,
                        matchedSubstring = findResult.value,
                        severityPoints = rule.baseSeverityPoints,
                        isCriticalTrigger = rule.isCriticalTrigger
                    )
                )
            }
        }
        return matches
    }
}

// ============================================================================
// 3. Multi-Factor Severity Scoring & Zero-Dump Filtering
// ============================================================================

object SeverityScoringEngine {

    /**
     * Calculates the composite risk score using category weights, contextual
     * timestamp modifiers, and secrecy multipliers.
     *
     * Mathematical Formula:
     *   CompositeScore = min(100.0, (Sum(BasePoints) * CategoryWeight * M_time * M_context))
     */
    fun calculateScore(
        matches: List<HeuristicMatch>,
        timestampEpochMs: Long,
        isOutgoing: Boolean
    ): Pair<Double, SeverityLevel> {
        if (matches.isEmpty()) {
            return Pair(0.0, SeverityLevel.LEVEL_1_LOW)
        }

        // Check if any rule triggered an unconditional critical flag
        val hasCriticalTrigger = matches.any { it.isCriticalTrigger }
        if (hasCriticalTrigger) {
            return Pair(98.5, SeverityLevel.LEVEL_5_CRITICAL)
        }

        // Find primary category (category with highest base severity among matches)
        val primaryCategory = matches.maxByOrNull { it.severityPoints }?.category ?: RiskCategory.CYBERBULLYING
        val sumBasePoints = matches.sumOf { it.severityPoints }

        // Context Modifier 1: Time of night multiplier (11 PM - 5 AM indicates heightened vulnerability)
        val calendar = Calendar.getInstance().apply { timeInMillis = timestampEpochMs }
        val hourOfDay = calendar.get(Calendar.HOUR_OF_DAY)
        val timeMultiplier = if (hourOfDay in 23..24 || hourOfDay in 0..5) 1.20 else 1.0

        // Context Modifier 2: Directionality (Incoming predatory grooming is higher immediate threat)
        val directionMultiplier = if (!isOutgoing && primaryCategory == RiskCategory.ONLINE_PREDATORS) 1.25 else 1.0

        // Context Modifier 3: Multiple distinct rule matches (indicates sustained conversation)
        val repetitionBonus = if (matches.size > 1) 1.15 else 1.0

        val rawScore = sumBasePoints * primaryCategory.baseWeight * timeMultiplier * directionMultiplier * repetitionBonus
        val finalScore = rawScore.coerceIn(0.0, 100.0)

        val severity = when {
            finalScore < 25.0 -> SeverityLevel.LEVEL_1_LOW
            finalScore < 50.0 -> SeverityLevel.LEVEL_2_GUARDED
            finalScore < 75.0 -> SeverityLevel.LEVEL_3_MODERATE
            finalScore < 90.0 -> SeverityLevel.LEVEL_4_HIGH
            else -> SeverityLevel.LEVEL_5_CRITICAL
        }

        return Pair(finalScore, severity)
    }

    /**
     * Extracts a strictly bounded context snippet (maximum 120 characters) around the matched
     * trigger to protect child privacy. Never dumps full conversation histories.
     */
    fun extractMinimalSnippet(fullText: String, matchedSubstring: String): String {
        val index = fullText.indexOf(matchedSubstring, ignoreCase = true)
        if (index == -1) return matchedSubstring

        val start = (index - 30).coerceAtLeast(0)
        val end = (index + matchedSubstring.length + 30).coerceAtMost(fullText.length)

        val prefix = if (start > 0) "..." else ""
        val suffix = if (end < fullText.length) "..." else ""

        return "$prefix${fullText.substring(start, end).trim()}$suffix"
    }
}

// ============================================================================
// 4. AI Parent Coaching & Conversation Suggestions Generator
// ============================================================================

object CoachingSuggestionGenerator {

    private val HOTLINE_988 = CrisisHotline(
        name = "Suicide & Crisis Lifeline",
        phone = "988",
        textShortCode = "988",
        website = "https://988lifeline.org/",
        description = "Free, confidential 24/7 support for people in distress and crisis prevention resources."
    )

    private val HOTLINE_CRISIS_TEXT = CrisisHotline(
        name = "Crisis Text Line",
        phone = "741741",
        textShortCode = "HOME",
        website = "https://www.crisistextline.org/",
        description = "Free 24/7 text line connecting individuals in crisis with trained volunteer crisis counselors."
    )

    private val HOTLINE_TREVOR = CrisisHotline(
        name = "The Trevor Project",
        phone = "1-866-488-7386",
        textShortCode = "START to 678-678",
        website = "https://www.thetrevorproject.org/",
        description = "Crisis intervention and suicide prevention services for LGBTQ young people."
    )

    private val HOTLINE_NCMEC = CrisisHotline(
        name = "CyberTipline (NCMEC)",
        phone = "1-800-843-5678",
        textShortCode = null,
        website = "https://www.missingkids.org/gethelpnow/cybertipline",
        description = "National reporting mechanism for child sexual exploitation and predator grooming."
    )

    fun generate(category: RiskCategory, severity: SeverityLevel): List<ConversationSuggestion> {
        val suggestions = mutableListOf<ConversationSuggestion>()

        when (category) {
            RiskCategory.DEPRESSION_SUICIDE -> {
                suggestions.add(
                    ConversationSuggestion(
                        suggestionId = "SUICIDE_COACH_${severity.level}",
                        category = category,
                        severity = severity,
                        empatheticApproach = "Immediate, non-judgmental presence. Prioritize safety over discipline.",
                        talkingPoints = listOf(
                            "I love you unconditionally, and you are not alone in how you feel.",
                            "I noticed you might be carrying a really heavy burden right now. Can we talk about it?",
                            "Whatever pain you are going through, we will get through it together with professional help."
                        ),
                        pitfallWarnings = listOf(
                            "Do NOT dismiss their pain with 'you have so much to live for' or 'it's just a phase'.",
                            "Do NOT leave them unattended if they express immediate suicidal intent.",
                            "Do NOT confiscate their phone in anger; treat this as a health emergency, not misconduct."
                        ),
                        hotlines = listOf(HOTLINE_988, HOTLINE_CRISIS_TEXT, HOTLINE_TREVOR)
                    )
                )
            }

            RiskCategory.ONLINE_PREDATORS -> {
                suggestions.add(
                    ConversationSuggestion(
                        suggestionId = "PREDATOR_COACH_${severity.level}",
                        category = category,
                        severity = severity,
                        empatheticApproach = "Supportive curiosity without accusation. Validate that predators manipulate trust.",
                        talkingPoints = listOf(
                            "You are not in trouble. My only goal is to protect you from people who hide who they are.",
                            "Adults who ask young people to keep secrets from their parents are never safe.",
                            "Let's look at this account together and block/report them immediately."
                        ),
                        pitfallWarnings = listOf(
                            "Do NOT blame the child for replying or feeling flattered by attention.",
                            "Do NOT alert the predator directly before preserving digital evidence.",
                            "Do NOT delete chat history until it is reported to law enforcement / NCMEC."
                        ),
                        hotlines = listOf(HOTLINE_NCMEC)
                    )
                )
            }

            RiskCategory.CYBERBULLYING -> {
                suggestions.add(
                    ConversationSuggestion(
                        suggestionId = "BULLY_COACH_${severity.level}",
                        category = category,
                        severity = severity,
                        empatheticApproach = "Validate the emotional hurt. Build self-worth and outline practical blocking steps.",
                        talkingPoints = listOf(
                            "What they said says everything about their cruelty, and nothing about who you are.",
                            "You don't have to carry this alone. Let's take screenshots, block them, and report the behavior.",
                            "How can I best support you at school or online right now?"
                        ),
                        pitfallWarnings = listOf(
                            "Do NOT suggest replying with an insult or retaliating.",
                            "Do NOT tell them to 'just ignore it' — digital harassment feels inescapable."
                        )
                    )
                )
            }

            RiskCategory.SEXUAL_CONTENT -> {
                suggestions.add(
                    ConversationSuggestion(
                        suggestionId = "SEXT_COACH_${severity.level}",
                        category = category,
                        severity = severity,
                        empatheticApproach = "Educational and empathetic. Explain digital permanence without inducing shame.",
                        talkingPoints = listOf(
                            "Once a photo or message is sent online, it can never be truly deleted or controlled.",
                            "People who pressure you to share private pictures do not respect your boundaries.",
                            "I'm here to protect your dignity and your future, no matter what has already been sent."
                        ),
                        pitfallWarnings = listOf(
                            "Do NOT react with shock or disgust, which shuts down open dialogue.",
                            "Do NOT assume criminal intent without exploring peer pressure dynamics."
                        )
                    )
                )
            }

            RiskCategory.SUBSTANCE_ABUSE -> {
                suggestions.add(
                    ConversationSuggestion(
                        suggestionId = "DRUG_COACH_${severity.level}",
                        category = category,
                        severity = severity,
                        empatheticApproach = "Open conversation about peer influence and physical safety.",
                        talkingPoints = listOf(
                            "I care deeply about your brain and body health as you grow.",
                            "Things being sold online today (like counterfeit pills or vapes) often contain deadly substances like fentanyl.",
                            "If you ever find yourself somewhere unsafe with drugs or alcohol, call me — I will pick you up no questions asked."
                        ),
                        pitfallWarnings = listOf(
                            "Do NOT launch into harsh punitive restrictions immediately; explore why they are curious or stressed."
                        )
                    )
                )
            }

            RiskCategory.HATE_SPEECH -> {
                suggestions.add(
                    ConversationSuggestion(
                        suggestionId = "HATE_COACH_${severity.level}",
                        category = category,
                        severity = severity,
                        empatheticApproach = "Firm boundary setting around dignity, empathy, and social impact.",
                        talkingPoints = listOf(
                            "Words like that carry immense historical pain and have no place in our family values.",
                            "Online gaming and meme culture sometimes normalize cruel language, but it hurts real people.",
                            "Let's talk about why using that word is harmful, even as a joke."
                        ),
                        pitfallWarnings = listOf(
                            "Do NOT treat hate speech as harmless gaming banter."
                        )
                    )
                )
            }
        }

        return suggestions
    }
}

// ============================================================================
// 5. Authenticated Envelope Encryption Engine (Google Tink / AES-256-GCM)
// ============================================================================

class TinkAesGcmEncryptor(
    private val secretKey: SecretKey = generateRandomAesKey()
) {
    companion object {
        private const val GCM_IV_LENGTH_BYTES = 12
        private const val GCM_TAG_LENGTH_BITS = 128
        private const val TRANSFORMATION = "AES/GCM/NoPadding"

        fun generateRandomAesKey(): SecretKey {
            val keyBytes = ByteArray(32) // 256 bits
            SecureRandom().nextBytes(keyBytes)
            return SecretKeySpec(keyBytes, "AES")
        }
    }

    private val secureRandom = SecureRandom()

    /**
     * Encrypts plaintext bytes using AES-256-GCM with associated authentication data (AAD).
     */
    fun encrypt(plaintext: ByteArray, associatedData: ByteArray): Pair<ByteArray, ByteArray> {
        val iv = ByteArray(GCM_IV_LENGTH_BYTES)
        secureRandom.nextBytes(iv)

        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec)
        cipher.updateAAD(associatedData)

        val ciphertext = cipher.doFinal(plaintext)
        return Pair(iv, ciphertext)
    }

    /**
     * Decrypts ciphertext bytes and verifies authentication tag using AES-256-GCM.
     */
    fun decrypt(iv: ByteArray, ciphertext: ByteArray, associatedData: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        val spec = GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
        cipher.updateAAD(associatedData)

        return cipher.doFinal(ciphertext)
    }
}

// ============================================================================
// 6. Complete Risk Detection & Alerting Pipeline Coordinator
// ============================================================================

class RiskDetectionAndAlertingPipeline(
    private val encryptor: TinkAesGcmEncryptor = TinkAesGcmEncryptor(),
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    private val _riskSignalFlow = MutableSharedFlow<RiskSignal>(replay = 0, extraBufferCapacity = 64)
    val riskSignalFlow: SharedFlow<RiskSignal> = _riskSignalFlow.asSharedFlow()

    private val _encryptedPayloadFlow = MutableSharedFlow<EncryptedRiskPayload>(replay = 0, extraBufferCapacity = 64)
    val encryptedPayloadFlow: SharedFlow<EncryptedRiskPayload> = _encryptedPayloadFlow.asSharedFlow()

    /**
     * Ingests captured content events from Engine 1, executes on-device evaluation,
     * discards benign chatter (Level 1), and packages/encrypts confirmed risks.
     */
    fun processCapturedEvent(event: CapturedContentEvent) {
        val (textToScan, sender, isOutgoing, sourceApp) = when (event) {
            is CapturedContentEvent.ChatMessage -> Tuple4(event.messageText, event.sender, event.isOutgoing, event.appName)
            is CapturedContentEvent.NotificationAlert -> Tuple4(event.notificationData.body ?: event.notificationData.bigText ?: "", event.notificationData.title, false, event.packageName)
            is CapturedContentEvent.SocialMediaFeed -> Tuple4(event.captionOrComment, event.authorHandle, false, event.platform)
        }

        if (textToScan.isBlank()) return

        coroutineScope.launch {
            // Step 1: Run Tier-1 On-Device Regex & Heuristic Scans
            val matches = HeuristicRuleRegistry.evaluate(textToScan)

            // Step 2: Compute Multi-Factor Severity Score
            val (calculatedScore, severity) = SeverityScoringEngine.calculateScore(
                matches = matches,
                timestampEpochMs = event.timestampEpochMs,
                isOutgoing = isOutgoing
            )

            // Step 3: Zero-Dump Filter Enforcement
            // Level 1 chatter is PURGED IMMEDIATELY from memory. Never stored, never transmitted.
            if (severity == SeverityLevel.LEVEL_1_LOW) {
                return@launch
            }

            // Step 4: Construct Privacy-Preserving Minimal Context Snippet
            val primaryMatch = matches.maxByOrNull { it.severityPoints }
            val matchedSnippet = if (primaryMatch != null) {
                SeverityScoringEngine.extractMinimalSnippet(textToScan, primaryMatch.matchedSubstring)
            } else {
                "[Context Redacted]"
            }

            // Step 5: Synthesize Parent AI Coaching Suggestions
            val primaryCategory = primaryMatch?.category ?: RiskCategory.CYBERBULLYING
            val suggestions = CoachingSuggestionGenerator.generate(primaryCategory, severity)

            val signalId = UUID.randomUUID().toString()
            val riskSignal = RiskSignal(
                signalId = signalId,
                category = primaryCategory,
                severity = severity,
                calculatedScore = calculatedScore,
                timestampEpochMs = event.timestampEpochMs,
                sourceApp = sourceApp,
                senderIdentity = sender,
                minimalContextSnippet = matchedSnippet,
                matchedRuleIds = matches.map { it.ruleId },
                coachingSuggestions = suggestions
            )

            // Emit unencrypted internal signal for local notification/logging
            _riskSignalFlow.emit(riskSignal)

            // Step 6: Authenticated Envelope Encryption via Google Tink (AES-256-GCM)
            val signalJson = serializeSignalToJson(riskSignal)
            val associatedData = "bark_guard_v1:${riskSignal.signalId}:${riskSignal.timestampEpochMs}".toByteArray(StandardCharsets.UTF_8)
            val (iv, ciphertext) = encryptor.encrypt(signalJson.toByteArray(StandardCharsets.UTF_8), associatedData)

            val encryptedPayload = EncryptedRiskPayload(
                signalId = signalId,
                iv = iv,
                ciphertext = ciphertext,
                associatedData = associatedData
            )

            _encryptedPayloadFlow.emit(encryptedPayload)
        }
    }

    private fun serializeSignalToJson(signal: RiskSignal): String {
        val escapedSnippet = signal.minimalContextSnippet.replace("\"", "\\\"")
        val escapedSender = (signal.senderIdentity ?: "Unknown").replace("\"", "\\\"")
        return """{
            "signalId": "${signal.signalId}",
            "category": "${signal.category.name}",
            "severity": "${signal.severity.name}",
            "score": ${signal.calculatedScore},
            "timestamp": ${signal.timestampEpochMs},
            "sourceApp": "${signal.sourceApp}",
            "sender": "$escapedSender",
            "snippet": "$escapedSnippet"
        }""".trimIndent()
    }

    fun shutdown() {
        coroutineScope.cancel()
    }

    private data class Tuple4<A, B, C, D>(val a: A, val b: B, val c: C, val d: D)
}
