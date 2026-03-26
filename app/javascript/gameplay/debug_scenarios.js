export const DEBUG_SCENARIOS = Object.freeze({
  pawnPromotion: [1, 18, 50, 42, 11, 27, 59, 41, 3, 19, 42, 34, 14, 22, 34, 27, 18, 24, 51, 43, 10, 26, 41, 17, 26, 34, 49, 33, 19, 33, 57, 42, 33, 49, 27, 19, 34, 43, 19, 12, 43, 52, 12, 5, 4, 5, 17, 9, 52, 61],
  sim2: [1, 18, 50, 42, 11, 27, 59, 41, 3, 19, 42, 34, 14, 22, 34, 27, 0, 1, 27, 18, 9, 18, 51, 35, 15, 23, 58, 23],
  blackEnPassant: [1, 18, 50, 42, 11, 27, 59, 41, 3, 19, 42, 34, 14, 22, 34, 27, 18, 24, 51, 43],
  whiteEnPassant: [1, 18, 50, 42, 11, 27, 59, 41, 3, 19, 42, 34, 14, 22, 34, 27, 18, 24, 51, 43, 10, 26, 41, 17, 26, 34, 49, 33],
  checkmate: [12, 20, 57, 42, 5, 26, 42, 32, 3, 21, 32, 17, 21, 53],
  queensCastles: [11, 19, 51, 43, 2, 20, 58, 44, 3, 11, 59, 51, 1, 18, 57, 42, 4, 2, 60, 58],
  kingsCastles: [12, 20, 52, 44, 5, 12, 61, 43, 6, 23, 62, 52, 4, 6, 60, 62],
  singleMoveTest: [1, 18],
  threeFold: [1, 18, 62, 45, 18, 1, 45, 62, 1, 18, 62, 45, 18, 1, 45, 62],
  notThreeFold: [1, 18, 62, 45, 18, 1, 45, 62, 1, 18, 62, 45, 18, 1, 50, 42, 1, 18, 45, 62, 18, 1, 62, 45],
  touchKings: [12, 28, 51, 35, 28, 35, 60, 51, 4, 12, 51, 43, 12, 20, 43, 36, 20, 28],
  check: [12, 20, 57, 42, 3, 21, 42, 32, 21, 53, 32, 17]
})

function cloneMoves(moveArray = []) {
  return [...moveArray]
}

export function scenarioNames() {
  return Object.keys(DEBUG_SCENARIOS)
}

export function resetScenarioBoard(gameController) {
  gameController.pause()
  gameController.board._reset()
  gameController.view.displayLayOut({ board: gameController.board, alert: "" })
}

export function runScenarioMoves(gameController, moveArray, delay = 500) {
  const moves = cloneMoves(moveArray)

  const step = () => {
    if (moves.length < 2) {
      return
    }

    const startPosition = moves.shift()
    const endPosition = moves.shift()
    gameController.attemptMove(startPosition, endPosition)

    if (moves.length >= 2) {
      setTimeout(step, delay)
    }
  }

  step()
}

export function loadScenario(gameController, name, options = {}) {
  const { delay = 500, reset = true } = options
  const moves = DEBUG_SCENARIOS[name]

  if (!moves) {
    throw new Error(`Unknown debug scenario: ${name}`)
  }

  if (reset) {
    resetScenarioBoard(gameController)
  } else {
    gameController.pause()
  }

  runScenarioMoves(gameController, moves, delay)
}
