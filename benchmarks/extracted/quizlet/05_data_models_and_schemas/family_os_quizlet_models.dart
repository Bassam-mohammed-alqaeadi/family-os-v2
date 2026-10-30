// ==============================================================================
// نماذج بيانات مجموعات وبطاقات Quizlet لتطبيق Flutter في Family OS
// المسار: benchmarks/extracted/quizlet/05_data_models_and_schemas/family_os_quizlet_models.dart
// ==============================================================================

enum StudyAccessType { public, password, classOnly, private }

enum CardMasteryLevel { unseen, stillLearning, mastered }

enum StudyModeType { flashcards, learn, write, test, match }

class StudySetModel {
  final String id;
  final String title;
  final String? description;
  final int wordCount;
  final String creatorId;
  final String creatorUsername;
  final StudyAccessType accessType;
  final bool hasImages;
  final bool hasAudio;
  final bool isStarred;
  final DateTime createdTimestamp;
  final DateTime lastModifiedTimestamp;
  final DateTime? lastStudiedTimestamp;
  final List<FlashcardModel> cards;

  const StudySetModel({
    required this.id,
    required this.title,
    this.description,
    required this.wordCount,
    required this.creatorId,
    required this.creatorUsername,
    this.accessType = StudyAccessType.public,
    this.hasImages = false,
    this.hasAudio = false,
    this.isStarred = false,
    required this.createdTimestamp,
    required this.lastModifiedTimestamp,
    this.lastStudiedTimestamp,
    this.cards = const [],
  });

  factory StudySetModel.fromJson(Map<String, dynamic> json) {
    return StudySetModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      wordCount: json['word_count'] as int? ?? 0,
      creatorId: json['creator_id'] as String,
      creatorUsername: json['creator_username'] as String,
      accessType: _parseAccessType(json['access_type'] as String?),
      hasImages: (json['has_images'] as int? ?? 0) == 1,
      hasAudio: (json['has_audio'] as int? ?? 0) == 1,
      isStarred: (json['is_starred'] as int? ?? 0) == 1,
      createdTimestamp: DateTime.fromMillisecondsSinceEpoch(json['created_timestamp'] as int),
      lastModifiedTimestamp: DateTime.fromMillisecondsSinceEpoch(json['last_modified_timestamp'] as int),
      lastStudiedTimestamp: json['last_studied_timestamp'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['last_studied_timestamp'] as int)
          : null,
      cards: (json['cards'] as List<dynamic>?)
              ?.map((e) => FlashcardModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'word_count': wordCount,
        'creator_id': creatorId,
        'creator_username': creatorUsername,
        'access_type': accessType.name.toUpperCase(),
        'has_images': hasImages ? 1 : 0,
        'has_audio': hasAudio ? 1 : 0,
        'is_starred': isStarred ? 1 : 0,
        'created_timestamp': createdTimestamp.millisecondsSinceEpoch,
        'last_modified_timestamp': lastModifiedTimestamp.millisecondsSinceEpoch,
        'last_studied_timestamp': lastStudiedTimestamp?.millisecondsSinceEpoch,
      };

  static StudyAccessType _parseAccessType(String? val) {
    switch (val?.toUpperCase()) {
      case 'PASSWORD':
        return StudyAccessType.password;
      case 'CLASS_ONLY':
        return StudyAccessType.classOnly;
      case 'PRIVATE':
        return StudyAccessType.private;
      default:
        return StudyAccessType.public;
    }
  }
}

class FlashcardModel {
  final String id;
  final String setId;
  final int cardOrder;
  final String term;
  final String definition;
  final String? imageUrl;
  final String? audioRemoteUrl;
  final String? audioLocalPath;
  final bool isStarred;
  final CardMasteryStateModel? mastery;

  const FlashcardModel({
    required this.id,
    required this.setId,
    required this.cardOrder,
    required this.term,
    required this.definition,
    this.imageUrl,
    this.audioRemoteUrl,
    this.audioLocalPath,
    this.isStarred = false,
    this.mastery,
  });

  factory FlashcardModel.fromJson(Map<String, dynamic> json) {
    return FlashcardModel(
      id: json['id'] as String,
      setId: json['set_id'] as String,
      cardOrder: json['card_order'] as int? ?? 0,
      term: json['term'] as String,
      definition: json['definition'] as String,
      imageUrl: json['image_url'] as String?,
      audioRemoteUrl: json['audio_remote_url'] as String?,
      audioLocalPath: json['audio_local_path'] as String?,
      isStarred: (json['is_starred'] as int? ?? 0) == 1,
      mastery: json['mastery'] != null
          ? CardMasteryStateModel.fromJson(json['mastery'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'set_id': setId,
        'card_order': cardOrder,
        'term': term,
        'definition': definition,
        'image_url': imageUrl,
        'audio_remote_url': audioRemoteUrl,
        'audio_local_path': audioLocalPath,
        'is_starred': isStarred ? 1 : 0,
      };
}

class CardMasteryStateModel {
  final String cardId;
  final String setId;
  final String userId;
  final CardMasteryLevel masteryLevel;
  final int repetitionCount;
  final int consecutiveCorrect;
  final double easinessFactor;
  final double intervalDays;
  final DateTime? lastReviewedAt;
  final DateTime nextReviewDueAt;
  final int totalMistakes;

  const CardMasteryStateModel({
    required this.cardId,
    required this.setId,
    required this.userId,
    this.masteryLevel = CardMasteryLevel.unseen,
    this.repetitionCount = 0,
    this.consecutiveCorrect = 0,
    this.easinessFactor = 2.5,
    this.intervalDays = 0.0,
    this.lastReviewedAt,
    required this.nextReviewDueAt,
    this.totalMistakes = 0,
  });

  factory CardMasteryStateModel.fromJson(Map<String, dynamic> json) {
    return CardMasteryStateModel(
      cardId: json['card_id'] as String,
      setId: json['set_id'] as String,
      userId: json['user_id'] as String,
      masteryLevel: _parseMastery(json['mastery_level'] as String?),
      repetitionCount: json['repetition_count'] as int? ?? 0,
      consecutiveCorrect: json['consecutive_correct'] as int? ?? 0,
      easinessFactor: (json['easiness_factor'] as num?)?.toDouble() ?? 2.5,
      intervalDays: (json['interval_days'] as num?)?.toDouble() ?? 0.0,
      lastReviewedAt: json['last_reviewed_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(json['last_reviewed_at'] as int)
          : null,
      nextReviewDueAt: DateTime.fromMillisecondsSinceEpoch(json['next_review_due_at'] as int),
      totalMistakes: json['total_mistakes'] as int? ?? 0,
    );
  }

  static CardMasteryLevel _parseMastery(String? val) {
    switch (val?.toUpperCase()) {
      case 'MASTERED':
        return CardMasteryLevel.mastered;
      case 'STILL_LEARNING':
        return CardMasteryLevel.stillLearning;
      default:
        return CardMasteryLevel.unseen;
    }
  }
}
