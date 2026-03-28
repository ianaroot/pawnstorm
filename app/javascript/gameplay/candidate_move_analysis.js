import Board from 'gameplay/board'
import Rules from 'gameplay/rules'
import { adjacentPositions, attackingPositions, coveringPositions, coveredPositions, defendingPositions, materialValue, shieldingPositions, shieldedPositions } from 'gameplay/board_query_utils'

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

  movedPieceValue() {
    return materialValue(this.board.pieceTypeAt(this.moveObject.startPosition))
  }

  movedPiecePosition(boardScope = 'after') {
    return boardScope === 'prior'
      ? this.moveObject.startPosition
      : this.moveObject.endPosition
  }

  movedPieceAttackerCount() {
    return this.queryValue({
      subject: 'moved_piece',
      subjectSpecifier: 'any',
      relation: 'attacker',
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

    const positions = this.subjectPositions(query, boardScope)
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
      case 'count':
        return this.capturedPieceMatchesSpecifier(query.subjectSpecifier) ? 1 : 0
      case 'value':
        return this.capturedPieceMatchesSpecifier(query.subjectSpecifier) ? this.capturedPieceValue() : 0
      default:
        throw new Error(`captured_piece does not support relation: ${query.relation}`)
    }
  }

  positionalQueryValue(query, positions, boardScope = 'after') {
    switch (query.relation) {
      case 'count':
        return positions.length
      case 'value':
        return this.valueOfPositions(positions, boardScope)
      case 'mobility':
        return this.mobilityValue(positions, boardScope)
      case 'adjacent':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'adjacent',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'attacker':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'attacker',
          team: Board.opposingTeam(this.movedPieceTeam()),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'attacked':
        return this.countPositionsWithRelation({
          positions,
          relation: 'attacker',
          team: Board.opposingTeam(this.movedPieceTeam()),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'defender':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'defender',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'defended':
        return this.countPositionsWithRelation({
          positions,
          relation: 'defender',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'shielder':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'shielder',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'shielded':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'shielded',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'coverer':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'coverer',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      case 'covered':
        return this.aggregatePositionRelationValue({
          positions,
          relation: 'covered',
          team: this.movedPieceTeam(),
          relationSpecifier: query.relationSpecifier,
          boardScope
        })
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support positional relation: ${query.relation}`)
    }
  }

  subjectPositions(query, boardScope = 'after') {
    switch (query.subject) {
      case 'moved_piece':
        return this.movedPiecePositions(query.subjectSpecifier, boardScope)
      case 'allies':
        return this.teamPositions({
          team: this.movedPieceTeam(),
          subjectSpecifier: query.subjectSpecifier,
          boardScope
        })
      case 'opponents':
        return this.teamPositions({
          team: Board.opposingTeam(this.movedPieceTeam()),
          subjectSpecifier: query.subjectSpecifier,
          boardScope
        })
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support positional subject: ${query.subject}`)
    }
  }

  movedPiecePositions(subjectSpecifier = 'any', boardScope = 'after') {
    return this.matchesSpecifier(this.board.pieceTypeAt(this.moveObject.startPosition), subjectSpecifier)
      ? [this.movedPiecePosition(boardScope)]
      : []
  }

  teamPositions({ team, subjectSpecifier = 'any', boardScope = 'after' }) {
    const board = this.boardForScope(boardScope)
    const positions = board._positionsOccupiedByTeam(team)
    return this.positionsMatchingSpecifier(positions, subjectSpecifier, board)
  }

  positionsMatchingSpecifier(positions, subjectSpecifier = 'any', board = this.afterBoard()) {
    if (subjectSpecifier === 'any') {
      return positions
    }

    return positions.filter(position => {
      return this.matchesSpecifier(board.pieceTypeAt(position), subjectSpecifier)
    })
  }

  mobilityValue(positions, boardScope = 'after') {
    return positions.reduce((sum, position) => {
      return sum + this.positionMobility(position, boardScope)
    }, 0)
  }

  valueOfPositions(positions, boardScope = 'after') {
    const board = this.boardForScope(boardScope)

    return positions.reduce((sum, position) => {
      const pieceValue = materialValue(board.pieceTypeAt(position))
      return Number.isFinite(pieceValue) ? sum + pieceValue : sum
    }, 0)
  }

  positionMobility(position, boardScope = 'after') {
    const board = this.boardForScope(boardScope)
    const pieceType = board.pieceTypeAt(position)
    const moveObjects = Rules.availableMovesFrom({ board, startPosition: position })

    if (pieceType === Board.PAWN) {
      return moveObjects.some(moveObject => {
        return Board.file(moveObject.startPosition) === Board.file(moveObject.endPosition)
      }) ? 1 : 0
    }

    return moveObjects.length
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

  countPositionsWithRelation({ positions, relation, team, relationSpecifier, boardScope = 'after' }) {
    return positions.filter(targetPosition => {
      return this.positionRelationValue({
        relation,
        targetPosition,
        team,
        relationSpecifier,
        boardScope
      }) > 0
    }).length
  }

  positionRelationValue({ relation, targetPosition, team, relationSpecifier, boardScope = 'after' }) {
    return this.relatedPositions({
      relation,
      targetPosition,
      team,
      relationSpecifier,
      boardScope
    }).length
  }

  relatedPositions({ relation, targetPosition, team, relationSpecifier, boardScope = 'after' }) {
    const board = this.boardForScope(boardScope)

    const positions = this.rawRelatedPositions({
      relation,
      targetPosition,
      team,
      board
    })

    return this.filterRelationPositions({
      positions,
      relationSpecifier,
      boardScope
    })
  }

  rawRelatedPositions({ relation, targetPosition, team, board }) {
    switch (relation) {
      case 'attacker':
        return attackingPositions({
          board,
          targetPosition,
          team
        })
      case 'adjacent':
        return adjacentPositions({
          board,
          targetPosition,
          team
        })
      case 'defender':
        return defendingPositions({
          board,
          targetPosition,
          team
        })
      case 'shielder':
        return shieldingPositions({
          board,
          targetPosition,
          team
        })
      case 'shielded':
        return shieldedPositions({
          board,
          sourcePosition: targetPosition,
          team
        })
      case 'coverer':
        return coveringPositions({
          board,
          targetPosition,
          team
        })
      case 'covered':
        return coveredPositions({
          board,
          sourcePosition: targetPosition,
          team
        })
      default:
        throw new Error(`Unknown positional relation: ${relation}`)
    }
  }

  filterRelationPositions({ positions, relationSpecifier = 'any', boardScope = 'after' }) {
    if (relationSpecifier === 'any') {
      return positions
    }

    if (relationSpecifier === 'moved_piece') {
      const movedPiecePosition = this.movedPiecePosition(boardScope)
      return positions.filter(position => position === movedPiecePosition)
    }

    const board = this.boardForScope(boardScope)
    return this.positionsMatchingSpecifier(positions, relationSpecifier, board)
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
      case 'moved_piece':
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
