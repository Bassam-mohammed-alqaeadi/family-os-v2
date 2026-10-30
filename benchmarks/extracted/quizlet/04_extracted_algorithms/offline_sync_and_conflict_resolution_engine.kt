package com.familyos.education.quizlet.engine

import java.time.Instant

/**
 * محرك المزامنة دون اتصال وحل النزاعات في Quizlet (Offline Sync & Conflict Resolution Engine)
 *
 * مستخرج ومبني استناداً إلى كود Quizlet في:
 * `com.quizlet.data` و `com.quizlet.remote` و `com.quizlet.db.sync`
 *
 * يوفر هذا المحرك:
 * 1. إدارة طابور التعديلات وأحداث المذاكرة غير المتصلة (Offline Mutation Queue).
 * 2. حل النزاعات المتزامنة عبر خوارزميات متعددة:
 *    - تقدم الإتقان: دمج التقدم الأعلى (Highest Progression Wins).
 *    - تعديل نصوص البطاقات: الفائز بالختم الزمني الأحدث (Last-Write-Wins / LWW).
 *    - النجوم والتفضيل: الدمج المنطقي (Logical OR Merge).
 *    - الحذف: شواهد القبور (Tombstones Propagation).
 * 3. تقسيم الحزم الكبيرة إلى دفعات (Chunked Batching) مع ضغط البيانات.
 */

enum class MutationType {
    CARD_RECALL,        // إجابة بطاقة في جلسة مذاكرة
    CARD_STAR_TOGGLE,   // وضع أو إزالة نجمة من البطاقة
    CARD_EDIT,          // تعديل نص المصطلح أو التعريف
    CARD_CREATE,        // إنشاء بطاقة جديدة محلياً
    CARD_DELETE         // حذف بطاقة (Tombstone)
}

data class OfflineMutation(
    val mutationId: String,
    val userId: String,
    val setId: String,
    val cardId: String,
    val type: MutationType,
    val payloadJson: String,
    val clientTimestamp: Long = System.currentTimeMillis(),
    val retryCount: Int = 0,
    val isCommitted: Boolean = false
)

data class CardConflictPayload(
    val cardId: String,
    val localTerm: String,
    val localDefinition: String,
    val localMastery: String,
    val localIsStarred: Boolean,
    val localTimestamp: Long,
    val remoteTerm: String,
    val remoteDefinition: String,
    val remoteMastery: String,
    val remoteIsStarred: Boolean,
    val remoteTimestamp: Long
)

data class ResolvedCardData(
    val cardId: String,
    val resolvedTerm: String,
    val resolvedDefinition: String,
    val resolvedMastery: String,
    val resolvedIsStarred: Boolean,
    val resolvedTimestamp: Long,
    val conflictReason: String
)

data class SyncBatch(
    val batchId: String,
    val userId: String,
    val mutations: List<OfflineMutation>,
    val requiresGzip: Boolean,
    val generatedAt: Instant = Instant.now()
)

class OfflineSyncAndConflictResolutionEngine {

    companion object {
        const val MAX_MUTATIONS_PER_BATCH = 50
        const val MAX_RETRY_ATTEMPTS = 5
    }

    /**
     * تجميع الطابور المحلي وتقسيمه إلى دفعات صالحة للإرسال عبر الشبكة
     */
    fun buildSyncBatches(
        userId: String,
        pendingMutations: List<OfflineMutation>
    ): List<SyncBatch> {
        val eligible = pendingMutations
            .filter { !it.isCommitted && it.retryCount < MAX_RETRY_ATTEMPTS }
            .sortedBy { it.clientTimestamp }

        return eligible.chunked(MAX_MUTATIONS_PER_BATCH).mapIndexed { index, chunk ->
            SyncBatch(
                batchId = "batch_${userId}_${System.currentTimeMillis()}_$index",
                userId = userId,
                mutations = chunk,
                requiresGzip = chunk.size > 20
            )
        }
    }

    /**
     * حل النزاع عند تعديل نفس البطاقة من جهازين مختلفين دون اتصال (Conflict Resolver)
     */
    fun resolveCardConflict(conflict: CardConflictPayload): ResolvedCardData {
        // 1. حل نزاع النصوص (Last-Write-Wins بناءً على الختم الزمني الأحدث)
        val (finalTerm, finalDef, termReason) = if (conflict.localTimestamp >= conflict.remoteTimestamp) {
            Triple(conflict.localTerm, conflict.localDefinition, "LWW: التعديل المحلي أحدث")
        } else {
            Triple(conflict.remoteTerm, conflict.remoteDefinition, "LWW: التعديل السحابي أحدث")
        }

        // 2. حل نزاع حالة الإتقان (Highest Progression Wins)
        // ترتيب الأولوية: MASTERED > STILL_LEARNING > UNSEEN
        val masteryOrder = mapOf("MASTERED" to 3, "STILL_LEARNING" to 2, "UNSEEN" to 1)
        val localRank = masteryOrder[conflict.localMastery] ?: 1
        val remoteRank = masteryOrder[conflict.remoteMastery] ?: 1

        val finalMastery = if (localRank > remoteRank) {
            conflict.localMastery
        } else if (remoteRank > localRank) {
            conflict.remoteMastery
        } else {
            // إذا تساوت الرتب، نعتمد الأحدث زمناً
            if (conflict.localTimestamp >= conflict.remoteTimestamp) conflict.localMastery else conflict.remoteMastery
        }

        // 3. حل نزاع النجمة (Logical OR: إذا وُضعت نجمة في أي جهاز تظل مفعلة)
        val finalIsStarred = conflict.localIsStarred || conflict.remoteIsStarred

        val finalTimestamp = maxOf(conflict.localTimestamp, conflict.remoteTimestamp)

        return ResolvedCardData(
            cardId = conflict.cardId,
            resolvedTerm = finalTerm,
            resolvedDefinition = finalDef,
            resolvedMastery = finalMastery,
            resolvedIsStarred = finalIsStarred,
            resolvedTimestamp = finalTimestamp,
            conflictReason = "$termReason | Mastery: HighestProgression ($finalMastery) | Star: OR ($finalIsStarred)"
        )
    }

    /**
     * احتساب فترة الانتظار لإعادة المحاولة (Exponential Backoff Calculation)
     */
    fun calculateNextRetryDelaySeconds(retryCount: Int): Long {
        val baseDelay = 2L // ثانيتان
        val maxDelay = 300L // 5 دقائق كحد أقصى
        val delay = baseDelay * (1L shl retryCount.coerceAtMost(8))
        return delay.coerceAtMost(maxDelay)
    }
}
