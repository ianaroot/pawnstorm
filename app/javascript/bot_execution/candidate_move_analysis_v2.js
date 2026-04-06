  import Board from "gameplay/board"
  import Rules from "gameplay/rules"
  import {
    adjacentPositions,
    controlledSquares,
    coveredPositions,
    materialValue,
    shieldedPositions
  } from "gameplay/board_query_utils"
  
  const AFTER_BOARD = "after"
  const PRIOR_BOARD = "prior"

  
  class CandidateMoveAnalysisV2 {
      constructor({ board, moveObject }) {
          this.board = board
          this.moveObject = moveObject
          this._afterBoard = null
          this._availableMovesCache = new Map()
        }

    afterBoard() {
      if (!this._afterBoard) {
        const nextBoard = this.board.lightClone()
        nextBoard._hypotheticallyMovePiece(this.moveObject)
        this._afterBoard = nextBoard
      }
      return this._afterBoard
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
      const key = `${boardScope}:${position}`
      if (this._availableMovesCache.has(key)) { return this._availableMovesCache.get(key) }
      const board = this.boardForScope(boardScope)
      const moves = Rules.availableMovesFrom({ board, startPosition: position })
      this._availableMovesCache.set(key, moves)
      return moves
    }

    positionMobility(position, boardScope = AFTER_BOARD) {
        const board = this.boardForScope(boardScope)
        const pieceType = board.pieceTypeAt(position)
        const moveObjects = this.availableMovesFrom(position, boardScope)
        if (pieceType === Board.PAWN) {
        const destinations = new Set(moveObjects.map(moveObject => moveObject.endPosition))
        return destinations.size
        }
        return moveObjects.length
    }
    movedPieceValue(boardScope = AFTER_BOARD) {
        return materialValue(this.resolvedMovedPiece(boardScope).species)
    }

    capturedPieceValue() {
      const resolved = this.resolvedCapturedPiece()
      return resolved ? materialValue(resolved.species) : 0
    }

    enemyMovedPieceValue() {
        const recentMove = this.board.recentMoveContext
        return recentMove ? materialValue(recentMove.movedPieceSpeciesAfterMove) : 0
    }

    enemyCapturedPieceValue() {
      const resolved = this.resolvedEnemyCapturedPiece()
      return resolved ? materialValue(resolved.species) : 0
    }

    resolvedMovedPiece(boardScope = AFTER_BOARD) {
        if (boardScope === PRIOR_BOARD ) {
            return {
                species: this.board.pieceTypeAt(this.moveObject.startPosition),
                position: this.moveObject.startPosition
            } 
        }else {
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

    capturedPiecePosition() {
      const startPosition = this.moveObject.startPosition
      const endPosition = this.moveObject.endPosition
      const movedPieceType = this.board.pieceTypeAt(startPosition)
      if (this.board.teamAt(endPosition) !== Board.EMPTY) { return endPosition }
      const changedFiles = Board.file(startPosition) !== Board.file(endPosition)
      if (movedPieceType === Board.PAWN && changedFiles) {
        return this.movedPieceTeam() === Board.WHITE
          ? endPosition - 8 //white en passant
          : endPosition + 8 //black en passant
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
      const baseMatch = species === this.filterToSpecies(filter)
      return normalizedFilterMode === "exclude" ? !baseMatch : baseMatch
    }

    filterToSpecies(filter) {
      switch (filter) {
        case "king":
          return Board.KING
        case "queen":
          return Board.QUEEN
        case "rook":
          return Board.ROOK
        case "bishop":
          return Board.BISHOP
        case "knight":
          return Board.NIGHT
        case "pawn":
          return Board.PAWN
        default:
          throw new Error(`Unknown V2 filter: ${filter}`)
      }
    }

    comparisonValueFor({
        comparisonValue,
        subject,
        subjectFilter = "any",
        subjectFilterMode = null,
        verb
    }) {
        if (typeof comparisonValue === "number") {
        return comparisonValue
        }

        switch (comparisonValue) {
        case "moved_piece_value":
            return this.movedPieceValue(AFTER_BOARD)
        case "enemy_moved_piece_value":
            return this.enemyMovedPieceValue()
        case "captured_piece_value":
            return this.capturedPieceValue()
        case "enemy_captured_piece_value":
            return this.enemyCapturedPieceValue()
        case "prior_board_state":
            return this.priorComparisonValueFor({
            subject,
            subjectFilter,
            subjectFilterMode,
            verb
            })
        default:
            throw new Error(`Unsupported V2 comparison value: ${comparisonValue}`)
        }
    }

    // ---------------------------------------------     UNARY BLOCK     ------------------------------------------
    unaryValue({
      subject,
      subjectFilter = "any",
      subjectFilterMode = null,
      verb,
      boardScope = AFTER_BOARD
    }) {
      switch (subject) {
        case "allied":
        case "enemy":
          return this.generalSubjectUnaryValue({
            subject,
            subjectFilter,
            subjectFilterMode,
            verb,
            boardScope
          })
        case "moved_piece":
          return this.movedPieceUnaryValue({
            subjectFilter,
            subjectFilterMode,
            verb,
            boardScope
          })
        case "captured_piece":
          return this.capturedPieceUnaryValue({
            subjectFilter,
            subjectFilterMode,
            verb
          })
        case "enemy_moved_piece":
          return this.enemyMovedPieceUnaryValue({
            subjectFilter,
            subjectFilterMode,
            verb,
            boardScope
          })
        case "enemy_captured_piece":
          return this.enemyCapturedPieceUnaryValue({
            subjectFilter,
            subjectFilterMode,
            verb
          })
        default:
          throw new Error(`Unsupported V2 unary subject: ${subject}`)
      }
    }

    priorComparisonValueFor({ subject, subjectFilter, subjectFilterMode, verb }) {
        return this.unaryValue({
            subject,
            subjectFilter,
            subjectFilterMode,
            verb,
            boardScope: PRIOR_BOARD
        })
    }

    generalSubjectUnaryValue({
      subject,
      subjectFilter = "any",
      subjectFilterMode = null,
      verb,
      boardScope = AFTER_BOARD
    }) {
      const team = subject === "allied" ? this.movedPieceTeam() : this.enemyTeam()
      const board = this.boardForScope(boardScope)
      const positions = board._positionsOccupiedByTeam(team).filter(position => {
        return this.matchesFilter({
          species: board.pieceTypeAt(position),
          filter: subjectFilter,
          filterMode: subjectFilterMode
        })
      })
      switch (verb) {
        case "count":
          return positions.length
        case "value":
          return positions.reduce((sum, position) => {
            return sum + materialValue(board.pieceTypeAt(position))
          }, 0)
        case "mobility":
          return positions.reduce((sum, position) => {
            return sum + this.positionMobility(position, boardScope)
          }, 0)
        default:
          throw new Error(`Unsupported V2 unary verb for ${subject}: ${verb}`)
      }
    }

    movedPieceUnaryValue({
      subjectFilter = "any",
      subjectFilterMode = null,
      verb,
      boardScope = AFTER_BOARD
    }) {
      const resolved = this.resolvedMovedPiece(boardScope)
      if (!this.matchesFilter({species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode})) { return 0 }
      switch (verb) {
        case "count":
          return 1
        case "value":
          return materialValue(resolved.species)
        case "mobility":
          return this.positionMobility(resolved.position, boardScope)
        default:
          throw new Error(`Unsupported V2 unary verb for moved_piece: ${verb}`)
      }
    }

    capturedPieceUnaryValue({
      subjectFilter = "any",
      subjectFilterMode = null,
      verb
    }) {
      const resolved = this.resolvedCapturedPiece()
      if (!resolved) { return 0 }
      if (!this.matchesFilter({ species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode })) { return 0 }
      switch (verb) {
        case "count":
          return 1
        case "value":
          return materialValue(resolved.species)
        default:
          throw new Error(`Unsupported V2 unary verb for captured_piece: ${verb}`)
      }
    }

    enemyMovedPieceUnaryValue({
      subjectFilter = "any",
      subjectFilterMode = null,
      verb,
      boardScope = AFTER_BOARD
    }) {
      const resolved = this.resolvedEnemyMovedPiece(boardScope)
      if (!resolved) { return 0 }
      if (!this.matchesFilter({ species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode })) { return 0 }
      switch (verb) {
        case "count":
          return 1
        case "value":
          return materialValue(resolved.species)
        case "mobility":
          if (!resolved.presentOnBoard) return 0
          return this.positionMobility(resolved.position, boardScope)
        default:
          throw new Error(`Unsupported V2 unary verb for enemy_moved_piece: ${verb}`)
      }
    }

    enemyCapturedPieceUnaryValue({
      subjectFilter = "any",
      subjectFilterMode = null,
      verb
    }) {
      const resolved = this.resolvedEnemyCapturedPiece()
      if (!resolved) { return 0 }
      if (!this.matchesFilter({ species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode })) { return 0 }
      switch (verb) {
        case "count":
          return 1
        case "value":
          return materialValue(resolved.species)
        default:
          throw new Error(`Unsupported V2 unary verb for enemy_captured_piece: ${verb}`)
      }
    }

    // -------------------------------------------------   RELATIONAL BLOCK -------------------------------------------

    relationalResult({
        subject,
        subjectFilter = "any",
        subjectFilterMode = null,
        verb,
        target,
        targetFilter = "any",
        targetFilterMode = null,
        boardScope = AFTER_BOARD
    }) {
        const candidateSubjectPositions = this.relationalActorPositions({
            actor: subject,
            filter: subjectFilter,
            filterMode: subjectFilterMode,
            boardScope
        })
        const candidateTargetPositions = this.relationalActorPositions({
            actor: target,
            filter: targetFilter,
            filterMode: targetFilterMode,
            boardScope
        })
        const candidateTargetPositionSet = new Set(candidateTargetPositions)
        const pairs = []
        candidateSubjectPositions.forEach((subjectPosition) => {
            const relatedTargetPositions = this.relatedTargetPositionsForSubject({
                verb,
                subjectPosition,
                target,
                boardScope
            })
            relatedTargetPositions.forEach((targetPosition) => {
                if (!candidateTargetPositionSet.has(targetPosition)) { return }
                pairs.push({ subjectPosition, targetPosition })
            })
        })
        return {
            pairs,
            subjectPositions: this.uniquePositions(pairs.map(pair => pair.subjectPosition)),
            targetPositions: this.uniquePositions(pairs.map(pair => pair.targetPosition))
        }
    }
    
    relationalActorPositions({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      switch (actor) {
        case "allied":
        case "enemy":
          return this.generalRelationalPositions({
            actor,
            filter,
            filterMode,
            boardScope
          })
        case "moved_piece":
          return this.movedPieceRelationalPositions({
            filter,
            filterMode,
            boardScope
          })
        case "enemy_moved_piece":
          return this.enemyMovedPieceRelationalPositions({
            filter,
            filterMode,
            boardScope
          })
        default:
          throw new Error(`Unsupported V2 relational actor: ${actor}`)
      }
    }

    generalRelationalPositions({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      const team = actor === "allied" ? this.movedPieceTeam() : this.enemyTeam()
      const board = this.boardForScope(boardScope)

      return board._positionsOccupiedByTeam(team).filter((position) => {
        return this.matchesFilter({
          species: board.pieceTypeAt(position),
          filter,
          filterMode
        })
      })
    }

    movedPieceRelationalPositions({ filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      const resolved = this.resolvedMovedPiece(boardScope)

      if (!this.matchesFilter({
        species: resolved.species,
        filter,
        filterMode
      })) {
        return []
      }

      return [resolved.position]
    }

    enemyMovedPieceRelationalPositions({ filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      const resolved = this.resolvedEnemyMovedPiece(boardScope)

      if (!resolved || !resolved.presentOnBoard) {
        return []
      }

      if (!this.matchesFilter({
        species: resolved.species,
        filter,
        filterMode
      })) {
        return []
      }

      return [resolved.position]
    }

    relatedTargetPositionsForSubject({ verb, subjectPosition, target, boardScope = AFTER_BOARD }) {
        const board = this.boardForScope(boardScope)
        const targetTeam = this.relationalTeamForActor(target)
        switch (verb) {
              case "attack": {
                    const subjectTeam = board.teamAt(subjectPosition)
                    return controlledSquares({ board, attackerPosition: subjectPosition }).filter((targetPosition) => {
                    return board.teamAt(targetPosition) === targetTeam && targetTeam !== subjectTeam })
                }
                case "defend": {
                    const subjectTeam = board.teamAt(subjectPosition)
                    return controlledSquares({ board, attackerPosition: subjectPosition }).filter((targetPosition) => {
                    return board.teamAt(targetPosition) === targetTeam && targetTeam === subjectTeam })
                }
            case "adjacent":
                return adjacentPositions({ board, targetPosition: subjectPosition, team: targetTeam })
            case "shield":
                return shieldedPositions({ board, sourcePosition: subjectPosition, team: targetTeam })
            case "cover":
                return coveredPositions({ board, sourcePosition: subjectPosition, team: targetTeam })
            default:
                throw new Error(`Unsupported V2 relational verb: ${verb}`)
        }
    }

    relationalTeamForActor(actor) {
        switch (actor) {
            case "allied":
            case "moved_piece":
                return this.movedPieceTeam()
            case "enemy":
            case "enemy_moved_piece":
                return this.enemyTeam()
            default:
                throw new Error(`Unsupported V2 relational team actor: ${actor}`)
        }
    }

        uniquePositions(positions) {
      return Array.from(new Set(positions))
    }

    metricForPositions({ metric, positions, boardScope = AFTER_BOARD }) {
        switch (metric) {
            case "count":
                return positions.length
            case "value":
                return this.valueOfPositions(positions, boardScope)
            default:
                throw new Error(`Unsupported V2 relational metric: ${metric}`)
        }
    }

    valueOfPositions(positions, boardScope = AFTER_BOARD) {
        const board = this.boardForScope(boardScope)

        return positions.reduce((sum, position) => {
            return sum + materialValue(board.pieceTypeAt(position))
        }, 0)
    }


  }

  export default CandidateMoveAnalysisV2