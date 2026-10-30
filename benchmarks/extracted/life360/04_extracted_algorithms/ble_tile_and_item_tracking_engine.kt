package com.familyos.engine.tile

import kotlin.math.pow

/**
 * ============================================================================
 * Family OS — Reconstructed Tile BLE & Mesh Item Tracking Engine
 * Derived from Life360 Architecture (com.life360.android.awarenessengine.network.TileAdvertisementApi & tile)
 *
 * Implements:
 * 1. Background Bluetooth Low Energy (BLE) Advertisement Scanner
 * 2. Tile Service UUID & Manufacturer Beacon Parsing (0xFEED / 0xFEEC)
 * 3. Log-Distance Path Loss RSSI Distance Estimation
 * 4. Anonymous Community Mesh Relay (Zero-Knowledge Location Sighting)
 * ============================================================================
 */

data class BleScanSample(
    val macAddress: String,
    val rssi: Int,
    val txPowerLevel: Int,
    val serviceUuids: List<String>,
    val manufacturerBytes: ByteArray?,
    val timestampMs: Long
)

data class TileDeviceItem(
    val tileId: String,
    val customName: String, // e.g. "House Keys", "Backpack"
    val ownerUserId: String,
    val lastKnownLat: Double,
    val lastKnownLng: Double,
    val estimatedDistanceMeters: Double,
    val isLostModeActive: Boolean,
    val lastSeenTimestampMs: Long
)

data class TileMeshReport(
    val tileUuid: String,
    val observerLat: Double,
    val observerLng: Double,
    val rssi: Int,
    val timestampMs: Long
)

class BleTileTrackingEngine(
    private val onOwnerTileLocated: (TileDeviceItem) -> Unit,
    private val onCommunityMeshSighting: (TileMeshReport) -> Unit
) {
    companion object {
        const val TILE_SERVICE_UUID_16 = "0000feed-0000-1000-8000-00805f9b34fb"
        const val TILE_ALT_UUID_16     = "0000feec-0000-1000-8000-00805f9b34fb"
        const val DEFAULT_PATH_LOSS_EXPONENT = 2.4 // Typical indoor/outdoor mixed path loss
        const val DEFAULT_CALIBRATED_TX_POWER = -59 // RSSI at 1 meter distance
    }

    private val registeredTiles = mutableMapOf<String, TileDeviceItem>()

    fun registerUserTile(tile: TileDeviceItem) {
        registeredTiles[tile.tileId] = tile
    }

    /**
     * Ingestion of raw BLE scan results from Android BluetoothLeScanner
     */
    fun processBleScanResult(sample: BleScanSample, observerLat: Double, observerLng: Double) {
        val isTileDevice = sample.serviceUuids.any {
            it.equals(TILE_SERVICE_UUID_16, ignoreCase = true) ||
            it.equals(TILE_ALT_UUID_16, ignoreCase = true)
        }

        if (!isTileDevice) return

        val tileIdentifier = sample.macAddress.replace(":", "").uppercase()
        val distanceMeters = estimateDistanceMeters(sample.rssi, sample.txPowerLevel)

        val ownedTile = registeredTiles[tileIdentifier]

        if (ownedTile != null) {
            // This device belongs to the local user / circle
            val updated = ownedTile.copy(
                lastKnownLat = observerLat,
                lastKnownLng = observerLng,
                estimatedDistanceMeters = distanceMeters,
                lastSeenTimestampMs = sample.timestampMs
            )
            registeredTiles[tileIdentifier] = updated
            onOwnerTileLocated(updated)
        } else {
            // Anonymous sighting: Community Mesh Relay
            // In accordance with Life360 Tile Network, report sighting secretly to cloud
            val meshReport = TileMeshReport(
                tileUuid = tileIdentifier,
                observerLat = observerLat,
                observerLng = observerLng,
                rssi = sample.rssi,
                timestampMs = sample.timestampMs
            )
            onCommunityMeshSighting(meshReport)
        }
    }

    /**
     * Log-Distance Path Loss Model:
     * Distance = 10 ^ ((MeasuredPower - RSSI) / (10 * n))
     */
    private fun estimateDistanceMeters(rssi: Int, txPower: Int): Double {
        val measuredPower = if (txPower != 0 && txPower in -100..-30) txPower else DEFAULT_CALIBRATED_TX_POWER
        val exponent = (measuredPower - rssi) / (10.0 * DEFAULT_PATH_LOSS_EXPONENT)
        return 10.0.pow(exponent)
    }
}
