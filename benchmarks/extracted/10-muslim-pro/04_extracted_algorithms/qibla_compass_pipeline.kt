package com.familyos.core.prayer.qibla

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlin.math.*

/**
 * خط معالجة وحساب بوصلة القبلة (Qibla Compass Pipeline)
 *
 * مستخلص بالهندسة العكسية من فئتي:
 * 1. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/com/bitsmedia/android/muslimpro/screens/main/pages/qibla/QiblaFragment.java]
 * 2. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/o/AyaIdRange.java L320-L360]
 * 3. [REF: benchmarks/10-muslim-pro/03_decompiled_src/sources/o/setSharedElementEnterTransition.java L951]
 */
class QiblaCompassPipeline(
    private val onCompassUpdate: (azimuthDeg: Float, qiblaBearingDeg: Float, isCalibrated: Boolean) -> Unit
) : SensorEventListener {

    companion object {
        // إحداثيات الكعبة المشرفة بمكة المكرمة بدقة فلكية
        // [REF: setSharedElementEnterTransition.java L951: 0.3738935 rad = 21.422487°]
        const val KAABA_LATITUDE = 21.422487
        const val KAABA_LONGITUDE = 39.826206

        // معامل الترشيح المنخفض لتنعيم حركة المؤشر والتخلص من التذبذب
        private const val LOW_PASS_ALPHA = 0.15f
    }

    private val accelerometerReading = FloatArray(3)
    private val magnetometerReading = FloatArray(3)
    private val rotationMatrix = FloatArray(9)
    private val remappedMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)

    private var smoothedAzimuth = 0f
    private var isCalibrated = true
    private var currentLatitude = 0.0
    private var currentLongitude = 0.0

    /**
     * حساب اتجاه القبلة من موقع المستخدم الجغرافي (Great Circle Forward Azimuth)
     * [REF: setSharedElementEnterTransition.java L951]
     */
    fun calculateQiblaBearing(lat: Double, lng: Double): Float {
        currentLatitude = lat
        currentLongitude = lng

        val phi1 = Math.toRadians(lat)
        val phi2 = Math.toRadians(KAABA_LATITUDE)
        val deltaLambda = Math.toRadians(KAABA_LONGITUDE - lng)

        val y = sin(deltaLambda) * cos(phi2)
        val x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(deltaLambda)
        
        var qiblaRad = atan2(y, x)
        var qiblaDeg = Math.toDegrees(qiblaRad).toFloat()
        if (qiblaDeg < 0f) {
            qiblaDeg += 360f
        }
        return qiblaDeg
    }

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                // تطبيق مرشح الترددات المنخفضة Low-Pass Filter
                for (i in 0..2) {
                    accelerometerReading[i] = accelerometerReading[i] + LOW_PASS_ALPHA * (event.values[i] - accelerometerReading[i])
                }
            }
            Sensor.TYPE_MAGNETIC_FIELD -> {
                for (i in 0..2) {
                    magnetometerReading[i] = magnetometerReading[i] + LOW_PASS_ALPHA * (event.values[i] - magnetometerReading[i])
                }
            }
        }

        // حساب مصفوفة الدوران العالمية
        // [REF: AyaIdRange.java L345-L348]
        val success = SensorManager.getRotationMatrix(
            rotationMatrix,
            null,
            accelerometerReading,
            magnetometerReading
        )

        if (success) {
            // إعادة تعيين محاور الجهاز لتناسب الوضع الرأسي للهاتف (Portrait)
            SensorManager.remapCoordinateSystem(
                rotationMatrix,
                SensorManager.AXIS_X,
                SensorManager.AXIS_Y,
                remappedMatrix
            )

            SensorManager.getOrientation(remappedMatrix, orientationAngles)

            // زاوية السمت بالنسبة للشمال المغناطيسي (Azimuth)
            var azimuthRad = orientationAngles[0]
            var azimuthDeg = Math.toDegrees(azimuthRad.toDouble()).toFloat()
            if (azimuthDeg < 0f) {
                azimuthDeg += 360f
            }

            // تنعيم القيمة عبر تخميد القفزات عند زاوية 0/360
            smoothedAzimuth = smoothHeading(smoothedAzimuth, azimuthDeg)

            val qiblaBearing = calculateQiblaBearing(currentLatitude, currentLongitude)
            onCompassUpdate(smoothedAzimuth, qiblaBearing, isCalibrated)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
        // إذا انخفضت دقة الحساس المغناطيسي دون الدقة المتوسطة، يتم إشعار الواجهة لطلب المعايرة بحركة الرقم 8
        // [REF: QiblaFragment.java L387: showCompassCalibrationView]
        if (sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
            isCalibrated = accuracy >= SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM
        }
    }

    private fun smoothHeading(oldHeading: Float, newHeading: Float): Float {
        var diff = newHeading - oldHeading
        while (diff < -180f) diff += 360f
        while (diff > 180f) diff -= 360f
        return (oldHeading + LOW_PASS_ALPHA * diff + 360f) % 360f
    }
}
