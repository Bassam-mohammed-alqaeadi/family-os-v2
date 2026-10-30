/// Life360 — Flutter Dart Models & JSON Serialization
///
/// Reverse-Engineered from:
/// - `com.life360.android.Core360Api`
/// - Ready for Flutter integration in Family OS client.

class Life360CircleModel {
  final String id;
  final String name;
  final String color;
  final List<CircleMemberModel> members;

  Life360CircleModel({
    required this.id,
    required this.name,
    required this.color,
    required this.members,
  });

  factory Life360CircleModel.fromJson(Map<String, dynamic> json) {
    return Life360CircleModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      color: json['color'] ?? '#00D2B4',
      members: (json['members'] as List<dynamic>?)
              ?.map((e) => CircleMemberModel.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'members': members.map((e) => e.toJson()).toList(),
    };
  }
}

class CircleMemberModel {
  final String userId;
  final String firstName;
  final String lastName;
  final String? avatarUrl;
  final int batteryLevel;
  final bool isCharging;
  final bool isDriving;
  final double latitude;
  final double longitude;
  final double speedKmh;
  final int timestamp;

  CircleMemberModel({
    required this.userId,
    required this.firstName,
    required this.lastName,
    this.avatarUrl,
    required this.batteryLevel,
    required this.isCharging,
    required this.isDriving,
    required this.latitude,
    required this.longitude,
    required this.speedKmh,
    required this.timestamp,
  });

  factory CircleMemberModel.fromJson(Map<String, dynamic> json) {
    final loc = json['location'] as Map<String, dynamic>? ?? {};
    return CircleMemberModel(
      userId: json['userId'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      avatarUrl: json['avatarUrl'],
      batteryLevel: json['batteryLevel'] ?? 100,
      isCharging: json['isCharging'] ?? false,
      isDriving: json['isDriving'] ?? false,
      latitude: (loc['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (loc['longitude'] as num?)?.toDouble() ?? 0.0,
      speedKmh: (loc['speedKmh'] as num?)?.toDouble() ?? 0.0,
      timestamp: loc['timestamp'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'firstName': firstName,
      'lastName': lastName,
      'avatarUrl': avatarUrl,
      'batteryLevel': batteryLevel,
      'isCharging': isCharging,
      'isDriving': isDriving,
      'location': {
        'latitude': latitude,
        'longitude': longitude,
        'speedKmh': speedKmh,
        'timestamp': timestamp,
      },
    };
  }
}

class DriveTripModel {
  final String tripId;
  final String userId;
  final int startTime;
  final int endTime;
  final double distanceMeters;
  final double topSpeedKmh;
  final double averageSpeedKmh;
  final int hardBrakingCount;
  final int rapidAccelCount;
  final int highSpeedCount;
  final int phoneUsageMinutes;
  final int driveScore;

  DriveTripModel({
    required this.tripId,
    required this.userId,
    required this.startTime,
    required this.endTime,
    required this.distanceMeters,
    required this.topSpeedKmh,
    required this.averageSpeedKmh,
    required this.hardBrakingCount,
    required this.rapidAccelCount,
    required this.highSpeedCount,
    required this.phoneUsageMinutes,
    required this.driveScore,
  });

  factory DriveTripModel.fromJson(Map<String, dynamic> json) {
    return DriveTripModel(
      tripId: json['tripId'] ?? '',
      userId: json['userId'] ?? '',
      startTime: json['startTime'] ?? 0,
      endTime: json['endTime'] ?? 0,
      distanceMeters: (json['distanceMeters'] as num?)?.toDouble() ?? 0.0,
      topSpeedKmh: (json['topSpeedKmh'] as num?)?.toDouble() ?? 0.0,
      averageSpeedKmh: (json['averageSpeedKmh'] as num?)?.toDouble() ?? 0.0,
      hardBrakingCount: json['hardBrakingCount'] ?? 0,
      rapidAccelCount: json['rapidAccelCount'] ?? 0,
      highSpeedCount: json['highSpeedCount'] ?? 0,
      phoneUsageMinutes: json['phoneUsageMinutes'] ?? 0,
      driveScore: json['driveScore'] ?? 100,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tripId': tripId,
      'userId': userId,
      'startTime': startTime,
      'endTime': endTime,
      'distanceMeters': distanceMeters,
      'topSpeedKmh': topSpeedKmh,
      'averageSpeedKmh': averageSpeedKmh,
      'hardBrakingCount': hardBrakingCount,
      'rapidAccelCount': rapidAccelCount,
      'highSpeedCount': highSpeedCount,
      'phoneUsageMinutes': phoneUsageMinutes,
      'driveScore': driveScore,
    };
  }
}
