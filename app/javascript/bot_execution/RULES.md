# bot_execution rules

## Team vocabulary

- `movingTeam` is always allies — never the enemy.
- `enemyTeam` is always the opposing team of the mover.
- `subjectTeam` is the team of the actor a condition asserts about — may equal `movingTeam` (allied/moved_piece subjects) or `enemyTeam` (enemy/enemy_moved_piece subjects).
- `enemy_moved_piece` refers to the piece the enemy moved on their previous turn, not the current frame.
- `capturedPiece` is always an enemy piece.
- `enemyCapturedPiece` is always part of the moving team.
- Some conditions refer to `prior_board_state` (PBS) in their comparisons. PBS is the board state at the beginning of the moving team's turn. `afterBoard`, the default state conditions query, is the board state after a potential legal move by moving team.

## Condition evaluation

`ConditionEvaluatorV2.evaluate` dispatches `kind ∈ {relational, census,
identity}`; any other kind throws. `unary`/`position` are retired and never
reach the evaluator.

- `evaluateCensus`: no spatial keys → delegates to `evaluateUnary` (kept as
  the whole-board helper). With `positionAxis` it is region-restricted: the
  **subject** is filtered to the region, but a distinct-actor **target** is
  read board-wide. `target: 'prior_board_state'` coerces both sides.
- `evaluateIdentity`: `same_piece` over subject/target only.
