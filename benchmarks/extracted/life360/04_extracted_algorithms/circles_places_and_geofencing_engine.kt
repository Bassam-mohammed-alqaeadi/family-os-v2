package com.familyos.engine.geofence

import kotlin.math.*

/**
 * ============================================================================
 * Family OS — Reconstructed Circles, Places & Geofencing Engine
 * Derived from Life360 Geofencing Architecture (com.life360.android.awarenessengine & placesearch)
 *
 * Implements:
 * 1. Multi-Circle Place Definition & State Storage
 * 2. High-Precision Haversine Geodesic Distance Matrix
 * 3. Boundary Hysteresis & Dwell Time Filtering (Zero-Oscillation Flapping)
 * 4. Enter / Exit Notification Dispatch Engine
 * ============================================================================
 */

data class PlaceGeofence(
    val placeId: String,
    val circleId: String,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val radiusMeters: Double,
    val notifyOnEnter: Boolean = true,
    val notifyOnExit: Boolean = true
)

enum class GeofenceTransition {
    ENTER,
    EXIT,
    DWELL_INSIDE,
    STATIONARY_OUTSIDE
}

data class MemberPlaceState(
    val memberId: String,
    val placeId: String,
    var isInside: Boolean,
    var firstEnteredTimestampMs: Long,
    var lastUpdatedTimestampMs: Long,
    var isDwellConfirmed: Boolean = false
)

class CirclesGeofencingEngine(
    private val onGeofenceAlertTriggered: (circleId: String, memberId: String, placeName: String, transition: GeofenceTransition) -> Unit
) {
    companion object {
        const val EARTH_RADIUS_METERS = 6371000.0
        const val HYSTERESIS_BUFFER_METERS = 15.0     // Buffer zone to eliminate edge bouncing
        const val MIN_DWELL_CONFIRMATION_MS = 60_000L // 60 seconds continuous presence required
    }

    private val placesMap = mutableMapOf<String, PlaceGeofence>()
    private val memberStates = mutableMapOf<String, MemberPlaceState>() // Key: "$memberId:$placeId"

    fun registerPlace(place: PlaceGeofence) {
        placesMap[place.placeId] = place
    }

    fun unregisterPlace(placeId: String) {
        placesMap.remove(placeId)
    }

    /**
     * Evaluates a member's updated coordinates against all relevant circle places
     */
    fun evaluateMemberLocation(
        memberId: String,
        circleId: String,
        latitude: Double,
        longitude: Double,
        accuracyMeters: Float,
        timestampMs: Long
    ) {
        val circlePlaces = placesMap.values.filter { it.circleId == circleId }

        for (place in circlePlaces) {
            val key = "$memberId:${place.placeId}"
            val distance = calculateHaversineDistanceMeters(
                latitude, longitude,
                place.latitude, place.longitude
            )

            val currentState = memberStates[key] ?: MemberPlaceState(
                memberId = memberId,
                placeId = place.placeId,
                isInside = false,
                firstEnteredTimestampMs = 0L,
                lastUpdatedTimestampMs = timestampMs
            )

            // Effective radius with boundary hysteresis
            val enterThreshold = place.radiusMeters
            val exitThreshold = place.radiusMeters + HYSTERESIS_BUFFER_METERS

            if (!currentState.isInside) {
                // Check if member entered the place
                if (distance <= enterThreshold) {
                    currentState.isInside = true
                    currentState.firstEnteredTimestampMs = timestampMs
                    currentState.lastUpdatedTimestampMs = timestampMs
                    currentState.isDwellConfirmed = false
                    memberStates[key] = currentState
                }
            } else {
                // Member currently inside
                if (distance > exitThreshold) {
                    // Confirmed Exit
                    currentState.isInside = false
                    currentState.isDwellConfirmed = false
                    currentState.lastUpdatedTimestampMs = timestampMs
                    memberStates[key] = currentState

                    if (place.notifyOnExit) {
                        onGeofenceAlertTriggered(
                            place.circleId,
                            memberId,
                            place.name,
                            GeofenceTransition.EXIT
                        )
                    }
                } else {
                    // Still inside, check dwell time
                    if (!currentState.isDwellConfirmed) {
                        val dwellDuration = timestampMs - currentState.firstEnteredTimestampMs
                        if (dwellDuration >= MIN_DWELL_CONFIRMATION_MS) {
                            currentState.isDwellConfirmed = true
                            memberStates[key] = currentState

                            if (place.notifyOnEnter) {
                                onGeofenceAlertTriggered(
                                    place.circleId,
                                    memberId,
                                    place.name,
                                    GeofenceTransition.ENTER
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    private fun calculateHaversineDistanceMeters(
        lat1: Double, lon1: Double,
        lat2: Double, lon2: Double
    ): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val rLat1 = Math.toRadians(lat1)
        val rLat2 = Math.toRadians(lat2)

        val a = sin(dLat / 2).pow(2) +
                cos(rLat1) * cos(rLat2) * sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return EARTH_RADIUS_METERS * c
    }
}
