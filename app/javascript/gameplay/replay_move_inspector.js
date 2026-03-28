import BotRunner from 'gameplay/bot_runner'
import NotationResolver from 'gameplay/notation_resolver'

class ReplayMoveInspector {
  constructor({ compiledProgram, botRunner = null, notationResolver = new NotationResolver() }) {
    this.compiledProgram = compiledProgram
    this.botRunner = botRunner || new BotRunner(compiledProgram)
    this.notationResolver = notationResolver
  }

  static moveKey(moveObject) {
    return [
      moveObject.startPosition,
      moveObject.endPosition,
      moveObject.promotionPiece || 'none'
    ].join(':')
  }

  inspectPosition({ board, actualMoveNotation = null, selectedMoveKey = null, restrictToStartPosition = null }) {
    const scoredMoves = this.botRunner.scoreLegalMoves({ board }).map(result => ({
      ...result,
      key: ReplayMoveInspector.moveKey(result.moveObject)
    }))
    const topScore = scoredMoves.length > 0 ? Math.max(...scoredMoves.map(result => result.score)) : null
    const tiedTopMoveKeys = topScore === null
      ? []
      : scoredMoves.filter(result => result.score === topScore).map(result => result.key)
    const actualMoveKey = this.resolveActualMoveKey({ board, actualMoveNotation, scoredMoves })
    const visibleMoves = restrictToStartPosition === null
      ? scoredMoves
      : scoredMoves.filter(result => result.moveObject.startPosition === restrictToStartPosition)
    const effectiveSelectedMoveKey = this.selectedMoveKey({
      scoredMoves,
      visibleMoves,
      selectedMoveKey,
      actualMoveKey
    })
    const selectedMove = scoredMoves.find(result => result.key === effectiveSelectedMoveKey) || null
    const selectedTrace = selectedMove
      ? this.botRunner.scoreMove({ board, moveObject: selectedMove.moveObject, withTrace: true })
      : null

    return {
      scoredMoves,
      visibleMoves,
      topScore,
      tiedTopMoveKeys,
      actualMoveKey,
      selectedMoveKey: selectedMove?.key || null,
      selectedMove,
      selectedTrace,
      actualMoveWasTopScored: actualMoveKey ? tiedTopMoveKeys.includes(actualMoveKey) : false
    }
  }

  resolveActualMoveKey({ board, actualMoveNotation, scoredMoves }) {
    if (!actualMoveNotation) {
      return null
    }

    try {
      const actualMove = this.notationResolver.resolve({ board, notation: actualMoveNotation })
      const actualMoveKey = ReplayMoveInspector.moveKey(actualMove)
      return scoredMoves.some(result => result.key === actualMoveKey) ? actualMoveKey : null
    } catch (_error) {
      return null
    }
  }

  selectedMoveKey({ scoredMoves, visibleMoves, selectedMoveKey, actualMoveKey }) {
    if (selectedMoveKey && scoredMoves.some(result => result.key === selectedMoveKey)) {
      return selectedMoveKey
    }

    if (actualMoveKey) {
      return actualMoveKey
    }

    if (visibleMoves.length === 0) {
      return null
    }

    const visibleTopScore = Math.max(...visibleMoves.map(result => result.score))
    return visibleMoves.find(result => result.score === visibleTopScore)?.key || null
  }
}

export default ReplayMoveInspector
