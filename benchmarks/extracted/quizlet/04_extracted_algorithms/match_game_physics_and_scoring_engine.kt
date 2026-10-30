package com.familyos.education.quizlet.engine

/**
 * محرك وقواعد لعبة المطابقة التنافسية (Match Game Physics & Scoring Engine)
 *
 * مستخرج ومبني استناداً إلى كود Quizlet التفاعلي في:
 * `com.quizlet.features.match`
 *
 * ميكانيكا اللعبة:
 * 1. اختيار 6 أزواج من المصطلحات والتعريفات وتوزيعها عشوائياً في شبكة مكونة من 12 بلاطة.
 * 2. آلة حالات النقر (Tap State Machine):
 *    - النقر الأول: تحديد البلاطة بلون أزرق ساطع.
 *    - النقر الثاني: إذا تطابقت البلاطتان، تومضان بلون أخضر وتختفيان.
 *    - إذا لم تتطابقا: تهتزان بلون أحمر وتُضاف ثانية واحدة كعقوبة (Penalty) لمؤقت اللعبة.
 * 3. احتساب النتيجة النهائية وتحديد الترتيب المئوي (Percentile Ranking).
 */

enum class TileType {
    TERM,
    DEFINITION
}

enum class TileState {
    DEFAULT,   // الحالة العادية
    SELECTED,  // محددة حالياً (توهج أزرق)
    MATCHED,   // متطابقة (تختفي من الشبكة)
    MISMATCH   // خطأ (وميض أحمر واهتزاز لمسي)
}

data class MatchTile(
    val id: String,
    val pairId: String,
    val text: String,
    val type: TileType,
    val state: TileState = TileState.DEFAULT
)

data class MatchGameState(
    val tiles: List<MatchTile>,
    val selectedTile: MatchTile? = null,
    val elapsedSeconds: Double = 0.0,
    val penaltySeconds: Double = 0.0,
    val matchedPairsCount: Int = 0,
    val totalPairsCount: Int = 6,
    val isGameCompleted: Boolean = false
)

class MatchGamePhysicsAndScoringEngine {

    companion object {
        const val PAIRS_PER_GAME = 6
        const val MISMATCH_PENALTY_SECONDS = 1.0 // عقوبة الخطأ في Quizlet ثانية كاملة
    }

    /**
     * تهيئة لوحة لعب جديدة وتوزيع 12 بلاطة مبعثرة
     */
    fun startNewGame(cards: List<StudiableCard>): MatchGameState {
        val selectedCards = cards.shuffled().take(PAIRS_PER_GAME)
        val tiles = mutableListOf<MatchTile>()

        selectedCards.forEach { card ->
            tiles.add(
                MatchTile(
                    id = "tile_term_${card.id}",
                    pairId = card.id,
                    text = card.term,
                    type = TileType.TERM
                )
            )
            tiles.add(
                MatchTile(
                    id = "tile_def_${card.id}",
                    pairId = card.id,
                    text = card.definition,
                    type = TileType.DEFINITION
                )
            )
        }

        return MatchGameState(
            tiles = tiles.shuffled(),
            selectedTile = null,
            elapsedSeconds = 0.0,
            penaltySeconds = 0.0,
            matchedPairsCount = 0,
            totalPairsCount = selectedCards.size,
            isGameCompleted = false
        )
    }

    /**
     * معالجة نقرة المستخدم على إحدى البلاطات (Selection & Match Logic)
     */
    fun handleTileClick(currentState: MatchGameState, clickedTileId: String): MatchGameState {
        if (currentState.isGameCompleted) return currentState

        val clickedTile = currentState.tiles.find { it.id == clickedTileId } ?: return currentState
        if (clickedTile.state == TileState.MATCHED) return currentState // متطابقة بالفعل

        val previouslySelected = currentState.selectedTile

        return when {
            // الحالة 1: النقر على نفس البلاطة المحددة لإلغاء التحديد
            previouslySelected?.id == clickedTile.id -> {
                val updatedTiles = currentState.tiles.map {
                    if (it.id == clickedTile.id) it.copy(state = TileState.DEFAULT) else it
                }
                currentState.copy(tiles = updatedTiles, selectedTile = null)
            }

            // الحالة 2: النقر على أول بلاطة
            previouslySelected == null -> {
                val updatedTiles = currentState.tiles.map {
                    if (it.id == clickedTile.id) it.copy(state = TileState.SELECTED) else it
                }
                currentState.copy(tiles = updatedTiles, selectedTile = clickedTile.copy(state = TileState.SELECTED))
            }

            // الحالة 3: النقر على بلاطة ثانية وكان الاختيار صحيحاً (MATCH!)
            previouslySelected.pairId == clickedTile.pairId -> {
                val newMatchedCount = currentState.matchedPairsCount + 1
                val isCompleted = newMatchedCount == currentState.totalPairsCount

                val updatedTiles = currentState.tiles.map {
                    if (it.id == previouslySelected.id || it.id == clickedTile.id) {
                        it.copy(state = TileState.MATCHED)
                    } else it
                }

                currentState.copy(
                    tiles = updatedTiles,
                    selectedTile = null,
                    matchedPairsCount = newMatchedCount,
                    isGameCompleted = isCompleted
                )
            }

            // الحالة 4: النقر على بلاطة ثانية ولكن الاختيار خاطئ (MISMATCH / PENALTY)
            else -> {
                val updatedTiles = currentState.tiles.map {
                    if (it.id == previouslySelected.id || it.id == clickedTile.id) {
                        it.copy(state = TileState.MISMATCH)
                    } else it
                }

                currentState.copy(
                    tiles = updatedTiles,
                    selectedTile = null,
                    penaltySeconds = currentState.penaltySeconds + MISMATCH_PENALTY_SECONDS
                )
            }
        }
    }

    /**
     * تحديث توقيت اللعبة
     */
    fun tickTimer(currentState: MatchGameState, deltaSeconds: Double): MatchGameState {
        if (currentState.isGameCompleted) return currentState
        return currentState.copy(elapsedSeconds = currentState.elapsedSeconds + deltaSeconds)
    }

    /**
     * احتساب النتيجة الإجمالية بالأجزاء من المئة من الثانية
     */
    fun calculateFinalTime(state: MatchGameState): Double {
        return state.elapsedSeconds + state.penaltySeconds
    }
}
