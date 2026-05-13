# condition_preview rules

## Goals

Generate a wide variety of legal chess positions + moves in which the condition(s) are satisfied. Variety means:

- Diversity of piece types involved
- Variety of whether the subject/target is the moving piece or a bystander
- Variety of whether kings are subject target or bystander
- Captures and non-captures both represented
- Check and non-check both represented
- Promotion (simple and capture, all four promoted species), castling, and en passant represented when feasibly satisfiable
- For value conditions: multiple value combinations that satisfy the condition (not just the minimum)
- For mobility conditions: different mobility values and the mechanisms that produce them (edge of board, blocking pieces, pins, check restricting moves, attacks on adjacent squares limiting king mobility)
- For relation conditions: both single-pair and multi-pair examples where the condition allows it
- For prior board state conditions: a variety of delta magnitudes (0→1, 1→2, 2→0 etc.)
- For position conditions: variety of what else is happening on the board (attacked, defended, pinned, etc.)

Rare-but-meaningful move types (castling, promotion, en passant) should be deliberately surfaced even though they are unlikely to appear by pure chance.

---

## Legality Rules

All generated boards must satisfy:

- No illegal moves (enforced by `Rules.getMoveObject` returning `illegal: false`)
- Opponent not in check at the start of the current player's turn (`legalPriorTurnState`)
- Pawns not on rank 1 or rank 8 (enforced at construction time via `legalPlacementForSpecies`)
- No more than 8 pawns per team (enforced at construction time via pawn count tracking)
- Exactly one king per team (enforced at construction time)
- No two pieces on the same square except via legal capture (`mergeRelationPieces` and move legality)
- No same team moving twice in a row (enforced by `allowedToMove` on the board and `legalPriorTurnState`)

Note: most of these are construction-time constraints, not verified by the evaluation chain. The verification chain covers illegal moves and opponent-in-check-before-move only.

## Team vocabulary

See `app/javascript/bot_execution/RULES.md` for the canonical definitions of `movingTeam`, `enemyTeam`, `subjectTeam`, `moved_piece`, `enemy_moved_piece`, `captured_piece`, `enemy_captured_piece`, and `prior_board_state` (PBS).

## Placement discipline

All mutations to a pieces `Map<position, pieceCode>` must go through `placePiece` in `shared/piece_placement.js`. Direct `.set()` on a pieces Map bypasses legality guards (pawn-rank, king-uniqueness, 8-pawn-cap) and has produced verifier crashes via invalid priorBoard states. If you find a raw `.set()` on a pieces Map outside `piece_placement.js`, treat it as a bug to fix or a deliberate exception that needs a comment explaining why.
