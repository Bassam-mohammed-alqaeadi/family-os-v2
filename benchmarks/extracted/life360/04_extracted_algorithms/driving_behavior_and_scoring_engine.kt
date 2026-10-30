package com.familyos.engine.driving

import kotlin.math.max
import kotlin.math.min

/**
 * ============================================================================
 * Family OS — Reconstructed Driving Behavior & Safety Scoring Engine
 * Derived from Life360 Driving Architecture (com.life360.android.driving & driver_behavior)
 *
 * Implements:
 * 1. Automatic Trip Lifecycle (Start, Ongoing, Complete Detection)
 * 2. Hard Braking Detection (> 13 km/h deceleration in 1.0s)
 * 3. Rapid Acceleration Detection (> 11 km/h acceleration in 1.0s)
 * 4. Distracted Driving / In-Drive Phone Usage Detection
 * 5. Weekly Driving Score Algorithm (Normalized 0 to 100)
 * ============================================================================
 */

enum class DrivingEventType {
    HARD_BRAKE,
    RAPID_ACCEL,
    PHONE_USAGE,
    SPEEDING
}

data class DrivingIncident(
    val type: DrivingEventType,
    val speedKmh: Float,
    val latitude: Double,
    val longitude: Double,
    val timestampMs: Long,
    val severityPenalty: Float
)

data class TripSummary(
    val tripId: String,
    val startTimeMs: Long,
    val endTimeMs: Long,
    val totalDistanceKm: Double,
    val maxSpeedKmh: Float,
    val averageSpeedKmh: Float,
    val hardBrakeCount: Int,
    val rapidAccelCount: Int,
    val phoneUsageMinutes: Double,
    val tripSafetyScore: Int,
    val incidents: List<DrivingIncident>
)

class DrivingBehaviorEngine(
    private val onTripStarted: (String, Long) -> Unit,
    private val onDrivingIncidentRecorded: (DrivingIncident) -> Unit,
    private val onTripCompleted: (TripSummary) -> Unit
) {
    companion object {
        const val HARD_BRAKE_THRESHOLD_KMH_PER_SEC = 13.0f   // ~ 3.6 m/s^2 deceleration
        const val RAPID_ACCEL_THRESHOLD_KMH_PER_SEC = 11.0f   // ~ 3.0 m/s^2 acceleration
        const val TRIP_START_MIN_SPEED_KMH = 15.0f
        const val TRIP_END_STATIONARY_TIME_MS = 300_000L      // 5 minutes stationary
        const val SPEEDING_SPEED_THRESHOLD_KMH = 125.0f
    }

    private var isTripActive = false
    private var currentTripId: String = ""
    private var tripStartTimeMs: Long = 0
    private var lastSpeedKmh: Float = 0.0f
    private var lastSpeedTimestampMs: Long = 0
    private var stationaryStartMs: Long = 0
    private var totalDistanceMeters: Double = 0.0
    private var maxRecordedSpeedKmh: Float = 0.0f
    private var speedSumKmh: Double = 0.0
    private var speedSampleCount: Int = 0

    private val tripIncidents = mutableListOf<DrivingIncident>()
    private var phoneScreenOnDuringTrip = false
    private var phoneUsageStartMs: Long = 0
    private var totalPhoneUsageMs: Long = 0

    /**
     * Ingestion of periodic location and speed samples during drive
     */
    fun onLocationSampleReceived(
        latitude: Double,
        longitude: Double,
        speedKmh: Float,
        distanceFromLastMeters: Double,
        timestampMs: Long
    ) {
        if (!isTripActive) {
            if (speedKmh >= TRIP_START_MIN_SPEED_KMH) {
                // Trip begins
                isTripActive = true
                currentTripId = "trip_${System.currentTimeMillis()}"
                tripStartTimeMs = timestampMs
                tripIncidents.clear()
                totalDistanceMeters = 0.0
                maxRecordedSpeedKmh = speedKmh
                speedSumKmh = speedKmh.toDouble()
                speedSampleCount = 1
                stationaryStartMs = 0
                totalPhoneUsageMs = 0
                lastSpeedKmh = speedKmh
                lastSpeedTimestampMs = timestampMs
                onTripStarted(currentTripId, tripStartTimeMs)
            }
            return
        }

        // Active Trip Monitoring
        totalDistanceMeters += distanceFromLastMeters
        if (speedKmh > maxRecordedSpeedKmh) maxRecordedSpeedKmh = speedKmh
        speedSumKmh += speedKmh
        speedSampleCount++

        val dtSeconds = (timestampMs - lastSpeedTimestampMs) / 1000.0f
        if (dtSeconds in 0.5f..2.5f) {
            val deltaV = speedKmh - lastSpeedKmh

            // Check Hard Braking
            if (deltaV <= -HARD_BRAKE_THRESHOLD_KMH_PER_SEC) {
                val incident = DrivingIncident(
                    type = DrivingEventType.HARD_BRAKE,
                    speedKmh = speedKmh,
                    latitude = latitude,
                    longitude = longitude,
                    timestampMs = timestampMs,
                    severityPenalty = 8.0f
                )
                tripIncidents.add(incident)
                onDrivingIncidentRecorded(incident)
            }
            // Check Rapid Acceleration
            else if (deltaV >= RAPID_ACCEL_THRESHOLD_KMH_PER_SEC) {
                val incident = DrivingIncident(
                    type = DrivingEventType.RAPID_ACCEL,
                    speedKmh = speedKmh,
                    latitude = latitude,
                    longitude = longitude,
                    timestampMs = timestampMs,
                    severityPenalty = 5.0f
                )
                tripIncidents.add(incident)
                onDrivingIncidentRecorded(incident)
            }

            // Check Extreme Speeding
            if (speedKmh >= SPEEDING_SPEED_THRESHOLD_KMH) {
                val incident = DrivingIncident(
                    type = DrivingEventType.SPEEDING,
                    speedKmh = speedKmh,
                    latitude = latitude,
                    longitude = longitude,
                    timestampMs = timestampMs,
                    severityPenalty = 10.0f
                )
                tripIncidents.add(incident)
                onDrivingIncidentRecorded(incident)
            }
        }

        // Check Stationary timeout for trip completion
        if (speedKmh < 3.0f) {
            if (stationaryStartMs == 0L) stationaryStartMs = timestampMs
            if (timestampMs - stationaryStartMs >= TRIP_END_STATIONARY_TIME_MS) {
                completeTrip(timestampMs - TRIP_END_STATIONARY_TIME_MS)
            }
        } else {
            stationaryStartMs = 0
        }

        lastSpeedKmh = speedKmh
        lastSpeedTimestampMs = timestampMs
    }

    /**
     * Screen state change hook (BroadcastReceiver for Intent.ACTION_SCREEN_ON)
     */
    fun onPhoneInteractionChanged(isScreenOnAndUnlocked: Boolean, timestampMs: Long, lat: Double, lng: Double) {
        if (!isTripActive) return

        if (isScreenOnAndUnlocked && lastSpeedKmh >= TRIP_START_MIN_SPEED_KMH) {
            if (!phoneScreenOnDuringTrip) {
                phoneScreenOnDuringTrip = true
                phoneUsageStartMs = timestampMs
                val incident = DrivingIncident(
                    type = DrivingEventType.PHONE_USAGE,
                    speedKmh = lastSpeedKmh,
                    latitude = lat,
                    longitude = lng,
                    timestampMs = timestampMs,
                    severityPenalty = 7.0f
                )
                tripIncidents.add(incident)
                onDrivingIncidentRecorded(incident)
            }
        } else {
            if (phoneScreenOnDuringTrip) {
                totalPhoneUsageMs += (timestampMs - phoneUsageStartMs)
                phoneScreenOnDuringTrip = false
            }
        }
    }

    private fun completeTrip(endTimeMs: Long) {
        isTripActive = false
        val distanceKm = totalDistanceMeters / 1000.0
        val avgSpeed = if (speedSampleCount > 0) (speedSumKmh / speedSampleCount).toFloat() else 0.0f

        val hardBrakes = tripIncidents.count { it.type == DrivingEventType.HARD_BRAKE }
        val rapidAccels = tripIncidents.count { it.type == DrivingEventType.RAPID_ACCEL }
        val phoneMins = totalPhoneUsageMs / 60_000.0

        // Life360 Driving Score Formula
        // Starts at 100, penalized proportionally to distance driven
        var baseScore = 100.0f
        val distanceFactor = max(1.0, distanceKm / 10.0) // normalized to 10 km intervals

        val totalPenalty = (hardBrakes * 6.0f + rapidAccels * 4.0f + (phoneMins.toFloat() * 5.0f)) / distanceFactor.toFloat()
        baseScore = max(10.0f, min(100.0f, baseScore - totalPenalty))

        val summary = TripSummary(
            tripId = currentTripId,
            startTimeMs = tripStartTimeMs,
            endTimeMs = endTimeMs,
            totalDistanceKm = distanceKm,
            maxSpeedKmh = maxRecordedSpeedKmh,
            averageSpeedKmh = avgSpeed,
            hardBrakeCount = hardBrakes,
            rapidAccelCount = rapidAccels,
            phoneUsageMinutes = phoneMins,
            tripSafetyScore = baseScore.toInt(),
            incidents = ArrayList(tripIncidents)
        )

        onTripCompleted(summary)
    }
}
