// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import Api from "gameplay/api"
import Board from "gameplay/board"
import BotClass from "gameplay/bot"
// import NodeEditor from "editor/node_editor"
import GameController from "gameplay/game_controller"
import {
  DEBUG_SCENARIOS,
  loadScenario,
  resetScenarioBoard,
  runScenarioMoves,
  scenarioNames
} from "gameplay/debug_scenarios"
import Layout from "gameplay/layout"
import MoveObject from "gameplay/move_object"
import MovementType from "gameplay/movement_type"
import MovesCalculator from "gameplay/moves_calculator"
import Rules from "gameplay/rules"
import Sound from "gameplay/sound"
import {
  initializeMatchBotListScrollbars,
  refreshMatchBotListScrollbars
} from "./match_bot_list_scrollbars"

// var gameController = new GameController()
// window.addEventListener('load', function () {
//     var gameController = new GameController()
// })

document.addEventListener('turbo:load', () => {
    initializeMatchBotListScrollbars()

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
