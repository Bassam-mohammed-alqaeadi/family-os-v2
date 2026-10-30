package org.familyos.media.audio

import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * محرك استخراج وضغط قمم الموجات الصوتية (Telegram Audio Waveform Engine).
 *
 * يستخرج هذا المحرك الشكل الموجي الدقيق للرسائل الصوتية باستخدام خوارزمية ضغط العينات 5-bit
 * المعتمدة رسمياً في تيليجرام لتخزين 100 عينة ترددية بأقل حجم ممكن (نحو 63 بايت فقط لكل رسالة صوتية!).
 */
object AudioWaveformPipeline {

    private const val PEAK_MAX_VALUE = 31 // 5-bit representation (0..31)
    private const val DEFAULT_BAR_COUNT = 100

    /**
     * فك ضغط مصفوفة البايتات المدمجة 5-bit إلى مصفوفة قيم عينات عادية (0..31) لرسمها في الواجهة.
     *
     * @param waveformByteArray مصفوفة البايتات المشفرة المستلمة من السيرفر أو قاعدة البيانات
     * @return مصفوفة أعداد صحيحة تمثل ارتفاعات كل عمود في الموجة الصوتية
     */
    fun unpackWaveform(waveformByteArray: ByteArray): IntArray {
        if (waveformByteArray.isEmpty()) return IntArray(0)

        val totalBits = waveformByteArray.size * 8
        val totalSamples = totalBits / 5
        val result = IntArray(totalSamples)

        for (i in 0 until totalSamples) {
            val bitOffset = i * 5
            val byteOffset = bitOffset / 8
            val bitInByte = bitOffset % 8

            var value: Int
            if (bitInByte <= 3) {
                // العينة تقع بالكامل داخل نفس البايت
                val b = waveformByteArray[byteOffset].toInt() and 0xFF
                value = (b shr bitInByte) and 0x1F
            } else {
                // العينة تنقسم بين بايتين متتاليين
                val b1 = waveformByteArray[byteOffset].toInt() and 0xFF
                val b2 = if (byteOffset + 1 < waveformByteArray.size) {
                    waveformByteArray[byteOffset + 1].toInt() and 0xFF
                } else {
                    0
                }
                val part1 = b1 shr bitInByte
                val bitsFromPart1 = 8 - bitInByte
                val bitsNeededFromPart2 = 5 - bitsFromPart1
                val part2 = (b2 and ((1 shl bitsNeededFromPart2) - 1)) shl bitsFromPart1
                value = (part1 or part2) and 0x1F
            }
            result[i] = value
        }
        return result
    }

    /**
     * ضغط مصفوفة قمم العينات (القيم من 0 إلى 31) إلى مصفوفة بايتات 5-bit Bitstream مضغوطة.
     *
     * @param samples مصفوفة القمم المجهزة
     * @return مصفوفة بايتات مضغوطة للغاية جاهزة للإرسال في بروتوكول الرسائل
     */
    fun packWaveform(samples: IntArray): ByteArray {
        val totalBits = samples.size * 5
        val byteCount = (totalBits + 7) / 8
        val result = ByteArray(byteCount)

        for (i in samples.indices) {
            val sampleVal = min(PEAK_MAX_VALUE, max(0, samples[i]))
            val bitOffset = i * 5

            for (bit in 0 until 5) {
                val bitVal = (sampleVal shr bit) and 1
                if (bitVal == 1) {
                    val targetBit = bitOffset + bit
                    val targetByte = targetBit / 8
                    val bitInByte = targetBit % 8
                    result[targetByte] = (result[targetByte].toInt() or (1 shl bitInByte)).toByte()
                }
            }
        }
        return result
    }

    /**
     * حساب القمم وتطبيعها (Normalization) من عينات الصوت الخام PCM المسجلة من الميكروفون
     * وتجهيزها للعرض كـ 100 عمود صوتي ديناميكي.
     */
    fun normalizePcmToWaveform(pcmData: ShortArray, targetBars: Int = DEFAULT_BAR_COUNT): IntArray {
        if (pcmData.isEmpty()) return IntArray(targetBars)

        val samplesPerBar = max(1, pcmData.size / targetBars)
        val rawPeaks = DoubleArray(targetBars)
        var maxPeak = 1.0

        for (bar in 0 until targetBars) {
            val start = bar * samplesPerBar
            val end = min(pcmData.size, start + samplesPerBar)
            var sumSquare = 0.0
            var count = 0

            for (idx in start until end) {
                val sample = pcmData[idx].toDouble()
                sumSquare += sample * sample
                count++
            }

            val rms = if (count > 0) Math.sqrt(sumSquare / count) else 0.0
            rawPeaks[bar] = rms
            if (rms > maxPeak) {
                maxPeak = rms
            }
        }

        // تحويل كل قمة لمقياس 5-bit من 0 إلى 31
        val finalBars = IntArray(targetBars)
        for (i in 0 until targetBars) {
            val normalized = (rawPeaks[i] / maxPeak) * PEAK_MAX_VALUE
            finalBars[i] = min(PEAK_MAX_VALUE, max(1, normalized.roundToInt()))
        }
        return finalBars
    }
}
