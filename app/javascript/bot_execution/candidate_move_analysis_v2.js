import Board from "gameplay/board"
import profileCollector from "gameplay/profile_collector"
import Rules from "gameplay/rules"
import { materialValue } from "gameplay/board_query_utils"
import { unaryTotal, priorComparisonSourceTotal } from "bot_execution/unary_analysis"
import {
  samePiece,
  relationalResult,
  relationalActorPositions,
  metricForPositions,
  comparisonSourceTotal
} from "bot_execution/relational_analysis"
import { positionFilteredPositions, positionMetricTotal } from "bot_execution/position_analysis"

const AFTER_BOARD = "after"
const PRIOR_BOARD = "prior"


class CandidateMoveAnalysisV2 {
  constructor({ board, moveObject }) {
    this.board = board
    this.moveObject = moveObject
    this._afterBoard = null
    this._availableMovesCache = new Map()
    this._positionMobilityCache = new Map()
    this._relationalResultCache = new Map()
    this._relationalActorPositionsCache = new Map()
    this._relatedTargetPositionsCache = new Map()
    this._boardQueryCache = {}
  }

  afterBoard() {
    return profileCollector.measure('cma.v2.after_board', () => {
      if (!this._afterBoard) {
        const nextBoard = this.board.lightClone()
        nextBoard._hypotheticallyMovePiece(this.moveObject)
        this._afterBoard = nextBoard
      }
      return this._afterBoard
    })
  }

  boardForScope(boardScope = AFTER_BOARD) {
    return boardScope === PRIOR_BOARD ? this.board : this.afterBoard()
  }

  movedPieceTeam() {
    return this.board.teamAt(this.moveObject.startPosition)
  }

  enemyTeam() {
    return Board.opposingTeam(this.movedPieceTeam())
  }

  availableMovesFrom(position, boardScope = AFTER_BOARD) {
    return profileCollector.measure('cma.v2.available_moves_from', () => {
      const key = `${boardScope}:${position}`
      if (this._availableMovesCache.has(key)) { return this._availableMovesCache.get(key) }
      const board = this.boardForScope(boardScope)
      const moves = Rules.availableMovesFrom({ board, startPosition: position })
      this._availableMovesCache.set(key, moves)
      return moves
    })
  }

  positionMobility(position, boardScope = AFTER_BOARD) {
    return profileCollector.measure('cma.v2.position_mobility', () => {
      const key = `${boardScope}:${position}`
      if (this._positionMobilityCache.has(key)) { return this._positionMobilityCache.get(key) }
      const board = this.boardForScope(boardScope)
      const pieceType = board.pieceTypeAt(position)
      const moveObjects = this.availableMovesFrom(position, boardScope)
      let mobility
      if (pieceType === Board.PAWN) {
        const destinations = new Set(moveObjects.map(moveObject => moveObject.endPosition))
        mobility = destinations.size
      } else {
        mobility = moveObjects.length
      }
      this._positionMobilityCache.set(key, mobility)
      return mobility
    })
  }

  individualComparableValue(species) {
    if (species === Board.KING) { return null }
    return materialValue(species)
  }

  movedPieceValue(boardScope = AFTER_BOARD) {
    return this.individualComparableValue(this.resolvedMovedPiece(boardScope).species)
  }

  capturedPieceValue() {
    const resolved = this.resolvedCapturedPiece()
    return resolved ? this.individualComparableValue(resolved.species) : 0
  }

  enemyMovedPieceValue() {
    const recentMove = this.board.recentMoveContext
    return recentMove ? this.individualComparableValue(recentMove.movedPieceSpeciesAfterMove) : 0
  }

  enemyCapturedPieceValue() {
    const resolved = this.resolvedEnemyCapturedPiece()
    return resolved ? this.individualComparableValue(resolved.species) : 0
  }

  resolvedMovedPiece(boardScope = AFTER_BOARD) {
    if (boardScope === PRIOR_BOARD) {
      return {
        species: this.board.pieceTypeAt(this.moveObject.startPosition),
        position: this.moveObject.startPosition
      }
    } else {
      return {
        species: this.afterBoard().pieceTypeAt(this.moveObject.endPosition),
        position: this.moveObject.endPosition
      }
    }
  }

  resolvedCapturedPiece() {
    const species = this.capturedPieceSpecies()
    if (species === null) return null
    return { species }
  }

  resolvedEnemyMovedPiece(boardScope = AFTER_BOARD) {
    const recentMove = this.board.recentMoveContext
    if (!recentMove) return null
    const board = this.boardForScope(boardScope)
    const position = recentMove.movedPieceEndPosition
    const presentOnBoard =
      board.teamAt(position) === recentMove.movingTeam &&
      board.pieceTypeAt(position) === recentMove.movedPieceSpeciesAfterMove
    return {
      species: recentMove.movedPieceSpeciesAfterMove,
      position: presentOnBoard ? position : null,
      presentOnBoard
    }
  }

  resolvedEnemyCapturedPiece() {
    const recentMove = this.board.recentMoveContext
    if (!recentMove || recentMove.capturedPieceSpecies === null) return null
    return {
      species: recentMove.capturedPieceSpecies
    }
  }

  singularActor(actor) {
    return [
      "moved_piece",
      "enemy_moved_piece",
      "captured_piece",
      "enemy_captured_piece"
    ].includes(actor)
  }

  relationalSingularActor(actor) {
    return ["moved_piece", "enemy_moved_piece"].includes(actor)
  }

  singularActorSpecies(actor, boardScope = AFTER_BOARD) {
    switch (actor) {
      case "moved_piece":
        return this.resolvedMovedPiece(boardScope).species
      case "enemy_moved_piece": {
        const resolved = this.resolvedEnemyMovedPiece(boardScope)
        return resolved ? resolved.species : null
      }
      case "captured_piece": {
        const resolved = this.resolvedCapturedPiece()
        return resolved ? resolved.species : null
      }
      case "enemy_captured_piece": {
        const resolved = this.resolvedEnemyCapturedPiece()
        return resolved ? resolved.species : null
      }
      default:
        return null
    }
  }

  singularActorMatchesFilter({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
    return this.matchesFilter({
      species: this.singularActorSpecies(actor, boardScope),
      filter,
      filterMode
    })
  }

  singularActorPresentForMobility({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
    switch (actor) {
      case "moved_piece": {
        const resolved = this.resolvedMovedPiece(boardScope)
        return this.matchesFilter({ species: resolved.species, filter, filterMode })
      }
      case "enemy_moved_piece": {
        const resolved = this.resolvedEnemyMovedPiece(boardScope)
        return Boolean(resolved?.presentOnBoard) && this.matchesFilter({ species: resolved.species, filter, filterMode })
      }
      default:
        return false
    }
  }

  relationalSingularActorResolves({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
    if (!this.relationalSingularActor(actor)) { return true }
    return relationalActorPositions(this, { actor, filter, filterMode, boardScope }).length > 0
  }

  capturedPiecePosition() {
    const startPosition = this.moveObject.startPosition
    const endPosition = this.moveObject.endPosition
    const movedPieceType = this.board.pieceTypeAt(startPosition)
    if (this.board.teamAt(endPosition) !== Board.EMPTY) { return endPosition }
    const changedFiles = Board.file(startPosition) !== Board.file(endPosition)
    if (movedPieceType === Board.PAWN && changedFiles) {
      return this.movedPieceTeam() === Board.WHITE
        ? endPosition - 8
        : endPosition + 8
    }
    return null
  }

  capturedPieceSpecies() {
    const position = this.capturedPiecePosition()
    if (position === null) return null
    return this.board.pieceTypeAt(position)
  }

  normalizedFilterMode(filter, filterMode) {
    return filter === "any" ? "include" : (filterMode || "include")
  }

  matchesFilter({ species, filter = "any", filterMode = null }) {
    if (species === null) return false
    if (filter === "any") return true
    const normalizedFilterMode = this.normalizedFilterMode(filter, filterMode)
    const baseMatch = this.matchesSpeciesFilter({ species, filter })
    return normalizedFilterMode === "exclude" ? !baseMatch : baseMatch
  }

  matchesSpeciesFilter({ species, filter }) {
    switch (filter) {
      case "king":   return species === Board.KING
      case "queen":  return species === Board.QUEEN
      case "rook":   return species === Board.ROOK
      case "bishop": return species === Board.BISHOP
      case "knight": return species === Board.NIGHT
      case "pawn":   return species === Board.PAWN
      case "major":  return species === Board.QUEEN || species === Board.ROOK
      case "minor":  return species === Board.BISHOP || species === Board.NIGHT
      default:
        throw new Error(`Unknown V2 filter: ${filter}`)
    }
  }

  uniquePositions(positions) {
    return Array.from(new Set(positions))
  }

  // ===== Delegates =====

  samePiece({ subject, target }) {
    return samePiece(this, { subject, target })
  }

  unaryTotal({ actor, filter = "any", filterMode = null, operator, boardScope = AFTER_BOARD }) {
    return unaryTotal(this, { actor, filter, filterMode, operator, boardScope })
  }

  priorComparisonSourceTotal({ subject, subjectFilter, subjectFilterMode, operator }) {
    return priorComparisonSourceTotal(this, { subject, subjectFilter, subjectFilterMode, operator })
  }

  relationalResult({ subject, subjectFilter = "any", subjectFilterMode = null, operator, target, targetFilter = "any", targetFilterMode = null, boardScope = AFTER_BOARD }) {
    return relationalResult(this, { subject, subjectFilter, subjectFilterMode, operator, target, targetFilter, targetFilterMode, boardScope })
  }

  relationalActorPositions({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
    return relationalActorPositions(this, { actor, filter, filterMode, boardScope })
  }

  metricForPositions({ metric, positions, boardScope = AFTER_BOARD }) {
    return metricForPositions(this, { metric, positions, boardScope })
  }

  comparisonSourceTotal({ comparisonSource, subject, subjectFilter = "any", subjectFilterMode = null, operator }) {
    return comparisonSourceTotal(this, { comparisonSource, subject, subjectFilter, subjectFilterMode, operator })
  }

  positionFilteredPositions({ actor, filter = "any", filterMode = null, positionAxis, positionComparator, positionTarget, boardScope = AFTER_BOARD }) {
    return positionFilteredPositions(this, { actor, filter, filterMode, positionAxis, positionComparator, positionTarget, boardScope })
  }

  positionMetricTotal({ positions, operator, boardScope = AFTER_BOARD }) {
    return positionMetricTotal(this, { positions, operator, boardScope })
  }
}

export default CandidateMoveAnalysisV2
