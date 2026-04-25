// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import Api from "live_game/api"
import Board from "chess_engine/board"
import BotClass from "bot_execution/bot"
// import NodeEditor from "editor/node_editor"
import GameController from "live_game/game_controller"
import {
  DEBUG_SCENARIOS,
  loadScenario,
  resetScenarioBoard,
  runScenarioMoves,
  scenarioNames
} from "chess_engine/debug_scenarios"
import Layout from "chess_engine/layout"
import MoveObject from "chess_engine/move_object"
import MovementType from "chess_engine/movement_type"
import MovesCalculator from "chess_engine/moves_calculator"
import Rules from "chess_engine/rules"
import Sound from "chess_engine/sound"
import MatchReplayController from "replay/match_replay_controller"
import {
  initializeMatchBotListScrollbars,
  refreshMatchBotListScrollbars
} from "match_bot_list_scrollbars"

// var gameController = new GameController()
// window.addEventListener('load', function () {
//     var gameController = new GameController()
// })

document.addEventListener('turbo:load', () => {
    initializeMatchBotListScrollbars()

    const replayRoot = document.querySelector('[data-match-replay-page="true"]')
    if (replayRoot) {
      new MatchReplayController({ rootElement: replayRoot })
    }

    if (document.querySelector('[data-game-controller-page="true"]')) {
      var gameController = new GameController()
      
      // Expose globally for debugging in development only
      // Only exposed in development to limit security concerns in production
      if (document.body.dataset.environment === 'development') {
        window.gameController = gameController;
        window.api = gameController.api;
        window.gameplay = {
          gameController,
          api: gameController.api,
          board: gameController.board,
          Board,
          Rules,
          MovesCalculator,
          MoveObject,
          scenarios: DEBUG_SCENARIOS,
          scenarioNames,
          resetScenarioBoard: () => resetScenarioBoard(gameController),
          runScenarioMoves: (moveArray, delay) => runScenarioMoves(gameController, moveArray, delay),
          loadScenario: (name, options) => loadScenario(gameController, name, options)
        };
      }
    }
  });

window.addEventListener('resize', () => {
  refreshMatchBotListScrollbars()
})
