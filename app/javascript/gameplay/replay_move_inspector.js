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

  inspectPosition({ board, actualMoveNotation = null, selectedMoveKey = null, restrictToStartPosition = null, autoSelectVisibleMove = true }) {
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
    const currentChoiceKey = this.currentChoiceKey({
      scoredMoves,
      actualMoveKey
    })
    const explicitSelectedMoveKey = this.explicitSelectedMoveKey({
      scoredMoves,
      selectedMoveKey
    })
    const inspectedMoveKey = this.inspectedMoveKey({
      visibleMoves,
      explicitSelectedMoveKey,
      currentChoiceKey,
      autoSelectVisibleMove
    })
    const currentChoiceMove = scoredMoves.find(result => result.key === currentChoiceKey) || null
    const inspectedMove = scoredMoves.find(result => result.key === inspectedMoveKey) || null
    const selectedTrace = inspectedMove
      ? this.botRunner.scoreMove({ board, moveObject: inspectedMove.moveObject, withTrace: true })
      : null

    return {
      scoredMoves,
      visibleMoves,
      topScore,
      tiedTopMoveKeys,
      actualMoveKey,
      currentChoiceKey: currentChoiceMove?.key || null,
      currentChoiceMove,
      explicitSelectedMoveKey,
      selectedMoveKey: inspectedMove?.key || null,
      selectedMove: inspectedMove,
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

  currentChoiceKey({ scoredMoves, actualMoveKey }) {
    if (actualMoveKey) {
      return actualMoveKey
    }

    if (scoredMoves.length === 0) {
      return null
    }

    const topScore = Math.max(...scoredMoves.map(result => result.score))
    return scoredMoves.find(result => result.score === topScore)?.key || null
  }

  explicitSelectedMoveKey({ scoredMoves, selectedMoveKey }) {
    if (selectedMoveKey && scoredMoves.some(result => result.key === selectedMoveKey)) {
      return selectedMoveKey
    }

    return null
  }

  inspectedMoveKey({ visibleMoves, explicitSelectedMoveKey, currentChoiceKey, autoSelectVisibleMove }) {
    if (explicitSelectedMoveKey) {
      return explicitSelectedMoveKey
    }

    if (currentChoiceKey) {
      return currentChoiceKey
    }

    if (!autoSelectVisibleMove) {
      return null
    }

    if (visibleMoves.length === 0) {
      return null
    }

    const visibleTopScore = Math.max(...visibleMoves.map(result => result.score))
    return visibleMoves.find(result => result.score === visibleTopScore)?.key || null
  }
}

export default ReplayMoveInspector
