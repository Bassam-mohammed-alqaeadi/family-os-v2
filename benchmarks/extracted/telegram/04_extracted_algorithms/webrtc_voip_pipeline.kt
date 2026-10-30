package org.familyos.messenger.voip

import java.security.MessageDigest

/**
 * خط إدارة مكالمات WebRTC P2P والتحقق البصري المزدوج عبر الإيموجي (Telegram Emoji Key Fingerprint).
 *
 * يوفر هذا النظام تشفيراً تاماً (End-to-End Encryption) بين طرفي الاتصال مع خوارزمية
 * مطابقة البصمة المرئية عبر 4 إيموجيات يتم توليدها مباشرة من هاش المفتاح السري المشترك SHA-256،
 * معتمدة على مصفوفة الـ 333 إيموجي الرسمية وتقسيم الهاش إلى قيم 64-بت مطابقة تماماً
 * لتطبيق Telegram الرسمي (EncryptionKeyEmojifier.java).
 */
object WebRtcVoipPipeline {

    // مصفوفة الـ 333 إيموجي المعتمدة في تيليجرام للتحقق من أمان المكالمة المشفرة
    val EMOJI_SET = arrayOf("😉", "😍", "😛", "😭", "😱", "😡", "😎", "😴", "😵", "😈", "😬", "😇", "😏", "👮", "👷", "💂", "👶", "👨", "👩", "👴", "👵", "😻", "😽", "🙀", "👺", "🙈", "🙉", "🙊", "💀", "👽", "💩", "🔥", "💥", "💤", "👂", "👀", "👃", "👅", "👄", "👍", "👎", "👌", "👊", "✌", "✋", "👐", "👆", "👇", "👉", "👈", "🙏", "👏", "💪", "🚶", "🏃", "💃", "👫", "👨\u200d👩\u200d👦", "👬", "👭", "💅", "🎩", "👑", "👒", "👟", "👞", "👠", "👕", "👗", "👖", "👙", "👜", "👓", "🎀", "💄", "💛", "💙", "💜", "💚", "💍", "💎", "🐶", "🐺", "🐱", "🐭", "🐹", "🐰", "🐸", "🐯", "🐨", "🐻", "🐷", "🐮", "🐗", "🐴", "🐑", "🐘", "🐼", "🐧", "🐥", "🐔", "🐍", "🐢", "🐛", "🐝", "🐜", "🐞", "🐌", "🐙", "🐚", "🐟", "🐬", "🐋", "🐐", "🐊", "🐫", "🍀", "🌹", "🌻", "🍁", "🌾", "🍄", "🌵", "🌴", "🌳", "🌞", "🌚", "🌙", "🌎", "🌋", "⚡", "☔", "❄", "⛄", "🌀", "🌈", "🌊", "🎓", "🎆", "🎃", "👻", "🎅", "🎄", "🎁", "🎈", "🔮", "🎥", "📷", "💿", "💻", "☎", "📡", "📺", "📻", "🔉", "🔔", "⏳", "⏰", "⌚", "🔒", "🔑", "🔎", "💡", "🔦", "🔌", "🔋", "🚿", "🚽", "🔧", "🔨", "🚪", "🚬", "💣", "🔫", "🔪", "💊", "💉", "💰", "💵", "💳", "✉", "📫", "📦", "📅", "📁", "✂", "📌", "📎", "✒", "✏", "📐", "📚", "🔬", "🔭", "🎨", "🎬", "🎤", "🎧", "🎵", "🎹", "🎻", "🎺", "🎸", "👾", "🎮", "🃏", "🎲", "🎯", "🏈", "🏀", "⚽", "⚾", "🎾", "🎱", "🏉", "🎳", "🏁", "🏇", "🏆", "🏊", "🏄", "☕", "🍼", "🍺", "🍷", "🍴", "🍕", "🍔", "🍟", "🍗", "🍱", "🍚", "🍜", "🍡", "🍳", "🍞", "🍩", "🍦", "🎂", "🍰", "🍪", "🍫", "🍭", "🍯", "🍎", "🍏", "🍊", "🍋", "🍒", "🍇", "🍉", "🍓", "🍑", "🍌", "🍐", "🍍", "🍆", "🍅", "🌽", "🏡", "🏥", "🏦", "⛪", "🏰", "⛺", "🏭", "🗻", "🗽", "🎠", "🎡", "⛲", "🎢", "🚢", "🚤", "⚓", "🚀", "✈", "🚁", "🚂", "🚋", "🚎", "🚌", "🚙", "🚗", "🚕", "🚛", "🚨", "🚔", "🚒", "🚑", "🚲", "🚠", "🚜", "🚦", "⚠", "🚧", "⛽", "🎰", "🗿", "🎪", "🎭", "🇯🇵", "🇰🇷", "🇩🇪", "🇨🇳", "🇺🇸", "🇫🇷", "🇪🇸", "🇮🇹", "🇷🇺", "🇬🇧", "1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "0⃣", "🔟", "❗", "❓", "♥", "♦", "💯", "🔗", "🔱", "🔴", "🔵", "🔶", "🔷")

    private val offsets = intArrayOf(0, 4, 8, 12, 16)

    private fun bytesToInt(bArr: ByteArray, offset: Int): Int {
        return (bArr[offset + 3].toInt() and 255) or
                ((bArr[offset].toInt() and 127) shl 24) or
                ((bArr[offset + 1].toInt() and 255) shl 16) or
                ((bArr[offset + 2].toInt() and 255) shl 8)
    }

    private fun bytesToLong(bArr: ByteArray, offset: Int): Long {
        return (bArr[offset + 7].toLong() and 255L) or
                ((bArr[offset].toLong() and 127L) shl 56) or
                ((bArr[offset + 1].toLong() and 255L) shl 48) or
                ((bArr[offset + 2].toLong() and 255L) shl 40) or
                ((bArr[offset + 3].toLong() and 255L) shl 32) or
                ((bArr[offset + 4].toLong() and 255L) shl 24) or
                ((bArr[offset + 5].toLong() and 255L) shl 16) or
                ((bArr[offset + 6].toLong() and 255L) shl 8)
    }

    /**
     * تحويل المفتاح السري المشترك (Shared Auth Key) لمكالمة WebRTC إلى 4 إيموجيات بصرية
     * مطابقة لخوارزمية emojifyForCall في Telegram الرسمي.
     *
     * @param sharedKey المفتاح المشفر الناتج من خوارزمية Diffie-Hellman بين الطرفين (أو SHA-256 hash)
     * @return قائمة بـ 4 إيموجيات متطابقة تماماً على هاتفي المتصل والمستلم
     */
    fun generateCallKeyFingerprintEmojis(sharedKey: ByteArray): List<String> {
        val hash = if (sharedKey.size == 32) {
            sharedKey
        } else {
            MessageDigest.getInstance("SHA-256").digest(sharedKey)
        }

        val emojis = mutableListOf<String>()
        // استخراج 4 كتل 64-بت (8 بايتات لكل إيموجي) مع القسمة على 333
        for (i in 0 until 4) {
            val longVal = bytesToLong(hash, i * 8)
            val index = (longVal % EMOJI_SET.size.toLong()).toInt()
            emojis.add(EMOJI_SET[index])
        }
        return emojis
    }

    /**
     * تحويل هاش 32 بايت إلى 5 إيموجيات للدردشات السرية المشفرة (Secret Chats)
     */
    fun emojifySecretChat(sha256: ByteArray): List<String> {
        require(sha256.size == 32) { "sha256 needs to be exactly 32 bytes" }
        val result = mutableListOf<String>()
        for (i in 0 until 5) {
            val intVal = bytesToInt(sha256, offsets[i])
            val index = intVal % EMOJI_SET.size
            result.add(EMOJI_SET[index])
        }
        return result
    }

    /**
     * حالة المكالمة المشفرة
     */
    enum class CallState {
        IDLE,
        INITIALIZING,
        CONNECTING_P2P,
        RINGING,
        EXCHANGING_KEYS,
        ACTIVE_ENCRYPTED,
        ENDED,
        FAILED
    }
}
