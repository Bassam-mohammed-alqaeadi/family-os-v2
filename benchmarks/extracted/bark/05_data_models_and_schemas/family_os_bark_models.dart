/// ============================================================================
/// Family OS — Bark Reverse-Engineered Dart Client Models
/// Target Application: Bark Parental Controls (v6.5.1 Build 600500103) & Bark Kids Sentinel
/// Purpose: Production-ready, immutable, type-safe Dart models for Flutter client.
/// Features:
///   - Zero external code-generation dependencies (pure, standalone Dart).
///   - Immutable classes with const constructors.
///   - Full [fromJson] and [toJson] serialization contracts.
///   - Functional [copyWith] mutations.
///   - Equatable-style [props] value equality and [hashCode] computation.
/// ============================================================================

// ============================================================================
// 1. ENUMERATIONS
// ============================================================================

enum BarkSubscriptionPlan {
  barkJr('bark_jr'),
  barkPremium('bark_premium'),
  barkPhone('bark_phone'),
  trial('trial');

  final String value;
  const BarkSubscriptionPlan(this.value);

  static BarkSubscriptionPlan fromValue(String? value) {
    return BarkSubscriptionPlan.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkSubscriptionPlan.barkPremium,
    );
  }
}

enum BarkSubscriptionStatus {
  active('active'),
  trialing('trialing'),
  pastDue('past_due'),
  canceled('canceled'),
  incomplete('incomplete');

  final String value;
  const BarkSubscriptionStatus(this.value);

  static BarkSubscriptionStatus fromValue(String? value) {
    return BarkSubscriptionStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkSubscriptionStatus.active,
    );
  }
}

enum BarkBillingCycle {
  monthly('monthly'),
  annual('annual'),
  lifetime('lifetime');

  final String value;
  const BarkBillingCycle(this.value);

  static BarkBillingCycle fromValue(String? value) {
    return BarkBillingCycle.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkBillingCycle.monthly,
    );
  }
}

enum BarkAccountType {
  parent('parent'),
  guardian('guardian'),
  trial('trial');

  final String value;
  const BarkAccountType(this.value);

  static BarkAccountType fromValue(String? value) {
    return BarkAccountType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkAccountType.parent,
    );
  }
}

enum BarkGender {
  male('male'),
  female('female'),
  unspecified('unspecified');

  final String value;
  const BarkGender(this.value);

  static BarkGender fromValue(String? value) {
    return BarkGender.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkGender.unspecified,
    );
  }
}

enum BarkMonitoringTier {
  full('full'),
  screenTimeOnly('screen_time_only');

  final String value;
  const BarkMonitoringTier(this.value);

  static BarkMonitoringTier fromValue(String? value) {
    return BarkMonitoringTier.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkMonitoringTier.full,
    );
  }
}

enum BarkDeviceType {
  phone('phone'),
  tablet('tablet'),
  chromebook('chromebook'),
  pc('pc'),
  mac('mac');

  final String value;
  const BarkDeviceType(this.value);

  static BarkDeviceType fromValue(String? value) {
    return BarkDeviceType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkDeviceType.phone,
    );
  }
}

enum BarkDeviceOsFamily {
  android('android'),
  ios('ios'),
  chromeOs('chrome_os'),
  windows('windows'),
  macos('macos');

  final String value;
  const BarkDeviceOsFamily(this.value);

  static BarkDeviceOsFamily fromValue(String? value) {
    return BarkDeviceOsFamily.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkDeviceOsFamily.android,
    );
  }
}

enum BarkPairingStatus {
  pendingPairing('pending_pairing'),
  paired('paired'),
  unpaired('unpaired'),
  revoked('revoked');

  final String value;
  const BarkPairingStatus(this.value);

  static BarkPairingStatus fromValue(String? value) {
    return BarkPairingStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkPairingStatus.paired,
    );
  }
}

enum BarkPlatform {
  whatsapp('whatsapp'),
  whatsappBusiness('whatsapp_business'),
  instagram('instagram'),
  snapchat('snapchat'),
  tiktok('tiktok'),
  youtube('youtube'),
  discord('discord'),
  twitter('twitter'),
  sms('sms'),
  browser('browser'),
  system('system');

  final String value;
  const BarkPlatform(this.value);

  static BarkPlatform fromValue(String? value) {
    return BarkPlatform.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkPlatform.system,
    );
  }
}

enum BarkChannelType {
  directMessage('direct_message'),
  groupChat('group_chat'),
  postComment('post_comment'),
  searchQuery('search_query'),
  notification('notification');

  final String value;
  const BarkChannelType(this.value);

  static BarkChannelType fromValue(String? value) {
    return BarkChannelType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkChannelType.directMessage,
    );
  }
}

enum BarkExtractionSource {
  accessibilityScrape('accessibility_scrape'),
  notificationListener('notification_listener'),
  vpnDnsQuery('vpn_dns_query');

  final String value;
  const BarkExtractionSource(this.value);

  static BarkExtractionSource fromValue(String? value) {
    return BarkExtractionSource.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkExtractionSource.accessibilityScrape,
    );
  }
}

enum BarkDangerCategory {
  cyberbullying('cyberbullying'),
  depressionSuicide('depression_suicide'),
  sexualContentSexting('sexual_content_sexting'),
  predatoryContact('predatory_contact'),
  drugsAlcohol('drugs_alcohol'),
  hateSpeech('hate_speech'),
  violenceWeapons('violence_weapons'),
  profanity('profanity'),
  anxietyMentalHealth('anxiety_mental_health');

  final String value;
  const BarkDangerCategory(this.value);

  static BarkDangerCategory fromValue(String? value) {
    return BarkDangerCategory.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkDangerCategory.cyberbullying,
    );
  }
}

enum BarkRiskSeverity {
  notice(1),
  low(2),
  moderate(3),
  high(4),
  severeEmergency(5);

  final int value;
  const BarkRiskSeverity(this.value);

  static BarkRiskSeverity fromValue(int? value) {
    return BarkRiskSeverity.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkRiskSeverity.notice,
    );
  }
}

enum BarkSignalStatus {
  detected('detected'),
  encryptedQueued('encrypted_queued'),
  uploaded('uploaded'),
  dismissed('dismissed');

  final String value;
  const BarkSignalStatus(this.value);

  static BarkSignalStatus fromValue(String? value) {
    return BarkSignalStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkSignalStatus.detected,
    );
  }
}

enum BarkAlertStatus {
  newAlert('new'),
  reviewed('reviewed'),
  acknowledged('acknowledged'),
  resolved('resolved'),
  dismissed('dismissed'),
  escalated('escalated');

  final String value;
  const BarkAlertStatus(this.value);

  static BarkAlertStatus fromValue(String? value) {
    return BarkAlertStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkAlertStatus.newAlert,
    );
  }
}

enum BarkRulesetType {
  defaultRule('default'),
  school('school'),
  bedtime('bedtime'),
  bonus('bonus'),
  paused('paused'),
  custom('custom');

  final String value;
  const BarkRulesetType(this.value);

  static BarkRulesetType fromValue(String? value) {
    return BarkRulesetType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkRulesetType.defaultRule,
    );
  }
}

enum BarkDayOfWeek {
  sunday(0),
  monday(1),
  tuesday(2),
  wednesday(3),
  thursday(4),
  friday(5),
  saturday(6);

  final int value;
  const BarkDayOfWeek(this.value);

  static BarkDayOfWeek fromValue(int? value) {
    return BarkDayOfWeek.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkDayOfWeek.sunday,
    );
  }
}

enum BarkFilterAction {
  allow('allow'),
  block('block'),
  warn('warn');

  final String value;
  const BarkFilterAction(this.value);

  static BarkFilterAction fromValue(String? value) {
    return BarkFilterAction.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkFilterAction.block,
    );
  }
}

enum BarkExceptionType {
  domain('domain'),
  app('app');

  final String value;
  const BarkExceptionType(this.value);

  static BarkExceptionType fromValue(String? value) {
    return BarkExceptionType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkExceptionType.domain,
    );
  }
}

enum BarkExceptionAction {
  alwaysAllow('always_allow'),
  alwaysBlock('always_block');

  final String value;
  const BarkExceptionAction(this.value);

  static BarkExceptionAction fromValue(String? value) {
    return BarkExceptionAction.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkExceptionAction.alwaysAllow,
    );
  }
}

enum BarkZoneType {
  home('home'),
  school('school'),
  activities('activities'),
  custom('custom');

  final String value;
  const BarkZoneType(this.value);

  static BarkZoneType fromValue(String? value) {
    return BarkZoneType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkZoneType.custom,
    );
  }
}

enum BarkCheckinType {
  manual('manual'),
  parentRequested('parent_requested'),
  geofenceTrigger('geofence_trigger'),
  periodic('periodic');

  final String value;
  const BarkCheckinType(this.value);

  static BarkCheckinType fromValue(String? value) {
    return BarkCheckinType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkCheckinType.manual,
    );
  }
}

enum BarkGeofenceTransition {
  enter('enter'),
  exit('exit'),
  dwell('dwell');

  final String value;
  const BarkGeofenceTransition(this.value);

  static BarkGeofenceTransition fromValue(String? value) {
    return BarkGeofenceTransition.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkGeofenceTransition.enter,
    );
  }
}

enum BarkSyncOperation {
  insert('insert'),
  update('update'),
  delete('delete'),
  telemetry('telemetry');

  final String value;
  const BarkSyncOperation(this.value);

  static BarkSyncOperation fromValue(String? value) {
    return BarkSyncOperation.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkSyncOperation.insert,
    );
  }
}

enum BarkSyncStatus {
  pending('pending'),
  inFlight('in_flight'),
  failed('failed'),
  synced('synced');

  final String value;
  const BarkSyncStatus(this.value);

  static BarkSyncStatus fromValue(String? value) {
    return BarkSyncStatus.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkSyncStatus.pending,
    );
  }
}

enum BarkTelemetryLogType {
  battery('battery'),
  vpnStatus('vpn_status'),
  accessibilityHeartbeat('accessibility_heartbeat'),
  appCrash('app_crash'),
  antiTamperAlert('anti_tamper_alert');

  final String value;
  const BarkTelemetryLogType(this.value);

  static BarkTelemetryLogType fromValue(String? value) {
    return BarkTelemetryLogType.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkTelemetryLogType.battery,
    );
  }
}

enum BarkTelemetrySeverity {
  debug('debug'),
  info('info'),
  warning('warning'),
  error('error'),
  critical('critical');

  final String value;
  const BarkTelemetrySeverity(this.value);

  static BarkTelemetrySeverity fromValue(String? value) {
    return BarkTelemetrySeverity.values.firstWhere(
      (e) => e.value == value,
      orElse: () => BarkTelemetrySeverity.info,
    );
  }
}


// ============================================================================
// 2. EQUATABLE MIXIN HELPER FOR VALUE EQUALITY
// ============================================================================

abstract class BarkEquatable {
  const BarkEquatable();

  List<Object?> get props;

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other is! BarkEquatable) return false;
    if (runtimeType != other.runtimeType) return false;
    final otherProps = other.props;
    final thisProps = props;
    if (thisProps.length != otherProps.length) return false;
    for (int i = 0; i < thisProps.length; i++) {
      if (thisProps[i] != otherProps[i]) return false;
    }
    return true;
  }

  @override
  int get hashCode => Object.hashAll(props);

  @override
  String toString() => '$runtimeType(${props.join(', ')})';
}


// ============================================================================
// 3. CRYPTOGRAPHIC ENVELOPE MODEL
// ============================================================================

class BarkEncryptedEnvelope extends BarkEquatable {
  final String keyId;
  final String initializationVector;
  final String ciphertext;
  final String authenticationTag;
  final String? associatedData;

  const BarkEncryptedEnvelope({
    required this.keyId,
    required this.initializationVector,
    required this.ciphertext,
    required this.authenticationTag,
    this.associatedData,
  });

  factory BarkEncryptedEnvelope.fromJson(Map<String, dynamic> json) {
    return BarkEncryptedEnvelope(
      keyId: json['keyId'] as String,
      initializationVector: json['initializationVector'] as String,
      ciphertext: json['ciphertext'] as String,
      authenticationTag: json['authenticationTag'] as String,
      associatedData: json['associatedData'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'keyId': keyId,
    'initializationVector': initializationVector,
    'ciphertext': ciphertext,
    'authenticationTag': authenticationTag,
    if (associatedData != null) 'associatedData': associatedData,
  };

  BarkEncryptedEnvelope copyWith({
    String? keyId,
    String? initializationVector,
    String? ciphertext,
    String? authenticationTag,
    String? associatedData,
  }) {
    return BarkEncryptedEnvelope(
      keyId: keyId ?? this.keyId,
      initializationVector: initializationVector ?? this.initializationVector,
      ciphertext: ciphertext ?? this.ciphertext,
      authenticationTag: authenticationTag ?? this.authenticationTag,
      associatedData: associatedData ?? this.associatedData,
    );
  }

  @override
  List<Object?> get props => [
    keyId,
    initializationVector,
    ciphertext,
    authenticationTag,
    associatedData,
  ];
}


// ============================================================================
// 4. ACCOUNTS & FAMILY PROFILES MODELS
// ============================================================================

class BarkAccount extends BarkEquatable {
  final String accountId;
  final String email;
  final String fullName;
  final String? phoneNumber;
  final BarkAccountType accountType;
  final BarkSubscriptionPlan subscriptionPlan;
  final BarkSubscriptionStatus subscriptionStatus;
  final BarkBillingCycle billingCycle;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastActiveAt;
  final String? sessionToken;

  const BarkAccount({
    required this.accountId,
    required this.email,
    required this.fullName,
    this.phoneNumber,
    this.accountType = BarkAccountType.parent,
    this.subscriptionPlan = BarkSubscriptionPlan.barkPremium,
    this.subscriptionStatus = BarkSubscriptionStatus.active,
    this.billingCycle = BarkBillingCycle.monthly,
    required this.createdAt,
    required this.updatedAt,
    this.lastActiveAt,
    this.sessionToken,
  });

  factory BarkAccount.fromJson(Map<String, dynamic> json) {
    return BarkAccount(
      accountId: json['accountId'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      accountType: BarkAccountType.fromValue(json['accountType'] as String?),
      subscriptionPlan: BarkSubscriptionPlan.fromValue(json['subscriptionPlan'] as String?),
      subscriptionStatus: BarkSubscriptionStatus.fromValue(json['subscriptionStatus'] as String?),
      billingCycle: BarkBillingCycle.fromValue(json['billingCycle'] as String?),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      lastActiveAt: json['lastActiveAt'] != null ? DateTime.parse(json['lastActiveAt'] as String) : null,
      sessionToken: json['sessionToken'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'accountId': accountId,
    'email': email,
    'fullName': fullName,
    if (phoneNumber != null) 'phoneNumber': phoneNumber,
    'accountType': accountType.value,
    'subscriptionPlan': subscriptionPlan.value,
    'subscriptionStatus': subscriptionStatus.value,
    'billingCycle': billingCycle.value,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    if (lastActiveAt != null) 'lastActiveAt': lastActiveAt!.toIso8601String(),
    if (sessionToken != null) 'sessionToken': sessionToken,
  };

  BarkAccount copyWith({
    String? accountId,
    String? email,
    String? fullName,
    String? phoneNumber,
    BarkAccountType? accountType,
    BarkSubscriptionPlan? subscriptionPlan,
    BarkSubscriptionStatus? subscriptionStatus,
    BarkBillingCycle? billingCycle,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastActiveAt,
    String? sessionToken,
  }) {
    return BarkAccount(
      accountId: accountId ?? this.accountId,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      accountType: accountType ?? this.accountType,
      subscriptionPlan: subscriptionPlan ?? this.subscriptionPlan,
      subscriptionStatus: subscriptionStatus ?? this.subscriptionStatus,
      billingCycle: billingCycle ?? this.billingCycle,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastActiveAt: lastActiveAt ?? this.lastActiveAt,
      sessionToken: sessionToken ?? this.sessionToken,
    );
  }

  @override
  List<Object?> get props => [
    accountId,
    email,
    fullName,
    phoneNumber,
    accountType,
    subscriptionPlan,
    subscriptionStatus,
    billingCycle,
    createdAt,
    updatedAt,
    lastActiveAt,
    sessionToken,
  ];
}

class BarkChildProfile extends BarkEquatable {
  final String childId;
  final String accountId;
  final String firstName;
  final String? lastName;
  final int birthYear;
  final BarkGender gender;
  final String? avatarUrl;
  final String? schoolName;
  final String timeZone;
  final BarkMonitoringTier monitoringTier;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BarkChildProfile({
    required this.childId,
    required this.accountId,
    required this.firstName,
    this.lastName,
    required this.birthYear,
    this.gender = BarkGender.unspecified,
    this.avatarUrl,
    this.schoolName,
    this.timeZone = 'UTC',
    this.monitoringTier = BarkMonitoringTier.full,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BarkChildProfile.fromJson(Map<String, dynamic> json) {
    return BarkChildProfile(
      childId: json['childId'] as String,
      accountId: json['accountId'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String?,
      birthYear: json['birthYear'] as int,
      gender: BarkGender.fromValue(json['gender'] as String?),
      avatarUrl: json['avatarUrl'] as String?,
      schoolName: json['schoolName'] as String?,
      timeZone: json['timeZone'] as String? ?? 'UTC',
      monitoringTier: BarkMonitoringTier.fromValue(json['monitoringTier'] as String?),
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'childId': childId,
    'accountId': accountId,
    'firstName': firstName,
    if (lastName != null) 'lastName': lastName,
    'birthYear': birthYear,
    'gender': gender.value,
    if (avatarUrl != null) 'avatarUrl': avatarUrl,
    if (schoolName != null) 'schoolName': schoolName,
    'timeZone': timeZone,
    'monitoringTier': monitoringTier.value,
    'isActive': isActive,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  BarkChildProfile copyWith({
    String? childId,
    String? accountId,
    String? firstName,
    String? lastName,
    int? birthYear,
    BarkGender? gender,
    String? avatarUrl,
    String? schoolName,
    String? timeZone,
    BarkMonitoringTier? monitoringTier,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BarkChildProfile(
      childId: childId ?? this.childId,
      accountId: accountId ?? this.accountId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      birthYear: birthYear ?? this.birthYear,
      gender: gender ?? this.gender,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      schoolName: schoolName ?? this.schoolName,
      timeZone: timeZone ?? this.timeZone,
      monitoringTier: monitoringTier ?? this.monitoringTier,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
    childId,
    accountId,
    firstName,
    lastName,
    birthYear,
    gender,
    avatarUrl,
    schoolName,
    timeZone,
    monitoringTier,
    isActive,
    createdAt,
    updatedAt,
  ];
}

class BarkPairedDevice extends BarkEquatable {
  final String deviceId;
  final String childId;
  final String deviceName;
  final BarkDeviceType deviceType;
  final BarkDeviceOsFamily osFamily;
  final String osVersion;
  final String barkAgentVersion;
  final String? pairingCode;
  final BarkPairingStatus pairingStatus;
  final DateTime pairingTimestamp;
  final int batteryLevel;
  final bool isVpnActive;
  final bool isAccessibilityGranted;
  final bool isNotificationGranted;
  final DateTime? lastHeartbeat;

  const BarkPairedDevice({
    required this.deviceId,
    required this.childId,
    required this.deviceName,
    this.deviceType = BarkDeviceType.phone,
    this.osFamily = BarkDeviceOsFamily.android,
    required this.osVersion,
    required this.barkAgentVersion,
    this.pairingCode,
    this.pairingStatus = BarkPairingStatus.paired,
    required this.pairingTimestamp,
    this.batteryLevel = 100,
    this.isVpnActive = false,
    this.isAccessibilityGranted = false,
    this.isNotificationGranted = false,
    this.lastHeartbeat,
  });

  factory BarkPairedDevice.fromJson(Map<String, dynamic> json) {
    return BarkPairedDevice(
      deviceId: json['deviceId'] as String,
      childId: json['childId'] as String,
      deviceName: json['deviceName'] as String,
      deviceType: BarkDeviceType.fromValue(json['deviceType'] as String?),
      osFamily: BarkDeviceOsFamily.fromValue(json['osFamily'] as String?),
      osVersion: json['osVersion'] as String,
      barkAgentVersion: json['barkAgentVersion'] as String,
      pairingCode: json['pairingCode'] as String?,
      pairingStatus: BarkPairingStatus.fromValue(json['pairingStatus'] as String?),
      pairingTimestamp: DateTime.parse(json['pairingTimestamp'] as String),
      batteryLevel: json['batteryLevel'] as int? ?? 100,
      isVpnActive: json['isVpnActive'] as bool? ?? false,
      isAccessibilityGranted: json['isAccessibilityGranted'] as bool? ?? false,
      isNotificationGranted: json['isNotificationGranted'] as bool? ?? false,
      lastHeartbeat: json['lastHeartbeat'] != null ? DateTime.parse(json['lastHeartbeat'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'deviceId': deviceId,
    'childId': childId,
    'deviceName': deviceName,
    'deviceType': deviceType.value,
    'osFamily': osFamily.value,
    'osVersion': osVersion,
    'barkAgentVersion': barkAgentVersion,
    if (pairingCode != null) 'pairingCode': pairingCode,
    'pairingStatus': pairingStatus.value,
    'pairingTimestamp': pairingTimestamp.toIso8601String(),
    'batteryLevel': batteryLevel,
    'isVpnActive': isVpnActive,
    'isAccessibilityGranted': isAccessibilityGranted,
    'isNotificationGranted': isNotificationGranted,
    if (lastHeartbeat != null) 'lastHeartbeat': lastHeartbeat!.toIso8601String(),
  };

  BarkPairedDevice copyWith({
    String? deviceId,
    String? childId,
    String? deviceName,
    BarkDeviceType? deviceType,
    BarkDeviceOsFamily? osFamily,
    String? osVersion,
    String? barkAgentVersion,
    String? pairingCode,
    BarkPairingStatus? pairingStatus,
    DateTime? pairingTimestamp,
    int? batteryLevel,
    bool? isVpnActive,
    bool? isAccessibilityGranted,
    bool? isNotificationGranted,
    DateTime? lastHeartbeat,
  }) {
    return BarkPairedDevice(
      deviceId: deviceId ?? this.deviceId,
      childId: childId ?? this.childId,
      deviceName: deviceName ?? this.deviceName,
      deviceType: deviceType ?? this.deviceType,
      osFamily: osFamily ?? this.osFamily,
      osVersion: osVersion ?? this.osVersion,
      barkAgentVersion: barkAgentVersion ?? this.barkAgentVersion,
      pairingCode: pairingCode ?? this.pairingCode,
      pairingStatus: pairingStatus ?? this.pairingStatus,
      pairingTimestamp: pairingTimestamp ?? this.pairingTimestamp,
      batteryLevel: batteryLevel ?? this.batteryLevel,
      isVpnActive: isVpnActive ?? this.isVpnActive,
      isAccessibilityGranted: isAccessibilityGranted ?? this.isAccessibilityGranted,
      isNotificationGranted: isNotificationGranted ?? this.isNotificationGranted,
      lastHeartbeat: lastHeartbeat ?? this.lastHeartbeat,
    );
  }

  @override
  List<Object?> get props => [
    deviceId,
    childId,
    deviceName,
    deviceType,
    osFamily,
    osVersion,
    barkAgentVersion,
    pairingCode,
    pairingStatus,
    pairingTimestamp,
    batteryLevel,
    isVpnActive,
    isAccessibilityGranted,
    isNotificationGranted,
    lastHeartbeat,
  ];
}


// ============================================================================
// 5. CAPTURED CHAT & NOTIFICATION MODELS
// ============================================================================

class BarkMonitoredMessage extends BarkEquatable {
  final String messageId;
  final String deviceId;
  final String childId;
  final BarkPlatform platform;
  final BarkChannelType channelType;
  final String senderIdentifier;
  final String? recipientIdentifier;
  final String messageBody;
  final String rawContentHash;
  final int timestampEpochMs;
  final DateTime capturedAt;
  final BarkExtractionSource extractionSource;
  final bool isIncoming;
  final List<String>? mediaUrls;

  const BarkMonitoredMessage({
    required this.messageId,
    required this.deviceId,
    required this.childId,
    required this.platform,
    this.channelType = BarkChannelType.directMessage,
    required this.senderIdentifier,
    this.recipientIdentifier,
    required this.messageBody,
    required this.rawContentHash,
    required this.timestampEpochMs,
    required this.capturedAt,
    required this.extractionSource,
    this.isIncoming = true,
    this.mediaUrls,
  });

  factory BarkMonitoredMessage.fromJson(Map<String, dynamic> json) {
    return BarkMonitoredMessage(
      messageId: json['messageId'] as String,
      deviceId: json['deviceId'] as String,
      childId: json['childId'] as String,
      platform: BarkPlatform.fromValue(json['platform'] as String?),
      channelType: BarkChannelType.fromValue(json['channelType'] as String?),
      senderIdentifier: json['senderIdentifier'] as String,
      recipientIdentifier: json['recipientIdentifier'] as String?,
      messageBody: json['messageBody'] as String,
      rawContentHash: json['rawContentHash'] as String,
      timestampEpochMs: json['timestampEpochMs'] as int,
      capturedAt: DateTime.parse(json['capturedAt'] as String),
      extractionSource: BarkExtractionSource.fromValue(json['extractionSource'] as String?),
      isIncoming: json['isIncoming'] as bool? ?? true,
      mediaUrls: (json['mediaUrls'] as List<dynamic>?)?.map((e) => e as String).toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'messageId': messageId,
    'deviceId': deviceId,
    'childId': childId,
    'platform': platform.value,
    'channelType': channelType.value,
    'senderIdentifier': senderIdentifier,
    if (recipientIdentifier != null) 'recipientIdentifier': recipientIdentifier,
    'messageBody': messageBody,
    'rawContentHash': rawContentHash,
    'timestampEpochMs': timestampEpochMs,
    'capturedAt': capturedAt.toIso8601String(),
    'extractionSource': extractionSource.value,
    'isIncoming': isIncoming,
    if (mediaUrls != null) 'mediaUrls': mediaUrls,
  };

  BarkMonitoredMessage copyWith({
    String? messageId,
    String? deviceId,
    String? childId,
    BarkPlatform? platform,
    BarkChannelType? channelType,
    String? senderIdentifier,
    String? recipientIdentifier,
    String? messageBody,
    String? rawContentHash,
    int? timestampEpochMs,
    DateTime? capturedAt,
    BarkExtractionSource? extractionSource,
    bool? isIncoming,
    List<String>? mediaUrls,
  }) {
    return BarkMonitoredMessage(
      messageId: messageId ?? this.messageId,
      deviceId: deviceId ?? this.deviceId,
      childId: childId ?? this.childId,
      platform: platform ?? this.platform,
      channelType: channelType ?? this.channelType,
      senderIdentifier: senderIdentifier ?? this.senderIdentifier,
      recipientIdentifier: recipientIdentifier ?? this.recipientIdentifier,
      messageBody: messageBody ?? this.messageBody,
      rawContentHash: rawContentHash ?? this.rawContentHash,
      timestampEpochMs: timestampEpochMs ?? this.timestampEpochMs,
      capturedAt: capturedAt ?? this.capturedAt,
      extractionSource: extractionSource ?? this.extractionSource,
      isIncoming: isIncoming ?? this.isIncoming,
      mediaUrls: mediaUrls ?? this.mediaUrls,
    );
  }

  @override
  List<Object?> get props => [
    messageId,
    deviceId,
    childId,
    platform,
    channelType,
    senderIdentifier,
    recipientIdentifier,
    messageBody,
    rawContentHash,
    timestampEpochMs,
    capturedAt,
    extractionSource,
    isIncoming,
    mediaUrls,
  ];
}

class BarkDeduplicationEntry extends BarkEquatable {
  final String hashId;
  final String deviceId;
  final String rawHash;
  final String channelId;
  final String normalizedSnippet;
  final int bucketWindow;
  final DateTime firstSeenAt;
  final DateTime lastSeenAt;
  final int hitCount;

  const BarkDeduplicationEntry({
    required this.hashId,
    required this.deviceId,
    required this.rawHash,
    required this.channelId,
    required this.normalizedSnippet,
    required this.bucketWindow,
    required this.firstSeenAt,
    required this.lastSeenAt,
    this.hitCount = 1,
  });

  factory BarkDeduplicationEntry.fromJson(Map<String, dynamic> json) {
    return BarkDeduplicationEntry(
      hashId: json['hashId'] as String,
      deviceId: json['deviceId'] as String,
      rawHash: json['rawHash'] as String,
      channelId: json['channelId'] as String,
      normalizedSnippet: json['normalizedSnippet'] as String,
      bucketWindow: json['bucketWindow'] as int,
      firstSeenAt: DateTime.parse(json['firstSeenAt'] as String),
      lastSeenAt: DateTime.parse(json['lastSeenAt'] as String),
      hitCount: json['hitCount'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() => {
    'hashId': hashId,
    'deviceId': deviceId,
    'rawHash': rawHash,
    'channelId': channelId,
    'normalizedSnippet': normalizedSnippet,
    'bucketWindow': bucketWindow,
    'firstSeenAt': firstSeenAt.toIso8601String(),
    'lastSeenAt': lastSeenAt.toIso8601String(),
    'hitCount': hitCount,
  };

  BarkDeduplicationEntry copyWith({
    String? hashId,
    String? deviceId,
    String? rawHash,
    String? channelId,
    String? normalizedSnippet,
    int? bucketWindow,
    DateTime? firstSeenAt,
    DateTime? lastSeenAt,
    int? hitCount,
  }) {
    return BarkDeduplicationEntry(
      hashId: hashId ?? this.hashId,
      deviceId: deviceId ?? this.deviceId,
      rawHash: rawHash ?? this.rawHash,
      channelId: channelId ?? this.channelId,
      normalizedSnippet: normalizedSnippet ?? this.normalizedSnippet,
      bucketWindow: bucketWindow ?? this.bucketWindow,
      firstSeenAt: firstSeenAt ?? this.firstSeenAt,
      lastSeenAt: lastSeenAt ?? this.lastSeenAt,
      hitCount: hitCount ?? this.hitCount,
    );
  }

  @override
  List<Object?> get props => [
    hashId,
    deviceId,
    rawHash,
    channelId,
    normalizedSnippet,
    bucketWindow,
    firstSeenAt,
    lastSeenAt,
    hitCount,
  ];
}


// ============================================================================
// 6. RISK SIGNALS & ALERTS MODELS
// ============================================================================

class BarkRiskSignal extends BarkEquatable {
  final String signalId;
  final String deviceId;
  final String childId;
  final String? messageId;
  final BarkDangerCategory dangerCategory;
  final BarkRiskSeverity severityScore;
  final double confidenceScore;
  final List<String> matchedKeywords;
  final String contextSnippet;
  final BarkSignalStatus status;
  final String? encryptionKeyId;
  final DateTime detectedAt;
  final DateTime? uploadedAt;

  const BarkRiskSignal({
    required this.signalId,
    required this.deviceId,
    required this.childId,
    this.messageId,
    required this.dangerCategory,
    required this.severityScore,
    this.confidenceScore = 0.0,
    required this.matchedKeywords,
    required this.contextSnippet,
    this.status = BarkSignalStatus.detected,
    this.encryptionKeyId,
    required this.detectedAt,
    this.uploadedAt,
  });

  factory BarkRiskSignal.fromJson(Map<String, dynamic> json) {
    return BarkRiskSignal(
      signalId: json['signalId'] as String,
      deviceId: json['deviceId'] as String,
      childId: json['childId'] as String,
      messageId: json['messageId'] as String?,
      dangerCategory: BarkDangerCategory.fromValue(json['dangerCategory'] as String?),
      severityScore: BarkRiskSeverity.fromValue(json['severityScore'] as int?),
      confidenceScore: (json['confidenceScore'] as num?)?.toDouble() ?? 0.0,
      matchedKeywords: (json['matchedKeywords'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      contextSnippet: json['contextSnippet'] as String,
      status: BarkSignalStatus.fromValue(json['status'] as String?),
      encryptionKeyId: json['encryptionKeyId'] as String?,
      detectedAt: DateTime.parse(json['detectedAt'] as String),
      uploadedAt: json['uploadedAt'] != null ? DateTime.parse(json['uploadedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'signalId': signalId,
    'deviceId': deviceId,
    'childId': childId,
    if (messageId != null) 'messageId': messageId,
    'dangerCategory': dangerCategory.value,
    'severityScore': severityScore.value,
    'confidenceScore': confidenceScore,
    'matchedKeywords': matchedKeywords,
    'contextSnippet': contextSnippet,
    'status': status.value,
    if (encryptionKeyId != null) 'encryptionKeyId': encryptionKeyId,
    'detectedAt': detectedAt.toIso8601String(),
    if (uploadedAt != null) 'uploadedAt': uploadedAt!.toIso8601String(),
  };

  BarkRiskSignal copyWith({
    String? signalId,
    String? deviceId,
    String? childId,
    String? messageId,
    BarkDangerCategory? dangerCategory,
    BarkRiskSeverity? severityScore,
    double? confidenceScore,
    List<String>? matchedKeywords,
    String? contextSnippet,
    BarkSignalStatus? status,
    String? encryptionKeyId,
    DateTime? detectedAt,
    DateTime? uploadedAt,
  }) {
    return BarkRiskSignal(
      signalId: signalId ?? this.signalId,
      deviceId: deviceId ?? this.deviceId,
      childId: childId ?? this.childId,
      messageId: messageId ?? this.messageId,
      dangerCategory: dangerCategory ?? this.dangerCategory,
      severityScore: severityScore ?? this.severityScore,
      confidenceScore: confidenceScore ?? this.confidenceScore,
      matchedKeywords: matchedKeywords ?? this.matchedKeywords,
      contextSnippet: contextSnippet ?? this.contextSnippet,
      status: status ?? this.status,
      encryptionKeyId: encryptionKeyId ?? this.encryptionKeyId,
      detectedAt: detectedAt ?? this.detectedAt,
      uploadedAt: uploadedAt ?? this.uploadedAt,
    );
  }

  @override
  List<Object?> get props => [
    signalId,
    deviceId,
    childId,
    messageId,
    dangerCategory,
    severityScore,
    confidenceScore,
    matchedKeywords,
    contextSnippet,
    status,
    encryptionKeyId,
    detectedAt,
    uploadedAt,
  ];
}

class BarkAlertHistory extends BarkEquatable {
  final String alertId;
  final String? signalId;
  final String accountId;
  final String childId;
  final String title;
  final BarkDangerCategory category;
  final BarkRiskSeverity severityLevel;
  final BarkAlertStatus parentStatus;
  final String? parentNotes;
  final DateTime? notificationSentAt;
  final DateTime? reviewedAt;
  final DateTime? resolvedAt;
  final List<BarkConversationSuggestion>? conversationSuggestions;

  const BarkAlertHistory({
    required this.alertId,
    this.signalId,
    required this.accountId,
    required this.childId,
    required this.title,
    required this.category,
    required this.severityLevel,
    this.parentStatus = BarkAlertStatus.newAlert,
    this.parentNotes,
    this.notificationSentAt,
    this.reviewedAt,
    this.resolvedAt,
    this.conversationSuggestions,
  });

  factory BarkAlertHistory.fromJson(Map<String, dynamic> json) {
    return BarkAlertHistory(
      alertId: json['alertId'] as String,
      signalId: json['signalId'] as String?,
      accountId: json['accountId'] as String,
      childId: json['childId'] as String,
      title: json['title'] as String,
      category: BarkDangerCategory.fromValue(json['category'] as String?),
      severityLevel: BarkRiskSeverity.fromValue(json['severityLevel'] as int?),
      parentStatus: BarkAlertStatus.fromValue(json['parentStatus'] as String?),
      parentNotes: json['parentNotes'] as String?,
      notificationSentAt: json['notificationSentAt'] != null ? DateTime.parse(json['notificationSentAt'] as String) : null,
      reviewedAt: json['reviewedAt'] != null ? DateTime.parse(json['reviewedAt'] as String) : null,
      resolvedAt: json['resolvedAt'] != null ? DateTime.parse(json['resolvedAt'] as String) : null,
      conversationSuggestions: (json['conversationSuggestions'] as List<dynamic>?)
          ?.map((e) => BarkConversationSuggestion.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'alertId': alertId,
    if (signalId != null) 'signalId': signalId,
    'accountId': accountId,
    'childId': childId,
    'title': title,
    'category': category.value,
    'severityLevel': severityLevel.value,
    'parentStatus': parentStatus.value,
    if (parentNotes != null) 'parentNotes': parentNotes,
    if (notificationSentAt != null) 'notificationSentAt': notificationSentAt!.toIso8601String(),
    if (reviewedAt != null) 'reviewedAt': reviewedAt!.toIso8601String(),
    if (resolvedAt != null) 'resolvedAt': resolvedAt!.toIso8601String(),
    if (conversationSuggestions != null)
      'conversationSuggestions': conversationSuggestions!.map((e) => e.toJson()).toList(),
  };

  BarkAlertHistory copyWith({
    String? alertId,
    String? signalId,
    String? accountId,
    String? childId,
    String? title,
    BarkDangerCategory? category,
    BarkRiskSeverity? severityLevel,
    BarkAlertStatus? parentStatus,
    String? parentNotes,
    DateTime? notificationSentAt,
    DateTime? reviewedAt,
    DateTime? resolvedAt,
    List<BarkConversationSuggestion>? conversationSuggestions,
  }) {
    return BarkAlertHistory(
      alertId: alertId ?? this.alertId,
      signalId: signalId ?? this.signalId,
      accountId: accountId ?? this.accountId,
      childId: childId ?? this.childId,
      title: title ?? this.title,
      category: category ?? this.category,
      severityLevel: severityLevel ?? this.severityLevel,
      parentStatus: parentStatus ?? this.parentStatus,
      parentNotes: parentNotes ?? this.parentNotes,
      notificationSentAt: notificationSentAt ?? this.notificationSentAt,
      reviewedAt: reviewedAt ?? this.reviewedAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      conversationSuggestions: conversationSuggestions ?? this.conversationSuggestions,
    );
  }

  @override
  List<Object?> get props => [
    alertId,
    signalId,
    accountId,
    childId,
    title,
    category,
    severityLevel,
    parentStatus,
    parentNotes,
    notificationSentAt,
    reviewedAt,
    resolvedAt,
    conversationSuggestions,
  ];
}

class BarkConversationSuggestion extends BarkEquatable {
  final String suggestionId;
  final String alertId;
  final BarkDangerCategory riskCategory;
  final String title;
  final String empathyPrompt;
  final String discussionGuideMarkdown;
  final String recommendedAction;
  final String? childPsychologyNotes;
  final DateTime createdAt;

  const BarkConversationSuggestion({
    required this.suggestionId,
    required this.alertId,
    required this.riskCategory,
    required this.title,
    required this.empathyPrompt,
    required this.discussionGuideMarkdown,
    required this.recommendedAction,
    this.childPsychologyNotes,
    required this.createdAt,
  });

  factory BarkConversationSuggestion.fromJson(Map<String, dynamic> json) {
    return BarkConversationSuggestion(
      suggestionId: json['suggestionId'] as String,
      alertId: json['alertId'] as String,
      riskCategory: BarkDangerCategory.fromValue(json['riskCategory'] as String?),
      title: json['title'] as String,
      empathyPrompt: json['empathyPrompt'] as String,
      discussionGuideMarkdown: json['discussionGuideMarkdown'] as String,
      recommendedAction: json['recommendedAction'] as String,
      childPsychologyNotes: json['childPsychologyNotes'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'suggestionId': suggestionId,
    'alertId': alertId,
    'riskCategory': riskCategory.value,
    'title': title,
    'empathyPrompt': empathyPrompt,
    'discussionGuideMarkdown': discussionGuideMarkdown,
    'recommendedAction': recommendedAction,
    if (childPsychologyNotes != null) 'childPsychologyNotes': childPsychologyNotes,
    'createdAt': createdAt.toIso8601String(),
  };

  BarkConversationSuggestion copyWith({
    String? suggestionId,
    String? alertId,
    BarkDangerCategory? riskCategory,
    String? title,
    String? empathyPrompt,
    String? discussionGuideMarkdown,
    String? recommendedAction,
    String? childPsychologyNotes,
    DateTime? createdAt,
  }) {
    return BarkConversationSuggestion(
      suggestionId: suggestionId ?? this.suggestionId,
      alertId: alertId ?? this.alertId,
      riskCategory: riskCategory ?? this.riskCategory,
      title: title ?? this.title,
      empathyPrompt: empathyPrompt ?? this.empathyPrompt,
      discussionGuideMarkdown: discussionGuideMarkdown ?? this.discussionGuideMarkdown,
      recommendedAction: recommendedAction ?? this.recommendedAction,
      childPsychologyNotes: childPsychologyNotes ?? this.childPsychologyNotes,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
    suggestionId,
    alertId,
    riskCategory,
    title,
    empathyPrompt,
    discussionGuideMarkdown,
    recommendedAction,
    childPsychologyNotes,
    createdAt,
  ];
}


// ============================================================================
// 7. SCREEN TIME & VPN RULESETS MODELS
// ============================================================================

class BarkScheduleBlock extends BarkEquatable {
  final String blockId;
  final String rulesetId;
  final String childId;
  final BarkDayOfWeek dayOfWeek;
  final int startTimeMinutes;
  final int endTimeMinutes;
  final bool isEnabled;
  final String recurringRule;

  const BarkScheduleBlock({
    required this.blockId,
    required this.rulesetId,
    required this.childId,
    required this.dayOfWeek,
    required this.startTimeMinutes,
    required this.endTimeMinutes,
    this.isEnabled = true,
    this.recurringRule = 'WEEKLY',
  });

  factory BarkScheduleBlock.fromJson(Map<String, dynamic> json) {
    return BarkScheduleBlock(
      blockId: json['blockId'] as String,
      rulesetId: json['rulesetId'] as String,
      childId: json['childId'] as String,
      dayOfWeek: BarkDayOfWeek.fromValue(json['dayOfWeek'] as int?),
      startTimeMinutes: json['startTimeMinutes'] as int,
      endTimeMinutes: json['endTimeMinutes'] as int,
      isEnabled: json['isEnabled'] as bool? ?? true,
      recurringRule: json['recurringRule'] as String? ?? 'WEEKLY',
    );
  }

  Map<String, dynamic> toJson() => {
    'blockId': blockId,
    'rulesetId': rulesetId,
    'childId': childId,
    'dayOfWeek': dayOfWeek.value,
    'startTimeMinutes': startTimeMinutes,
    'endTimeMinutes': endTimeMinutes,
    'isEnabled': isEnabled,
    'recurringRule': recurringRule,
  };

  BarkScheduleBlock copyWith({
    String? blockId,
    String? rulesetId,
    String? childId,
    BarkDayOfWeek? dayOfWeek,
    int? startTimeMinutes,
    int? endTimeMinutes,
    bool? isEnabled,
    String? recurringRule,
  }) {
    return BarkScheduleBlock(
      blockId: blockId ?? this.blockId,
      rulesetId: rulesetId ?? this.rulesetId,
      childId: childId ?? this.childId,
      dayOfWeek: dayOfWeek ?? this.dayOfWeek,
      startTimeMinutes: startTimeMinutes ?? this.startTimeMinutes,
      endTimeMinutes: endTimeMinutes ?? this.endTimeMinutes,
      isEnabled: isEnabled ?? this.isEnabled,
      recurringRule: recurringRule ?? this.recurringRule,
    );
  }

  @override
  List<Object?> get props => [
    blockId,
    rulesetId,
    childId,
    dayOfWeek,
    startTimeMinutes,
    endTimeMinutes,
    isEnabled,
    recurringRule,
  ];
}

class BarkCategoryBlockRule extends BarkEquatable {
  final String ruleId;
  final String rulesetId;
  final String categoryCode;
  final String categoryName;
  final BarkFilterAction action;
  final String dnsSinkholeIp;
  final DateTime createdAt;

  const BarkCategoryBlockRule({
    required this.ruleId,
    required this.rulesetId,
    required this.categoryCode,
    required this.categoryName,
    this.action = BarkFilterAction.block,
    this.dnsSinkholeIp = '0.0.0.0',
    required this.createdAt,
  });

  factory BarkCategoryBlockRule.fromJson(Map<String, dynamic> json) {
    return BarkCategoryBlockRule(
      ruleId: json['ruleId'] as String,
      rulesetId: json['rulesetId'] as String,
      categoryCode: json['categoryCode'] as String,
      categoryName: json['categoryName'] as String,
      action: BarkFilterAction.fromValue(json['action'] as String?),
      dnsSinkholeIp: json['dnsSinkholeIp'] as String? ?? '0.0.0.0',
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'ruleId': ruleId,
    'rulesetId': rulesetId,
    'categoryCode': categoryCode,
    'categoryName': categoryName,
    'action': action.value,
    'dnsSinkholeIp': dnsSinkholeIp,
    'createdAt': createdAt.toIso8601String(),
  };

  BarkCategoryBlockRule copyWith({
    String? ruleId,
    String? rulesetId,
    String? categoryCode,
    String? categoryName,
    BarkFilterAction? action,
    String? dnsSinkholeIp,
    DateTime? createdAt,
  }) {
    return BarkCategoryBlockRule(
      ruleId: ruleId ?? this.ruleId,
      rulesetId: rulesetId ?? this.rulesetId,
      categoryCode: categoryCode ?? this.categoryCode,
      categoryName: categoryName ?? this.categoryName,
      action: action ?? this.action,
      dnsSinkholeIp: dnsSinkholeIp ?? this.dnsSinkholeIp,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
    ruleId,
    rulesetId,
    categoryCode,
    categoryName,
    action,
    dnsSinkholeIp,
    createdAt,
  ];
}

class BarkCustomException extends BarkEquatable {
  final String exceptionId;
  final String? rulesetId;
  final String childId;
  final String? domainPattern;
  final String? packageName;
  final BarkExceptionType exceptionType;
  final BarkExceptionAction action;
  final String? reason;
  final DateTime createdAt;

  const BarkCustomException({
    required this.exceptionId,
    this.rulesetId,
    required this.childId,
    this.domainPattern,
    this.packageName,
    required this.exceptionType,
    this.action = BarkExceptionAction.alwaysAllow,
    this.reason,
    required this.createdAt,
  });

  factory BarkCustomException.fromJson(Map<String, dynamic> json) {
    return BarkCustomException(
      exceptionId: json['exceptionId'] as String,
      rulesetId: json['rulesetId'] as String?,
      childId: json['childId'] as String,
      domainPattern: json['domainPattern'] as String?,
      packageName: json['packageName'] as String?,
      exceptionType: BarkExceptionType.fromValue(json['exceptionType'] as String?),
      action: BarkExceptionAction.fromValue(json['action'] as String?),
      reason: json['reason'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'exceptionId': exceptionId,
    if (rulesetId != null) 'rulesetId': rulesetId,
    'childId': childId,
    if (domainPattern != null) 'domainPattern': domainPattern,
    if (packageName != null) 'packageName': packageName,
    'exceptionType': exceptionType.value,
    'action': action.value,
    if (reason != null) 'reason': reason,
    'createdAt': createdAt.toIso8601String(),
  };

  BarkCustomException copyWith({
    String? exceptionId,
    String? rulesetId,
    String? childId,
    String? domainPattern,
    String? packageName,
    BarkExceptionType? exceptionType,
    BarkExceptionAction? action,
    String? reason,
    DateTime? createdAt,
  }) {
    return BarkCustomException(
      exceptionId: exceptionId ?? this.exceptionId,
      rulesetId: rulesetId ?? this.rulesetId,
      childId: childId ?? this.childId,
      domainPattern: domainPattern ?? this.domainPattern,
      packageName: packageName ?? this.packageName,
      exceptionType: exceptionType ?? this.exceptionType,
      action: action ?? this.action,
      reason: reason ?? this.reason,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
    exceptionId,
    rulesetId,
    childId,
    domainPattern,
    packageName,
    exceptionType,
    action,
    reason,
    createdAt,
  ];
}

class BarkScreenTimeRuleset extends BarkEquatable {
  final String rulesetId;
  final String childId;
  final String rulesetName;
  final BarkRulesetType rulesetType;
  final bool isActive;
  final bool allowInternet;
  final bool enforceSafesearch;
  final bool blockAllApps;
  final List<BarkScheduleBlock> scheduleBlocks;
  final List<BarkCategoryBlockRule> categoryBlockRules;
  final List<BarkCustomException> customExceptions;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BarkScreenTimeRuleset({
    required this.rulesetId,
    required this.childId,
    required this.rulesetName,
    this.rulesetType = BarkRulesetType.defaultRule,
    this.isActive = false,
    this.allowInternet = true,
    this.enforceSafesearch = true,
    this.blockAllApps = false,
    this.scheduleBlocks = const [],
    this.categoryBlockRules = const [],
    this.customExceptions = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory BarkScreenTimeRuleset.fromJson(Map<String, dynamic> json) {
    return BarkScreenTimeRuleset(
      rulesetId: json['rulesetId'] as String,
      childId: json['childId'] as String,
      rulesetName: json['rulesetName'] as String,
      rulesetType: BarkRulesetType.fromValue(json['rulesetType'] as String?),
      isActive: json['isActive'] as bool? ?? false,
      allowInternet: json['allowInternet'] as bool? ?? true,
      enforceSafesearch: json['enforceSafesearch'] as bool? ?? true,
      blockAllApps: json['blockAllApps'] as bool? ?? false,
      scheduleBlocks: (json['scheduleBlocks'] as List<dynamic>?)
          ?.map((e) => BarkScheduleBlock.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      categoryBlockRules: (json['categoryBlockRules'] as List<dynamic>?)
          ?.map((e) => BarkCategoryBlockRule.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      customExceptions: (json['customExceptions'] as List<dynamic>?)
          ?.map((e) => BarkCustomException.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'rulesetId': rulesetId,
    'childId': childId,
    'rulesetName': rulesetName,
    'rulesetType': rulesetType.value,
    'isActive': isActive,
    'allowInternet': allowInternet,
    'enforceSafesearch': enforceSafesearch,
    'blockAllApps': blockAllApps,
    'scheduleBlocks': scheduleBlocks.map((e) => e.toJson()).toList(),
    'categoryBlockRules': categoryBlockRules.map((e) => e.toJson()).toList(),
    'customExceptions': customExceptions.map((e) => e.toJson()).toList(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  BarkScreenTimeRuleset copyWith({
    String? rulesetId,
    String? childId,
    String? rulesetName,
    BarkRulesetType? rulesetType,
    bool? isActive,
    bool? allowInternet,
    bool? enforceSafesearch,
    bool? blockAllApps,
    List<BarkScheduleBlock>? scheduleBlocks,
    List<BarkCategoryBlockRule>? categoryBlockRules,
    List<BarkCustomException>? customExceptions,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BarkScreenTimeRuleset(
      rulesetId: rulesetId ?? this.rulesetId,
      childId: childId ?? this.childId,
      rulesetName: rulesetName ?? this.rulesetName,
      rulesetType: rulesetType ?? this.rulesetType,
      isActive: isActive ?? this.isActive,
      allowInternet: allowInternet ?? this.allowInternet,
      enforceSafesearch: enforceSafesearch ?? this.enforceSafesearch,
      blockAllApps: blockAllApps ?? this.blockAllApps,
      scheduleBlocks: scheduleBlocks ?? this.scheduleBlocks,
      categoryBlockRules: categoryBlockRules ?? this.categoryBlockRules,
      customExceptions: customExceptions ?? this.customExceptions,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
    rulesetId,
    childId,
    rulesetName,
    rulesetType,
    isActive,
    allowInternet,
    enforceSafesearch,
    blockAllApps,
    scheduleBlocks,
    categoryBlockRules,
    customExceptions,
    createdAt,
    updatedAt,
  ];
}


// ============================================================================
// 8. GEOFENCING & LOCATION CHECK-INS MODELS
// ============================================================================

class BarkGeofenceZone extends BarkEquatable {
  final String zoneId;
  final String childId;
  final String zoneName;
  final BarkZoneType zoneType;
  final double latitude;
  final double longitude;
  final double radiusMeters;
  final bool notifyOnEntry;
  final bool notifyOnExit;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  const BarkGeofenceZone({
    required this.zoneId,
    required this.childId,
    required this.zoneName,
    this.zoneType = BarkZoneType.custom,
    required this.latitude,
    required this.longitude,
    this.radiusMeters = 150.0,
    this.notifyOnEntry = true,
    this.notifyOnExit = true,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory BarkGeofenceZone.fromJson(Map<String, dynamic> json) {
    return BarkGeofenceZone(
      zoneId: json['zoneId'] as String,
      childId: json['childId'] as String,
      zoneName: json['zoneName'] as String,
      zoneType: BarkZoneType.fromValue(json['zoneType'] as String?),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      radiusMeters: (json['radiusMeters'] as num?)?.toDouble() ?? 150.0,
      notifyOnEntry: json['notifyOnEntry'] as bool? ?? true,
      notifyOnExit: json['notifyOnExit'] as bool? ?? true,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'zoneId': zoneId,
    'childId': childId,
    'zoneName': zoneName,
    'zoneType': zoneType.value,
    'latitude': latitude,
    'longitude': longitude,
    'radiusMeters': radiusMeters,
    'notifyOnEntry': notifyOnEntry,
    'notifyOnExit': notifyOnExit,
    'isActive': isActive,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  BarkGeofenceZone copyWith({
    String? zoneId,
    String? childId,
    String? zoneName,
    BarkZoneType? zoneType,
    double? latitude,
    double? longitude,
    double? radiusMeters,
    bool? notifyOnEntry,
    bool? notifyOnExit,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return BarkGeofenceZone(
      zoneId: zoneId ?? this.zoneId,
      childId: childId ?? this.childId,
      zoneName: zoneName ?? this.zoneName,
      zoneType: zoneType ?? this.zoneType,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      radiusMeters: radiusMeters ?? this.radiusMeters,
      notifyOnEntry: notifyOnEntry ?? this.notifyOnEntry,
      notifyOnExit: notifyOnExit ?? this.notifyOnExit,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
    zoneId,
    childId,
    zoneName,
    zoneType,
    latitude,
    longitude,
    radiusMeters,
    notifyOnEntry,
    notifyOnExit,
    isActive,
    createdAt,
    updatedAt,
  ];
}

class BarkLocationCheckin extends BarkEquatable {
  final String checkinId;
  final String childId;
  final String deviceId;
  final BarkCheckinType checkinType;
  final double latitude;
  final double longitude;
  final double accuracyMeters;
  final double? altitude;
  final int? batteryPercentage;
  final DateTime checkinTimestamp;
  final String? addressReverseGeo;
  final String? note;

  const BarkLocationCheckin({
    required this.checkinId,
    required this.childId,
    required this.deviceId,
    this.checkinType = BarkCheckinType.manual,
    required this.latitude,
    required this.longitude,
    required this.accuracyMeters,
    this.altitude,
    this.batteryPercentage,
    required this.checkinTimestamp,
    this.addressReverseGeo,
    this.note,
  });

  factory BarkLocationCheckin.fromJson(Map<String, dynamic> json) {
    return BarkLocationCheckin(
      checkinId: json['checkinId'] as String,
      childId: json['childId'] as String,
      deviceId: json['deviceId'] as String,
      checkinType: BarkCheckinType.fromValue(json['checkinType'] as String?),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      accuracyMeters: (json['accuracyMeters'] as num).toDouble(),
      altitude: (json['altitude'] as num?)?.toDouble(),
      batteryPercentage: json['batteryPercentage'] as int?,
      checkinTimestamp: DateTime.parse(json['checkinTimestamp'] as String),
      addressReverseGeo: json['addressReverseGeo'] as String?,
      note: json['note'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'checkinId': checkinId,
    'childId': childId,
    'deviceId': deviceId,
    'checkinType': checkinType.value,
    'latitude': latitude,
    'longitude': longitude,
    'accuracyMeters': accuracyMeters,
    if (altitude != null) 'altitude': altitude,
    if (batteryPercentage != null) 'batteryPercentage': batteryPercentage,
    'checkinTimestamp': checkinTimestamp.toIso8601String(),
    if (addressReverseGeo != null) 'addressReverseGeo': addressReverseGeo,
    if (note != null) 'note': note,
  };

  BarkLocationCheckin copyWith({
    String? checkinId,
    String? childId,
    String? deviceId,
    BarkCheckinType? checkinType,
    double? latitude,
    double? longitude,
    double? accuracyMeters,
    double? altitude,
    int? batteryPercentage,
    DateTime? checkinTimestamp,
    String? addressReverseGeo,
    String? note,
  }) {
    return BarkLocationCheckin(
      checkinId: checkinId ?? this.checkinId,
      childId: childId ?? this.childId,
      deviceId: deviceId ?? this.deviceId,
      checkinType: checkinType ?? this.checkinType,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      accuracyMeters: accuracyMeters ?? this.accuracyMeters,
      altitude: altitude ?? this.altitude,
      batteryPercentage: batteryPercentage ?? this.batteryPercentage,
      checkinTimestamp: checkinTimestamp ?? this.checkinTimestamp,
      addressReverseGeo: addressReverseGeo ?? this.addressReverseGeo,
      note: note ?? this.note,
    );
  }

  @override
  List<Object?> get props => [
    checkinId,
    childId,
    deviceId,
    checkinType,
    latitude,
    longitude,
    accuracyMeters,
    altitude,
    batteryPercentage,
    checkinTimestamp,
    addressReverseGeo,
    note,
  ];
}

class BarkGeofenceEvent extends BarkEquatable {
  final String eventId;
  final String zoneId;
  final String childId;
  final String deviceId;
  final BarkGeofenceTransition transitionType;
  final double latitude;
  final double longitude;
  final double accuracyMeters;
  final DateTime eventTimestamp;
  final bool isNotified;

  const BarkGeofenceEvent({
    required this.eventId,
    required this.zoneId,
    required this.childId,
    required this.deviceId,
    required this.transitionType,
    required this.latitude,
    required this.longitude,
    required this.accuracyMeters,
    required this.eventTimestamp,
    this.isNotified = false,
  });

  factory BarkGeofenceEvent.fromJson(Map<String, dynamic> json) {
    return BarkGeofenceEvent(
      eventId: json['eventId'] as String,
      zoneId: json['zoneId'] as String,
      childId: json['childId'] as String,
      deviceId: json['deviceId'] as String,
      transitionType: BarkGeofenceTransition.fromValue(json['transitionType'] as String?),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      accuracyMeters: (json['accuracyMeters'] as num).toDouble(),
      eventTimestamp: DateTime.parse(json['eventTimestamp'] as String),
      isNotified: json['isNotified'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'eventId': eventId,
    'zoneId': zoneId,
    'childId': childId,
    'deviceId': deviceId,
    'transitionType': transitionType.value,
    'latitude': latitude,
    'longitude': longitude,
    'accuracyMeters': accuracyMeters,
    'eventTimestamp': eventTimestamp.toIso8601String(),
    'isNotified': isNotified,
  };

  BarkGeofenceEvent copyWith({
    String? eventId,
    String? zoneId,
    String? childId,
    String? deviceId,
    BarkGeofenceTransition? transitionType,
    double? latitude,
    double? longitude,
    double? accuracyMeters,
    DateTime? eventTimestamp,
    bool? isNotified,
  }) {
    return BarkGeofenceEvent(
      eventId: eventId ?? this.eventId,
      zoneId: zoneId ?? this.zoneId,
      childId: childId ?? this.childId,
      deviceId: deviceId ?? this.deviceId,
      transitionType: transitionType ?? this.transitionType,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      accuracyMeters: accuracyMeters ?? this.accuracyMeters,
      eventTimestamp: eventTimestamp ?? this.eventTimestamp,
      isNotified: isNotified ?? this.isNotified,
    );
  }

  @override
  List<Object?> get props => [
    eventId,
    zoneId,
    childId,
    deviceId,
    transitionType,
    latitude,
    longitude,
    accuracyMeters,
    eventTimestamp,
    isNotified,
  ];
}


// ============================================================================
// 9. SYNC QUEUE & TELEMETRY MODELS
// ============================================================================

class BarkOfflineSyncItem extends BarkEquatable {
  final String mutationId;
  final String deviceId;
  final String entityType;
  final String entityId;
  final BarkSyncOperation operation;
  final String payloadBase64;
  final int priority;
  final int attemptCount;
  final int maxRetries;
  final DateTime createdAt;
  final DateTime? lastAttemptAt;
  final String? errorMessage;
  final BarkSyncStatus status;

  const BarkOfflineSyncItem({
    required this.mutationId,
    required this.deviceId,
    required this.entityType,
    required this.entityId,
    required this.operation,
    required this.payloadBase64,
    this.priority = 3,
    this.attemptCount = 0,
    this.maxRetries = 10,
    required this.createdAt,
    this.lastAttemptAt,
    this.errorMessage,
    this.status = BarkSyncStatus.pending,
  });

  factory BarkOfflineSyncItem.fromJson(Map<String, dynamic> json) {
    return BarkOfflineSyncItem(
      mutationId: json['mutationId'] as String,
      deviceId: json['deviceId'] as String,
      entityType: json['entityType'] as String,
      entityId: json['entityId'] as String,
      operation: BarkSyncOperation.fromValue(json['operation'] as String?),
      payloadBase64: json['payloadBase64'] as String,
      priority: json['priority'] as int? ?? 3,
      attemptCount: json['attemptCount'] as int? ?? 0,
      maxRetries: json['maxRetries'] as int? ?? 10,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastAttemptAt: json['lastAttemptAt'] != null ? DateTime.parse(json['lastAttemptAt'] as String) : null,
      errorMessage: json['errorMessage'] as String?,
      status: BarkSyncStatus.fromValue(json['status'] as String?),
    );
  }

  Map<String, dynamic> toJson() => {
    'mutationId': mutationId,
    'deviceId': deviceId,
    'entityType': entityType,
    'entityId': entityId,
    'operation': operation.value,
    'payloadBase64': payloadBase64,
    'priority': priority,
    'attemptCount': attemptCount,
    'maxRetries': maxRetries,
    'createdAt': createdAt.toIso8601String(),
    if (lastAttemptAt != null) 'lastAttemptAt': lastAttemptAt!.toIso8601String(),
    if (errorMessage != null) 'errorMessage': errorMessage,
    'status': status.value,
  };

  BarkOfflineSyncItem copyWith({
    String? mutationId,
    String? deviceId,
    String? entityType,
    String? entityId,
    BarkSyncOperation? operation,
    String? payloadBase64,
    int? priority,
    int? attemptCount,
    int? maxRetries,
    DateTime? createdAt,
    DateTime? lastAttemptAt,
    String? errorMessage,
    BarkSyncStatus? status,
  }) {
    return BarkOfflineSyncItem(
      mutationId: mutationId ?? this.mutationId,
      deviceId: deviceId ?? this.deviceId,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      operation: operation ?? this.operation,
      payloadBase64: payloadBase64 ?? this.payloadBase64,
      priority: priority ?? this.priority,
      attemptCount: attemptCount ?? this.attemptCount,
      maxRetries: maxRetries ?? this.maxRetries,
      createdAt: createdAt ?? this.createdAt,
      lastAttemptAt: lastAttemptAt ?? this.lastAttemptAt,
      errorMessage: errorMessage ?? this.errorMessage,
      status: status ?? this.status,
    );
  }

  @override
  List<Object?> get props => [
    mutationId,
    deviceId,
    entityType,
    entityId,
    operation,
    payloadBase64,
    priority,
    attemptCount,
    maxRetries,
    createdAt,
    lastAttemptAt,
    errorMessage,
    status,
  ];
}

class BarkTelemetryLog extends BarkEquatable {
  final String logId;
  final String deviceId;
  final BarkTelemetryLogType logType;
  final Map<String, dynamic> payload;
  final BarkTelemetrySeverity severity;
  final DateTime recordedAt;
  final DateTime? syncedAt;

  const BarkTelemetryLog({
    required this.logId,
    required this.deviceId,
    required this.logType,
    required this.payload,
    this.severity = BarkTelemetrySeverity.info,
    required this.recordedAt,
    this.syncedAt,
  });

  factory BarkTelemetryLog.fromJson(Map<String, dynamic> json) {
    return BarkTelemetryLog(
      logId: json['logId'] as String,
      deviceId: json['deviceId'] as String,
      logType: BarkTelemetryLogType.fromValue(json['logType'] as String?),
      payload: json['payload'] as Map<String, dynamic>? ?? {},
      severity: BarkTelemetrySeverity.fromValue(json['severity'] as String?),
      recordedAt: DateTime.parse(json['recordedAt'] as String),
      syncedAt: json['syncedAt'] != null ? DateTime.parse(json['syncedAt'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'logId': logId,
    'deviceId': deviceId,
    'logType': logType.value,
    'payload': payload,
    'severity': severity.value,
    'recordedAt': recordedAt.toIso8601String(),
    if (syncedAt != null) 'syncedAt': syncedAt!.toIso8601String(),
  };

  BarkTelemetryLog copyWith({
    String? logId,
    String? deviceId,
    BarkTelemetryLogType? logType,
    Map<String, dynamic>? payload,
    BarkTelemetrySeverity? severity,
    DateTime? recordedAt,
    DateTime? syncedAt,
  }) {
    return BarkTelemetryLog(
      logId: logId ?? this.logId,
      deviceId: deviceId ?? this.deviceId,
      logType: logType ?? this.logType,
      payload: payload ?? this.payload,
      severity: severity ?? this.severity,
      recordedAt: recordedAt ?? this.recordedAt,
      syncedAt: syncedAt ?? this.syncedAt,
    );
  }

  @override
  List<Object?> get props => [
    logId,
    deviceId,
    logType,
    payload,
    severity,
    recordedAt,
    syncedAt,
  ];
}
