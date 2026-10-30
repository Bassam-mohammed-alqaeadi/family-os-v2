package com.familyos.benchmarks.life360.engine

import kotlin.math.sqrt

/**
 * Life360 — Vehicle Crash Detection & Emergency Escalation Engine
 *
 * Reverse-Engineered from:
 * - `com.life360.android.crash.*`
 * - `com.life360.android.driving.*`
 *
 * Core Capabilities:
 * 1. High-G Impact Vector Calculation: Computes resultant 3-axis acceleration vector magnitude.
 * 2. Velocity Delta Validation: Ensures vehicle was traveling at speed (>= 25 mph / 40 km/h)
 *    prior to the sudden impact to filter out dropped phone false positives.
 * 3. 30-Second Life-Saving Cancellation Countdown: Audio siren and haptic alert giving user time to cancel.
 * 4. Multi-Channel Emergency Dispatch: Circles broadcast, emergency contact SMS, and 911 dispatch hook.
 */

data class ImuSample(
    val accelX: Float,
    val accelY: Float,
    val accelZ: Float,
    val gyroX: Float = 0f,
    val gyroY: Float = 0f,
    val gyroZ: Float = 0f,
    val timestampMs: Long = System.currentTimeMillis()
)

data class CrashCandidate(
    val peakGForce: Float,
    val preCrashSpeedKmh: Float,
    val timestampMs: Long,
    val latitude: Double,
    val longitude: Double,
    val isConfirmedCrash: Boolean
)

enum class CrashEscalationState {
    MONITORING,
    COUNTDOWN_ACTIVE, // 30-second audible countdown window
    DISPATCHED,       // Circle members and emergency services notified
    CANCELLED_BY_USER // User tapped "I'm OK"
}

class Life360CrashDetectionEngine(
    private val crashGForceThreshold: Float = 4.5f,     // Standard vehicle collision trigger: 4.5G
    private val minPreCollisionSpeedKmh: Float = 35.0f, // Must be driving before collision
    private val countdownDurationSec: Int = 30
) {

    private var preCrashSpeedKmh = 0f
    private var lastSpeedUpdateMs = 0L
    private var escalationState = CrashEscalationState.MONITORING
    private var activeCrashEvent: CrashCandidate? = null
    private var countdownStartMs = 0L

    fun updateVehicleSpeed(speedKmh: Float, timestampMs: Long) {
        this.preCrashSpeedKmh = speedKmh
        this.lastSpeedUpdateMs = timestampMs
    }

    /**
     * Evaluates continuous 100Hz/50Hz IMU sensor streams.
     * Computes resultant G-force: |a| = sqrt(x^2 + y^2 + z^2) / 9.80665
     */
    fun processImuSample(sample: ImuSample, currentLat: Double, currentLng: Double): CrashCandidate? {
        if (escalationState != CrashEscalationState.MONITORING) return null

        val rawMagnitude = sqrt(
            sample.accelX * sample.accelX +
            sample.accelY * sample.accelY +
            sample.accelZ * sample.accelZ
        )

        val gForce = rawMagnitude / 9.80665f

        // Condition 1: Severe Impact G-Force
        if (gForce >= crashGForceThreshold) {
            // Condition 2: Vehicle Velocity Validation (Eliminates phone drops while stationary)
            val isDrivingSpeed = preCrashSpeedKmh >= minPreCollisionSpeedKmh
            val speedIsFresh = (sample.timestampMs - lastSpeedUpdateMs) < 5000 // Speed reading within 5s

            if (isDrivingSpeed && speedIsFresh) {
                val crash = CrashCandidate(
                    peakGForce = gForce,
                    preCrashSpeedKmh = preCrashSpeedKmh,
                    timestampMs = sample.timestampMs,
                    latitude = currentLat,
                    longitude = currentLng,
                    isConfirmedCrash = true
                )

                // Trigger 30-second cancellation countdown
                this.activeCrashEvent = crash
                this.escalationState = CrashEscalationState.COUNTDOWN_ACTIVE
                this.countdownStartMs = sample.timestampMs

                return crash
            }
        }

        return null
    }

    /**
     * Called when user taps "I'm OK, it was a false alarm" within the countdown window.
     */
    fun cancelCrashAlert(): Boolean {
        if (escalationState == CrashEscalationState.COUNTDOWN_ACTIVE) {
            escalationState = CrashEscalationState.CANCELLED_BY_USER
            activeCrashEvent = null
            return true
        }
        return false
    }

    /**
     * Periodic watchdog tick evaluating whether the 30-second window expired without user cancellation.
     */
    fun evaluateCountdownTick(currentTimeMs: Long): Boolean {
        if (escalationState == CrashEscalationState.COUNTDOWN_ACTIVE) {
            val elapsedSec = (currentTimeMs - countdownStartMs) / 1000
            if (elapsedSec >= countdownDurationSec) {
                // Countdown expired -> Dispatch emergency alerts!
                escalationState = CrashEscalationState.DISPATCHED
                return true // Trigger immediate push + SMS broadcast
            }
        }
        return false
    }

    fun getEscalationState(): CrashEscalationState = escalationState
    fun getActiveCrash(): CrashCandidate? = activeCrashEvent
}
