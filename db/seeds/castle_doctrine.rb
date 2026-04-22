# Standalone seed file for Castle Doctrine.

require_relative 'helpers'

user = seed_user!

castle_doctrine = user.bots.find_or_initialize_by(name: 'Castle Doctrine')
castle_doctrine.description = 'A template-composed fortress bot: castle early, preserve king safety, defend important material, and convert from a secure shell.'
castle_doctrine.save!

reset_bot_graph!(castle_doctrine)

root = castle_doctrine.root_node

create_template_instances!(
  bot: castle_doctrine,
  start_node: root,
  placements: [
    { template_id: 'checkmate', x: 120, y: 160, action_value_multiplier: 1.0 },
    { template_id: 'avoid-stalemate', x: 520, y: 160, action_value_multiplier: 1.0 },

    { template_id: 'castling', x: 100, y: 1120, action_value_multiplier: 1.8 },
    { template_id: 'safe-knight-development', x: 720, y: 1120, action_value_multiplier: 0.8 },
    { template_id: 'safe-bishop-development', x: 1180, y: 1120, action_value_multiplier: 0.8 },
    { template_id: 'queen-safety', x: 1640, y: 1120, action_value_multiplier: 1.25 },

    { template_id: 'escape-check-safely', x: 100, y: 2540, action_value_multiplier: 1.35 },
    { template_id: 'avoid-hanging-pieces', x: 720, y: 2540, action_value_multiplier: 1.1 },
    { template_id: 'retain-defense', x: 1180, y: 2540, action_value_multiplier: 1.45 },
    { template_id: 'pawns-protect-majors', x: 1640, y: 2540, action_value_multiplier: 1.25 },
    { template_id: 'safety', x: 2100, y: 2540, action_value_multiplier: 1.25 },

    { template_id: 'direct-king-pressure', x: 100, y: 4040, action_value_multiplier: 0.65 },
    { template_id: 'tighten-the-net', x: 620, y: 4040, action_value_multiplier: 0.9 },
    { template_id: 'strip-king-shelter', x: 1140, y: 4040, action_value_multiplier: 0.7 },
    { template_id: 'open-file-rook', x: 1660, y: 4040, action_value_multiplier: 1.0 },
    { template_id: 'connect-majors', x: 2180, y: 4040, action_value_multiplier: 1.1 },

    { template_id: 'endgame', x: 100, y: 5600 },
    { template_id: 'push-safe-pawns', x: 620, y: 5600, action_value_multiplier: 0.9 },
    { template_id: 'safe-promotion', x: 1140, y: 5600, action_value_multiplier: 1.0 },
    { template_id: 'improve-pawn-mobility', x: 1660, y: 5600, action_value_multiplier: 0.75 }
  ]
)

castle_doctrine.compile_program!
