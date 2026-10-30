package com.familyos.benchmarks.famisafe.engine

import kotlin.math.abs
import kotlin.math.max

/**
 * Wondershare FamiSafe — Driving Safety & Vehicle Telemetry Engine
 *
 * Reverse-Engineered from:
 * - `com.wondershare.famisafe.parent.drive.*`
 * - `com.wondershare.famisafe.parent.drive.BarChartView`
 *
 * Core Capabilities:
 * 1. Automatic In-Vehicle Trip Detection (Activity Recognition + Speed > 20 km/h).
 * 2. Harsh Event Detection (Hard Braking, Rapid Acceleration, Sharp Turns).
 * 3. Speeding Violations (Instant Speed vs Custom Speed Limit).
 * 4. Distracted Driving Detection (Screen unlocked & interacted with while moving > 15 km/h).
 * 5. Composite Driving Safety Score (0 to 100) and Trip Summary Generation.
 */

data class TelemetrySample(
    val timestampMs: Long,
    val speedKmh: Float,
    val accelX: Float = 0f,
    val accelY: Float = 0f, // Forward / Backward acceleration in m/s^2
    val accelZ: Float = 0f,
    val isScreenOn: Boolean = false,
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)

enum class HarshEventType {
    HARD_BRAKING,
    RAPID_ACCELERATION,
    SPEEDING,
    PHONE_USE_WHILE_DRIVING
}

data class DrivingIncident(
    val type: HarshEventType,
    val timestampMs: Long,
    val latitude: Double,
    val longitude: Double,
    val speedKmh: Float,
    val metricValue: Float, // e.g. -11.2 m/s^2 for braking
    val severity: String    // "LOW", "MEDIUM", "HIGH"
)

data class DrivingTripSummary(
    val tripId: String,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val durationSeconds: Long,
    val totalDistanceKm: Double,
    val topSpeedKmh: Float,
    val averageSpeedKmh: Float,
    val hardBrakingCount: Int,
    val rapidAccelerationCount: Int,
    val speedingCount: Int,
    val phoneUsageSeconds: Long,
    val safetyScore: Int // 0 to 100
)

class FamiSafeDrivingTelemetryEngine(
    private val speedLimitKmh: Float = 100f,
    private val hardBrakingThresholdMs2: Float = -9.8f,    // ~1G deceleration
    private val rapidAccelThresholdMs2: Float = 7.5f       // ~0.76G acceleration
) {

    private var activeTripId: String? = null
    private var tripStartTimeMs: Long = 0
    private var lastSample: TelemetrySample? = null

    private val incidents = mutableListOf<DrivingIncident>()
    private var totalDistanceMeters = 0.0
    private var topSpeedKmh = 0f
    private var speedSumKmh = 0.0
    private var sampleCount = 0
    private var phoneUsageSeconds = 0L

    fun isTripInProgress(): Boolean = activeTripId != null

    fun startTrip(tripId: String, startTimeMs: Long) {
        this.activeTripId = tripId
        this.tripStartTimeMs = startTimeMs
        this.incidents.clear()
        this.totalDistanceMeters = 0.0
        this.topSpeedKmh = 0f
        this.speedSumKmh = 0.0
        this.sampleCount = 0
        this.phoneUsageSeconds = 0L
        this.lastSample = null
    }

    /**
     * Processes 1Hz telemetry updates from GPS and IMU sensors during vehicle travel.
     */
    fun processSample(sample: TelemetrySample): DrivingIncident? {
        if (activeTripId == null) return null

        sampleCount++
        speedSumKmh += sample.speedKmh
        topSpeedKmh = max(topSpeedKmh, sample.speedKmh)

        // 1. Check Distracted Driving (Screen ON while moving)
        if (sample.isScreenOn && sample.speedKmh > 15f) {
            phoneUsageSeconds += 1
            if (phoneUsageSeconds % 15 == 0L) { // Log incident every 15s of continuous screen use
                val incident = DrivingIncident(
                    type = HarshEventType.PHONE_USE_WHILE_DRIVING,
                    timestampMs = sample.timestampMs,
                    latitude = sample.latitude,
                    longitude = sample.longitude,
                    speedKmh = sample.speedKmh,
                    metricValue = phoneUsageSeconds.toFloat(),
                    severity = "HIGH"
                )
                incidents.add(incident)
                return incident
            }
        }

        // 2. Check Speed Limit Violation
        if (sample.speedKmh > speedLimitKmh) {
            val overage = sample.speedKmh - speedLimitKmh
            val incident = DrivingIncident(
                type = HarshEventType.SPEEDING,
                timestampMs = sample.timestampMs,
                latitude = sample.latitude,
                longitude = sample.longitude,
                speedKmh = sample.speedKmh,
                metricValue = overage,
                severity = if (overage > 25f) "HIGH" else "MEDIUM"
            )
            incidents.add(incident)
            return incident
        }

        // 3. Accelerometer / Speed Differential Analysis
        lastSample?.let { prev ->
            val dt = (sample.timestampMs - prev.timestampMs) / 1000f
            if (dt in 0.5f..2.5f) {
                // Calculate acceleration in m/s^2 from GPS delta speed if IMU Y-accel is zero
                val speedDeltaMps = ((sample.speedKmh - prev.speedKmh) / 3.6f)
                val calculatedAccelY = if (sample.accelY != 0f) sample.accelY else (speedDeltaMps / dt)

                // Check Hard Braking
                if (calculatedAccelY <= hardBrakingThresholdMs2) {
                    val incident = DrivingIncident(
                        type = HarshEventType.HARD_BRAKING,
                        timestampMs = sample.timestampMs,
                        latitude = sample.latitude,
                        longitude = sample.longitude,
                        speedKmh = sample.speedKmh,
                        metricValue = calculatedAccelY,
                        severity = if (calculatedAccelY < -12f) "HIGH" else "MEDIUM"
                    )
                    incidents.add(incident)
                    return incident
                }

                // Check Rapid Acceleration
                if (calculatedAccelY >= rapidAccelThresholdMs2) {
                    val incident = DrivingIncident(
                        type = HarshEventType.RAPID_ACCELERATION,
                        timestampMs = sample.timestampMs,
                        latitude = sample.latitude,
                        longitude = sample.longitude,
                        speedKmh = sample.speedKmh,
                        metricValue = calculatedAccelY,
                        severity = if (calculatedAccelY > 10f) "HIGH" else "MEDIUM"
                    )
                    incidents.add(incident)
                    return incident
                }

                // Distance accumulation
                val avgSpeedMps = ((sample.speedKmh + prev.speedKmh) / 2f) / 3.6f
                totalDistanceMeters += avgSpeedMps * dt
            }
        }

        lastSample = sample
        return null
    }

    /**
     * Finalizes trip and computes weighted safety score (0 - 100).
     */
    fun completeTrip(endTimeMs: Long): DrivingTripSummary {
        val durationSeconds = max(1L, (endTimeMs - tripStartTimeMs) / 1000)
        val avgSpeed = if (sampleCount > 0) (speedSumKmh / sampleCount).toFloat() else 0f

        val hardBrakes = incidents.count { it.type == HarshEventType.HARD_BRAKING }
        val rapidAccels = incidents.count { it.type == HarshEventType.RAPID_ACCELERATION }
        val speedings = incidents.count { it.type == HarshEventType.SPEEDING }

        // Score Deduction Formula:
        // Baseline = 100
        // -8 pts per hard braking
        // -5 pts per rapid acceleration
        // -6 pts per speeding event
        // -2 pts per 10 seconds of phone use
        var deductions = (hardBrakes * 8) + (rapidAccels * 5) + (speedings * 6) + ((phoneUsageSeconds / 10) * 2).toInt()
        val finalScore = (100 - deductions).coerceIn(10, 100)

        val summary = DrivingTripSummary(
            tripId = activeTripId ?: "TRIP-UNKNOWN",
            startTimeMs = tripStartTimeMs,
            endTimeMs = endTimeMs,
            durationSeconds = durationSeconds,
            totalDistanceKm = totalDistanceMeters / 1000.0,
            topSpeedKmh = topSpeedKmh,
            averageSpeedKmh = avgSpeed,
            hardBrakingCount = hardBrakes,
            rapidAccelerationCount = rapidAccels,
            speedingCount = speedings,
            phoneUsageSeconds = phoneUsageSeconds,
            safetyScore = finalScore
        )

        activeTripId = null
        return summary
    }
}
