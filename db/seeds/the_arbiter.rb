# Standalone seed file for The Arbiter.

require_relative 'helpers'

user = seed_user!

arbiter = user.bots.find_or_initialize_by(name: 'The Arbiter')
arbiter.description = 'A broad-spectrum tactician: deep template coverage, disciplined safety gating on every reward, and original counter-pressure chains.'
arbiter.save!

reset_bot_graph!(arbiter)
root = arbiter.root_node

# ── Foundations ───────────────────────────────────────────────────────────────
# Checkmate, stalemate handling — always evaluate regardless of game phase.

foundations_org = create_organizer!(
  bot: arbiter, position_x: -1600, position_y: 300,
  title: 'Foundations'
)
connect!(root, foundations_org)

create_template_instances!(
  bot: arbiter,
  start_node: foundations_org,
  placements: [
    { template_id: 'checkmate',                   x: -1900, y: 600 },
    { template_id: 'avoid-stalemate',             x: -1380, y: 600 },
    { template_id: 'force-stalemate-when-losing', x:  -860, y: 600 },
  ]
)

# ── Development & Openings ────────────────────────────────────────────────────

dev_org = create_organizer!(
  bot: arbiter, position_x: 700, position_y: 300,
  title: 'Development & Openings'
)
connect!(root, dev_org)

create_template_instances!(
  bot: arbiter,
  start_node: dev_org,
  placements: [
    { template_id: 'opening-game-condition',  x:  200, y:  600 },
    { template_id: 'endgame',                 x:  720, y:  600 },
    { template_id: 'safe-knight-development', x: 1240, y:  600 },
    { template_id: 'safe-bishop-development', x: 1760, y:  600 },
    { template_id: 'castling',                x:  200, y: 2000 },
    { template_id: 'queen-safety',            x:  720, y: 2000 },
  ]
)

# ── Tactical Operations ───────────────────────────────────────────────────────

tactics_org = create_organizer!(
  bot: arbiter, position_x: 4100, position_y: 300,
  title: 'Tactical Operations'
)
connect!(root, tactics_org)

create_template_instances!(
  bot: arbiter,
  start_node: tactics_org,
  placements: [
    # Forks, pins, skewers
    { template_id: 'knight-fork',          x: 2400, y:  600 },
    { template_id: 'bishop-fork',          x: 2920, y:  600 },
    { template_id: 'queen-pin',            x: 3440, y:  600 },
    { template_id: 'rook-pin',             x: 3960, y:  600 },
    { template_id: 'queen-skewer',         x: 4480, y:  600 },
    { template_id: 'rook-skewer',          x: 5000, y:  600 },

    # Discovered attacks, king pressure
    { template_id: 'discovered-attack',    x: 2400, y: 2000 },
    { template_id: 'discovered-check',     x: 2920, y: 2000 },
    { template_id: 'dual-king-threat',     x: 3440, y: 2000 },
    { template_id: 'open-file-rook',       x: 3960, y: 2000 },
    { template_id: 'connect-majors',       x: 4480, y: 2000 },
    { template_id: 'direct-king-pressure', x: 5000, y: 2000 },

    # King tightening, shelter removal, captures
    { template_id: 'tighten-the-net',      x: 2400, y: 3400 },
    { template_id: 'strip-king-shelter',   x: 2920, y: 3400 },
    { template_id: 'winning-capture',      x: 3440, y: 3400 },
    { template_id: 'free-capture',         x: 3960, y: 3400 },
    { template_id: 'winning-attack',       x: 4480, y: 3400 },
    { template_id: 'winning',              x: 5000, y: 3400 },
    { template_id: 'even-trade',           x: 5520, y: 3400 },
    { template_id: 'recapture',            x: 6040, y: 3400 },
  ]
)

# ── Defense & Pawns ───────────────────────────────────────────────────────────

defense_org = create_organizer!(
  bot: arbiter, position_x: 8300, position_y: 300,
  title: 'Defense & Pawns'
)
connect!(root, defense_org)

create_template_instances!(
  bot: arbiter,
  start_node: defense_org,
  placements: [
    { template_id: 'safety',                  x: 7000, y:  600 },
    { template_id: 'avoid-hanging-pieces',    x: 7520, y:  600 },
    { template_id: 'hide-from-attacks',       x: 8040, y:  600 },
    { template_id: 'retain-defense',          x: 8560, y:  600 },
    { template_id: 'escape-check-safely',     x: 9080, y:  600 },

    { template_id: 'push-safe-pawns',         x: 7000, y: 2000 },
    { template_id: 'attack-pawns',            x: 7520, y: 2000 },
    { template_id: 'improve-pawn-mobility',   x: 8040, y: 2000 },
    { template_id: 'kick-material',           x: 8560, y: 2000 },
    { template_id: 'avoid-pawn-attacks',      x: 9080, y: 2000 },

    { template_id: 'safe-promotion',          x: 7000, y: 3400 },
    { template_id: 'pawns-protect-majors',    x: 7520, y: 3400 },
    { template_id: 'queen-pressure',          x: 8040, y: 3400 },
    { template_id: 'discourage-pawn-roaming', x: 8560, y: 3400 },
  ]
)

# ── Custom Chain: "Check and Restrict" ───────────────────────────────────────
# Reward a check that also reduces enemy king mobility.
# DAG gate: (enemy pawns can't reach us + allied defends) OR (no enemy attack).

cr_org = create_organizer!(
  bot: arbiter, position_x: 2600, position_y: 4800,
  title: 'Check and Restrict'
)
connect!(tactics_org, cr_org)

cr_gate = create_condition_chain!(
  bot: arbiter,
  start_node: cr_org,
  x: 2600, y: 4960,
  conditions: [
    rel_v2(
      subject: 'moved_piece', operator: 'attack', target: 'enemy',
      target_filter: 'king', target_filter_mode: 'include'
    ),
    unary_v2(
      subject: 'enemy', filter: 'king', filter_mode: 'include',
      operator: 'mobility', comparator: 'less_than', target: 'prior_board_state'
    ),
  ]
)

cr_pawn_safe = create_condition!(
  bot: arbiter, position_x: 2450, position_y: 5260,
  data: rel_v2(
    subject: 'enemy', subject_filter: 'pawn', subject_filter_mode: 'include',
    operator: 'attack', target: 'moved_piece',
    subject_comparison_metric: 'count', subject_comparator: 'equal_to',
    subject_comparison_source: 'exact_number', subject_comparison_source_total: 0
  )
)
connect!(cr_gate, cr_pawn_safe)

cr_allied_def = create_condition!(
  bot: arbiter, position_x: 2450, position_y: 5410,
  data: rel_v2(subject: 'allied', operator: 'defend', target: 'moved_piece')
)
connect!(cr_pawn_safe, cr_allied_def)

cr_enemy_safe = create_condition!(
  bot: arbiter, position_x: 2750, position_y: 5260,
  data: rel_v2(
    subject: 'enemy', operator: 'attack', target: 'moved_piece',
    subject_comparison_metric: 'count', subject_comparator: 'equal_to',
    subject_comparison_source: 'exact_number', subject_comparison_source_total: 0
  )
)
connect!(cr_gate, cr_enemy_safe)

cr_reward = create_action!(
  bot: arbiter, position_x: 2600, position_y: 5560,
  action_type: 'add', value: 22
)
connect!(cr_allied_def, cr_reward)
connect!(cr_enemy_safe, cr_reward)

# ── Custom Chain: "Knight Outpost" ────────────────────────────────────────────
# Reward a knight that gains mobility in a square enemy pawns cannot reach.
# DAG gate: allied defends OR no enemy attack.

ko_org = create_organizer!(
  bot: arbiter, position_x: 3600, position_y: 4800,
  title: 'Knight Outpost'
)
connect!(tactics_org, ko_org)

ko_gate = create_condition_chain!(
  bot: arbiter,
  start_node: ko_org,
  x: 3600, y: 4960,
  conditions: [
    unary_v2(
      subject: 'moved_piece', filter: 'knight', filter_mode: 'include',
      operator: 'mobility', comparator: 'greater_than', target: 'prior_board_state'
    ),
    rel_v2(
      subject: 'enemy', subject_filter: 'pawn', subject_filter_mode: 'include',
      operator: 'attack', target: 'moved_piece',
      subject_comparison_metric: 'count', subject_comparator: 'equal_to',
      subject_comparison_source: 'exact_number', subject_comparison_source_total: 0
    ),
  ]
)

ko_allied_def = create_condition!(
  bot: arbiter, position_x: 3450, position_y: 5260,
  data: rel_v2(subject: 'allied', operator: 'defend', target: 'moved_piece')
)
connect!(ko_gate, ko_allied_def)

ko_enemy_safe = create_condition!(
  bot: arbiter, position_x: 3750, position_y: 5260,
  data: rel_v2(
    subject: 'enemy', operator: 'attack', target: 'moved_piece',
    subject_comparison_metric: 'count', subject_comparator: 'equal_to',
    subject_comparison_source: 'exact_number', subject_comparison_source_total: 0
  )
)
connect!(ko_gate, ko_enemy_safe)

ko_reward = create_action!(
  bot: arbiter, position_x: 3600, position_y: 5410,
  action_type: 'add', value: 16
)
connect!(ko_allied_def, ko_reward)
connect!(ko_enemy_safe, ko_reward)

# ── Custom Chain: "Counterfire" ───────────────────────────────────────────────
# When enemy is actively attacking our non-pawns, reward moves that
# simultaneously increase our attack pressure on their non-pawns.
# DAG gate: (enemy pawns can't reach us + allied defends) OR (no enemy attack).

cf_org = create_organizer!(
  bot: arbiter, position_x: 4600, position_y: 4800,
  title: 'Counterfire'
)
connect!(tactics_org, cf_org)

cf_gate = create_condition_chain!(
  bot: arbiter,
  start_node: cf_org,
  x: 4600, y: 4960,
  conditions: [
    rel_v2(
      subject: 'enemy', operator: 'attack', target: 'allied',
      target_filter: 'pawn', target_filter_mode: 'exclude',
      subject_comparison_metric: 'count', subject_comparator: 'greater_than',
      subject_comparison_source: 'exact_number', subject_comparison_source_total: 0
    ),
    rel_v2(
      subject: 'allied', operator: 'attack', target: 'enemy',
      target_filter: 'pawn', target_filter_mode: 'exclude',
      subject_comparison_metric: 'count', subject_comparator: 'greater_than',
      subject_comparison_source: 'prior_board_state'
    ),
  ]
)

cf_pawn_safe = create_condition!(
  bot: arbiter, position_x: 4450, position_y: 5260,
  data: rel_v2(
    subject: 'enemy', subject_filter: 'pawn', subject_filter_mode: 'include',
    operator: 'attack', target: 'moved_piece',
    subject_comparison_metric: 'count', subject_comparator: 'equal_to',
    subject_comparison_source: 'exact_number', subject_comparison_source_total: 0
  )
)
connect!(cf_gate, cf_pawn_safe)

cf_allied_def = create_condition!(
  bot: arbiter, position_x: 4450, position_y: 5410,
  data: rel_v2(subject: 'allied', operator: 'defend', target: 'moved_piece')
)
connect!(cf_pawn_safe, cf_allied_def)

cf_enemy_safe = create_condition!(
  bot: arbiter, position_x: 4750, position_y: 5260,
  data: rel_v2(
    subject: 'enemy', operator: 'attack', target: 'moved_piece',
    subject_comparison_metric: 'count', subject_comparator: 'equal_to',
    subject_comparison_source: 'exact_number', subject_comparison_source_total: 0
  )
)
connect!(cf_gate, cf_enemy_safe)

cf_reward = create_action!(
  bot: arbiter, position_x: 4600, position_y: 5560,
  action_type: 'add', value: 18
)
connect!(cf_allied_def, cf_reward)
connect!(cf_enemy_safe, cf_reward)

arbiter.compile_program!
