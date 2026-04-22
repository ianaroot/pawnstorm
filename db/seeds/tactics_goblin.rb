# Standalone seed file for Tactics Goblin.

require_relative 'helpers'

user = seed_user!

tactics_goblin = user.bots.find_or_initialize_by(name: 'Tactics Goblin')
tactics_goblin.description = 'A template-composed chaos goblin: forks, pins, skewers, discoveries, checks, and only enough safety to keep the knives airborne.'
tactics_goblin.save!

reset_bot_graph!(tactics_goblin)

root = tactics_goblin.root_node

create_template_instances!(
  bot: tactics_goblin,
  start_node: root,
  placements: [
    { template_id: 'checkmate', x: 120, y: 160, action_value_multiplier: 1.0 },
    { template_id: 'avoid-stalemate', x: 520, y: 160, action_value_multiplier: 1.0 },

    { template_id: 'knight-fork', x: 100, y: 1120, action_value_multiplier: 1.45 },
    { template_id: 'bishop-fork', x: 620, y: 1120, action_value_multiplier: 1.35 },
    { template_id: 'queen-pin', x: 1140, y: 1120, action_value_multiplier: 1.4 },
    { template_id: 'rook-pin', x: 1660, y: 1120, action_value_multiplier: 1.35 },
    { template_id: 'queen-skewer', x: 2180, y: 1120, action_value_multiplier: 1.4 },
    { template_id: 'rook-skewer', x: 2700, y: 1120, action_value_multiplier: 1.35 },

    { template_id: 'discovered-attack', x: 100, y: 2860, action_value_multiplier: 1.4 },
    { template_id: 'discovered-check', x: 620, y: 2860, action_value_multiplier: 1.55 },
    { template_id: 'dual-king-threat', x: 1140, y: 2860, action_value_multiplier: 1.45 },
    { template_id: 'open-file-rook', x: 1660, y: 2860, action_value_multiplier: 1.15 },
    { template_id: 'connect-majors', x: 2180, y: 2860, action_value_multiplier: 0.9 },

    { template_id: 'direct-king-pressure', x: 100, y: 4420, action_value_multiplier: 1.35 },
    { template_id: 'tighten-the-net', x: 620, y: 4420, action_value_multiplier: 1.2 },
    { template_id: 'strip-king-shelter', x: 1140, y: 4420, action_value_multiplier: 1.2 },
    { template_id: 'queen-pressure', x: 1660, y: 4420, action_value_multiplier: 1.25 },

    { template_id: 'winning-capture', x: 100, y: 5920, action_value_multiplier: 1.1 },
    { template_id: 'free-capture', x: 620, y: 5920, action_value_multiplier: 1.0 },
    { template_id: 'winning-attack', x: 1140, y: 5920, action_value_multiplier: 1.25 },
    { template_id: 'kick-material', x: 1660, y: 5920, action_value_multiplier: 1.15 },
    { template_id: 'even-trade', x: 2180, y: 5920, action_value_multiplier: 0.55 },

    { template_id: 'avoid-hanging-pieces', x: 100, y: 7360, action_value_multiplier: 0.5 },
    { template_id: 'hide-from-attacks', x: 620, y: 7360, action_value_multiplier: 0.35 },
    { template_id: 'escape-check-safely', x: 1140, y: 7360, action_value_multiplier: 0.7 },

    { template_id: 'safe-knight-development', x: 100, y: 8860, action_value_multiplier: 0.45 },
    { template_id: 'safe-bishop-development', x: 620, y: 8860, action_value_multiplier: 0.45 },
    { template_id: 'queen-safety', x: 1140, y: 8860, action_value_multiplier: 0.55 },

    { template_id: 'endgame', x: 100, y: 10120 },
    { template_id: 'attack-pawns', x: 620, y: 10120, action_value_multiplier: 0.85 },
    { template_id: 'push-safe-pawns', x: 1140, y: 10120, action_value_multiplier: 0.55 },
    { template_id: 'safe-promotion', x: 1660, y: 10120, action_value_multiplier: 0.65 }
  ]
)

tactics_goblin.compile_program!
