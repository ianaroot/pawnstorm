# app/javascript — architecture map

Rails importmaps project. Module aliases are defined in `node_alias_loader.mjs`:
- `gameplay` → `app/javascript/gameplay`
- `bot_execution` → `app/javascript/bot_execution`
- `editorV2` → `app/javascript/editorV2`

---

## Top-level directories

### `gameplay/`
Core chess engine. Board representation, rules, move calculation, game running, replay, sound, notation.  
Key files:
- `board.js` — Board class. Constants: `Board.WHITE = "W"`, `Board.BLACK = "B"`, `Board.EMPTY_SQUARE = "ee"`, piece type constants (`Board.KING`, `Board.QUEEN`, `Board.ROOK`, `Board.BISHOP`, `Board.NIGHT`, `Board.PAWN`). Key methods: `rankIndex(position)`, `fileIndex(position)`, `pieceTypeAt`, `teamAt`, `lightClone`, `_hypotheticallyMovePiece`, `_placePiece`. `layOut` is the board's flat array representation.
- `rules.js` — `Rules.getMoveObject(start, end, board)` — returns a move object (may have `.illegal`, `.additionalActions`, `.promotionPiece`, `.pieceNotation`).
- `board_query_utils.js` — Spatial queries: `controlledSquares`, `adjacentPositions`, `nextPositionOnRay`, `shieldedPositions`.
- `candidate_move_analysis.js` / `candidate_move_analysis_v2.js` (V2 is current) — Analyzes a board+move for relational properties. `analysis.relationalResult(params)` returns `{ pairs, subjectPositions, targetPositions }`.
- `condition_evaluator.js` / `condition_evaluator_v2.js` (V2 is current) — `evaluator.evaluate(payload, { board, moveObject })` → boolean.

### `bot_execution/`
Bot condition evaluation and move analysis, consumed by the editor and match runner.  
Key files:
- `candidate_move_analysis_v2.js` — see gameplay note above (lives here, not in gameplay).
- `condition_evaluator_v2.js` — see gameplay note above (lives here).

### `editorV2/`
Bot editor UI. Panels, state management, rendering, API sync.  
Subdirectories: `panels/`, `models/`, `state/`, `rendering/`, `handlers/`, `sync/`, `templates/`, `utils/`, `controllers/`.  
Key files:
- `index.js` — editor entry point.
- `api.js` — editor API calls.
- `constants.js` — editor-wide constants.

#### `editorV2/panels/condition_preview/`
Generates illustrative board examples for a condition payload. Fully mapped — see `_map.md` in that folder.  
Public entry: `ConditionExampleGenerator.generateConditionExamples(payload, options)`.

---

## Notes

- V2 evaluator/analysis (`condition_evaluator_v2`, `candidate_move_analysis_v2`) are the active versions; V1 files still exist in `gameplay/`.
- `Board._deepCopy`, `Board._hypotheticallyMovePiece`, `Board._placePiece` are nominally private (underscore) but used by the example generation layer.
