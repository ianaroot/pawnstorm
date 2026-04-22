# Standalone seed file for Boa Constrictor.

require_relative 'helpers'

user = seed_user!

boa_constrictor = user.bots.find_or_initialize_by(name: 'Boa Constrictor')
boa_constrictor.description = 'A template-composed squeeze bot: reduces mobility, keeps pieces safe, tightens king nets, and wins by making the board smaller.'
boa_constrictor.save!

reset_bot_graph!(boa_constrictor)

root = boa_constrictor.root_node

create_template_instances!(
  bot: boa_constrictor,
  start_node: root,
  placements: [
    { template_id: 'checkmate', x: 120, y: 160, action_value_multiplier: 1.0 },
    { template_id: 'avoid-stalemate', x: 520, y: 160, action_value_multiplier: 1.0 },

    { template_id: 'tighten-the-net', x: 100, y: 1120, action_value_multiplier: 1.45 },
    { template_id: 'direct-king-pressure', x: 620, y: 1120, action_value_multiplier: 0.95 },
    { template_id: 'strip-king-shelter', x: 1140, y: 1120, action_value_multiplier: 1.15 },
    { template_id: 'queen-pressure', x: 1660, y: 1120, action_value_multiplier: 0.9 },

    { template_id: 'safety', x: 100, y: 2700, action_value_multiplier: 1.15 },
    { template_id: 'retain-defense', x: 620, y: 2700, action_value_multiplier: 1.25 },
    { template_id: 'avoid-hanging-pieces', x: 1140, y: 2700, action_value_multiplier: 1.1 },
    { template_id: 'hide-from-attacks', x: 1660, y: 2700, action_value_multiplier: 1.0 },
    { template_id: 'pawns-protect-majors', x: 2180, y: 2700, action_value_multiplier: 1.0 },

    { template_id: 'safe-knight-development', x: 100, y: 4140, action_value_multiplier: 0.9 },
    { template_id: 'safe-bishop-development', x: 620, y: 4140, action_value_multiplier: 0.9 },
    { template_id: 'castling', x: 1140, y: 4140, action_value_multiplier: 0.95 },
    { template_id: 'queen-safety', x: 1660, y: 4140, action_value_multiplier: 1.05 },

    { template_id: 'open-file-rook', x: 100, y: 5620, action_value_multiplier: 1.0 },
    { template_id: 'connect-majors', x: 620, y: 5620, action_value_multiplier: 1.15 },
    { template_id: 'discovered-attack', x: 1140, y: 5620, action_value_multiplier: 0.75 },
    { template_id: 'winning-attack', x: 1660, y: 5620, action_value_multiplier: 0.9 },

    { template_id: 'winning-capture', x: 100, y: 7080, action_value_multiplier: 0.9 },
    { template_id: 'free-capture', x: 620, y: 7080, action_value_multiplier: 0.95 },
    { template_id: 'even-trade', x: 1140, y: 7080, action_value_multiplier: 1.05 },
    { template_id: 'recapture', x: 1660, y: 7080, action_value_multiplier: 1.0 },

    { template_id: 'endgame', x: 100, y: 8420 },
    { template_id: 'push-safe-pawns', x: 620, y: 8420, action_value_multiplier: 0.85 },
    { template_id: 'safe-promotion', x: 1140, y: 8420, action_value_multiplier: 0.9 },
    { template_id: 'improve-pawn-mobility', x: 1660, y: 8420, action_value_multiplier: 0.75 }
  ]
)

boa_constrictor.compile_program!
