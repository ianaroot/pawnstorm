# Standalone seed file for Pawn Goblin.

require_relative 'helpers'

user = seed_user!

pawn_goblin = user.bots.find_or_initialize_by(name: 'Pawn Goblin')
pawn_goblin.description = 'A template-composed pawn gremlin: pushes pawns, attacks pawns, hunts promotions, and treats the endgame like a snack drawer.'
pawn_goblin.save!

reset_bot_graph!(pawn_goblin)

root = pawn_goblin.root_node

create_template_instances!(
  bot: pawn_goblin,
  start_node: root,
  placements: [
    { template_id: 'checkmate', x: 120, y: 160, action_value_multiplier: 1.0 },
    { template_id: 'avoid-stalemate', x: 520, y: 160, action_value_multiplier: 1.0 },

    { template_id: 'push-safe-pawns', x: 100, y: 1120, action_value_multiplier: 1.45 },
    { template_id: 'safe-promotion', x: 620, y: 1120, action_value_multiplier: 1.55 },
    { template_id: 'improve-pawn-mobility', x: 1140, y: 1120, action_value_multiplier: 1.35 },
    { template_id: 'attack-pawns', x: 1660, y: 1120, action_value_multiplier: 1.25 },
    { template_id: 'avoid-pawn-attacks', x: 2180, y: 1120, action_value_multiplier: 1.0 },

    { template_id: 'kick-material', x: 100, y: 2860, action_value_multiplier: 1.1 },
    { template_id: 'any-capture', x: 620, y: 2860, action_value_multiplier: 1.0 },
    { template_id: 'winning-capture', x: 1140, y: 2860, action_value_multiplier: 0.9 },
    { template_id: 'free-capture', x: 1660, y: 2860, action_value_multiplier: 0.85 },
    { template_id: 'recapture', x: 2180, y: 2860, action_value_multiplier: 0.8 },

    { template_id: 'safe-knight-development', x: 100, y: 4200, action_value_multiplier: 0.55 },
    { template_id: 'safe-bishop-development', x: 620, y: 4200, action_value_multiplier: 0.55 },
    { template_id: 'queen-safety', x: 1140, y: 4200, action_value_multiplier: 0.85 },
    { template_id: 'discourage-pawn-roaming', x: 1660, y: 4200, action_value_multiplier: 0.6 },

    { template_id: 'avoid-hanging-pieces', x: 100, y: 5520, action_value_multiplier: 0.8 },
    { template_id: 'pawns-protect-majors', x: 620, y: 5520, action_value_multiplier: 1.25 },
    { template_id: 'retain-defense', x: 1140, y: 5520, action_value_multiplier: 0.75 },

    { template_id: 'direct-king-pressure', x: 100, y: 6780, action_value_multiplier: 0.65 },
    { template_id: 'strip-king-shelter', x: 620, y: 6780, action_value_multiplier: 0.95 },
    { template_id: 'tighten-the-net', x: 1140, y: 6780, action_value_multiplier: 0.7 },

    { template_id: 'endgame', x: 100, y: 8200 },
    { template_id: 'winning', x: 620, y: 8200, action_value_multiplier: 1.0 },
    { template_id: 'force-stalemate-when-losing', x: 1140, y: 8200, action_value_multiplier: 0.8 }
  ]
)

pawn_goblin.compile_program!
