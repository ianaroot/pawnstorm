  import Board from "gameplay/board"
  import profileCollector from "gameplay/profile_collector"
  import Rules from "gameplay/rules"
  import {
    adjacentPositions,
    cachedControlledSquares,
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

    samePiece({ subject, target }) {
        if (
          (subject === "enemy_moved_piece" && target === "captured_piece") ||
          (subject === "captured_piece" && target === "enemy_moved_piece")
        ) {
          return this.enemyMovedPieceMatchesCapturedPiece()
        } else {
          throw new Error(`Unsupported V2 samePiece comparison: ${subject} vs ${target}`)
        }
    }

    enemyMovedPieceMatchesCapturedPiece() {
        const recentMove = this.board.recentMoveContext
        const capturedPiecePosition = this.capturedPiecePosition()
        const capturedPieceSpecies = this.capturedPieceSpecies()
        if (!recentMove || capturedPiecePosition === null || capturedPieceSpecies === null) {
          return false
        } else {
            return (
              recentMove.movedPieceEndPosition === capturedPiecePosition &&
              recentMove.movedPieceSpeciesAfterMove === capturedPieceSpecies
            )
        }
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
      return this.relationalActorPositions({ actor, filter, filterMode, boardScope }).length > 0
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

    comparisonValueFor({ comparisonValue, subject, subjectFilter = "any", subjectFilterMode = null, operator }) {
        return profileCollector.measure('cma.v2.comparison_value_for', () => {
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
              return this.priorComparisonValueFor({ subject, subjectFilter, subjectFilterMode, operator })
          default:
              throw new Error(`Unsupported V2 comparison value: ${comparisonValue}`)
          }
        })
    }

    // ---------------------------------------------     UNARY BLOCK     ------------------------------------------
    unaryValue({ subject, subjectFilter = "any", subjectFilterMode = null, operator, boardScope = AFTER_BOARD }) {
      return profileCollector.measure('cma.v2.unary_value', () => {
        switch (subject) {
          case "allied":
          case "enemy":
            return this.generalSubjectUnaryValue({ subject, subjectFilter, subjectFilterMode, operator, boardScope })
          case "moved_piece":
            return this.movedPieceUnaryValue({ subjectFilter, subjectFilterMode, operator, boardScope })
          case "captured_piece":
            return this.capturedPieceUnaryValue({ subjectFilter, subjectFilterMode, operator })
          case "enemy_moved_piece":
            return this.enemyMovedPieceUnaryValue({ subjectFilter, subjectFilterMode, operator, boardScope })
          case "enemy_captured_piece":
            return this.enemyCapturedPieceUnaryValue({ subjectFilter, subjectFilterMode, operator })
          default:
            throw new Error(`Unsupported V2 unary subject: ${subject}`)
        }
      })
    }

    priorComparisonValueFor({ subject, subjectFilter, subjectFilterMode, operator }) {
        return this.unaryValue({ subject, subjectFilter, subjectFilterMode, operator, boardScope: PRIOR_BOARD })
    }

    generalSubjectUnaryValue({ subject, subjectFilter = "any", subjectFilterMode = null, operator, boardScope = AFTER_BOARD }) {
      return profileCollector.measure('cma.v2.general_subject_unary_value', () => {
        const team = subject === "allied" ? this.movedPieceTeam() : this.enemyTeam()
        const board = this.boardForScope(boardScope)
        const positions = board._positionsOccupiedByTeam(team).filter(position => {
          return this.matchesFilter({ species: board.pieceTypeAt(position), filter: subjectFilter, filterMode: subjectFilterMode })
        })

        switch (operator) {
          case "count":
            return positions.length
          case "value":
            return profileCollector.measure('cma.v2.general_subject_unary_value.value', () => {
              return positions.reduce((sum, position) => {
                return sum + materialValue(board.pieceTypeAt(position))
              }, 0)
            })
          case "mobility":
            return profileCollector.measure('cma.v2.general_subject_unary_value.mobility', () => {
              return positions.reduce((sum, position) => {
                return sum + this.positionMobility(position, boardScope)
              }, 0)
            })
          default:
            throw new Error(`Unsupported V2 unary operator for ${subject}: ${operator}`)
        }
      })
    }

    movedPieceUnaryValue({ subjectFilter = "any", subjectFilterMode = null, operator, boardScope = AFTER_BOARD }) {
      return profileCollector.measure('cma.v2.moved_piece_unary_value', () => {
        const resolved = this.resolvedMovedPiece(boardScope)
        if (!this.matchesFilter({species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode})) { return 0 }
        switch (operator) {
          case "count":
            return 1
          case "value":
            return materialValue(resolved.species)
          case "mobility":
            return this.positionMobility(resolved.position, boardScope)
          default:
            throw new Error(`Unsupported V2 unary operator for moved_piece: ${operator}`)
        }
      })
    }

    capturedPieceUnaryValue({ subjectFilter = "any", subjectFilterMode = null, operator }) {
      const resolved = this.resolvedCapturedPiece()
      if (!resolved) { return 0 }
      if (!this.matchesFilter({ species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode })) { return 0 }
      switch (operator) {
        case "count":
          return 1
        case "value":
          return materialValue(resolved.species)
        default:
          throw new Error(`Unsupported V2 unary operator for captured_piece: ${operator}`)
      }
    }

    enemyMovedPieceUnaryValue({ subjectFilter = "any", subjectFilterMode = null, operator, boardScope = AFTER_BOARD }) {
      return profileCollector.measure('cma.v2.enemy_moved_piece_unary_value', () => {
        const resolved = this.resolvedEnemyMovedPiece(boardScope)
        if (!resolved) { return 0 }
        if (!this.matchesFilter({ species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode })) { return 0 }
        switch (operator) {
          case "count":
            return 1
          case "value":
            return materialValue(resolved.species)
          case "mobility":
            if (!resolved.presentOnBoard) return 0
            return this.positionMobility(resolved.position, boardScope)
          default:
            throw new Error(`Unsupported V2 unary operator for enemy_moved_piece: ${operator}`)
        }
      })
    }

    enemyCapturedPieceUnaryValue({ subjectFilter = "any", subjectFilterMode = null, operator }) {
      const resolved = this.resolvedEnemyCapturedPiece()
      if (!resolved) { return 0 }
      if (!this.matchesFilter({ species: resolved.species, filter: subjectFilter, filterMode: subjectFilterMode })) { return 0 }
      switch (operator) {
        case "count":
          return 1
        case "value":
          return materialValue(resolved.species)
        default:
          throw new Error(`Unsupported V2 unary operator for enemy_captured_piece: ${operator}`)
      }
    }

    // -------------------------------------------------   RELATIONAL BLOCK -------------------------------------------

    relationalResult({ subject, subjectFilter = "any", subjectFilterMode = null,
        operator,
        target, targetFilter = "any", targetFilterMode = null, boardScope = AFTER_BOARD
    }) {
        const cacheKey = [
          boardScope,
          subject,
          subjectFilter,
          subjectFilterMode || "include",
          operator,
          target,
          targetFilter,
          targetFilterMode || "include"
        ].join(":")
        if (this._relationalResultCache.has(cacheKey)) {
          return this._relationalResultCache.get(cacheKey)
        }

        return profileCollector.measure('cma.v2.relational_result', () => {
            const candidateSubjectPositions = this.relationalActorPositions({ actor: subject, filter: subjectFilter, filterMode: subjectFilterMode, boardScope })
            const candidateTargetPositions = this.relationalActorPositions({ actor: target, filter: targetFilter, filterMode: targetFilterMode, boardScope })
            const candidateTargetPositionSet = profileCollector.measure('cma.v2.relational_result.target_set', () => new Set(candidateTargetPositions))
            const pairs = []
            candidateSubjectPositions.forEach((subjectPosition) => {
                const relatedTargetPositions = this.relatedTargetPositionsForSubject({ operator, subjectPosition, target, boardScope })
                relatedTargetPositions.forEach((targetPosition) => {
                    if (!candidateTargetPositionSet.has(targetPosition)) { return }
                    pairs.push({ subjectPosition, targetPosition })
                })
            })
            const result = {
                pairs, // pairs in the return is not strictly speaking necessary but may simplify debugging in the future
                subjectPositions: this.uniquePositions(pairs.map(pair => pair.subjectPosition)),
                targetPositions: this.uniquePositions(pairs.map(pair => pair.targetPosition))
            }
            this._relationalResultCache.set(cacheKey, result)
            return result
        })
    }
    
    relationalActorPositions({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      const cacheKey = `${boardScope}:${actor}:${filter}:${filterMode || "include"}`
      if (this._relationalActorPositionsCache.has(cacheKey)) {
        return this._relationalActorPositionsCache.get(cacheKey)
      }

      return profileCollector.measure('cma.v2.relational_actor_positions', () => {
        let positions
        switch (actor) {
          case "allied":
          case "enemy":
            positions = this.generalRelationalPositions({ actor, filter, filterMode, boardScope })
            break
          case "moved_piece":
            positions = this.movedPieceRelationalPositions({ filter, filterMode, boardScope })
            break
          case "enemy_moved_piece":
            positions = this.enemyMovedPieceRelationalPositions({ filter, filterMode, boardScope })
            break
          default:
            throw new Error(`Unsupported V2 relational actor: ${actor}`)
        }

        this._relationalActorPositionsCache.set(cacheKey, positions)
        return positions
      })
    }

    generalRelationalPositions({ actor, filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      const team = actor === "allied" ? this.movedPieceTeam() : this.enemyTeam()
      const board = this.boardForScope(boardScope)

      return board._positionsOccupiedByTeam(team).filter((position) => {
        return this.matchesFilter({ species: board.pieceTypeAt(position), filter, filterMode })
      })
    }

    movedPieceRelationalPositions({ filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      const resolved = this.resolvedMovedPiece(boardScope)

      if (!this.matchesFilter({ species: resolved.species, filter, filterMode
      })) {
        return []
      } else {
        return [resolved.position]
      }
    }

    enemyMovedPieceRelationalPositions({ filter = "any", filterMode = null, boardScope = AFTER_BOARD }) {
      const resolved = this.resolvedEnemyMovedPiece(boardScope)
      if (!resolved || !resolved.presentOnBoard) { return [] }
      if (!this.matchesFilter({ species: resolved.species, filter, filterMode })) {
        return []
      } else {
        return [resolved.position]
      }
    }

    relatedTargetPositionsForSubject({ operator, subjectPosition, target, boardScope = AFTER_BOARD }) {
        const cacheKey = `${boardScope}:${operator}:${subjectPosition}:${target}`
        if (this._relatedTargetPositionsCache.has(cacheKey)) {
            return this._relatedTargetPositionsCache.get(cacheKey)
        }

        return profileCollector.measure('cma.v2.related_target_positions_for_subject', () => {
            const board = this.boardForScope(boardScope)
            const targetTeam = this.relationalTeamForActor(target)
            let positions
            switch (operator) {
                  case "attack": {
                        const subjectTeam = board.teamAt(subjectPosition)
                        positions = cachedControlledSquares({
                          board,
                          attackerPosition: subjectPosition,
                          cache: this._boardQueryCache,
                          cacheScope: boardScope
                        }).filter((targetPosition) => {
                        return board.teamAt(targetPosition) === targetTeam && targetTeam !== subjectTeam })
                        break
                    }
                    case "defend": {
                        const subjectTeam = board.teamAt(subjectPosition)
                        positions = cachedControlledSquares({
                          board,
                          attackerPosition: subjectPosition,
                          cache: this._boardQueryCache,
                          cacheScope: boardScope
                        }).filter((targetPosition) => {
                        return board.teamAt(targetPosition) === targetTeam && targetTeam === subjectTeam })
                        break
                    }
                case "adjacent":
                    positions = adjacentPositions({ board, targetPosition: subjectPosition, team: targetTeam })
                    break
                case "shield":
                    positions = shieldedPositions({ board, sourcePosition: subjectPosition, team: targetTeam })
                    break
                case "cover":
                    positions = coveredPositions({
                      board,
                      sourcePosition: subjectPosition,
                      team: targetTeam,
                      cache: this._boardQueryCache,
                      cacheScope: boardScope
                    })
                    break
                default:
                    throw new Error(`Unsupported V2 relational operator: ${operator}`)
            }
            this._relatedTargetPositionsCache.set(cacheKey, positions)
            return positions
        })
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
        return profileCollector.measure('cma.v2.metric_for_positions', () => {
            switch (metric) {
                case "count":
                    return positions.length
                case "value":
                    return this.valueOfPositions(positions, boardScope)
                default:
                    throw new Error(`Unsupported V2 relational metric: ${metric}`)
            }
        })
    }

    valueOfPositions(positions, boardScope = AFTER_BOARD) {
        const board = this.boardForScope(boardScope)
        return positions.reduce((sum, position) => {
            return sum + materialValue(board.pieceTypeAt(position))
        }, 0)
    }
  }

  export default CandidateMoveAnalysisV2
