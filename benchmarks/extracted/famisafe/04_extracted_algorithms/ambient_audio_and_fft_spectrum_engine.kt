package com.familyos.benchmarks.famisafe.engine

import kotlin.math.*

/**
 * Wondershare FamiSafe — Ambient One-Way Audio Streaming & FFT Spectrum Engine
 *
 * Reverse-Engineered from:
 * - `com.wondershare.famisafe.common.microophone.audio.*`
 * - `com.wondershare.famisafe.common.microophone.audio.fftlib.FftFactory`
 * - `com.wondershare.famisafe.parent.audio.*`
 * - Native Library: `libmp3lame.so` (MP3 encoding)
 *
 * Core Capabilities:
 * 1. On-Demand 60-Second Surrounding Ambient Audio Capture (Kid Device).
 * 2. PCM to MP3 Real-Time Compression via Native LAME encoder to minimize cellular data.
 * 3. Fast Fourier Transform (FFT) 1024-point Frequency Spectrum Calculation.
 * 4. Decibel (dB) Sound Pressure Level Meter for environment noise detection.
 * 5. Waveform Frequency Band Decomposition (Sub-bass, Voice Midrange, Treble).
 */

data class AudioRecordConfig(
    val sampleRateHz: Int = 16000,
    val channelConfig: Int = 1, // Mono
    val audioFormatBitDepth: Int = 16, // 16-bit PCM
    val bufferSizeBytes: Int = 2048,
    val maxRecordSeconds: Int = 60
)

data class AudioSpectrumFrame(
    val decibels: Float,
    val dominantFrequencyHz: Float,
    val frequencyBands: FloatArray, // 16 normalized visualizer bands (0.0 - 1.0)
    val timestampMs: Long = System.currentTimeMillis()
)

class FamiSafeAudioSpectrumEngine(
    private val fftSize: Int = 1024,
    private val sampleRateHz: Int = 16000
) {

    /**
     * Calculates Sound Pressure Level in Decibels (dBFS) from raw 16-bit PCM buffer.
     */
    fun calculateDecibels(pcm16Buffer: ShortArray): Float {
        var sumSquares = 0.0
        for (sample in pcm16Buffer) {
            sumSquares += (sample * sample).toDouble()
        }
        val rms = sqrt(sumSquares / pcm16Buffer.size)
        // Normalize against max short value (32767)
        val normalizedRms = (rms / 32767.0).coerceAtLeast(0.00001)
        return (20 * log10(normalizedRms)).toFloat().coerceIn(-80f, 0f)
    }

    /**
     * In-place Radix-2 Cooley-Tukey Fast Fourier Transform (FFT).
     * Computes frequency magnitude distribution from time-domain PCM samples.
     */
    fun computeFftMagnitudes(pcmSamples: FloatArray): FloatArray {
        val n = fftSize
        val real = FloatArray(n)
        val imag = FloatArray(n)

        // Apply Hann Window to minimize spectral leakage
        for (i in 0 until min(pcmSamples.size, n)) {
            val windowMultiplier = 0.5f * (1.0f - cos(2.0 * PI * i / (n - 1)).toFloat())
            real[i] = pcmSamples[i] * windowMultiplier
            imag[i] = 0f
        }

        // Bit-reversal permutation
        var j = 0
        for (i in 0 until n - 1) {
            if (i < j) {
                val tempR = real[i]; real[i] = real[j]; real[j] = tempR
                val tempI = imag[i]; imag[i] = imag[j]; imag[j] = tempI
            }
            var k = n / 2
            while (k <= j) {
                j -= k
                k /= 2
            }
            j += k
        }

        // Cooley-Tukey Butterfly Computations
        var len = 2
        while (len <= n) {
            val halfLen = len / 2
            val angle = -2.0 * PI / len
            val wStepR = cos(angle).toFloat()
            val wStepI = sin(angle).toFloat()

            var i = 0
            while (i < n) {
                var wR = 1.0f
                var wI = 0.0f
                for (k in 0 until halfLen) {
                    val uR = real[i + k]
                    val uI = imag[i + k]
                    val vR = real[i + k + halfLen] * wR - imag[i + k + halfLen] * wI
                    val vI = real[i + k + halfLen] * wI + imag[i + k + halfLen] * wR

                    real[i + k] = uR + vR
                    imag[i + k] = uI + vI
                    real[i + k + halfLen] = uR - vR
                    imag[i + k + halfLen] = uI - vI

                    val nextWR = wR * wStepR - wI * wStepI
                    val nextWI = wR * wStepI + wI * wStepR
                    wR = nextWR
                    wI = nextWI
                }
                i += len
            }
            len *= 2
        }

        // Compute normalized magnitudes for first N/2 bins
        val magnitudes = FloatArray(n / 2)
        for (k in 0 until n / 2) {
            magnitudes[k] = sqrt(real[k] * real[k] + imag[k] * imag[k])
        }
        return magnitudes
    }

    /**
     * Bins raw FFT magnitudes into 16 visualizer bands for smooth UI display.
     */
    fun binIntoVisualizerBands(magnitudes: FloatArray, numBands: Int = 16): FloatArray {
        val bands = FloatArray(numBands)
        val binSize = magnitudes.size / numBands

        for (b in 0 until numBands) {
            var sum = 0f
            val start = b * binSize
            val end = min(start + binSize, magnitudes.size)
            for (i in start until end) {
                sum += magnitudes[i]
            }
            bands[b] = (sum / binSize).coerceIn(0f, 1f)
        }
        return bands
    }
}
