import Board from 'gameplay/board'
import { attackerCount, defenderCount, materialValue } from 'gameplay/board_query_utils'

class CandidateMoveAnalysis {
  constructor({ board, moveObject }) {
    this.board = board
    this.moveObject = moveObject
    this._afterBoard = null
  }

  afterBoard() {
    if (!this._afterBoard) {
      const nextBoard = this.board.deepCopy()
      nextBoard._hypotheticallyMovePiece(this.moveObject)
      this._afterBoard = nextBoard
    }

    return this._afterBoard
  }

  boardForScope(boardScope = 'after') {
    return boardScope === 'prior' ? this.board : this.afterBoard()
  }

  movedPieceTeam() {
    return this.board.teamAt(this.moveObject.startPosition)
  }

  movedPiecePosition() {
    return this.moveObject.endPosition
  }

  movedPieceAttackerCount() {
    return this.queryValue({
      subject: 'moved_piece',
      subjectSpecifier: 'any',
      relation: 'attacker_count',
      relationSpecifier: 'any'
    })
  }

  queryValue(query, boardScope = 'after') {
    if (query.subject === 'captured_piece') {
      // Captured pieces are currently the only subject resolved from move-event state
      // rather than a live position on the after-board. If more such subjects appear,
      // this branch may want a broader shared path later.
      return this.capturedPieceQueryValue(query)
    }

    const positions = this.subjectPositions(query)
    return this.positionalQueryValue(query, positions, boardScope)
  }

  relationValue(conditionNode) {
    return this.queryValue({
      subject: conditionNode.subject,
      subjectSpecifier: conditionNode.subjectSpecifier || 'any',
      relation: conditionNode.relation,
      relationSpecifier: conditionNode.relationSpecifier || 'any'
    })
  }

  capturedPieceQueryValue(query) {
    switch (query.relation) {
      case 'presence':
        return this.capturedPieceMatchesSpecifier(query.subjectSpecifier)
      case 'absence':
        return !this.capturedPieceMatchesSpecifier(query.subjectSpecifier)
      case 'piece_count':
        return this.capturedPieceMatchesSpecifier(query.subjectSpecifier) ? 1 : 0
      case 'piece_value':
        return this.capturedPieceMatchesSpecifier(query.subjectSpecifier) ? this.capturedPieceValue() : 0
      default:
        throw new Error(`captured_piece does not support relation: ${query.relation}`)
    }
  }

  positionalQueryValue(query, positions, boardScope = 'after') {
    switch (query.relation) {
      case 'piece_count':
        return positions.length
      case 'attacker_count':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'attacker_count',
          team: Board.opposingTeam(this.movedPieceTeam()),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'defender_count':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'defender_count',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support positional relation: ${query.relation}`)
    }
  }

  subjectPositions(query) {
    switch (query.subject) {
      case 'moved_piece':
        return this.movedPiecePositions(query.subjectSpecifier)
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support positional subject: ${query.subject}`)
    }
  }

  movedPiecePositions(subjectSpecifier = 'any') {
    return this.matchesSpecifier(this.board.pieceTypeAt(this.moveObject.startPosition), subjectSpecifier)
      ? [this.movedPiecePosition()]
      : []
  }

  aggregatePositionRelationValue({ positions, relation, team, relationSpecifier, boardScope = 'after' }) {
    return positions.reduce((sum, targetPosition) => {
      return sum + this.positionRelationValue({
        relation,
        targetPosition,
        team,
        relationSpecifier,
        boardScope
      })
    }, 0)
  }

  positionRelationValue({ relation, targetPosition, team, relationSpecifier, boardScope = 'after' }) {
    const species = this.specifierToSpecies(relationSpecifier)
    const board = this.boardForScope(boardScope)

    switch (relation) {
      case 'attacker_count':
        return attackerCount({
          board,
          targetPosition,
          team,
          species
        })
      case 'defender_count':
        return defenderCount({
          board,
          targetPosition,
          team,
          species
        })
      default:
        throw new Error(`Unknown positional relation: ${relation}`)
    }
  }

  capturedPieceMatchesSpecifier(subjectSpecifier = 'any') {
    return this.matchesSpecifier(this.capturedPieceSpecies(), subjectSpecifier)
  }

  matchesSpecifier(species, specifier = 'any') {
    if (species === null) {
      return false
    }

    return specifier === 'any' || species === this.specifierToSpecies(specifier)
  }

  specifierToSpecies(specifier = 'any') {
    switch (specifier) {
      case 'any':
        return null
      case 'king':
        return Board.KING
      case 'queen':
        return Board.QUEEN
      case 'rook':
        return Board.ROOK
      case 'bishop':
        return Board.BISHOP
      case 'knight':
        return Board.NIGHT
      case 'pawn':
        return Board.PAWN
      default:
        throw new Error(`Unknown specifier: ${specifier}`)
    }
  }

  capturedPiecePresent() {
    return this.capturedPiecePosition() !== null
  }

  capturedPieceAbsent() {
    return !this.capturedPiecePresent()
  }

  capturedPiecePosition() {
    const startPosition = this.moveObject.startPosition
    const endPosition = this.moveObject.endPosition
    const movedPieceType = this.board.pieceTypeAt(startPosition)

    if (this.board.teamAt(endPosition) !== Board.EMPTY) {
      return endPosition
    }

    const changedFiles = Board.file(startPosition) !== Board.file(endPosition)

    if (movedPieceType === Board.PAWN && changedFiles) {
      return this.movedPieceTeam() === Board.WHITE
        ? endPosition - 8
        : endPosition + 8
    }

    return null
  }

  capturedPieceObject() {
    const capturedPosition = this.capturedPiecePosition()
    if (capturedPosition === null) { return null }
    return this.board.pieceObject(capturedPosition)
  }

  capturedPieceValue() {
    const species = this.capturedPieceSpecies()
    if (species === null) {
      return 0
    }

    return materialValue(species)
  }
  capturedPieceSpecies() {
    const capturedPiece = this.capturedPieceObject()
    if (capturedPiece === null) { return null }
    return Board.parseSpecies(capturedPiece)
  }

}

export default CandidateMoveAnalysis
