import { DEFAULT_ACTION_DATA, DEFAULT_CONDITION_DATA, DEFAULT_ORGANIZER_DATA } from '../utils/nodeDefaults.js'
import { TEMPLATE_CATEGORIES } from './TemplateCategories.js'
import { validateTemplates } from './validateTemplates.js'

function organizerNode(title) {
  return {
    key: 'organizer',
    type: 'organizer',
    position: { x: 0, y: 0 },
    data: { ...DEFAULT_ORGANIZER_DATA, title, notes: '' }
  }
}

function conditionNode(key, x, y, data) {
  return {
    key,
    type: 'condition',
    position: { x, y },
    data: { ...DEFAULT_CONDITION_DATA, ...data }
  }
}

function actionNode(key, x, y, data) {
  return {
    key,
    type: 'action',
    position: { x, y },
    data: { ...DEFAULT_ACTION_DATA, ...data }
  }
}

const RAW_TEMPLATES = [
  {
    id: 'opening-game-condition',
    name: 'Opening Game Condition',
    category: TEMPLATE_CATEGORIES.OPENING,
    description: 'Detect a very early opening state by confirming full material for both sides and no attacked pieces anywhere.',
    nodes: [
      organizerNode('Opening Game Condition'),
      conditionNode('allies_king_present', 0, 160, {
        subject: 'allies',
        subjectSpecifier: 'king',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 1
      }),
      conditionNode('allies_queen_present', 0, 320, {
        subject: 'allies',
        subjectSpecifier: 'queen',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 1
      }),
      conditionNode('allies_rooks_present', 0, 480, {
        subject: 'allies',
        subjectSpecifier: 'rook',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 2
      }),
      conditionNode('allies_bishops_present', 0, 640, {
        subject: 'allies',
        subjectSpecifier: 'bishop',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 2
      }),
      conditionNode('allies_knights_present', 0, 800, {
        subject: 'allies',
        subjectSpecifier: 'knight',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 2
      }),
      conditionNode('allies_pawns_present', 0, 960, {
        subject: 'allies',
        subjectSpecifier: 'pawn',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 8
      }),
      conditionNode('opponents_king_present', 0, 1120, {
        subject: 'opponents',
        subjectSpecifier: 'king',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 1
      }),
      conditionNode('opponents_queen_present', 0, 1280, {
        subject: 'opponents',
        subjectSpecifier: 'queen',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 1
      }),
      conditionNode('opponents_rooks_present', 0, 1440, {
        subject: 'opponents',
        subjectSpecifier: 'rook',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 2
      }),
      conditionNode('opponents_bishops_present', 0, 1600, {
        subject: 'opponents',
        subjectSpecifier: 'bishop',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 2
      }),
      conditionNode('opponents_knights_present', 0, 1760, {
        subject: 'opponents',
        subjectSpecifier: 'knight',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 2
      }),
      conditionNode('opponents_pawns_present', 0, 1920, {
        subject: 'opponents',
        subjectSpecifier: 'pawn',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 8
      }),
      conditionNode('allies_unattacked', 0, 2080, {
        subject: 'allies',
        subjectSpecifier: 'any',
        relation: 'attacked',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      conditionNode('opponents_unattacked', 0, 2240, {
        subject: 'opponents',
        subjectSpecifier: 'any',
        relation: 'attacked',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      actionNode('action', 0, 2400, {
        actionType: 'return',
        value: 15
      })
    ],
    connections: [
      { source: 'organizer', target: 'allies_king_present' },
      { source: 'allies_king_present', target: 'allies_queen_present' },
      { source: 'allies_queen_present', target: 'allies_rooks_present' },
      { source: 'allies_rooks_present', target: 'allies_bishops_present' },
      { source: 'allies_bishops_present', target: 'allies_knights_present' },
      { source: 'allies_knights_present', target: 'allies_pawns_present' },
      { source: 'allies_pawns_present', target: 'opponents_king_present' },
      { source: 'opponents_king_present', target: 'opponents_queen_present' },
      { source: 'opponents_queen_present', target: 'opponents_rooks_present' },
      { source: 'opponents_rooks_present', target: 'opponents_bishops_present' },
      { source: 'opponents_bishops_present', target: 'opponents_knights_present' },
      { source: 'opponents_knights_present', target: 'opponents_pawns_present' },
      { source: 'opponents_pawns_present', target: 'allies_unattacked' },
      { source: 'allies_unattacked', target: 'opponents_unattacked' },
      { source: 'opponents_unattacked', target: 'action' }
    ]
  },
  {
    id: 'winning-capture',
    name: 'Winning Capture',
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: 'Return hard for captures where the captured piece is worth more than the piece that moved.',
    nodes: [
      organizerNode('Winning Capture'),
      conditionNode('condition', 12, 160, {
        subject: 'captured_piece',
        subjectSpecifier: 'any',
        relation: 'value',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'moved_piece_value'
      }),
      actionNode('action', 8, 320, {
        actionType: 'return',
        value: 100
      })
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  },
  {
    id: 'any-capture',
    name: 'Any Capture',
    category: TEMPLATE_CATEGORIES.CAPTURES,
    description: 'Give a simple bonus to any move that captures something.',
    nodes: [
      organizerNode('Any Capture'),
      conditionNode('condition', 12, 160, {
        subject: 'captured_piece',
        subjectSpecifier: 'any',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      actionNode('action', 8, 320, {
        actionType: 'add',
        value: 3
      })
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  },
  {
    id: 'avoid-pawn-attacks',
    name: 'Avoid Pawn Attacks',
    category: TEMPLATE_CATEGORIES.SAFETY,
    description: 'Punish moves that leave the moved piece attacked by a pawn.',
    nodes: [
      organizerNode('Avoid Pawn Attacks'),
      conditionNode('condition', 12, 160, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'pawn',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      actionNode('action', 8, 320, {
        actionType: 'subtract',
        value: 4
      })
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  },
  {
    id: 'improve-pawn-mobility',
    name: 'Improve Pawn Mobility',
    category: TEMPLATE_CATEGORIES.ACTIVITY,
    description: 'Reward pawn moves that leave that pawn with more mobility than before.',
    nodes: [
      organizerNode('Improve Pawn Mobility'),
      conditionNode('condition', 12, 160, {
        subject: 'moved_piece',
        subjectSpecifier: 'pawn',
        relation: 'mobility',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      actionNode('action', 8, 320, {
        actionType: 'add',
        value: 2
      })
    ],
    connections: [
      { source: 'organizer', target: 'condition' },
      { source: 'condition', target: 'action' }
    ]
  },
  {
    id: 'safe-knight-development',
    name: 'Safe Knight Development',
    category: TEMPLATE_CATEGORIES.OPENING,
    description: 'Return for knight development that improves mobility without increasing danger and leaves the knight defended.',
    nodes: [
      organizerNode('Safe Knight Development'),
      conditionNode('minor_development', 0, 160, {
        subject: 'moved_piece',
        subjectSpecifier: 'knight',
        relation: 'mobility',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('attackers_equal_prior', -140, 320, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('attackers_less_than_prior', 140, 320, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('defended_after_equal', -140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('defended_after_less', 140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      actionNode('action', 0, 640, {
        actionType: 'return',
        value: 20
      })
    ],
    connections: [
      { source: 'organizer', target: 'minor_development' },
      { source: 'minor_development', target: 'attackers_equal_prior' },
      { source: 'minor_development', target: 'attackers_less_than_prior' },
      { source: 'attackers_equal_prior', target: 'defended_after_equal' },
      { source: 'attackers_less_than_prior', target: 'defended_after_less' },
      { source: 'defended_after_equal', target: 'action' },
      { source: 'defended_after_less', target: 'action' }
    ]
  },
  {
    id: 'safe-bishop-development',
    name: 'Safe Bishop Development',
    category: TEMPLATE_CATEGORIES.OPENING,
    description: 'Return for bishop development that improves mobility without increasing danger and leaves the bishop defended.',
    nodes: [
      organizerNode('Safe Bishop Development'),
      conditionNode('minor_development', 0, 160, {
        subject: 'moved_piece',
        subjectSpecifier: 'bishop',
        relation: 'mobility',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('attackers_equal_prior', -140, 320, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('attackers_less_than_prior', 140, 320, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('defended_after_equal', -140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('defended_after_less', 140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      actionNode('action', 0, 640, {
        actionType: 'return',
        value: 20
      })
    ],
    connections: [
      { source: 'organizer', target: 'minor_development' },
      { source: 'minor_development', target: 'attackers_equal_prior' },
      { source: 'minor_development', target: 'attackers_less_than_prior' },
      { source: 'attackers_equal_prior', target: 'defended_after_equal' },
      { source: 'attackers_less_than_prior', target: 'defended_after_less' },
      { source: 'defended_after_equal', target: 'action' },
      { source: 'defended_after_less', target: 'action' }
    ]
  },
  {
    id: 'checkmate',
    name: 'Checkmate',
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: 'Return immediately for moves that leave the opponent with no mobility while their king is attacked.',
    nodes: [
      organizerNode('Checkmate'),
      conditionNode('king_attacked', 0, 160, {
        subject: 'opponents',
        subjectSpecifier: 'king',
        relation: 'attacked',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('opponent_mobility_zero', 0, 320, {
        subject: 'opponents',
        subjectSpecifier: 'any',
        relation: 'mobility',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      actionNode('action', 0, 480, {
        actionType: 'return',
        value: 100
      })
    ],
    connections: [
      { source: 'organizer', target: 'king_attacked' },
      { source: 'king_attacked', target: 'opponent_mobility_zero' },
      { source: 'opponent_mobility_zero', target: 'action' }
    ]
  },
  {
    id: 'knight-fork',
    name: 'Knight Fork',
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: 'Return for knight moves that attack multiple non-pawns and are either defended or completely unattacked.',
    nodes: [
      organizerNode('Knight Fork'),
      conditionNode('is_knight', 0, 160, {
        subject: 'moved_piece',
        subjectSpecifier: 'knight',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('double_attack', 0, 320, {
        subject: 'opponents',
        subjectSpecifier: 'pawn',
        subjectSpecifierMode: 'exclude',
        relation: 'attacked',
        relationSpecifier: 'moved_piece',
        comparison: 'greater_than',
        comparisonValue: 1
      }),
      conditionNode('defended', -140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('unattacked', 140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      actionNode('action', 0, 640, {
        actionType: 'return',
        value: 60
      })
    ],
    connections: [
      { source: 'organizer', target: 'is_knight' },
      { source: 'is_knight', target: 'double_attack' },
      { source: 'double_attack', target: 'defended' },
      { source: 'double_attack', target: 'unattacked' },
      { source: 'defended', target: 'action' },
      { source: 'unattacked', target: 'action' }
    ]
  },
  {
    id: 'queen-pin',
    name: 'Queen Pin',
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: 'Return for moves that increase shielding on an enemy queen without increasing pawn attacks, using a non-heavy moved piece.',
    nodes: [
      organizerNode('Queen Pin'),
      conditionNode('queen_more_shielded', 0, 160, {
        subject: 'opponents',
        subjectSpecifier: 'queen',
        relation: 'shielded',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('not_queen', 0, 320, {
        subject: 'moved_piece',
        subjectSpecifier: 'queen',
        subjectSpecifierMode: 'exclude',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('not_rook', 0, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'rook',
        subjectSpecifierMode: 'exclude',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('pawn_attacks_equal_prior', -140, 640, {
        subject: 'opponents',
        subjectSpecifier: 'pawn',
        relation: 'attacked',
        relationSpecifier: 'moved_piece',
        comparison: 'equal_to',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('pawn_attacks_less_than_prior', 140, 640, {
        subject: 'opponents',
        subjectSpecifier: 'pawn',
        relation: 'attacked',
        relationSpecifier: 'moved_piece',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      actionNode('action', 0, 800, {
        actionType: 'return',
        value: 28
      })
    ],
    connections: [
      { source: 'organizer', target: 'queen_more_shielded' },
      { source: 'queen_more_shielded', target: 'not_queen' },
      { source: 'not_queen', target: 'not_rook' },
      { source: 'not_rook', target: 'pawn_attacks_equal_prior' },
      { source: 'not_rook', target: 'pawn_attacks_less_than_prior' },
      { source: 'pawn_attacks_equal_prior', target: 'action' },
      { source: 'pawn_attacks_less_than_prior', target: 'action' }
    ]
  },
  {
    id: 'rook-pin',
    name: 'Rook Pin',
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: 'Return for moves that increase shielding on an enemy rook without increasing pawn attacks, using a non-heavy moved piece.',
    nodes: [
      organizerNode('Rook Pin'),
      conditionNode('rook_more_shielded', 0, 160, {
        subject: 'opponents',
        subjectSpecifier: 'rook',
        relation: 'shielded',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('not_queen', 0, 320, {
        subject: 'moved_piece',
        subjectSpecifier: 'queen',
        subjectSpecifierMode: 'exclude',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('not_rook', 0, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'rook',
        subjectSpecifierMode: 'exclude',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('pawn_attacks_equal_prior', -140, 640, {
        subject: 'opponents',
        subjectSpecifier: 'pawn',
        relation: 'attacked',
        relationSpecifier: 'moved_piece',
        comparison: 'equal_to',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('pawn_attacks_less_than_prior', 140, 640, {
        subject: 'opponents',
        subjectSpecifier: 'pawn',
        relation: 'attacked',
        relationSpecifier: 'moved_piece',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      actionNode('action', 0, 800, {
        actionType: 'return',
        value: 24
      })
    ],
    connections: [
      { source: 'organizer', target: 'rook_more_shielded' },
      { source: 'rook_more_shielded', target: 'not_queen' },
      { source: 'not_queen', target: 'not_rook' },
      { source: 'not_rook', target: 'pawn_attacks_equal_prior' },
      { source: 'not_rook', target: 'pawn_attacks_less_than_prior' },
      { source: 'pawn_attacks_equal_prior', target: 'action' },
      { source: 'pawn_attacks_less_than_prior', target: 'action' }
    ]
  },
  {
    id: 'queen-skewer',
    name: 'Queen Skewer',
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: 'Return for moves that attack a queen from the front of a line while the moved piece stays defended.',
    nodes: [
      organizerNode('Queen Skewer'),
      conditionNode('queen_attacked_by_moved_piece', 0, 160, {
        subject: 'opponents',
        subjectSpecifier: 'queen',
        relation: 'attacked',
        relationSpecifier: 'moved_piece',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('no_other_non_queen_direct_attack', 0, 320, {
        subject: 'opponents',
        subjectSpecifier: 'queen',
        subjectSpecifierMode: 'exclude',
        relation: 'attacked',
        relationSpecifier: 'moved_piece',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      conditionNode('queen_is_shielding_one_piece', 0, 480, {
        subject: 'opponents',
        subjectSpecifier: 'queen',
        relation: 'shielder',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 1
      }),
      conditionNode('moved_piece_defended', 0, 640, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      actionNode('action', 0, 800, {
        actionType: 'return',
        value: 35
      })
    ],
    connections: [
      { source: 'organizer', target: 'queen_attacked_by_moved_piece' },
      { source: 'queen_attacked_by_moved_piece', target: 'no_other_non_queen_direct_attack' },
      { source: 'no_other_non_queen_direct_attack', target: 'queen_is_shielding_one_piece' },
      { source: 'queen_is_shielding_one_piece', target: 'moved_piece_defended' },
      { source: 'moved_piece_defended', target: 'action' }
    ]
  },
  {
    id: 'tighten-the-net',
    name: 'Tighten The Net',
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: 'Return for safe moves that reduce enemy king mobility while increasing pressure on the king.',
    nodes: [
      organizerNode('Tighten The Net'),
      conditionNode('king_mobility_down', 0, 160, {
        subject: 'opponents',
        subjectSpecifier: 'king',
        relation: 'mobility',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('king_attackers_up', 0, 320, {
        subject: 'opponents',
        subjectSpecifier: 'king',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('moved_piece_defended', -140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('moved_piece_unattacked', 140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      actionNode('action', 0, 640, {
        actionType: 'return',
        value: 32
      })
    ],
    connections: [
      { source: 'organizer', target: 'king_mobility_down' },
      { source: 'king_mobility_down', target: 'king_attackers_up' },
      { source: 'king_attackers_up', target: 'moved_piece_defended' },
      { source: 'king_attackers_up', target: 'moved_piece_unattacked' },
      { source: 'moved_piece_defended', target: 'action' },
      { source: 'moved_piece_unattacked', target: 'action' }
    ]
  },
  {
    id: 'strip-king-shelter',
    name: 'Strip King Shelter',
    category: TEMPLATE_CATEGORIES.TACTICS,
    description: 'Return for safe moves that reduce the enemy king’s shielding and cover at the same time.',
    nodes: [
      organizerNode('Strip King Shelter'),
      conditionNode('king_shielders_down', 0, 160, {
        subject: 'opponents',
        subjectSpecifier: 'king',
        relation: 'shielder',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('king_coverers_down', 0, 320, {
        subject: 'opponents',
        subjectSpecifier: 'king',
        relation: 'coverer',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('moved_piece_defended', -140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'defender',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('moved_piece_unattacked', 140, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      actionNode('action', 0, 640, {
        actionType: 'return',
        value: 28
      })
    ],
    connections: [
      { source: 'organizer', target: 'king_shielders_down' },
      { source: 'king_shielders_down', target: 'king_coverers_down' },
      { source: 'king_coverers_down', target: 'moved_piece_defended' },
      { source: 'king_coverers_down', target: 'moved_piece_unattacked' },
      { source: 'moved_piece_defended', target: 'action' },
      { source: 'moved_piece_unattacked', target: 'action' }
    ]
  },
  {
    id: 'endgame-protect-pawns',
    name: 'Endgame Protect Pawns',
    category: TEMPLATE_CATEGORIES.ENDGAME,
    description: 'Return for safe pawn moves that also improve pawn protection when both sides are down to kings, pawns, and at most one other piece.',
    nodes: [
      organizerNode('Endgame Protect Pawns'),
      conditionNode('allies_low_material', 0, 160, {
        subject: 'allies',
        subjectSpecifier: 'pawn',
        subjectSpecifierMode: 'exclude',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 3
      }),
      conditionNode('opponents_low_material', 0, 320, {
        subject: 'opponents',
        subjectSpecifier: 'pawn',
        subjectSpecifierMode: 'exclude',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 3
      }),
      conditionNode('moved_piece_is_pawn', 0, 480, {
        subject: 'moved_piece',
        subjectSpecifier: 'pawn',
        relation: 'count',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 0
      }),
      conditionNode('pawn_attackers_equal_prior', -140, 640, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('pawn_attackers_less_than_prior', 140, 640, {
        subject: 'moved_piece',
        subjectSpecifier: 'any',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'less_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('pawn_defense_up_equal', -140, 800, {
        subject: 'allies',
        subjectSpecifier: 'pawn',
        relation: 'defended',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      conditionNode('pawn_defense_up_less', 140, 800, {
        subject: 'allies',
        subjectSpecifier: 'pawn',
        relation: 'defended',
        relationSpecifier: 'any',
        comparison: 'greater_than',
        comparisonValue: 'prior_board_state'
      }),
      actionNode('action', 0, 960, {
        actionType: 'return',
        value: 18
      })
    ],
    connections: [
      { source: 'organizer', target: 'allies_low_material' },
      { source: 'allies_low_material', target: 'opponents_low_material' },
      { source: 'opponents_low_material', target: 'moved_piece_is_pawn' },
      { source: 'moved_piece_is_pawn', target: 'pawn_attackers_equal_prior' },
      { source: 'moved_piece_is_pawn', target: 'pawn_attackers_less_than_prior' },
      { source: 'pawn_attackers_equal_prior', target: 'pawn_defense_up_equal' },
      { source: 'pawn_attackers_less_than_prior', target: 'pawn_defense_up_less' },
      { source: 'pawn_defense_up_equal', target: 'action' },
      { source: 'pawn_defense_up_less', target: 'action' }
    ]
  },
  {
    id: 'avoid-stalemate',
    name: 'Avoid Stalemate',
    category: TEMPLATE_CATEGORIES.ENDGAME,
    description: 'Return hard against moves that leave the opponent with no mobility while their king is not under attack.',
    nodes: [
      organizerNode('Avoid Stalemate'),
      conditionNode('opponent_mobility_zero', 0, 160, {
        subject: 'opponents',
        subjectSpecifier: 'any',
        relation: 'mobility',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      conditionNode('opponent_king_attackers_zero', 0, 320, {
        subject: 'opponents',
        subjectSpecifier: 'king',
        relation: 'attacker',
        relationSpecifier: 'any',
        comparison: 'equal_to',
        comparisonValue: 0
      }),
      actionNode('action', 0, 480, {
        actionType: 'return',
        value: -100
      })
    ],
    connections: [
      { source: 'organizer', target: 'opponent_mobility_zero' },
      { source: 'opponent_mobility_zero', target: 'opponent_king_attackers_zero' },
      { source: 'opponent_king_attackers_zero', target: 'action' }
    ]
  }
]

export const TEMPLATES = Object.freeze(validateTemplates(RAW_TEMPLATES))

export function templatesForCategory(category) {
  return TEMPLATES.filter(template => template.category === category)
}

export function findTemplate(templateId) {
  return TEMPLATES.find(template => template.id === templateId) || null
}
