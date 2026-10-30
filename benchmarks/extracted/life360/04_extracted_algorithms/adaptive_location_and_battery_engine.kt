package com.familyos.engine.location

import kotlin.math.sqrt
import kotlin.math.pow

/**
 * ============================================================================
 * Family OS — Reconstructed Adaptive Location & Battery Optimization Engine
 * Derived from Life360 Architecture (com.life360.android.location & awarenessengine)
 *
 * Implements:
 * 1. Motion State Machine (STATIONARY, WALKING, IN_VEHICLE, BIKING)
 * 2. 1D/2D Kalman Filter for GPS drift reduction and location smoothing
 * 3. Dynamic GPS Polling & Accuracy Adjustment to minimize battery consumption
 * 4. Movement Thresholds & Geofence Dwell Hysteresis
 * ============================================================================
 */

enum class MotionActivityType {
    STATIONARY,
    WALKING,
    RUNNING,
    BIKING,
    IN_VEHICLE,
    UNKNOWN
}

data class RawLocationPoint(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val speed: Float, // meters/sec
    val bearing: Float,
    val timestampMs: Long
)

data class SmoothedLocationPoint(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val speedKmh: Float,
    val bearing: Float,
    val motionType: MotionActivityType,
    val isDwellPoint: Boolean,
    val timestampMs: Long
)

class GpsKalmanFilter {
    private var variance: Double = -1.0
    private var lat: Double = 0.0
    private var lng: Double = 0.0
    private var lastTimestampMs: Long = 0

    // Standard deviation of GPS process noise in meters/sec
    private val processNoiseQMetersPerSecond = 3.0

    fun reset() {
        variance = -1.0
    }

    /**
     * Filters raw GPS coordinates using a continuous-time Kalman filter.
     * Reduces jitter when stationary and smooths polyline trajectories while in motion.
     */
    fun filter(rawLat: Double, rawLng: Double, accuracy: Float, timestampMs: Long): Pair<Double, Double> {
        val accuracyMeters = if (accuracy < 1.0f) 1.0f else accuracy

        if (variance < 0) {
            // Initial state
            this.lat = rawLat
            this.lng = rawLng
            this.variance = (accuracyMeters * accuracyMeters).toDouble()
            this.lastTimestampMs = timestampMs
            return Pair(lat, lng)
        }

        val dt = (timestampMs - lastTimestampMs) / 1000.0
        if (dt > 0) {
            // Apply process variance increment over elapsed time
            variance += dt * processNoiseQMetersPerSecond * processNoiseQMetersPerSecond
            lastTimestampMs = timestampMs
        }

        // Kalman gain calculation
        val measurementVariance = (accuracyMeters * accuracyMeters).toDouble()
        val kalmanGain = variance / (variance + measurementVariance)

        // State update
        lat += kalmanGain * (rawLat - lat)
        lng += kalmanGain * (rawLng - lng)

        // Covariance update
        variance = (1.0 - kalmanGain) * variance

        return Pair(lat, lng)
    }
}

class AdaptiveLocationEngine(
    private val onLocationUpdated: (SmoothedLocationPoint) -> Unit,
    private val onEngineStateChanged: (MotionActivityType, Long) -> Unit
) {
    private val kalmanFilter = GpsKalmanFilter()
    private var currentActivity: MotionActivityType = MotionActivityType.STATIONARY
    private var lastRecordedLocation: RawLocationPoint? = null
    private var dwellCounterSeconds: Int = 0

    companion object {
        const val STATIONARY_SPEED_THRESHOLD_KMH = 3.0f
        const val DRIVING_SPEED_THRESHOLD_KMH = 15.0f
        const val STATIONARY_POLL_INTERVAL_MS = 120_000L // 2 minutes (passive Wi-Fi)
        const val WALKING_POLL_INTERVAL_MS = 30_000L    // 30 seconds
        const val DRIVING_POLL_INTERVAL_MS = 2_000L     // 2 seconds (high precision)
        const val MAX_VALID_ACCURACY_METERS = 65.0f
    }

    /**
     * Transition received from Google Play Services Activity Recognition API
     */
    fun onActivityTransitionDetected(type: MotionActivityType, confidence: Int) {
        if (confidence < 70) return // Ignore noisy transitions

        if (this.currentActivity != type) {
            this.currentActivity = type
            val recommendedPollInterval = when (type) {
                MotionActivityType.STATIONARY -> STATIONARY_POLL_INTERVAL_MS
                MotionActivityType.WALKING, MotionActivityType.RUNNING -> WALKING_POLL_INTERVAL_MS
                MotionActivityType.IN_VEHICLE -> DRIVING_POLL_INTERVAL_MS
                MotionActivityType.BIKING -> 5_000L
                MotionActivityType.UNKNOWN -> WALKING_POLL_INTERVAL_MS
            }
            onEngineStateChanged(type, recommendedPollInterval)
        }
    }

    /**
     * Ingestion of raw location coordinate updates from FusedLocationProviderClient
     */
    fun processRawLocation(raw: RawLocationPoint) {
        // 1. Accuracy Sanity Filter (Reject low confidence GPS spikes)
        if (raw.accuracy > MAX_VALID_ACCURACY_METERS) {
            return
        }

        val speedKmh = raw.speed * 3.6f

        // 2. Dynamic Motion Fallback (if Activity Recognition is latent)
        if (speedKmh > DRIVING_SPEED_THRESHOLD_KMH && currentActivity != MotionActivityType.IN_VEHICLE) {
            currentActivity = MotionActivityType.IN_VEHICLE
            onEngineStateChanged(currentActivity, DRIVING_POLL_INTERVAL_MS)
        } else if (speedKmh < STATIONARY_SPEED_THRESHOLD_KMH) {
            dwellCounterSeconds += ((raw.timestampMs - (lastRecordedLocation?.timestampMs ?: raw.timestampMs)) / 1000).toInt()
            if (dwellCounterSeconds > 300 && currentActivity != MotionActivityType.STATIONARY) {
                currentActivity = MotionActivityType.STATIONARY
                onEngineStateChanged(currentActivity, STATIONARY_POLL_INTERVAL_MS)
            }
        } else {
            dwellCounterSeconds = 0
        }

        // 3. Kalman Filter Coordinate Smoothing
        val (smoothedLat, smoothedLng) = kalmanFilter.filter(
            raw.latitude,
            raw.longitude,
            raw.accuracy,
            raw.timestampMs
        )

        val isDwell = (currentActivity == MotionActivityType.STATIONARY && dwellCounterSeconds > 180)

        val output = SmoothedLocationPoint(
            latitude = smoothedLat,
            longitude = smoothedLng,
            accuracy = raw.accuracy,
            speedKmh = speedKmh,
            bearing = raw.bearing,
            motionType = currentActivity,
            isDwellPoint = isDwell,
            timestampMs = raw.timestampMs
        )

        lastRecordedLocation = raw
        onLocationUpdated(output)
    }
}
