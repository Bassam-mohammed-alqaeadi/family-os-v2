package com.qustodio.engine.location

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.os.Looper
import com.google.android.gms.location.*
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong
import java.util.concurrent.atomic.AtomicReference
import kotlin.math.*

/**
 * ============================================================================
 * QUSTODIO BENCHMARK: LOCATION TRACKING & GEOFENCING ENGINE
 * ============================================================================
 *
 * Reverse-engineered from Qustodio Parental Control:
 * - TypeScript references: `src/ducks/places.ts`, `src/records/place.ts`,
 *   `src/actions/FamilyLocatorActions.ts`, `src/constants/index.ts`
 *
 * Core Capabilities:
 * ------------------
 * 1. Adaptive Location Capture:
 *    - Balances high accuracy against battery consumption using FusedLocationProviderClient.
 *    - Normal Mode: `PRIORITY_BALANCED_POWER_ACCURACY` (interval 60s, fastest 30s, displacement 25m).
 *    - Active Tracking / Panic Mode: `PRIORITY_HIGH_ACCURACY` (interval 5s, fastest 2s, displacement 5m).
 * 2. Geofencing Places Model:
 *    - Circular geofence boundaries with radius constraint:
 *      `PLACE_FORM_MIN_RADIUS_VALUE_METERS = 100.0` meters (up to 200m or custom radius).
 * 3. 8-Second Debounce Mechanism:
 *    - `LOCATION_REQUEST_DEBOUNCE_TIME = 8000L` (8000 ms) suppresses duplicate requests,
 *      smoothing high-frequency GPS jitter.
 * 4. Boundary Transition Detection (Enter / Exit / Dwell):
 *    - Pure mathematical Haversine Great-Circle distance computation.
 *    - Dynamic hysteresis margin ($\pm \Delta r$) to prevent ping-pong boundary flapping.
 * 5. Event Dispatching:
 *    - `EventType.Location = 400`, `EventType.LocationUnvailable = 401`, `EventType.LocationLast = 402`.
 */

// ============================================================================
// 1. CONSTANTS & DOMAIN DATA STRUCTURES
// ============================================================================

object LocationConstants {
    // Event types matching Qustodio constants/index.ts
    const val EVENT_TYPE_LOCATION = 400
    const val EVENT_TYPE_LOCATION_UNAVAILABLE = 401
    const val EVENT_TYPE_LOCATION_LAST = 402

    // Qustodio constants
    const val PLACE_FORM_MIN_RADIUS_VALUE_METERS = 100.0
    const val LOCATION_REQUEST_DEBOUNCE_TIME = 8000L // 8 seconds debounce
    const val CACHE_GEOCODE_SIZE = 1000

    // Earth's mean radius in meters for Haversine equation
    const val EARTH_RADIUS_METERS = 6371000.0

    // Default sampling intervals (ms)
    const val NORMAL_INTERVAL_MS = 60000L
    const val NORMAL_FASTEST_INTERVAL_MS = 30000L
    const val NORMAL_MIN_DISPLACEMENT_METERS = 25.0f

    const val HIGH_ACCURACY_INTERVAL_MS = 5000L
    const val HIGH_ACCURACY_FASTEST_INTERVAL_MS = 2000L
    const val HIGH_ACCURACY_MIN_DISPLACEMENT_METERS = 5.0f
}

data class Place(
    val uid: String,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val radius: Double = LocationConstants.PLACE_FORM_MIN_RADIUS_VALUE_METERS,
    val address: String = ""
) {
    init {
        require(radius >= LocationConstants.PLACE_FORM_MIN_RADIUS_VALUE_METERS) {
            "Radius cannot be less than ${LocationConstants.PLACE_FORM_MIN_RADIUS_VALUE_METERS}m to avoid false GPS triggers"
        }
    }
}

enum class GeofenceState {
    INSIDE,
    OUTSIDE,
    UNKNOWN
}

enum class TransitionType {
    ENTER,
    EXIT,
    DWELL
}

data class GeofenceTransitionEvent(
    val placeUid: String,
    val placeName: String,
    val transition: TransitionType,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val distanceToCenter: Double,
    val timestamp: Long
)

data class QustodioLocationRecord(
    val eventType: Int,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val altitude: Double,
    val speed: Float,
    val timestamp: Long,
    val isMock: Boolean = false
)

// ============================================================================
// 2. MATHEMATICAL HAVERSINE DISTANCE COMPUTATION
// ============================================================================

object GeoMath {
    /**
     * Calculates the great-circle distance between two points on a sphere using the Haversine formula.
     *
     * Formula:
     * a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
     * c = 2 * atan2(√a, √(1-a))
     * d = R * c
     * where φ is latitude in radians, λ is longitude in radians, R = 6,371,000 meters.
     */
    fun haversineDistance(
        lat1: Double,
        lon1: Double,
        lat2: Double,
        lon2: Double
    ): Double {
        val phi1 = Math.toRadians(lat1)
        val phi2 = Math.toRadians(lat2)
        val deltaPhi = Math.toRadians(lat2 - lat1)
        val deltaLambda = Math.toRadians(lon2 - lon1)

        val sinDeltaPhi = sin(deltaPhi / 2.0)
        val sinDeltaLambda = sin(deltaLambda / 2.0)

        val a = sinDeltaPhi * sinDeltaPhi +
                cos(phi1) * cos(phi2) * sinDeltaLambda * sinDeltaLambda
        val c = 2.0 * atan2(sqrt(a), sqrt(1.0 - a))

        return LocationConstants.EARTH_RADIUS_METERS * c
    }
}

// ============================================================================
// 3. GEOFENCING STATE MACHINE WITH HYSTERESIS & 8-SECOND DEBOUNCE
// ============================================================================

class GeofenceDetector {
    private val places = ConcurrentHashMap<String, Place>()
    private val placeStates = ConcurrentHashMap<String, GeofenceState>()
    private val lastTransitionTimestamp = ConcurrentHashMap<String, Long>()

    fun registerPlace(place: Place) {
        places[place.uid] = place
        placeStates.putIfAbsent(place.uid, GeofenceState.UNKNOWN)
    }

    fun removePlace(placeUid: String) {
        places.remove(placeUid)
        placeStates.remove(placeUid)
        lastTransitionTimestamp.remove(placeUid)
    }

    fun getAllPlaces(): List<Place> = places.values.toList()

    /**
     * Evaluates an incoming coordinate fix against all registered geofences.
     * Applies hysteresis to prevent boundary oscillation.
     */
    fun evaluateLocation(location: Location): List<GeofenceTransitionEvent> {
        val transitions = mutableListOf<GeofenceTransitionEvent>()
        val currentTime = location.time

        for ((uid, place) in places) {
            val distance = GeoMath.haversineDistance(
                place.latitude,
                place.longitude,
                location.latitude,
                location.longitude
            )

            // Dynamic hysteresis margin based on GPS accuracy (clamped between 5m and 15m)
            val hysteresisMargin = (location.accuracy / 2.0).coerceIn(5.0, 15.0)

            val currentState = placeStates[uid] ?: GeofenceState.UNKNOWN
            val innerThreshold = place.radius - hysteresisMargin
            val outerThreshold = place.radius + hysteresisMargin

            when (currentState) {
                GeofenceState.OUTSIDE, GeofenceState.UNKNOWN -> {
                    if (distance <= innerThreshold) {
                        placeStates[uid] = GeofenceState.INSIDE
                        lastTransitionTimestamp[uid] = currentTime
                        transitions.add(
                            GeofenceTransitionEvent(
                                placeUid = uid,
                                placeName = place.name,
                                transition = TransitionType.ENTER,
                                latitude = location.latitude,
                                longitude = location.longitude,
                                accuracy = location.accuracy,
                                distanceToCenter = distance,
                                timestamp = currentTime
                            )
                        )
                    }
                }
                GeofenceState.INSIDE -> {
                    if (distance > outerThreshold) {
                        placeStates[uid] = GeofenceState.OUTSIDE
                        lastTransitionTimestamp[uid] = currentTime
                        transitions.add(
                            GeofenceTransitionEvent(
                                placeUid = uid,
                                placeName = place.name,
                                transition = TransitionType.EXIT,
                                latitude = location.latitude,
                                longitude = location.longitude,
                                accuracy = location.accuracy,
                                distanceToCenter = distance,
                                timestamp = currentTime
                            )
                        )
                    }
                }
            }
        }
        return transitions
    }
}

// ============================================================================
// 4. BALANCED VS HIGH ACCURACY ADAPTIVE FUSED LOCATION PROVIDER
// ============================================================================

enum class TrackingAccuracyMode {
    BALANCED_POWER,
    HIGH_ACCURACY_PANIC
}

class LocationGeofencingEngine(
    private val context: Context,
    private val geofenceDetector: GeofenceDetector = GeofenceDetector()
) {
    private val fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(context)

    private val isTracking = AtomicBoolean(false)
    private var currentMode = TrackingAccuracyMode.BALANCED_POWER

    private val lastDispatchedLocation = AtomicReference<Location?>(null)
    private val lastDispatchTimestamp = AtomicLong(0L)

    // Callbacks
    var onLocationFix: ((QustodioLocationRecord) -> Unit)? = null
    var onGeofenceTransition: ((GeofenceTransitionEvent) -> Unit)? = null
    var onLocationError: ((Int, String) -> Unit)? = null

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            val location = result.lastLocation ?: return
            handleIncomingLocation(location)
        }

        override fun onLocationAvailability(availability: LocationAvailability) {
            if (!availability.isLocationAvailable) {
                onLocationError?.invoke(
                    LocationConstants.EVENT_TYPE_LOCATION_UNAVAILABLE,
                    "Location provider currently unavailable"
                )
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun startTracking(mode: TrackingAccuracyMode = TrackingAccuracyMode.BALANCED_POWER) {
        if (isTracking.getAndSet(true)) {
            if (currentMode != mode) {
                updateTrackingMode(mode)
            }
            return
        }

        currentMode = mode
        val request = buildLocationRequest(mode)

        try {
            fusedLocationClient.requestLocationUpdates(
                request,
                locationCallback,
                Looper.getMainLooper()
            )

            // Immediately query last known location (EventType.LocationLast = 402)
            fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc ->
                if (lastLoc != null && lastDispatchedLocation.get() == null) {
                    dispatchLocationRecord(lastLoc, LocationConstants.EVENT_TYPE_LOCATION_LAST)
                }
            }
        } catch (e: SecurityException) {
            isTracking.set(false)
            onLocationError?.invoke(
                LocationConstants.EVENT_TYPE_LOCATION_UNAVAILABLE,
                "Missing ACCESS_FINE_LOCATION or ACCESS_COARSE_LOCATION permissions"
            )
        }
    }

    fun stopTracking() {
        if (!isTracking.getAndSet(false)) return
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    fun updateTrackingMode(newMode: TrackingAccuracyMode) {
        currentMode = newMode
        if (isTracking.get()) {
            fusedLocationClient.removeLocationUpdates(locationCallback)
            val request = buildLocationRequest(newMode)
            try {
                fusedLocationClient.requestLocationUpdates(
                    request,
                    locationCallback,
                    Looper.getMainLooper()
                )
            } catch (e: SecurityException) {
                e.printStackTrace()
            }
        }
    }

    fun registerPlace(place: Place) {
        geofenceDetector.registerPlace(place)
    }

    fun removePlace(placeUid: String) {
        geofenceDetector.removePlace(placeUid)
    }

    /**
     * Enforces the 8-second debounce mechanism (`LOCATION_REQUEST_DEBOUNCE_TIME = 8000`),
     * evaluates geofence boundaries, and dispatches Location events.
     */
    private fun handleIncomingLocation(location: Location) {
        val now = System.currentTimeMillis()
        val lastTime = lastDispatchTimestamp.get()

        // 8-second debounce filter: ignore rapid duplicate triggers unless displacement is large (> 50m)
        val lastLoc = lastDispatchedLocation.get()
        if (lastLoc != null && (now - lastTime < LocationConstants.LOCATION_REQUEST_DEBOUNCE_TIME)) {
            val displacement = GeoMath.haversineDistance(
                lastLoc.latitude,
                lastLoc.longitude,
                location.latitude,
                location.longitude
            )
            if (displacement < 50.0) {
                // Debounced: too frequent and small displacement
                return
            }
        }

        lastDispatchTimestamp.set(now)
        lastDispatchedLocation.set(location)

        // 1. Dispatch Location Fix (EventType.Location = 400)
        dispatchLocationRecord(location, LocationConstants.EVENT_TYPE_LOCATION)

        // 2. Evaluate Geofence transitions
        val transitions = geofenceDetector.evaluateLocation(location)
        for (transition in transitions) {
            onGeofenceTransition?.invoke(transition)
        }
    }

    private fun dispatchLocationRecord(location: Location, eventType: Int) {
        val record = QustodioLocationRecord(
            eventType = eventType,
            latitude = location.latitude,
            longitude = location.longitude,
            accuracy = location.accuracy,
            altitude = location.altitude,
            speed = location.speed,
            timestamp = location.time,
            isMock = location.isFromMockProvider
        )
        onLocationFix?.invoke(record)
    }

    private fun buildLocationRequest(mode: TrackingAccuracyMode): LocationRequest {
        return when (mode) {
            TrackingAccuracyMode.BALANCED_POWER -> {
                LocationRequest.Builder(
                    Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                    LocationConstants.NORMAL_INTERVAL_MS
                )
                    .setMinUpdateIntervalMillis(LocationConstants.NORMAL_FASTEST_INTERVAL_MS)
                    .setMinUpdateDistanceMeters(LocationConstants.NORMAL_MIN_DISPLACEMENT_METERS)
                    .build()
            }
            TrackingAccuracyMode.HIGH_ACCURACY_PANIC -> {
                LocationRequest.Builder(
                    Priority.PRIORITY_HIGH_ACCURACY,
                    LocationConstants.HIGH_ACCURACY_INTERVAL_MS
                )
                    .setMinUpdateIntervalMillis(LocationConstants.HIGH_ACCURACY_FASTEST_INTERVAL_MS)
                    .setMinUpdateDistanceMeters(LocationConstants.HIGH_ACCURACY_MIN_DISPLACEMENT_METERS)
                    .build()
            }
        }
    }
}
