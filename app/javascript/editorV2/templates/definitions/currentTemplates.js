import { TEMPLATE_CATEGORIES } from 'editorV2/templates/TemplateCategories'
import { actionNode, conditionNode, organizerNode } from 'editorV2/templates/templateBuilders'

export const CURRENT_TEMPLATES = [
  {
    id: 'opening-game-condition',
    name: 'Opening Game Condition',
    category: TEMPLATE_CATEGORIES.OPENING,
    description: 'Detect a very early opening state by confirming full material for both sides and no attacked pieces anywhere.',
    nodes: [
      organizerNode('Opening Game Condition'),
      conditionNode('allies_king_present', 0, 160, {
        version: 2,
        kind: 'unary',
        subject: 'allied',
        subjectFilter: 'king',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 1
      }),
      conditionNode('allies_queen_present', 0, 320, {
        version: 2,
        kind: 'unary',
        subject: 'allied',
        subjectFilter: 'queen',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 1
      }),
      conditionNode('allies_rooks_present', 0, 480, {
        version: 2,
        kind: 'unary',
        subject: 'allied',
        subjectFilter: 'rook',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 2
      }),
      conditionNode('allies_bishops_present', 0, 640, {
        version: 2,
        kind: 'unary',
        subject: 'allied',
        subjectFilter: 'bishop',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 2
      }),
      conditionNode('allies_knights_present', 0, 800, {
        version: 2,
        kind: 'unary',
        subject: 'allied',
        subjectFilter: 'knight',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 2
      }),
      conditionNode('allies_pawns_present', 0, 960, {
        version: 2,
        kind: 'unary',
        subject: 'allied',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 8
      }),
      conditionNode('opponents_king_present', 0, 1120, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'king',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 1
      }),
      conditionNode('opponents_queen_present', 0, 1280, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'queen',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 1
      }),
      conditionNode('opponents_rooks_present', 0, 1440, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'rook',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 2
      }),
      conditionNode('opponents_bishops_present', 0, 1600, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'bishop',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 2
      }),
      conditionNode('opponents_knights_present', 0, 1760, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'knight',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 2
      }),
      conditionNode('opponents_pawns_present', 0, 1920, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 8
      }),
      conditionNode('allies_unattacked', 0, 2080, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0
      }),
      conditionNode('opponents_unattacked', 0, 2240, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'allied',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0
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
      { source: 'allies_unattacked', target: 'opponents_unattacked' }
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
        version: 2,
        kind: 'unary',
        subject: 'captured_piece',
        subjectFilter: 'any',
        operator: 'value',
        comparator: 'greater_than',
        target: 'moved_piece',
        targetFilter: 'any'
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
        version: 2,
        kind: 'unary',
        subject: 'captured_piece',
        subjectFilter: 'any',
        operator: 'count',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
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
    category: TEMPLATE_CATEGORIES.DEFENSE,
    description: 'Punish moves that leave the moved piece attacked by a pawn.',
    nodes: [
      organizerNode('Avoid Pawn Attacks'),
      conditionNode('condition', 12, 160, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any'
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
    category: TEMPLATE_CATEGORIES.PAWN_PLAY,
    description: 'Reward pawn moves that leave that pawn with more mobility than before.',
    nodes: [
      organizerNode('Improve Pawn Mobility'),
      conditionNode('condition', 12, 160, {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'mobility',
        comparator: 'greater_than',
        target: 'prior_board_state'
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
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'knight',
        subjectFilterMode: 'include',
        operator: 'mobility',
        comparator: 'greater_than',
        target: 'prior_board_state'
      }),
      conditionNode('attackers_equal_prior', -140, 320, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('attackers_less_than_prior', 140, 320, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'less_than',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('defended_after_equal', -140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
      }),
      conditionNode('defended_after_less', 140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
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
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'bishop',
        subjectFilterMode: 'include',
        operator: 'mobility',
        comparator: 'greater_than',
        target: 'prior_board_state'
      }),
      conditionNode('attackers_equal_prior', -140, 320, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('attackers_less_than_prior', 140, 320, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'less_than',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('defended_after_equal', -140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
      }),
      conditionNode('defended_after_less', 140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
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
    category: TEMPLATE_CATEGORIES.KING_PRESSURE,
    description: 'Return immediately for moves that leave the opponent with no mobility while their king is attacked.',
    nodes: [
      organizerNode('Checkmate'),
      conditionNode('king_attacked', 0, 160, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'king',
        subjectFilterMode: 'include',
        operator: 'attack',
        target: 'allied',
        targetFilter: 'any'
      }),
      conditionNode('opponent_mobility_zero', 0, 320, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'mobility',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 0
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
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'knight',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }),
      conditionNode('double_attack', 0, 320, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'exclude',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 1
      }),
      conditionNode('defended', -140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
      }),
      conditionNode('unattacked', 140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0
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
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'queen',
        subjectFilterMode: 'include',
        operator: 'shield',
        target: 'enemy',
        targetFilter: 'any',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonSource: 'prior_board_state'
      }),
      conditionNode('not_queen', 0, 320, {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'queen',
        subjectFilterMode: 'exclude',
        operator: 'count',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }),
      conditionNode('not_rook', 0, 480, {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'rook',
        subjectFilterMode: 'exclude',
        operator: 'count',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }),
      conditionNode('pawn_attacks_equal_prior', -140, 640, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('pawn_attacks_less_than_prior', 140, 640, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'less_than',
        subjectComparisonSource: 'prior_board_state'
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
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'rook',
        subjectFilterMode: 'include',
        operator: 'shield',
        target: 'enemy',
        targetFilter: 'any',
        targetComparisonMetric: 'count',
        targetComparator: 'greater_than',
        targetComparisonSource: 'prior_board_state'
      }),
      conditionNode('not_queen', 0, 320, {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'queen',
        subjectFilterMode: 'exclude',
        operator: 'count',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }),
      conditionNode('not_rook', 0, 480, {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'rook',
        subjectFilterMode: 'exclude',
        operator: 'count',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }),
      conditionNode('pawn_attacks_equal_prior', -140, 640, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('pawn_attacks_less_than_prior', 140, 640, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'less_than',
        subjectComparisonSource: 'prior_board_state'
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
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'queen',
        subjectFilterMode: 'include',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any'
      }),
      conditionNode('no_other_non_queen_direct_attack', 0, 320, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'queen',
        subjectFilterMode: 'exclude',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0
      }),
      conditionNode('queen_is_shielding_one_piece', 0, 480, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'shield',
        target: 'enemy',
        targetFilter: 'queen',
        targetFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 1
      }),
      conditionNode('moved_piece_defended', 0, 640, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
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
    category: TEMPLATE_CATEGORIES.KING_PRESSURE,
    description: 'Return for safe moves that reduce enemy king mobility while increasing pressure on the king.',
    nodes: [
      organizerNode('Tighten The Net'),
      conditionNode('king_mobility_down', 0, 160, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'king',
        subjectFilterMode: 'include',
        operator: 'mobility',
        comparator: 'less_than',
        target: 'prior_board_state'
      }),
      conditionNode('king_attackers_up', 0, 320, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'king',
        targetFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('moved_piece_defended', -140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
      }),
      conditionNode('moved_piece_unattacked', 140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0
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
    category: TEMPLATE_CATEGORIES.KING_PRESSURE,
    description: 'Return for safe moves that reduce the enemy king’s shielding and cover at the same time.',
    nodes: [
      organizerNode('Strip King Shelter'),
      conditionNode('king_shielders_down', 0, 160, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'shield',
        target: 'enemy',
        targetFilter: 'king',
        targetFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'less_than',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('king_coverers_down', 0, 320, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'cover',
        target: 'enemy',
        targetFilter: 'king',
        targetFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'less_than',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('moved_piece_defended', -140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'defend',
        target: 'moved_piece',
        targetFilter: 'any'
      }),
      conditionNode('moved_piece_unattacked', 140, 480, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0
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
        version: 2,
        kind: 'unary',
        subject: 'allied',
        subjectFilter: 'pawn',
        subjectFilterMode: 'exclude',
        operator: 'count',
        comparator: 'less_than',
        target: 'exact_number',
        targetTotal: 3
      }),
      conditionNode('opponents_low_material', 0, 320, {
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'pawn',
        subjectFilterMode: 'exclude',
        operator: 'count',
        comparator: 'less_than',
        target: 'exact_number',
        targetTotal: 3
      }),
      conditionNode('moved_piece_is_pawn', 0, 480, {
        version: 2,
        kind: 'unary',
        subject: 'moved_piece',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'count',
        comparator: 'greater_than',
        target: 'exact_number',
        targetTotal: 0
      }),
      conditionNode('pawn_attackers_equal_prior', -140, 640, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('pawn_attackers_less_than_prior', 140, 640, {
        version: 2,
        kind: 'relational',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'moved_piece',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'less_than',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('pawn_defense_up_equal', -140, 800, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'defend',
        target: 'allied',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'prior_board_state'
      }),
      conditionNode('pawn_defense_up_less', 140, 800, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'pawn',
        subjectFilterMode: 'include',
        operator: 'defend',
        target: 'allied',
        targetFilter: 'any',
        subjectComparisonMetric: 'count',
        subjectComparator: 'greater_than',
        subjectComparisonSource: 'prior_board_state'
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
        version: 2,
        kind: 'unary',
        subject: 'enemy',
        subjectFilter: 'any',
        operator: 'mobility',
        comparator: 'equal_to',
        target: 'exact_number',
        targetTotal: 0
      }),
      conditionNode('opponent_king_attackers_zero', 0, 320, {
        version: 2,
        kind: 'relational',
        subject: 'allied',
        subjectFilter: 'any',
        operator: 'attack',
        target: 'enemy',
        targetFilter: 'king',
        targetFilterMode: 'include',
        subjectComparisonMetric: 'count',
        subjectComparator: 'equal_to',
        subjectComparisonSource: 'exact_number',
        subjectComparisonSourceTotal: 0
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
