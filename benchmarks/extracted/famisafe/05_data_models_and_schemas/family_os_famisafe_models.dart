/// Wondershare FamiSafe — Dart Data Models & JSON Serialization
///
/// Reverse-Engineered from:
/// - `com.wondershare.famisafe.common.bean.*`
/// - Ready for Flutter integration in Family OS client.

class ChildDeviceProfile {
  final String memberId;
  final String childName;
  final int childAge;
  final String gender;
  final int avatarId;
  final String deviceUuid;
  final String deviceModel;
  final String osVersion;
  final int batteryLevel;
  final bool isCharging;
  final bool isOnline;
  final int lastActiveTime;

  ChildDeviceProfile({
    required this.memberId,
    required this.childName,
    required this.childAge,
    required this.gender,
    required this.avatarId,
    required this.deviceUuid,
    required this.deviceModel,
    required this.osVersion,
    required this.batteryLevel,
    required this.isCharging,
    required this.isOnline,
    required this.lastActiveTime,
  });

  factory ChildDeviceProfile.fromJson(Map<String, dynamic> json) {
    return ChildDeviceProfile(
      memberId: json['memberId'] ?? '',
      childName: json['childName'] ?? '',
      childAge: json['childAge'] ?? 0,
      gender: json['gender'] ?? 'OTHER',
      avatarId: json['avatarId'] ?? 1,
      deviceUuid: json['deviceUuid'] ?? '',
      deviceModel: json['deviceModel'] ?? '',
      osVersion: json['osVersion'] ?? '',
      batteryLevel: json['batteryLevel'] ?? 100,
      isCharging: json['isCharging'] ?? false,
      isOnline: json['isOnline'] ?? false,
      lastActiveTime: json['lastActiveTime'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'memberId': memberId,
      'childName': childName,
      'childAge': childAge,
      'gender': gender,
      'avatarId': avatarId,
      'deviceUuid': deviceUuid,
      'deviceModel': deviceModel,
      'osVersion': osVersion,
      'batteryLevel': batteryLevel,
      'isCharging': isCharging,
      'isOnline': isOnline,
      'lastActiveTime': lastActiveTime,
    };
  }
}

class ScreenTimeRuleModel {
  final String ruleId;
  final String memberId;
  final int dayOfWeek;
  final int dailyAllowanceMinutes;
  final int bonusMinutes;
  final bool instantBlockActive;

  ScreenTimeRuleModel({
    required this.ruleId,
    required this.memberId,
    required this.dayOfWeek,
    required this.dailyAllowanceMinutes,
    this.bonusMinutes = 0,
    this.instantBlockActive = false,
  });

  factory ScreenTimeRuleModel.fromJson(Map<String, dynamic> json) {
    return ScreenTimeRuleModel(
      ruleId: json['ruleId'] ?? '',
      memberId: json['memberId'] ?? '',
      dayOfWeek: json['dayOfWeek'] ?? 1,
      dailyAllowanceMinutes: json['dailyAllowanceMinutes'] ?? 120,
      bonusMinutes: json['bonusMinutes'] ?? 0,
      instantBlockActive: json['instantBlockActive'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ruleId': ruleId,
      'memberId': memberId,
      'dayOfWeek': dayOfWeek,
      'dailyAllowanceMinutes': dailyAllowanceMinutes,
      'bonusMinutes': bonusMinutes,
      'instantBlockActive': instantBlockActive,
    };
  }
}

class DrivingTripModel {
  final String tripId;
  final String memberId;
  final int startTime;
  final int endTime;
  final double totalDistanceKm;
  final double topSpeedKmh;
  final double averageSpeedKmh;
  final int hardBrakingCount;
  final int rapidAccelCount;
  final int speedingCount;
  final int safetyScore;

  DrivingTripModel({
    required this.tripId,
    required this.memberId,
    required this.startTime,
    required this.endTime,
    required this.totalDistanceKm,
    required this.topSpeedKmh,
    required this.averageSpeedKmh,
    required this.hardBrakingCount,
    required this.rapidAccelCount,
    required this.speedingCount,
    required this.safetyScore,
  });

  factory DrivingTripModel.fromJson(Map<String, dynamic> json) {
    return DrivingTripModel(
      tripId: json['tripId'] ?? '',
      memberId: json['memberId'] ?? '',
      startTime: json['startTime'] ?? 0,
      endTime: json['endTime'] ?? 0,
      totalDistanceKm: (json['totalDistanceKm'] as num?)?.toDouble() ?? 0.0,
      topSpeedKmh: (json['topSpeedKmh'] as num?)?.toDouble() ?? 0.0,
      averageSpeedKmh: (json['averageSpeedKmh'] as num?)?.toDouble() ?? 0.0,
      hardBrakingCount: json['hardBrakingCount'] ?? 0,
      rapidAccelCount: json['rapidAccelCount'] ?? 0,
      speedingCount: json['speedingCount'] ?? 0,
      safetyScore: json['safetyScore'] ?? 100,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tripId': tripId,
      'memberId': memberId,
      'startTime': startTime,
      'endTime': endTime,
      'totalDistanceKm': totalDistanceKm,
      'topSpeedKmh': topSpeedKmh,
      'averageSpeedKmh': averageSpeedKmh,
      'hardBrakingCount': hardBrakingCount,
      'rapidAccelCount': rapidAccelCount,
      'speedingCount': speedingCount,
      'safetyScore': safetyScore,
    };
  }
}

class SuspiciousAlertModel {
  final String alertId;
  final String memberId;
  final String alertType;
  final String? sourceApp;
  final String? senderName;
  final String? rawSnippet;
  final String threatCategory;
  final String severity;
  final int timestamp;
  final bool isReviewed;

  SuspiciousAlertModel({
    required this.alertId,
    required this.memberId,
    required this.alertType,
    this.sourceApp,
    this.senderName,
    this.rawSnippet,
    required this.threatCategory,
    required this.severity,
    required this.timestamp,
    this.isReviewed = false,
  });

  factory SuspiciousAlertModel.fromJson(Map<String, dynamic> json) {
    return SuspiciousAlertModel(
      alertId: json['alertId'] ?? '',
      memberId: json['memberId'] ?? '',
      alertType: json['alertType'] ?? 'TEXT_EXPLICIT',
      sourceApp: json['sourceApp'],
      senderName: json['senderName'],
      rawSnippet: json['rawSnippet'],
      threatCategory: json['threatCategory'] ?? 'GENERAL',
      severity: json['severity'] ?? 'LOW',
      timestamp: json['timestamp'] ?? 0,
      isReviewed: json['isReviewed'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'alertId': alertId,
      'memberId': memberId,
      'alertType': alertType,
      'sourceApp': sourceApp,
      'senderName': senderName,
      'rawSnippet': rawSnippet,
      'threatCategory': threatCategory,
      'severity': severity,
      'timestamp': timestamp,
      'isReviewed': isReviewed,
    };
  }
}
