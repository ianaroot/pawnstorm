import Board from 'gameplay/board'
import profileCollector from 'gameplay/profile_collector'
import Rules from 'gameplay/rules'
import { adjacentPositions, attackingPositions, controlledSquares, coveringPositions, coveredPositions, defendingPositions, materialValue, shieldingPositions, shieldedPositions } from 'gameplay/board_query_utils'

class CandidateMoveAnalysis {
  constructor({ board, moveObject }) {
    this.board = board
    this.moveObject = moveObject
    this._afterBoard = null
    this._availableMovesCache = new Map()
    this._rawRelatedPositionsCache = new Map()
  }

  cachedRawRelatedPositions({ relation, targetPosition, team, boardScope = 'after' }) {
    const key = `${boardScope}:${relation}:${targetPosition}:${team}`
    if (this._rawRelatedPositionsCache.has(key)) { return this._rawRelatedPositionsCache.get(key) }
    const board = this.boardForScope(boardScope)
    const positions = this.rawRelatedPositions({ relation, targetPosition, team, board })
    this._rawRelatedPositionsCache.set(key, positions)
    return positions
  }

  afterBoard() {
    return profileCollector.measure('cma.v1.after_board', () => {
      if (!this._afterBoard) {
        const nextBoard = this.board.lightClone()
        nextBoard._hypotheticallyMovePiece(this.moveObject)
        this._afterBoard = nextBoard
      }
      return this._afterBoard
    })
  }

  availableMovesFrom(position, boardScope = 'after') {
    return profileCollector.measure('cma.v1.available_moves_from', () => {
      const key = `${boardScope}:${position}`
      if (this._availableMovesCache.has(key)) return this._availableMovesCache.get(key)
      const board = this.boardForScope(boardScope)
      const moves = Rules.availableMovesFrom({ board, startPosition: position })
      this._availableMovesCache.set(key, moves)
      return moves
    })
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
    return boardScope === 'prior' ? this.moveObject.startPosition : this.moveObject.endPosition
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
    return profileCollector.measure('cma.v1.query_value', () => {
      if (query.subject === 'captured_piece') {
        // Captured pieces are currently the only subject resolved from move-event state
        // rather than a live position on the after-board. If more such subjects appear,
        // this branch may want a broader shared path later.
        return this.capturedPieceQueryValue(query)
      }
      const positions = this.subjectPositions(query, boardScope)
      return this.positionalQueryValue(query, positions, boardScope)
    })
  }

  relationValue(conditionNode) {
    return this.queryValue({
      subject: conditionNode.subject,
      subjectSpecifier: conditionNode.subjectSpecifier || 'any',
      subjectSpecifierMode: conditionNode.subjectSpecifierMode || 'include',
      relation: conditionNode.relation,
      relationSpecifier: conditionNode.relationSpecifier || 'any',
      relationSpecifierMode: conditionNode.relationSpecifierMode || 'include'
    })
  }

  capturedPieceQueryValue(query) {
    switch (query.relation) {
      case 'count':
        return this.capturedPieceMatchesSpecifier(query.subjectSpecifier, query.subjectSpecifierMode) ? 1 : 0
      case 'value':
        return this.capturedPieceMatchesSpecifier(query.subjectSpecifier, query.subjectSpecifierMode) ? this.capturedPieceValue() : 0
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
          query,
          positions,
          relation: 'adjacent',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'attacker':
        return this.aggregatePositionRelationValue({
          query,
          positions,
          relation: 'attacker',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'attacked':
        return this.countPositionsWithRelation({
          query,
          positions,
          relation: 'attacked',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'defender':
        return this.aggregatePositionRelationValue({
          query,
          positions,
          relation: 'defender',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'defended':
        return this.countPositionsWithRelation({
          query,
          positions,
          relation: 'defended',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'shielder':
        return this.aggregatePositionRelationValue({
          query,
          positions,
          relation: 'shielder',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'shielded':
        return this.aggregatePositionRelationValue({
          query,
          positions,
          relation: 'shielded',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'coverer':
        return this.aggregatePositionRelationValue({
          query,
          positions,
          relation: 'coverer',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      case 'covered':
        return this.aggregatePositionRelationValue({
          query,
          positions,
          relation: 'covered',
          relationSpecifier: query.relationSpecifier,
          relationSpecifierMode: query.relationSpecifierMode,
          boardScope
        })
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support positional relation: ${query.relation}`)
    }
  }

  subjectPositions(query, boardScope = 'after') {
    switch (query.subject) {
      case 'moved_piece':
        return this.movedPiecePositions(query.subjectSpecifier, boardScope, query.subjectSpecifierMode)
      case 'allies':
        return this.teamPositions({
          team: this.movedPieceTeam(),
          subjectSpecifier: query.subjectSpecifier,
          subjectSpecifierMode: query.subjectSpecifierMode,
          boardScope
        })
      case 'opponents':
        return this.teamPositions({
          team: Board.opposingTeam(this.movedPieceTeam()),
          subjectSpecifier: query.subjectSpecifier,
          subjectSpecifierMode: query.subjectSpecifierMode,
          boardScope
        })
      default:
        throw new Error(`CandidateMoveAnalysis does not yet support positional subject: ${query.subject}`)
    }
  }

  movedPiecePositions(subjectSpecifier = 'any', boardScope = 'after', subjectSpecifierMode = 'include') {
    return this.matchesSpecifier(this.board.pieceTypeAt(this.moveObject.startPosition), subjectSpecifier, subjectSpecifierMode)
      ? [this.movedPiecePosition(boardScope)]
      : []
  }

  teamPositions({ team, subjectSpecifier = 'any', boardScope = 'after', subjectSpecifierMode = 'include' }) {
    const board = this.boardForScope(boardScope)
    const positions = board._positionsOccupiedByTeam(team)
    return this.positionsMatchingSpecifier(positions, subjectSpecifier, subjectSpecifierMode, board)
  }

  positionsMatchingSpecifier(positions, subjectSpecifier = 'any', subjectSpecifierMode = 'include', board = this.afterBoard()) {
    if (subjectSpecifier === 'any') { return positions }
    return positions.filter(position => {
      return this.matchesSpecifier(board.pieceTypeAt(position), subjectSpecifier, subjectSpecifierMode)
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
    const moveObjects = this.availableMovesFrom(position, boardScope)
    if (pieceType === Board.PAWN) {
      const destinations = new Set(moveObjects.map(moveObject => moveObject.endPosition))
      return destinations.size
    }
    return moveObjects.length
  }

  subjectTeam(query) {
    switch (query.subject) {
      case 'moved_piece':
      case 'allies':
        return this.movedPieceTeam()
      case 'opponents':
        return Board.opposingTeam(this.movedPieceTeam())
      default:
        throw new Error(`Unknown positional subject for team resolution: ${query.subject}`)
    }
  }

  relatedTeamFor({ query, relation }) {
    const subjectTeam = this.subjectTeam(query)
    switch (relation) {
      case 'adjacent':
      case 'defender':
      case 'defended':
      case 'shielder':
      case 'shielded':
      case 'coverer':
      case 'covered':
        return subjectTeam
      case 'attacker':
      case 'attacked':
        return Board.opposingTeam(subjectTeam)
      default:
        throw new Error(`Unknown relation for team resolution: ${relation}`)
    }
  }

  aggregatePositionRelationValue({ query, positions, relation, relationSpecifier, relationSpecifierMode,  boardScope = 'after' }) {
    return positions.reduce((sum, targetPosition) => {
      return sum + this.positionRelationValue({
        query,
        relation,
        targetPosition,
        relationSpecifier,
        relationSpecifierMode,
        boardScope
      })
    }, 0)
  }

  countPositionsWithRelation({ query, positions, relation, relationSpecifier, relationSpecifierMode, boardScope = 'after' }) {
    return positions.filter(targetPosition => {
      return this.positionRelationValue({
        query,
        relation,
        targetPosition,
        relationSpecifier,
        relationSpecifierMode,
        boardScope
      }) > 0
    }).length
  }

  positionRelationValue({ query, relation, targetPosition, relationSpecifier, relationSpecifierMode, boardScope = 'after' }) {
    return this.relatedPositions({
      query,
      relation,
      targetPosition,
      relationSpecifier,
      relationSpecifierMode,
      boardScope
    }).length
  }

  relatedPositions({ query, relation, targetPosition, relationSpecifier, relationSpecifierMode, boardScope = 'after' }) {
    const team = this.relatedTeamFor({ query, relation })
    const positions = this.cachedRawRelatedPositions({ relation, targetPosition, team, boardScope })
    return this.filterRelationPositions({
      positions,
      relationSpecifier,
      relationSpecifierMode,
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
      case 'attacked':
        return this.controlledPositions({
          board,
          sourcePosition: targetPosition,
          team
        })
      case 'defender':
        return defendingPositions({
          board,
          targetPosition,
          team
        })
      case 'defended':
        return this.controlledPositions({
          board,
          sourcePosition: targetPosition,
          team
        }).filter(position => board.teamAt(position) === team)
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

  controlledPositions({ board, sourcePosition, team }) {
    return controlledSquares({ board, attackerPosition: sourcePosition }).filter(position => {
      return board.teamAt(position) === team
    })
  }

  filterRelationPositions({ positions, relationSpecifier = 'any', relationSpecifierMode = 'include', boardScope = 'after' }) {
    if (relationSpecifier === 'any') { return positions }
    if (relationSpecifier === 'moved_piece') {
    const movedPiecePosition = this.movedPiecePosition(boardScope)
    return positions.filter(position => {
      const baseMatch = position === movedPiecePosition
      return relationSpecifierMode === 'exclude' ? !baseMatch : baseMatch
    })
  }
    const board = this.boardForScope(boardScope)
    return this.positionsMatchingSpecifier(positions, relationSpecifier, relationSpecifierMode, board)
  }

  capturedPieceMatchesSpecifier(subjectSpecifier = 'any', subjectSpecifierMode = 'include') {
    return this.matchesSpecifier(this.capturedPieceSpecies(), subjectSpecifier, subjectSpecifierMode)
  }

  matchesSpecifier(species, specifier = 'any', specifierMode = 'include') {
    if (species === null) { return false }
    if (specifier === 'any') { return true
    } else{
      const baseMatch = species === this.specifierToSpecies(specifier)
      return specifierMode === 'exclude' ? !baseMatch : baseMatch
    }
    
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
    if (this.board.teamAt(endPosition) !== Board.EMPTY) { return endPosition }
    const changedFiles = Board.file(startPosition) !== Board.file(endPosition)
    if (movedPieceType === Board.PAWN && changedFiles) {
      return this.movedPieceTeam() === Board.WHITE ? endPosition - 8 : endPosition + 8 
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
    if (species === null) { return 0 }
    return materialValue(species)
  }
  capturedPieceSpecies() {
    const capturedPiece = this.capturedPieceObject()
    if (capturedPiece === null) { return null }
    return Board.parseSpecies(capturedPiece)
  }

}

export default CandidateMoveAnalysis
