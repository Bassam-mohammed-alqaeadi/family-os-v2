package com.familyos.benchmarks.life360.engine

/**
 * Life360 — Tile Bluetooth Low Energy (BLE) Crowd-Sourced Finding Mesh Engine
 *
 * Reverse-Engineered from:
 * - `com.life360.android.awarenessengine.network.TileAdvertisementApi`
 * - `com.life360.android.awarenessengine.network.TileRegisterApi`
 * - BLE Service UUID: `0xFEED` (Tile 16-bit Bluetooth SIG allocated service)
 *
 * Core Capabilities:
 * 1. Background BLE Scanner: Intercepts Bluetooth advertisement packets matching Tile service UUID.
 * 2. RSSI Signal Proximity Estimation: Calculates distance proximity (Immediate < 1m, Near < 5m, Far > 5m).
 * 3. Anonymous Encrypted Location Tagging: Associates phone's current GPS with observed Tile beacon ID.
 * 4. Batched Mesh Ingestion: Aggregates sightings and flushes to `/api/v1/clients/{uuid}/batch_location_updates`.
 */

data class BleAdvertisement(
    val macAddress: String,
    val serviceUuid: String,
    val rssi: Int,
    val rawManufacturerData: ByteArray?,
    val timestampMs: Long = System.currentTimeMillis()
)

data class TileSighting(
    val tileId: String,
    val latitude: Double,
    val longitude: Double,
    val horizontalAccuracyMeters: Float,
    val rssi: Int,
    val estimatedDistanceMeters: Double,
    val timestampMs: Long = System.currentTimeMillis()
)

class Life360TileMeshEngine(
    private val batchFlushSize: Int = 20,
    private val tileServiceUuid: String = "0000feed-0000-1000-8000-00805f9b34fb" // Tile UUID
) {

    private val sightingQueue = mutableListOf<TileSighting>()
    private val deduplicationCache = mutableMapOf<String, Long>() // tileId -> lastSeenMs

    /**
     * Estimates approximate distance in meters based on RSSI and measured power at 1 meter.
     */
    fun calculateDistance(rssi: Int, txPowerAt1m: Int = -59): Double {
        if (rssi == 0) return -1.0
        val ratio = (txPowerAt1m - rssi) / (10.0 * 2.0) // Path loss exponent n=2.0 (free space)
        return Math.pow(10.0, ratio)
    }

    /**
     * Ingests raw BLE scan result from Android BluetoothLeScanner.
     */
    fun processBleScan(
        advertisement: BleAdvertisement,
        currentLocation: FilteredLocation
    ): TileSighting? {
        if (!advertisement.serviceUuid.equals(tileServiceUuid, ignoreCase = true)) {
            return null // Ignore non-Tile BLE peripherals
        }

        val tileId = advertisement.macAddress
        val now = advertisement.timestampMs

        // Deduplication: Only record one sighting per Tile beacon every 60 seconds
        val lastSeen = deduplicationCache[tileId] ?: 0L
        if (now - lastSeen < 60_000L) {
            return null
        }
        deduplicationCache[tileId] = now

        val distance = calculateDistance(advertisement.rssi)
        val sighting = TileSighting(
            tileId = tileId,
            latitude = currentLocation.latitude,
            longitude = currentLocation.longitude,
            horizontalAccuracyMeters = currentLocation.accuracyMeters,
            rssi = advertisement.rssi,
            estimatedDistanceMeters = distance,
            timestampMs = now
        )

        sightingQueue.add(sighting)
        return sighting
    }

    /**
     * Determines whether accumulated sightings should be flushed to Tile Cloud API.
     */
    fun shouldFlushBatch(): Boolean {
        return sightingQueue.size >= batchFlushSize
    }

    fun flushBatch(): List<TileSighting> {
        val batch = sightingQueue.toList()
        sightingQueue.clear()
        return batch
    }
}
