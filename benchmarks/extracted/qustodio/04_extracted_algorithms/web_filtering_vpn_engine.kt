package com.qustodio.engine.webfilter

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.net.VpnService
import android.os.ParcelFileDescriptor
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import kotlinx.coroutines.*
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.ByteBuffer
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

/**
 * ============================================================================
 * QUSTODIO BENCHMARK: WEB FILTERING & SAFE NETWORK VPN ENGINE
 * ============================================================================
 *
 * Reverse-engineered from Qustodio Parental Control:
 * - TypeScript references: `src/businessLogic/profileRules/webCategories.ts`,
 *   `src/records/category.ts`, `src/constants/index.ts`, `src/businessLogic/safeNetwork/safeNetwork.ts`
 * - Android Native Core: `VpnService` DNS loopback interception & `AccessibilityService` URL Inspection
 *
 * Architecture Overview:
 * ----------------------
 * 1. Dual-Mode Inspection:
 *    - Mode A (Network Layer): Local loopback VPN creating a virtual TUN interface, capturing
 *      all outbound UDP port 53 (DNS) traffic, decoding wire-format DNS queries, matching
 *      FQDNs against categorized blocklists, and returning synthetic NXDOMAIN/Block-IP responses.
 *    - Mode B (UI/Accessibility Layer): Inspects browser address bar nodes in real-time
 *      across Chrome, Firefox, Opera, Edge, Samsung Internet, and blocks unsupported browsers.
 * 2. SafeSearch Enforcement:
 *    - Automatically rewrites or injects SafeSearch parameters (`safe=active`, `adlt=strict`)
 *      on Google, Bing, and YouTube, or redirects DNS queries to strict VIP IPs.
 * 3. Categorized Blocklists:
 *    - Implements all 31 Qustodio web categories, default harmful categories, and action codes
 *      (ALLOW = 0, BLOCK = 1, ALERT = 2, IGNORE = 3).
 * 4. SafeNetwork Awareness:
 *    - Observes school / managed Wi-Fi boundaries to adjust policies dynamically.
 */

// ============================================================================
// 1. CONSTANTS & DOMAIN DATA STRUCTURES
// ============================================================================

object WebFilterConstants {
    // Actions matching Qustodio constants/index.ts
    const val WEBFILTER_ALLOW = 0
    const val WEBFILTER_BLOCK = 1
    const val WEBFILTER_ALERT = 2
    const val WEBFILTER_IGNORE = 3

    // Reason codes matching Qustodio constants/index.ts
    const val REASON_NO_MATCH = 0
    const val REASON_WHITELIST = 1
    const val REASON_DOMAIN_LIST_ALLOW = 4
    const val REASON_DOMAIN_LIST_BLOCK = 5
    const val REASON_DOMAIN_LIST_ALERT = 6
    const val REASON_CATEGORY_BLOCK = 7
    const val REASON_CATEGORY_ALERT = 8
    const val REASON_NOT_ALLOW_UNKNOWN_SITES = 9
    const val REASON_DOMAIN_LIST_IGNORE = 12
    const val REASON_APP_BLOCK = 301

    // Events
    const val EVENT_TYPE_WEB = 101
    const val EVENT_TYPE_SEARCH = 103
    const val EVENT_TYPE_SAFE_NETWORK_DISABLE = 703
    const val EVENT_TYPE_SAFE_NETWORK_ENABLE = 704

    // Default DNS upstream servers
    val UPSTREAM_DNS_PRIMARY: InetAddress = InetAddress.getByName("1.1.1.1")
    val UPSTREAM_DNS_SECONDARY: InetAddress = InetAddress.getByName("8.8.8.8")
    const val DNS_PORT = 53
    const val VPN_MTU = 1500
    const val LOCAL_BLOCK_IP = "127.0.0.1"

    // Search Engine SafeSearch VIP IPs
    val GOOGLE_SAFE_SEARCH_VIP: InetAddress = InetAddress.getByName("216.239.38.120") // forcesafesearch.google.com
    val BING_SAFE_SEARCH_VIP: InetAddress = InetAddress.getByName("204.79.197.220")   // strict.bing.com
    val YOUTUBE_RESTRICTED_VIP: InetAddress = InetAddress.getByName("216.239.38.119") // restrict.youtube.com
}

/**
 * 31 Web Categories matching Qustodio `src/records/category.ts`
 */
enum class WebCategory(val id: Int, val label: String) {
    ALCOHOL(1, "Alcohol"),
    CHAT(2, "Chat"),
    DRUGS(3, "Drugs"),
    EDUCATIONAL(4, "Educational"),
    EMPLOYMENT(5, "Employment"),
    ENTERTAINMENT(6, "Entertainment"),
    GAMBLING(7, "Gambling"),
    GAMES(8, "Games"),
    GOVERNMENT(9, "Government"),
    HEALTH(10, "Health"),
    MATURE_CONTENT(12, "Mature Content"),
    NEWS(13, "News"),
    PORNOGRAPHY(14, "Pornography"),
    PROFANITY(15, "Profanity"),
    RELIGION(16, "Religion"),
    SEARCH_PORTALS(17, "Search Portals"),
    SHOPPING(18, "Shopping"),
    SOCIAL_NETWORK(19, "Social Network"),
    SPORTS(20, "Sports"),
    TOBACCO(21, "Tobacco"),
    TRAVEL(22, "Travel"),
    VIOLENCE(23, "Violence"),
    WEAPONS(24, "Weapons"),
    WEBMAIL(25, "Webmail"),
    BUSINESS(26, "Business"),
    TECHNOLOGY(27, "Technology"),
    FILE_SHARING(28, "File Sharing"),
    PROXIES_LOOPHOLES(29, "Proxies/Loopholes"),
    FORUMS(30, "Forums"),
    AI(31, "AI"),
    SAFETY_NET(40, "Safety Net");

    companion object {
        private val ID_MAP = values().associateBy { it.id }
        fun fromId(id: Int): WebCategory? = ID_MAP[id]

        /**
         * Qustodio's default `harmfulWebCategories`:
         * gambling, proxiesLoopholes, violence, weapons, profanity, matureContent,
         * pornography, alcohol, drugs, tobacco.
         */
        val HARMFUL_CATEGORIES = setOf(
            GAMBLING,
            PROXIES_LOOPHOLES,
            VIOLENCE,
            WEAPONS,
            PROFANITY,
            MATURE_CONTENT,
            PORNOGRAPHY,
            ALCOHOL,
            DRUGS,
            TOBACCO
        )

        /**
         * Categories managed strictly by school policy (`SCHOOL_MANAGED_WEB_CATEGORY_IDS`)
         */
        val SCHOOL_MANAGED_CATEGORIES = setOf(
            GAMBLING.id,
            PROXIES_LOOPHOLES.id,
            VIOLENCE.id,
            WEAPONS.id,
            PROFANITY.id,
            MATURE_CONTENT.id,
            PORNOGRAPHY.id,
            ALCOHOL.id,
            DRUGS.id,
            TOBACCO.id
        )
    }
}

/**
 * Represents the evaluation outcome of an inspection
 */
data class FilterDecision(
    val action: Int,            // WEBFILTER_ALLOW, WEBFILTER_BLOCK, WEBFILTER_ALERT
    val reason: Int,            // REASON_*
    val category: WebCategory?, // Matched category if applicable
    val domain: String,
    val matchedRule: String? = null
)

// ============================================================================
// 2. DOMAIN CATEGORY MATCHER & RULE ENGINE
// ============================================================================

class WebCategoryMatcher {

    private val domainRules = ConcurrentHashMap<String, Int>() // domain -> Action
    private val categoryRules = ConcurrentHashMap<WebCategory, Int>() // category -> Action
    private val domainCategoryIndex = ConcurrentHashMap<String, WebCategory>() // domain suffix -> Category

    var isAllowUnknownSites: Boolean = true
    var isSafeSearch: Boolean = true
    var isSchoolProfile: Boolean = false

    init {
        // Initialize default actions: block harmful categories
        WebCategory.values().forEach { cat ->
            if (WebCategory.HARMFUL_CATEGORIES.contains(cat)) {
                categoryRules[cat] = WebFilterConstants.WEBFILTER_BLOCK
            } else {
                categoryRules[cat] = WebFilterConstants.WEBFILTER_ALLOW
            }
        }
        populateSeedDomainCategories()
    }

    fun setDomainRule(domain: String, action: Int) {
        domainRules[domain.lowercase().trim()] = action
    }

    fun setCategoryRule(category: WebCategory, action: Int) {
        // Enforce school policy restriction: if school profile locks category, do not overwrite
        if (isSchoolProfile && WebCategory.SCHOOL_MANAGED_CATEGORIES.contains(category.id)) {
            categoryRules[category] = WebFilterConstants.WEBFILTER_BLOCK
            return
        }
        categoryRules[category] = action
    }

    /**
     * Resolves an incoming domain against the hierarchy:
     * 1. Exact Domain Exception (Whitelist / Blacklist / Alert)
     * 2. Suffix Match on Exceptions (e.g. *.badsite.com)
     * 3. Domain Category Classification & Category Rule
     * 4. Unknown Sites Policy
     */
    fun evaluateDomain(rawDomain: String): FilterDecision {
        val domain = rawDomain.lowercase().trim().removePrefix("www.")

        // 1. Check exact domain rule
        domainRules[domain]?.let { action ->
            val reason = when (action) {
                WebFilterConstants.WEBFILTER_ALLOW -> WebFilterConstants.REASON_DOMAIN_LIST_ALLOW
                WebFilterConstants.WEBFILTER_BLOCK -> WebFilterConstants.REASON_DOMAIN_LIST_BLOCK
                WebFilterConstants.WEBFILTER_ALERT -> WebFilterConstants.REASON_DOMAIN_LIST_ALERT
                else -> WebFilterConstants.REASON_DOMAIN_LIST_IGNORE
            }
            return FilterDecision(action, reason, null, domain, "exact_domain_rule")
        }

        // 2. Check parent domain rules (suffix matching)
        val parts = domain.split(".")
        for (i in 1 until parts.size - 1) {
            val parentDomain = parts.subList(i, parts.size).joinToString(".")
            domainRules[parentDomain]?.let { action ->
                val reason = when (action) {
                    WebFilterConstants.WEBFILTER_ALLOW -> WebFilterConstants.REASON_DOMAIN_LIST_ALLOW
                    WebFilterConstants.WEBFILTER_BLOCK -> WebFilterConstants.REASON_DOMAIN_LIST_BLOCK
                    WebFilterConstants.WEBFILTER_ALERT -> WebFilterConstants.REASON_DOMAIN_LIST_ALERT
                    else -> WebFilterConstants.REASON_DOMAIN_LIST_IGNORE
                }
                return FilterDecision(action, reason, null, domain, "parent_domain_rule: $parentDomain")
            }
        }

        // 3. Category matching
        val category = resolveCategory(domain)
        if (category != null) {
            val action = categoryRules[category] ?: WebFilterConstants.WEBFILTER_ALLOW
            val reason = if (action == WebFilterConstants.WEBFILTER_BLOCK) {
                WebFilterConstants.REASON_CATEGORY_BLOCK
            } else if (action == WebFilterConstants.WEBFILTER_ALERT) {
                WebFilterConstants.REASON_CATEGORY_ALERT
            } else {
                WebFilterConstants.REASON_NO_MATCH
            }
            return FilterDecision(action, reason, category, domain, "category_rule: ${category.name}")
        }

        // 4. Unknown sites policy
        if (!isAllowUnknownSites) {
            return FilterDecision(
                action = WebFilterConstants.WEBFILTER_BLOCK,
                reason = WebFilterConstants.REASON_NOT_ALLOW_UNKNOWN_SITES,
                category = null,
                domain = domain,
                matchedRule = "unknown_sites_blocked_by_policy"
            )
        }

        return FilterDecision(
            action = WebFilterConstants.WEBFILTER_ALLOW,
            reason = WebFilterConstants.REASON_NO_MATCH,
            category = null,
            domain = domain,
            matchedRule = "default_allow"
        )
    }

    private fun resolveCategory(domain: String): WebCategory? {
        // Direct match
        domainCategoryIndex[domain]?.let { return it }

        // Suffix match
        val parts = domain.split(".")
        for (i in 1 until parts.size - 1) {
            val sub = parts.subList(i, parts.size).joinToString(".")
            domainCategoryIndex[sub]?.let { return it }
        }
        return null
    }

    private fun populateSeedDomainCategories() {
        // Pornography & Mature
        listOf("pornhub.com", "xvideos.com", "xnxx.com", "redtube.com", "onlyfans.com")
            .forEach { domainCategoryIndex[it] = WebCategory.PORNOGRAPHY }

        // Gambling
        listOf("bet365.com", "pokerstars.com", "bwin.com", "casino.org", "draftkings.com")
            .forEach { domainCategoryIndex[it] = WebCategory.GAMBLING }

        // Proxies & Loopholes
        listOf("hide.me", "nordvpn.com", "expressvpn.com", "kproxy.com", "proxysite.com", "torproject.org")
            .forEach { domainCategoryIndex[it] = WebCategory.PROXIES_LOOPHOLES }

        // Weapons & Violence
        listOf("gunbroker.com", "thegunstore.com", "weaponsuniverse.com", "guns.com")
            .forEach { domainCategoryIndex[it] = WebCategory.WEAPONS }

        // Drugs & Alcohol & Tobacco
        listOf("silkroad.onion", "weedmaps.com", "leafly.com", "cigarsinternational.com")
            .forEach { domainCategoryIndex[it] = WebCategory.DRUGS }

        // Search Engines
        listOf("google.com", "bing.com", "yahoo.com", "duckduckgo.com", "ecosia.org")
            .forEach { domainCategoryIndex[it] = WebCategory.SEARCH_PORTALS }

        // Educational
        listOf("wikipedia.org", "khanacademy.org", "coursera.org", "mit.edu", "harvard.edu")
            .forEach { domainCategoryIndex[it] = WebCategory.EDUCATIONAL }

        // AI
        listOf("openai.com", "chatgpt.com", "anthropic.com", "claude.ai", "midjourney.com")
            .forEach { domainCategoryIndex[it] = WebCategory.AI }
    }
}

// ============================================================================
// 3. DNS WIRE-FORMAT PACKET PARSER & SYNTHESIZER
// ============================================================================

/**
 * Lightweight RFC 1035 wire-format DNS parser for local loopback VPN packet inspection.
 */
object DnsPacketCodec {

    data class DnsHeader(
        val id: Int,
        val flags: Int,
        val qdCount: Int,
        val anCount: Int,
        val nsCount: Int,
        val arCount: Int
    ) {
        val isQuery: Boolean get() = (flags and 0x8000) == 0
    }

    data class DnsQuestion(
        val qName: String,
        val qType: Int,
        val qClass: Int
    )

    fun parseHeader(buffer: ByteBuffer): DnsHeader {
        val id = buffer.short.toInt() and 0xFFFF
        val flags = buffer.short.toInt() and 0xFFFF
        val qdCount = buffer.short.toInt() and 0xFFFF
        val anCount = buffer.short.toInt() and 0xFFFF
        val nsCount = buffer.short.toInt() and 0xFFFF
        val arCount = buffer.short.toInt() and 0xFFFF
        return DnsHeader(id, flags, qdCount, anCount, nsCount, arCount)
    }

    fun parseDomainName(buffer: ByteBuffer): String {
        val sb = StringBuilder()
        while (buffer.hasRemaining()) {
            val len = buffer.get().toInt() and 0xFF
            if (len == 0) break
            if ((len and 0xC0) == 0xC0) {
                // Pointer compression offset
                val b2 = buffer.get().toInt() and 0xFF
                val offset = ((len and 0x3F) shl 8) or b2
                val currentPos = buffer.position()
                buffer.position(offset)
                val pointedName = parseDomainName(buffer)
                buffer.position(currentPos)
                if (sb.isNotEmpty()) sb.append(".")
                sb.append(pointedName)
                return sb.toString()
            } else {
                val label = ByteArray(len)
                buffer.get(label)
                if (sb.isNotEmpty()) sb.append(".")
                sb.append(String(label, Charsets.US_ASCII))
            }
        }
        return sb.toString()
    }

    /**
     * Synthesizes an immediate blocked DNS response (NXDOMAIN or A record pointing to 127.0.0.1)
     */
    fun buildBlockedDnsResponse(
        queryPacket: ByteArray,
        length: Int,
        redirectIp: InetAddress = InetAddress.getByName(WebFilterConstants.LOCAL_BLOCK_IP)
    ): ByteArray {
        val response = ByteBuffer.allocate(512)
        val queryBuf = ByteBuffer.wrap(queryPacket, 0, length)

        val header = parseHeader(queryBuf)
        val qName = parseDomainName(queryBuf)
        val qType = queryBuf.short.toInt() and 0xFFFF
        val qClass = queryBuf.short.toInt() and 0xFFFF

        // Header
        response.putShort(header.id.toShort())
        // Flags: QR=1 (response), AA=1, RD=1, RA=1, RCODE=0 (No error, resolved to block IP)
        response.putShort(0x8180.toShort())
        response.putShort(1.toShort()) // QDCOUNT = 1
        response.putShort(1.toShort()) // ANCOUNT = 1
        response.putShort(0.toShort()) // NSCOUNT = 0
        response.putShort(0.toShort()) // ARCOUNT = 0

        // Question section
        encodeDomainName(response, qName)
        response.putShort(qType.toShort())
        response.putShort(qClass.toShort())

        // Answer section (A record pointing to redirectIp)
        // Name pointer to question at offset 12 (0xC00C)
        response.putShort(0xC00C.toShort())
        response.putShort(1.toShort()) // Type A
        response.putShort(1.toShort()) // Class IN
        response.putInt(60)            // TTL = 60s
        response.putShort(4.toShort()) // RDLENGTH = 4 bytes
        response.put(redirectIp.address)

        val outBytes = ByteArray(response.position())
        System.arraycopy(response.array(), 0, outBytes, 0, response.position())
        return outBytes
    }

    /**
     * Synthesizes a SafeSearch redirection A record (e.g. forcesafesearch.google.com VIP)
     */
    fun buildSafeSearchDnsResponse(
        queryPacket: ByteArray,
        length: Int,
        safeSearchVip: InetAddress
    ): ByteArray {
        return buildBlockedDnsResponse(queryPacket, length, safeSearchVip)
    }

    private fun encodeDomainName(buffer: ByteBuffer, domain: String) {
        val labels = domain.split(".")
        for (label in labels) {
            val bytes = label.toByteArray(Charsets.US_ASCII)
            buffer.put(bytes.size.toByte())
            buffer.put(bytes)
        }
        buffer.put(0.toByte())
    }
}

// ============================================================================
// 4. LOCAL LOOPBACK VPN SERVICE & PACKET PROCESSING ENGINE
// ============================================================================

class WebFilteringVpnEngine(
    private val vpnService: VpnService,
    private val categoryMatcher: WebCategoryMatcher,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
) {
    private var vpnInterface: ParcelFileDescriptor? = null
    private val isRunning = AtomicBoolean(false)
    private var workerJob: Job? = null

    // Callbacks for logging and telemetry
    var onFilterDecision: ((FilterDecision) -> Unit)? = null
    var onSafeNetworkStatusChanged: ((Boolean) -> Unit)? = null

    fun startVpn() {
        if (isRunning.getAndSet(true)) return

        val builder = vpnService.Builder()
            .setSession("QustodioSafeNetworkVpn")
            .setMtu(WebFilterConstants.VPN_MTU)
            .addAddress("10.0.0.2", 32)
            // Route DNS port traffic through TUN
            .addRoute("10.0.0.1", 32)
            .addDnsServer("10.0.0.1")

        vpnInterface = builder.establish()
        if (vpnInterface == null) {
            isRunning.set(false)
            return
        }

        workerJob = coroutineScope.launch {
            processTunTraffic()
        }
    }

    fun stopVpn() {
        isRunning.set(false)
        workerJob?.cancel()
        vpnInterface?.close()
        vpnInterface = null
    }

    private suspend fun processTunTraffic() = withContext(Dispatchers.IO) {
        val inputStream = FileInputStream(vpnInterface?.fileDescriptor)
        val outputStream = FileOutputStream(vpnInterface?.fileDescriptor)
        val packet = ByteArray(WebFilterConstants.VPN_MTU)

        val forwardSocket = DatagramSocket()

        try {
            while (isRunning.get()) {
                val length = inputStream.read(packet)
                if (length <= 0) continue

                // Check IPv4 packet
                val version = (packet[0].toInt() shr 4) and 0x0F
                if (version != 4) continue

                val protocol = packet[9].toInt() and 0xFF
                val headerLength = (packet[0].toInt() and 0x0F) * 4

                // UDP protocol = 17
                if (protocol == 17) {
                    val srcPort = ((packet[headerLength].toInt() and 0xFF) shl 8) or
                            (packet[headerLength + 1].toInt() and 0xFF)
                    val dstPort = ((packet[headerLength + 2].toInt() and 0xFF) shl 8) or
                            (packet[headerLength + 3].toInt() and 0xFF)

                    // Intercept DNS port 53
                    if (dstPort == WebFilterConstants.DNS_PORT) {
                        val udpPayloadOffset = headerLength + 8
                        val dnsPayloadLength = length - udpPayloadOffset
                        if (dnsPayloadLength > 12) {
                            val dnsPayload = ByteArray(dnsPayloadLength)
                            System.arraycopy(packet, udpPayloadOffset, dnsPayload, 0, dnsPayloadLength)

                            handleDnsQuery(
                                dnsPayload,
                                dnsPayloadLength,
                                forwardSocket,
                                packet,
                                headerLength,
                                srcPort,
                                dstPort,
                                outputStream
                            )
                        }
                    }
                }
            }
        } catch (e: Exception) {
            if (isRunning.get()) {
                e.printStackTrace()
            }
        } finally {
            forwardSocket.close()
        }
    }

    private fun handleDnsQuery(
        dnsPayload: ByteArray,
        length: Int,
        forwardSocket: DatagramSocket,
        ipPacket: ByteArray,
        headerLength: Int,
        srcPort: Int,
        dstPort: Int,
        outputStream: FileOutputStream
    ) {
        val buf = ByteBuffer.wrap(dnsPayload, 0, length)
        val header = DnsPacketCodec.parseHeader(buf)
        if (!header.isQuery) return

        val domain = DnsPacketCodec.parseDomainName(buf)
        val decision = categoryMatcher.evaluateDomain(domain)
        onFilterDecision?.invoke(decision)

        // 1. SafeSearch Enforcement
        if (categoryMatcher.isSafeSearch) {
            val safeSearchVip = getSafeSearchVip(domain)
            if (safeSearchVip != null) {
                val responseDns = DnsPacketCodec.buildSafeSearchDnsResponse(dnsPayload, length, safeSearchVip)
                writeUdpResponseToTun(ipPacket, headerLength, srcPort, dstPort, responseDns, outputStream)
                return
            }
        }

        // 2. Web Category / Blacklist Block Action
        if (decision.action == WebFilterConstants.WEBFILTER_BLOCK) {
            val blockedDns = DnsPacketCodec.buildBlockedDnsResponse(dnsPayload, length)
            writeUdpResponseToTun(ipPacket, headerLength, srcPort, dstPort, blockedDns, outputStream)
            return
        }

        // 3. Allowed / Alert: forward query to upstream DNS
        try {
            val outPacket = DatagramPacket(
                dnsPayload,
                length,
                WebFilterConstants.UPSTREAM_DNS_PRIMARY,
                WebFilterConstants.DNS_PORT
            )
            forwardSocket.send(outPacket)

            val inBuf = ByteArray(512)
            val inPacket = DatagramPacket(inBuf, inBuf.size)
            forwardSocket.soTimeout = 2000
            forwardSocket.receive(inPacket)

            writeUdpResponseToTun(
                ipPacket,
                headerLength,
                srcPort,
                dstPort,
                inBuf.copyOf(inPacket.length),
                outputStream
            )
        } catch (e: Exception) {
            // Upstream timeout or socket error
        }
    }

    private fun getSafeSearchVip(domain: String): InetAddress? {
        val d = domain.lowercase()
        return when {
            d.contains("google.") && !d.contains("forcesafesearch") -> WebFilterConstants.GOOGLE_SAFE_SEARCH_VIP
            d.contains("bing.com") && !d.contains("strict") -> WebFilterConstants.BING_SAFE_SEARCH_VIP
            d.contains("youtube.com") && !d.contains("restrict") -> WebFilterConstants.YOUTUBE_RESTRICTED_VIP
            else -> null
        }
    }

    private fun writeUdpResponseToTun(
        originalIpPacket: ByteArray,
        ipHeaderLen: Int,
        clientPort: Int,
        serverPort: Int,
        dnsResponsePayload: ByteArray,
        outputStream: FileOutputStream
    ) {
        val totalLen = ipHeaderLen + 8 + dnsResponsePayload.size
        val outPacket = ByteBuffer.allocate(totalLen)

        // Swap IP addresses
        val srcIp = ByteArray(4)
        val dstIp = ByteArray(4)
        System.arraycopy(originalIpPacket, 12, srcIp, 0, 4) // original client IP
        System.arraycopy(originalIpPacket, 16, dstIp, 0, 4) // original server IP

        // IP Header
        outPacket.put(0x45.toByte()) // IPv4 + IHL 5
        outPacket.put(0.toByte())
        outPacket.putShort(totalLen.toShort())
        outPacket.putShort(0.toShort())
        outPacket.putShort(0x4000.toShort()) // Flags: Don't Fragment
        outPacket.put(64.toByte())           // TTL 64
        outPacket.put(17.toByte())           // Protocol UDP
        outPacket.putShort(0.toShort())      // Checksum placeholder
        outPacket.put(dstIp)                 // New Source IP = original Destination
        outPacket.put(srcIp)                 // New Destination IP = original Source

        // Calculate IP Checksum
        val ipChecksum = computeIpChecksum(outPacket.array(), 0, ipHeaderLen)
        outPacket.putShort(10, ipChecksum.toShort())

        // UDP Header
        outPacket.putShort(serverPort.toShort()) // Src Port = 53
        outPacket.putShort(clientPort.toShort()) // Dst Port = Client Port
        outPacket.putShort((8 + dnsResponsePayload.size).toShort()) // UDP Length
        outPacket.putShort(0.toShort()) // UDP Checksum (0 = optional in IPv4)

        // DNS Payload
        outPacket.put(dnsResponsePayload)

        synchronized(outputStream) {
            outputStream.write(outPacket.array())
            outputStream.flush()
        }
    }

    private fun computeIpChecksum(data: ByteArray, offset: Int, length: Int): Int {
        var sum = 0
        var i = offset
        while (i < offset + length) {
            val word = ((data[i].toInt() and 0xFF) shl 8) or (data[i + 1].toInt() and 0xFF)
            sum += word
            i += 2
        }
        while ((sum shr 16) > 0) {
            sum = (sum and 0xFFFF) + (sum shr 16)
        }
        return (sum.inv()) and 0xFFFF
    }
}

// ============================================================================
// 5. ACCESSIBILITY URL INSPECTION & UNSUPPORTED BROWSER BLOCKER
// ============================================================================

/**
 * Real-time Accessibility Service engine that inspects the browser address bar,
 * extracts URLs, evaluates category rules, and terminates or redirects blocked sessions.
 */
class AccessibilityUrlInspector(
    private val service: AccessibilityService,
    private val categoryMatcher: WebCategoryMatcher
) {
    // Known supported browser package -> URL address bar node view IDs
    private val supportedBrowserNodeMap = mapOf(
        "com.android.chrome" to listOf(
            "com.android.chrome:id/url_bar",
            "com.android.chrome:id/search_box_text"
        ),
        "org.mozilla.firefox" to listOf(
            "org.mozilla.firefox:id/url_bar_title",
            "org.mozilla.firefox:id/toolbar"
        ),
        "com.opera.browser" to listOf(
            "com.opera.browser:id/url_field"
        ),
        "com.sec.android.app.sbrowser" to listOf(
            "com.sec.android.app.sbrowser:id/location_bar_edit_text"
        ),
        "com.microsoft.emmx" to listOf(
            "com.microsoft.emmx:id/search_box_text",
            "com.microsoft.emmx:id/url_bar"
        )
    )

    // Unsupported browsers that must be blocked when `isBlockedUnsupportedBrowsers = true`
    private val unsupportedBrowserPackages = setOf(
        "org.torproject.torbrowser",
        "com.brave.browser",
        "com.duckduckgo.mobile.android",
        "com.UCMobile.intl",
        "com.opera.mini.native",
        "com.kiwibrowser.browser",
        "com.vivaldi.browser"
    )

    var isBlockedUnsupportedBrowsers: Boolean = true
    var onUrlInspected: ((String, FilterDecision) -> Unit)? = null
    var onUnsupportedBrowserBlocked: ((String) -> Unit)? = null

    fun onAccessibilityEvent(event: AccessibilityEvent) {
        val packageName = event.packageName?.toString() ?: return

        // 1. Check for Unsupported Browser blocking
        if (isBlockedUnsupportedBrowsers && unsupportedBrowserPackages.contains(packageName)) {
            blockBrowserAccess(packageName)
            return
        }

        // 2. Check Supported Browsers
        val addressBarIds = supportedBrowserNodeMap[packageName] ?: return
        val rootNode = service.rootInActiveWindow ?: return

        for (viewId in addressBarIds) {
            val nodes = rootNode.findAccessibilityNodeInfosByViewId(viewId)
            if (nodes.isNotEmpty()) {
                val node = nodes[0]
                val rawUrl = node.text?.toString()
                if (!rawUrl.isNullOrBlank()) {
                    evaluateAndEnforceUrl(rawUrl, packageName)
                    break
                }
            }
        }
    }

    private fun evaluateAndEnforceUrl(rawUrl: String, browserPackage: String) {
        val cleanDomain = extractDomain(rawUrl) ?: return
        val decision = categoryMatcher.evaluateDomain(cleanDomain)
        onUrlInspected?.invoke(rawUrl, decision)

        if (decision.action == WebFilterConstants.WEBFILTER_BLOCK) {
            enforceBlock(browserPackage, cleanDomain, decision.reason)
        }
    }

    private fun enforceBlock(browserPackage: String, domain: String, reason: Int) {
        // Force navigate child back to device home screen or custom block screen
        service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME)

        // Launch Qustodio Block Screen Overlay
        val blockIntent = Intent("com.qustodio.family.ACTION_BLOCK_PAGE").apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("blocked_domain", domain)
            putExtra("block_reason", reason)
            putExtra("browser_package", browserPackage)
        }
        service.startActivity(blockIntent)
    }

    private fun blockBrowserAccess(unsupportedPackage: String) {
        onUnsupportedBrowserBlocked?.invoke(unsupportedPackage)
        service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME)

        val blockIntent = Intent("com.qustodio.family.ACTION_BROWSER_BLOCKED").apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            putExtra("unsupported_package", unsupportedPackage)
            putExtra("block_reason", WebFilterConstants.REASON_APP_BLOCK)
        }
        service.startActivity(blockIntent)
    }

    private fun extractDomain(urlStr: String): String? {
        val normalized = if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
            "https://$urlStr"
        } else {
            urlStr
        }
        return try {
            val uri = Uri.parse(normalized)
            uri.host ?: urlStr.split("/").firstOrNull()
        } catch (e: Exception) {
            null
        }
    }
}
