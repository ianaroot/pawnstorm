# Standalone seed file for The Dentist.

require_relative 'helpers'

user = seed_user!

dentist = user.bots.find_or_initialize_by(name: 'The Dentist')
dentist.description = 'A template-composed positional cleanup bot: safe development, clean captures, defense, pressure, and endgame polishing.'
dentist.save!

reset_bot_graph!(dentist)

root = dentist.root_node

create_template_instances!(
  bot: dentist,
  start_node: root,
  placements: [
    { template_id: 'checkmate', x: 120, y: 160, action_value_multiplier: 1.0 },
    { template_id: 'avoid-stalemate', x: 520, y: 160, action_value_multiplier: 1.0 },

    { template_id: 'safe-knight-development', x: 100, y: 1120, action_value_multiplier: 0.85 },
    { template_id: 'safe-bishop-development', x: 560, y: 1120, action_value_multiplier: 0.85 },
    { template_id: 'queen-safety', x: 1020, y: 1120, action_value_multiplier: 1.1 },

    { template_id: 'avoid-hanging-pieces', x: 100, y: 2380, action_value_multiplier: 1.25 },
    { template_id: 'retain-defense', x: 560, y: 2380, action_value_multiplier: 1.2 },
    { template_id: 'hide-from-attacks', x: 1020, y: 2380, action_value_multiplier: 1.15 },
    { template_id: 'safety', x: 1480, y: 2380, action_value_multiplier: 1.1 },

    { template_id: 'winning-capture', x: 100, y: 3600, action_value_multiplier: 0.8 },
    { template_id: 'free-capture', x: 560, y: 3600, action_value_multiplier: 0.8 },
    { template_id: 'even-trade', x: 1020, y: 3600, action_value_multiplier: 0.9 },
    { template_id: 'recapture', x: 1480, y: 3600, action_value_multiplier: 0.9 },

    { template_id: 'direct-king-pressure', x: 100, y: 4820, action_value_multiplier: 0.75 },
    { template_id: 'tighten-the-net', x: 560, y: 4820, action_value_multiplier: 0.8 },
    { template_id: 'queen-pressure', x: 1020, y: 4820, action_value_multiplier: 0.65 },

    { template_id: 'endgame', x: 100, y: 6040 },
    { template_id: 'push-safe-pawns', x: 560, y: 6040, action_value_multiplier: 1.0 },
    { template_id: 'safe-promotion', x: 1020, y: 6040, action_value_multiplier: 1.05 },
    { template_id: 'improve-pawn-mobility', x: 1480, y: 6040, action_value_multiplier: 0.9 }
  ]
)

dentist.compile_program!
