/**
 * ============================================================================
 * Bark Parental Controls — Algorithmic Engine Extraction
 * Engine 3: Bark Guard Local DNS VPN & SafeSearch Rewriting Engine
 * Package: cm.pt.barkparent.algorithms.dns_vpn
 * File: bark_guard_dns_vpn_engine.kt
 * ============================================================================
 *
 * Architectural Purpose:
 * Reconstructed production-grade engine responsible for local loopback VPN
 * packet interception (VpnService), raw UDP/TCP port 53 DNS parsing, domain
 * categorization via Trie-indexed blocklists, automated SafeSearch DNS query
 * rewriting (Google, Bing, YouTube, DuckDuckGo), and zero-reconnect policy hot-reloading.
 *
 * Key Capabilities:
 * 1. Low-level IPv4 / IPv6 and UDP packet parser with RFC 1035 DNS label decoding.
 * 2. High-performance reverse domain Radix Trie matching parent domains and subdomains in O(k).
 * 3. Synthetic DNS response packet generator returning loopback sinkholes (0.0.0.0 / ::)
 *    or NXDOMAIN for restricted web categories.
 * 4. Automated SafeSearch DNS query rewriter forcing strict filtering across search engines:
 *    - Google: forcesafesearch.google.com (216.239.38.120)
 *    - Bing: strict.bing.com (204.79.197.220)
 *    - YouTube: restrict.youtube.com (216.239.38.119)
 *    - DuckDuckGo: safe.duckduckgo.com (52.142.124.215)
 * 5. Atomic policy hot-swapping allowing dynamic screen time ruleset enforcement
 *    without tearing down or reconnecting the Android VpnService tunnel.
 */

package cm.pt.barkparent.algorithms.dns_vpn

import java.io.ByteArrayOutputStream
import java.io.DataOutputStream
import java.net.InetAddress
import java.nio.ByteBuffer
import java.util.concurrent.atomic.AtomicReference

// ============================================================================
// 1. Data Models, Enums & Protocol Constants
// ============================================================================

enum class WebCategory(val displayName: String) {
    ADULT_PORNOGRAPHY("Adult Content & Pornography"),
    GAMBLING("Gambling & Betting"),
    SOCIAL_MEDIA("Social Media & Microblogging"),
    VIDEO_STREAMING("Video Streaming & Entertainment"),
    ONLINE_GAMING("Online Gaming"),
    MALWARE_PHISHING("Malware, Phishing & Botnets"),
    DRUGS_SUBSTANCES("Illegal Substances & Paraphernalia"),
    WEAPONS_VIOLENCE("Weapons & Violent Content")
}

data class DnsPolicy(
    val blockedCategories: Set<WebCategory> = setOf(
        WebCategory.ADULT_PORNOGRAPHY,
        WebCategory.GAMBLING,
        WebCategory.MALWARE_PHISHING
    ),
    val customBlockedDomains: Set<String> = emptySet(),
    val customAllowedDomains: Set<String> = emptySet(),
    val safeSearchEnabled: Boolean = true,
    val returnSinkholeIp: Boolean = true // Return 0.0.0.0 vs NXDOMAIN
)

data class DnsQuestion(
    val qname: String,
    val qtype: Int,
    val qclass: Int
)

data class DnsRecord(
    val name: String,
    val type: Int,
    val clazz: Int,
    val ttl: Long,
    val rdata: ByteArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is DnsRecord) return false
        return name == other.name && type == other.type && clazz == other.clazz &&
                ttl == other.ttl && rdata.contentEquals(other.rdata)
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + type
        result = 31 * result + clazz
        result = 31 * result + ttl.hashCode()
        result = 31 * result + rdata.contentHashCode()
        return result
    }
}

data class DnsMessage(
    val id: Int,
    val isResponse: Boolean,
    val opcode: Int,
    val isAuthoritative: Boolean,
    val isTruncated: Boolean,
    val recursionDesired: Boolean,
    val recursionAvailable: Boolean,
    val rcode: Int,
    val questions: List<DnsQuestion>,
    val answers: List<DnsRecord>,
    val rawBytes: ByteArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is DnsMessage) return false
        return id == other.id && isResponse == other.isResponse &&
                questions == other.questions && rawBytes.contentEquals(other.rawBytes)
    }

    override fun hashCode(): Int {
        var result = id
        result = 31 * result + isResponse.hashCode()
        result = 31 * result + questions.hashCode()
        result = 31 * result + rawBytes.contentHashCode()
        return result
    }
}

sealed class DnsResolutionResult {
    data class Allowed(val targetDomain: String) : DnsResolutionResult()
    data class Blocked(val domain: String, val category: WebCategory?, val reason: String) : DnsResolutionResult()
    data class RewrittenSafeSearch(val originalDomain: String, val canonicalAlias: String, val forcedIp: InetAddress) : DnsResolutionResult()
}

// ============================================================================
// 2. DNS Packet Parser & Serializer (RFC 1035 Standard)
// ============================================================================

object DnsPacketParser {
    const val QTYPE_A = 1
    const val QTYPE_NS = 2
    const val QTYPE_CNAME = 5
    const val QTYPE_AAAA = 28
    const val QCLASS_IN = 1

    const val RCODE_NOERROR = 0
    const val RCODE_NXDOMAIN = 3

    fun parse(packetData: ByteArray): DnsMessage? {
        if (packetData.size < 12) return null
        val buffer = ByteBuffer.wrap(packetData)

        val id = buffer.short.toInt() and 0xFFFF
        val flags = buffer.short.toInt() and 0xFFFF

        val isResponse = (flags and 0x8000) != 0
        val opcode = (flags and 0x7800) ushr 11
        val isAuthoritative = (flags and 0x0400) != 0
        val isTruncated = (flags and 0x0200) != 0
        val recursionDesired = (flags and 0x0100) != 0
        val recursionAvailable = (flags and 0x0080) != 0
        val rcode = flags and 0x000F

        val qdcount = buffer.short.toInt() and 0xFFFF
        val ancount = buffer.short.toInt() and 0xFFFF
        val nscount = buffer.short.toInt() and 0xFFFF
        val arcount = buffer.short.toInt() and 0xFFFF

        val questions = mutableListOf<DnsQuestion>()
        for (i in 0 until qdcount) {
            val qname = decodeDnsName(buffer, packetData) ?: return null
            val qtype = buffer.short.toInt() and 0xFFFF
            val qclass = buffer.short.toInt() and 0xFFFF
            questions.add(DnsQuestion(qname, qtype, qclass))
        }

        return DnsMessage(
            id = id,
            isResponse = isResponse,
            opcode = opcode,
            isAuthoritative = isAuthoritative,
            isTruncated = isTruncated,
            recursionDesired = recursionDesired,
            recursionAvailable = recursionAvailable,
            rcode = rcode,
            questions = questions,
            answers = emptyList(),
            rawBytes = packetData
        )
    }

    private fun decodeDnsName(buffer: ByteBuffer, fullPacket: ByteArray): String? {
        val domainSegments = mutableListOf<String>()
        var jumped = false
        var jumpsCount = 0
        val maxJumps = 5
        var currentPosition = buffer.position()

        while (true) {
            if (currentPosition >= fullPacket.size) return null
            val lengthByte = fullPacket[currentPosition].toInt() and 0xFF

            if (lengthByte == 0) {
                if (!jumped) {
                    buffer.position(currentPosition + 1)
                }
                break
            }

            // Pointer compression check (leading two bits set: 11xxxxxx)
            if ((lengthByte and 0xC0) == 0xC0) {
                if (currentPosition + 1 >= fullPacket.size) return null
                val secondByte = fullPacket[currentPosition + 1].toInt() and 0xFF
                val pointerOffset = ((lengthByte and 0x3F) shl 8) or secondByte

                if (!jumped) {
                    buffer.position(currentPosition + 2)
                    jumped = true
                }
                jumpsCount++
                if (jumpsCount > maxJumps) return null // Compression loop protection
                currentPosition = pointerOffset
            } else {
                currentPosition++
                if (currentPosition + lengthByte > fullPacket.size) return null
                val labelBytes = ByteArray(lengthByte)
                System.arraycopy(fullPacket, currentPosition, labelBytes, 0, lengthByte)
                domainSegments.add(String(labelBytes, Charsets.US_ASCII))
                currentPosition += lengthByte
                if (!jumped) {
                    buffer.position(currentPosition)
                }
            }
        }

        return domainSegments.joinToString(".").lowercase()
    }

    /**
     * Synthesizes an IPv4 A-record response packet.
     */
    fun createAResponsePacket(
        originalMessage: DnsMessage,
        resolvedIp: InetAddress,
        ttl: Long = 300L
    ): ByteArray {
        val baos = ByteArrayOutputStream()
        val dos = DataOutputStream(baos)

        // 1. Transaction ID
        dos.writeShort(originalMessage.id)

        // 2. Flags: Response, Opcode 0, Recursion Desired & Available, RCODE NOERROR
        // 0x8180 = QR(1) | RD(1) | RA(1)
        val flags = 0x8180
        dos.writeShort(flags)

        // 3. Counts: 1 Question, 1 Answer, 0 Auth, 0 Additional
        dos.writeShort(originalMessage.questions.size)
        dos.writeShort(1) // 1 Answer
        dos.writeShort(0)
        dos.writeShort(0)

        // 4. Echo Questions Section
        for (q in originalMessage.questions) {
            writeDnsName(dos, q.qname)
            dos.writeShort(q.qtype)
            dos.writeShort(q.qclass)
        }

        // 5. Answer Section (Point to first question via DNS Compression Pointer: 0xC00C)
        dos.writeShort(0xC00C) // Points to Question Name at offset 12
        dos.writeShort(QTYPE_A)
        dos.writeShort(QCLASS_IN)
        dos.writeInt(ttl.toInt())

        val ipBytes = resolvedIp.address
        dos.writeShort(ipBytes.size) // RDLENGTH (4 bytes for IPv4)
        dos.write(ipBytes)

        return baos.toByteArray()
    }

    /**
     * Synthesizes an NXDOMAIN (Non-Existent Domain) response packet.
     */
    fun createNxDomainPacket(originalMessage: DnsMessage): ByteArray {
        val baos = ByteArrayOutputStream()
        val dos = DataOutputStream(baos)

        dos.writeShort(originalMessage.id)
        // 0x8183 = QR(1) | RD(1) | RA(1) | RCODE(3 = NXDOMAIN)
        dos.writeShort(0x8183)
        dos.writeShort(originalMessage.questions.size)
        dos.writeShort(0) // 0 Answers
        dos.writeShort(0)
        dos.writeShort(0)

        for (q in originalMessage.questions) {
            writeDnsName(dos, q.qname)
            dos.writeShort(q.qtype)
            dos.writeShort(q.qclass)
        }

        return baos.toByteArray()
    }

    private fun writeDnsName(dos: DataOutputStream, domain: String) {
        val labels = domain.split(".")
        for (label in labels) {
            val bytes = label.toByteArray(Charsets.US_ASCII)
            dos.writeByte(bytes.size)
            dos.write(bytes)
        }
        dos.writeByte(0) // Root null terminator
    }
}

// ============================================================================
// 3. High-Performance Reverse Domain Radix Trie
// ============================================================================

class DomainRadixTrie {
    private class TrieNode {
        val children = HashMap<String, TrieNode>()
        var assignedCategory: WebCategory? = null
        var isTerminal: Boolean = false
    }

    private val root = TrieNode()

    /**
     * Inserts a domain in reverse-hierarchical order (e.g. "tiktok.com" -> ["com", "tiktok"]).
     * This enables O(k) matching for any arbitrary subdomain (e.g. "v16-web.tiktok.com").
     */
    fun insert(domain: String, category: WebCategory) {
        val parts = domain.lowercase().trim().split(".").reversed()
        var current = root
        for (part in parts) {
            current = current.children.getOrPut(part) { TrieNode() }
        }
        current.assignedCategory = category
        current.isTerminal = true
    }

    fun findCategory(domain: String): WebCategory? {
        val parts = domain.lowercase().trim().split(".").reversed()
        var current = root
        var matchedCategory: WebCategory? = null

        for (part in parts) {
            current = current.children[part] ?: break
            if (current.isTerminal) {
                matchedCategory = current.assignedCategory
            }
        }
        return matchedCategory
    }
}

// ============================================================================
// 4. SafeSearch Rewriting Engine
// ============================================================================

object SafeSearchEngine {
    // Official VIP addresses for strict filtering
    val GOOGLE_SAFESEARCH_IP: InetAddress = InetAddress.getByAddress(byteArrayOf(216.toByte(), 239.toByte(), 38.toByte(), 120.toByte())) // 216.239.38.120
    val BING_SAFESEARCH_IP: InetAddress = InetAddress.getByAddress(byteArrayOf(204.toByte(), 79.toByte(), 197.toByte(), 220.toByte())) // 204.79.197.220
    val YOUTUBE_RESTRICT_IP: InetAddress = InetAddress.getByAddress(byteArrayOf(216.toByte(), 239.toByte(), 38.toByte(), 119.toByte())) // 216.239.38.119
    val DUCKDUCKGO_SAFE_IP: InetAddress = InetAddress.getByAddress(byteArrayOf(52.toByte(), 142.toByte(), 124.toByte(), 215.toByte())) // 52.142.124.215

    fun checkSafeSearchOverride(domain: String): DnsResolutionResult.RewrittenSafeSearch? {
        val d = domain.lowercase()

        // Google SafeSearch: forcesafesearch.google.com
        if (d == "google.com" || d.endsWith(".google.com") || d.contains("google.co.")) {
            return DnsResolutionResult.RewrittenSafeSearch(
                originalDomain = d,
                canonicalAlias = "forcesafesearch.google.com",
                forcedIp = GOOGLE_SAFESEARCH_IP
            )
        }

        // Bing Strict SafeSearch: strict.bing.com
        if (d == "bing.com" || d.endsWith(".bing.com")) {
            return DnsResolutionResult.RewrittenSafeSearch(
                originalDomain = d,
                canonicalAlias = "strict.bing.com",
                forcedIp = BING_SAFESEARCH_IP
            )
        }

        // YouTube Restricted Mode: restrict.youtube.com
        if (d == "youtube.com" || d.endsWith(".youtube.com") || d == "m.youtube.com" || d == "youtubei.googleapis.com") {
            return DnsResolutionResult.RewrittenSafeSearch(
                originalDomain = d,
                canonicalAlias = "restrict.youtube.com",
                forcedIp = YOUTUBE_RESTRICT_IP
            )
        }

        // DuckDuckGo SafeSearch: safe.duckduckgo.com
        if (d == "duckduckgo.com" || d.endsWith(".duckduckgo.com")) {
            return DnsResolutionResult.RewrittenSafeSearch(
                originalDomain = d,
                canonicalAlias = "safe.duckduckgo.com",
                forcedIp = DUCKDUCKGO_SAFE_IP
            )
        }

        return null
    }
}

// ============================================================================
// 5. Bark Guard Local DNS VPN Controller
// ============================================================================

class BarkGuardDnsVpnEngine(
    initialPolicy: DnsPolicy = DnsPolicy()
) {
    private val activePolicy = AtomicReference<DnsPolicy>(initialPolicy)
    private val domainTrie = DomainRadixTrie()
    val SINKHOLE_IPV4: InetAddress = InetAddress.getByAddress(byteArrayOf(0, 0, 0, 0))

    init {
        populateBaselineBlocklists()
    }

    private fun populateBaselineBlocklists() {
        // Adult / Pornography
        listOf("pornhub.com", "xvideos.com", "redtube.com", "xnxx.com", "chaturbate.com", "onlyfans.com", "stripchat.com").forEach {
            domainTrie.insert(it, WebCategory.ADULT_PORNOGRAPHY)
        }

        // Gambling
        listOf("bet365.com", "stake.com", "pokerstars.com", "bovada.lv", "draftkings.com", "fanduel.com").forEach {
            domainTrie.insert(it, WebCategory.GAMBLING)
        }

        // Social Media
        listOf("tiktok.com", "instagram.com", "snapchat.com", "twitter.com", "x.com", "reddit.com", "discord.com").forEach {
            domainTrie.insert(it, WebCategory.SOCIAL_MEDIA)
        }

        // Video Streaming
        listOf("netflix.com", "twitch.tv", "hulu.com", "disneyplus.com", "primevideo.com").forEach {
            domainTrie.insert(it, WebCategory.VIDEO_STREAMING)
        }

        // Online Gaming
        listOf("roblox.com", "epicgames.com", "steampowered.com", "riotgames.com", "minecraft.net").forEach {
            domainTrie.insert(it, WebCategory.ONLINE_GAMING)
        }

        // Malware & Phishing
        listOf("phish-alert.com", "malware-drop.ru", "crypto-drainer.io", "trojan-installer.net").forEach {
            domainTrie.insert(it, WebCategory.MALWARE_PHISHING)
        }
    }

    /**
     * Hot-reloads the active policy dynamically without tearing down the VPN socket.
     */
    fun updatePolicy(newPolicy: DnsPolicy) {
        activePolicy.set(newPolicy)
    }

    fun getActivePolicy(): DnsPolicy = activePolicy.get()

    /**
     * Evaluates an incoming domain against Custom Whitelist, Custom Blacklist,
     * SafeSearch rewrites, and Trie-indexed Category Blocklists.
     */
    fun evaluateDomain(domain: String): DnsResolutionResult {
        val policy = activePolicy.get()
        val normalizedDomain = domain.lowercase().trim()

        // 1. Custom Whitelist / Allowed Bypass
        if (policy.customAllowedDomains.contains(normalizedDomain)) {
            return DnsResolutionResult.Allowed(normalizedDomain)
        }

        // 2. Custom Blocklist
        if (policy.customBlockedDomains.contains(normalizedDomain)) {
            return DnsResolutionResult.Blocked(normalizedDomain, null, "Explicitly blocked by custom parental rule")
        }

        // 3. Automated SafeSearch Enforcement
        if (policy.safeSearchEnabled) {
            val safeRewrite = SafeSearchEngine.checkSafeSearchOverride(normalizedDomain)
            if (safeRewrite != null) {
                return safeRewrite
            }
        }

        // 4. Trie-Indexed Category Matching
        val matchedCategory = domainTrie.findCategory(normalizedDomain)
        if (matchedCategory != null && policy.blockedCategories.contains(matchedCategory)) {
            return DnsResolutionResult.Blocked(normalizedDomain, matchedCategory, "Category [${matchedCategory.displayName}] is restricted by active schedule")
        }

        return DnsResolutionResult.Allowed(normalizedDomain)
    }

    /**
     * Intercepts a raw UDP DNS datagram payload and generates a synthetic
     * response packet if blocked or rewritten. Returns null if allowed (allowing
     * upstream DNS forwarding).
     */
    fun handleDnsPacket(rawDnsPacket: ByteArray): ByteArray? {
        val dnsMessage = DnsPacketParser.parse(rawDnsPacket) ?: return null
        if (dnsMessage.isResponse || dnsMessage.questions.isEmpty()) return null

        val firstQuestion = dnsMessage.questions.first()
        val requestedDomain = firstQuestion.qname
        val policy = activePolicy.get()

        when (val decision = evaluateDomain(requestedDomain)) {
            is DnsResolutionResult.Blocked -> {
                return if (policy.returnSinkholeIp) {
                    DnsPacketParser.createAResponsePacket(dnsMessage, SINKHOLE_IPV4, ttl = 60L)
                } else {
                    DnsPacketParser.createNxDomainPacket(dnsMessage)
                }
            }

            is DnsResolutionResult.RewrittenSafeSearch -> {
                return DnsPacketParser.createAResponsePacket(dnsMessage, decision.forcedIp, ttl = 300L)
            }

            is DnsResolutionResult.Allowed -> {
                // Return null so the packet is forwarded to upstream resolver (e.g. Cloudflare 1.1.1.1 / Google 8.8.8.8)
                return null
            }
        }
    }
}
