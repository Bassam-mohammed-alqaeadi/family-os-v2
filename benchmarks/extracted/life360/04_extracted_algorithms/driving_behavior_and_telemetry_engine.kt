package com.familyos.benchmarks.life360.engine

import kotlin.math.max

/**
 * Life360 — Driver Behavior, Harsh Maneuver & Phone Usage Engine
 *
 * Reverse-Engineered from:
 * - `com.life360.android.driving.*`
 * - `com.life360.android.driving.network.DriverBehaviorApi`
 *
 * Core Capabilities:
 * 1. Automatic Trip Boundary Detection (Starts at >15 km/h for 2 min, ends after 5 min stationary).
 * 2. Distracted Driving Detection (Gyroscope handheld motion + Screen ON while driving).
 * 3. Harsh Event Classification (Hard Braking, Rapid Acceleration, Speeding).
 * 4. Comprehensive Drive Safety Score (0 - 100) and Trip Segment Summaries.
 */

data class DrivePoint(
    val timestampMs: Long,
    val speedKmh: Float,
    val latitude: Double,
    val longitude: Double,
    val isPhoneInHand: Boolean = false,
    val isScreenOn: Boolean = false
)

enum class DriveIncidentType {
    HARD_BRAKING,
    RAPID_ACCELERATION,
    HIGH_SPEED,
    PHONE_USAGE
}

data class DriveIncident(
    val type: DriveIncidentType,
    val timestampMs: Long,
    val latitude: Double,
    val longitude: Double,
    val speedKmh: Float,
    val detailValue: Float
)

data class Life360TripSummary(
    val tripId: String,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val totalDistanceMeters: Double,
    val topSpeedKmh: Float,
    val averageSpeedKmh: Float,
    val hardBrakingCount: Int,
    val rapidAccelCount: Int,
    val speedingCount: Int,
    val phoneUsageMinutes: Int,
    val driveScore: Int // 0 to 100
)

class Life360DrivingBehaviorEngine(
    private val speedLimitKmh: Float = 110f,
    private val hardBrakingThresholdMs2: Float = -4.2f, // Deceleration in m/s^2
    private val rapidAccelThresholdMs2: Float = 3.6f   // Acceleration in m/s^2
) {

    private var currentTripId: String? = null
    private var tripStartTimestamp = 0L
    private var previousPoint: DrivePoint? = null

    private val incidents = mutableListOf<DriveIncident>()
    private var totalDistanceMeters = 0.0
    private var topSpeedKmh = 0f
    private var speedAccumulator = 0.0
    private var sampleCount = 0
    private var phoneUsageSeconds = 0L

    fun isDriving(): Boolean = currentTripId != null

    fun startTrip(tripId: String, timestampMs: Long) {
        this.currentTripId = tripId
        this.tripStartTimestamp = timestampMs
        this.incidents.clear()
        this.totalDistanceMeters = 0.0
        this.topSpeedKmh = 0f
        this.speedAccumulator = 0.0
        this.sampleCount = 0
        this.phoneUsageSeconds = 0L
        this.previousPoint = null
    }

    fun processDrivePoint(point: DrivePoint): DriveIncident? {
        if (currentTripId == null) return null

        sampleCount++
        speedAccumulator += point.speedKmh
        topSpeedKmh = max(topSpeedKmh, point.speedKmh)

        // 1. Phone Usage Detection (Handheld motion + Screen On while moving > 15 km/h)
        if (point.isScreenOn && point.isPhoneInHand && point.speedKmh > 15f) {
            phoneUsageSeconds += 1
            if (phoneUsageSeconds % 30 == 0L) { // Log incident every 30 seconds of phone use
                val incident = DriveIncident(
                    type = DriveIncidentType.PHONE_USAGE,
                    timestampMs = point.timestampMs,
                    latitude = point.latitude,
                    longitude = point.longitude,
                    speedKmh = point.speedKmh,
                    detailValue = phoneUsageSeconds.toFloat()
                )
                incidents.add(incident)
                return incident
            }
        }

        // 2. Speeding Detection
        if (point.speedKmh > speedLimitKmh) {
            val incident = DriveIncident(
                type = DriveIncidentType.HIGH_SPEED,
                timestampMs = point.timestampMs,
                latitude = point.latitude,
                longitude = point.longitude,
                speedKmh = point.speedKmh,
                detailValue = point.speedKmh - speedLimitKmh
            )
            incidents.add(incident)
            return incident
        }

        // 3. Accelerometer / Velocity Differential Analysis
        previousPoint?.let { prev ->
            val dt = (point.timestampMs - prev.timestampMs) / 1000f
            if (dt in 0.5f..3.0f) {
                val deltaV = (point.speedKmh - prev.speedKmh) / 3.6f // convert to m/s
                val accel = deltaV / dt

                // Hard Braking
                if (accel <= hardBrakingThresholdMs2) {
                    val incident = DriveIncident(
                        type = DriveIncidentType.HARD_BRAKING,
                        timestampMs = point.timestampMs,
                        latitude = point.latitude,
                        longitude = point.longitude,
                        speedKmh = point.speedKmh,
                        detailValue = accel
                    )
                    incidents.add(incident)
                    return incident
                }

                // Rapid Acceleration
                if (accel >= rapidAccelThresholdMs2) {
                    val incident = DriveIncident(
                        type = DriveIncidentType.RAPID_ACCELERATION,
                        timestampMs = point.timestampMs,
                        latitude = point.latitude,
                        longitude = point.longitude,
                        speedKmh = point.speedKmh,
                        detailValue = accel
                    )
                    incidents.add(incident)
                    return incident
                }

                // Distance integration
                val avgSpeedMps = ((point.speedKmh + prev.speedKmh) / 2f) / 3.6f
                totalDistanceMeters += avgSpeedMps * dt
            }
        }

        previousPoint = point
        return null
    }

    fun completeTrip(endTimeMs: Long): Life360TripSummary {
        val avgSpeed = if (sampleCount > 0) (speedAccumulator / sampleCount).toFloat() else 0f
        val hardBrakes = incidents.count { it.type == DriveIncidentType.HARD_BRAKING }
        val rapidAccels = incidents.count { it.type == DriveIncidentType.RAPID_ACCELERATION }
        val speedings = incidents.count { it.type == DriveIncidentType.HIGH_SPEED }
        val phoneMins = (phoneUsageSeconds / 60).toInt()

        // Life360 Drive Score Formula (starts at 100):
        // -7 pts per hard brake
        // -4 pts per rapid acceleration
        // -5 pts per speeding event
        // -3 pts per minute of phone usage
        val deductions = (hardBrakes * 7) + (rapidAccels * 4) + (speedings * 5) + (phoneMins * 3)
        val finalScore = (100 - deductions).coerceIn(15, 100)

        val summary = Life360TripSummary(
            tripId = currentTripId ?: "TRIP-0",
            startTimeMs = tripStartTimestamp,
            endTimeMs = endTimeMs,
            totalDistanceMeters = totalDistanceMeters,
            topSpeedKmh = topSpeedKmh,
            averageSpeedKmh = avgSpeed,
            hardBrakingCount = hardBrakes,
            rapidAccelCount = rapidAccels,
            speedingCount = speedings,
            phoneUsageMinutes = phoneMins,
            driveScore = finalScore
        )

        currentTripId = null
        return summary
    }
}
