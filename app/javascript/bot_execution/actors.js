// Actor sets used across bot execution and analysis. The singular sets mirror
// app/models/node_grammar_v2.rb (SINGULAR_SUBJECTS / RELATIONAL_SINGULAR_SUBJECTS);
// spec/models/actors_js_sync_spec.rb guards the mirror.

// Singular move-event actors — count is always 0 or 1 (one piece per role).
// Distinct from group actors (allied, enemy) which can have many pieces.
export const SINGULAR_ACTORS = Object.freeze(new Set([
  'moved_piece', 'captured_piece', 'enemy_moved_piece', 'enemy_captured_piece'
]))

// Relational actors — only the actors that can be subjects in relational conditions.
// captured_piece and enemy_captured_piece are unary-only (no relational context).
export const RELATIONAL_SINGULAR_ACTORS = Object.freeze(new Set([
  'moved_piece', 'enemy_moved_piece'
]))
