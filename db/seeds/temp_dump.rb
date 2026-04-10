# Standalone seed file for Temp Dump.

require_relative 'helpers'

user = seed_user!

temp_dump = user.bots.find_or_initialize_by(name: "Temp Dump")
temp_dump.description = " Migrated from temp by bots:migrate_to_v2_grammar_clone."
temp_dump.save!

reset_bot_graph!(temp_dump)

node_map = { 102296 => temp_dump.root_node }

node_map[102297] = create_organizer!(
  bot: temp_dump,
  position_x: -355.06944444444207,
  position_y: -408.916666666673,
  title: "Checkmate",
  notes: ""
)

node_map[102298] = create_condition!(
  bot: temp_dump,
  position_x: -336.73611111110876,
  position_y: -245.58333333333962,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[102299] = create_condition!(
  bot: temp_dump,
  position_x: -336.73611111110876,
  position_y: -58.916666666672995,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102300] = create_action!(
  bot: temp_dump,
  position_x: -335.06944444444207,
  position_y: 122.74999999999386,
  action_type: "return",
  value: 100
)

node_map[102301] = create_organizer!(
  bot: temp_dump,
  position_x: -697.9375000002137,
  position_y: 237.9999999999999,
  title: "Knight Fork",
  notes: ""
)

node_map[102302] = create_condition!(
  bot: temp_dump,
  position_x: -697.9375000002137,
  position_y: 397.9999999999999,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102303] = create_condition!(
  bot: temp_dump,
  position_x: -697.9375000002137,
  position_y: 557.9999999999999,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>1}
)

node_map[102304] = create_condition!(
  bot: temp_dump,
  position_x: -837.9375000002137,
  position_y: 717.9999999999998,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102305] = create_condition!(
  bot: temp_dump,
  position_x: -557.9375000002137,
  position_y: 717.9999999999998,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102306] = create_action!(
  bot: temp_dump,
  position_x: -697.9375000002137,
  position_y: 877.9999999999998,
  action_type: "return",
  value: 60
)

node_map[102307] = create_organizer!(
  bot: temp_dump,
  position_x: -659.3125000000017,
  position_y: 1036.5000000000014,
  title: "Queen Pin",
  notes: ""
)

node_map[102308] = create_condition!(
  bot: temp_dump,
  position_x: -659.3125000000017,
  position_y: 1196.5000000000014,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102309] = create_condition!(
  bot: temp_dump,
  position_x: -659.3125000000017,
  position_y: 1356.5000000000014,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102310] = create_condition!(
  bot: temp_dump,
  position_x: -659.3125000000017,
  position_y: 1516.5000000000014,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102311] = create_condition!(
  bot: temp_dump,
  position_x: -799.3125000000017,
  position_y: 1676.5000000000014,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102312] = create_condition!(
  bot: temp_dump,
  position_x: -519.3125000000017,
  position_y: 1676.5000000000014,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102313] = create_action!(
  bot: temp_dump,
  position_x: -659.3125000000017,
  position_y: 1836.5000000000014,
  action_type: "return",
  value: 28
)

node_map[102314] = create_organizer!(
  bot: temp_dump,
  position_x: -20.31250000000108,
  position_y: 1154.000000000001,
  title: "Rook Pin",
  notes: ""
)

node_map[102315] = create_condition!(
  bot: temp_dump,
  position_x: -20.31250000000108,
  position_y: 1314.000000000001,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102316] = create_condition!(
  bot: temp_dump,
  position_x: -20.31250000000108,
  position_y: 1474.000000000001,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102317] = create_condition!(
  bot: temp_dump,
  position_x: -20.31250000000108,
  position_y: 1634.000000000001,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102318] = create_condition!(
  bot: temp_dump,
  position_x: -160.31250000000108,
  position_y: 1794.000000000001,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102319] = create_condition!(
  bot: temp_dump,
  position_x: 119.68749999999892,
  position_y: 1794.000000000001,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102320] = create_action!(
  bot: temp_dump,
  position_x: -20.31250000000108,
  position_y: 1954.000000000001,
  action_type: "return",
  value: 24
)

node_map[102321] = create_organizer!(
  bot: temp_dump,
  position_x: -287.9375000002128,
  position_y: 396.6458333333286,
  title: "pins",
  notes: ""
)

node_map[102322] = create_organizer!(
  bot: temp_dump,
  position_x: 39.624999999998636,
  position_y: 166.4999999999992,
  title: "Queen Skewer",
  notes: ""
)

node_map[102323] = create_condition!(
  bot: temp_dump,
  position_x: 39.624999999998636,
  position_y: 326.4999999999992,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102324] = create_condition!(
  bot: temp_dump,
  position_x: 39.624999999998636,
  position_y: 486.4999999999992,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102325] = create_condition!(
  bot: temp_dump,
  position_x: 39.624999999998636,
  position_y: 646.4999999999992,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102326] = create_condition!(
  bot: temp_dump,
  position_x: 39.624999999998636,
  position_y: 806.4999999999992,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102327] = create_action!(
  bot: temp_dump,
  position_x: 39.624999999998636,
  position_y: 966.4999999999992,
  action_type: "return",
  value: 35
)

node_map[102328] = create_organizer!(
  bot: temp_dump,
  position_x: 808.9999999999998,
  position_y: 1164.500000000001,
  title: "Tighten The Net",
  notes: ""
)

node_map[102329] = create_condition!(
  bot: temp_dump,
  position_x: 808.9999999999998,
  position_y: 1324.500000000001,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102330] = create_condition!(
  bot: temp_dump,
  position_x: 808.9999999999998,
  position_y: 1484.500000000001,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102331] = create_condition!(
  bot: temp_dump,
  position_x: 668.9999999999998,
  position_y: 1644.500000000001,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102332] = create_condition!(
  bot: temp_dump,
  position_x: 948.9999999999998,
  position_y: 1644.500000000001,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102333] = create_action!(
  bot: temp_dump,
  position_x: 808.9999999999998,
  position_y: 1804.500000000001,
  action_type: "return",
  value: 32
)

node_map[102334] = create_organizer!(
  bot: temp_dump,
  position_x: 345.9999999999993,
  position_y: 1192.5000000000014,
  title: "Strip King Shelter",
  notes: ""
)

node_map[102335] = create_condition!(
  bot: temp_dump,
  position_x: 393.9999999999993,
  position_y: 1208.5000000000014,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102336] = create_condition!(
  bot: temp_dump,
  position_x: 393.9999999999993,
  position_y: 1368.5000000000014,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"cover",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102337] = create_condition!(
  bot: temp_dump,
  position_x: 253.99999999999932,
  position_y: 1528.5000000000014,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102338] = create_condition!(
  bot: temp_dump,
  position_x: 533.9999999999993,
  position_y: 1528.5000000000014,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102339] = create_action!(
  bot: temp_dump,
  position_x: 393.9999999999993,
  position_y: 1688.5000000000014,
  action_type: "return",
  value: 28
)

node_map[102340] = create_organizer!(
  bot: temp_dump,
  position_x: 548.9999999999993,
  position_y: 909.5000000000005,
  title: "king pressure",
  notes: ""
)

node_map[102341] = create_organizer!(
  bot: temp_dump,
  position_x: 314.49999999999955,
  position_y: 252.49999999999966,
  title: "Winning Capture",
  notes: ""
)

node_map[102342] = create_condition!(
  bot: temp_dump,
  position_x: 326.49999999999955,
  position_y: 412.49999999999966,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[102343] = create_action!(
  bot: temp_dump,
  position_x: 322.49999999999955,
  position_y: 634.9999999999997,
  action_type: "return",
  value: 100
)

node_map[102344] = create_organizer!(
  bot: temp_dump,
  position_x: 1212.000000000001,
  position_y: 189.99999999999932,
  title: "Endgame Protect Pawns",
  notes: ""
)

node_map[102345] = create_condition!(
  bot: temp_dump,
  position_x: 1496.9473684210539,
  position_y: 568.4736842105258,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[102346] = create_condition!(
  bot: temp_dump,
  position_x: 1232.000000000001,
  position_y: 427.4999999999991,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[102347] = create_condition!(
  bot: temp_dump,
  position_x: 1669.4473684210539,
  position_y: 710.9736842105256,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102348] = create_condition!(
  bot: temp_dump,
  position_x: 1364.4473684210539,
  position_y: 845.9736842105252,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102349] = create_condition!(
  bot: temp_dump,
  position_x: 1666.9473684210539,
  position_y: 973.4736842105258,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102350] = create_action!(
  bot: temp_dump,
  position_x: 1481.9473684210539,
  position_y: 1168.4736842105256,
  action_type: "return",
  value: 18
)

node_map[102351] = create_condition!(
  bot: temp_dump,
  position_x: 1227.06249999979,
  position_y: 675.583333333329,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102352] = create_action!(
  bot: temp_dump,
  position_x: 1216.0624999997895,
  position_y: 904.5833333333293,
  action_type: "return",
  value: 100
)

node_map[102353] = create_organizer!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 81.17448008379051,
  title: "Opening Game Condition",
  notes: ""
)

node_map[102354] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 241.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102355] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 401.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102356] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 561.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102357] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 721.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102358] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 881.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102359] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 1041.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102360] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 1201.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102361] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 1361.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102362] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 1521.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102363] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 1681.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102364] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 1841.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102365] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 2001.1744800837905,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102366] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 2161.1744800837905,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102367] = create_condition!(
  bot: temp_dump,
  position_x: 1830.8822297251215,
  position_y: 2321.1744800837905,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102368] = create_action!(
  bot: temp_dump,
  position_x: 1704.1095225394886,
  position_y: 3076.4515913435507,
  action_type: "return",
  value: 15
)

node_map[102369] = create_condition!(
  bot: temp_dump,
  position_x: 1427.4994062370754,
  position_y: 2653.8770996337244,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102370] = create_condition!(
  bot: temp_dump,
  position_x: 1676.2860623552199,
  position_y: 2656.736716370714,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>3}
)

node_map[102371] = create_condition!(
  bot: temp_dump,
  position_x: 1922.2131017363736,
  position_y: 2648.1578661597437,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102372] = create_condition!(
  bot: temp_dump,
  position_x: 2173.8593745915077,
  position_y: 2693.9117339515865,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102373] = create_condition!(
  bot: temp_dump,
  position_x: 2844.156454461092,
  position_y: -29.89026364631235,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102374] = create_action!(
  bot: temp_dump,
  position_x: 3019.415912458169,
  position_y: 231.0915091150165,
  action_type: "add",
  value: 5
)

node_map[102375] = create_action!(
  bot: temp_dump,
  position_x: 1449.429283409896,
  position_y: 2955.455128766828,
  action_type: "add",
  value: 18
)

node_map[102376] = create_action!(
  bot: temp_dump,
  position_x: 1941.4545730147843,
  position_y: 3018.844890004268,
  action_type: "add",
  value: 14
)

node_map[102377] = create_action!(
  bot: temp_dump,
  position_x: 2243.310578907354,
  position_y: 2943.380888531125,
  action_type: "add",
  value: 12
)

node_map[102378] = create_condition!(
  bot: temp_dump,
  position_x: 2053.2591481729237,
  position_y: 339.74936025037124,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102379] = create_organizer!(
  bot: temp_dump,
  position_x: 2315.798242886825,
  position_y: 69.0283614109822,
  title: "Organizer",
  notes: ""
)

node_map[102380] = create_organizer!(
  bot: temp_dump,
  position_x: 1430.0,
  position_y: 1329.0,
  title: "Organizer",
  notes: ""
)

node_map[102381] = create_condition!(
  bot: temp_dump,
  position_x: 2525.7049273731654,
  position_y: 304.473195230858,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102382] = create_condition!(
  bot: temp_dump,
  position_x: 2537.159214996702,
  position_y: 541.1951394506128,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102383] = create_condition!(
  bot: temp_dump,
  position_x: 2365.344900643654,
  position_y: 755.0085084232945,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102384] = create_action!(
  bot: temp_dump,
  position_x: 2371.254421271093,
  position_y: 1270.9057391059746,
  action_type: "add",
  value: 1
)

node_map[102385] = create_condition!(
  bot: temp_dump,
  position_x: 2369.162996518166,
  position_y: 1014.6390278901226,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102386] = create_condition!(
  bot: temp_dump,
  position_x: 948.0,
  position_y: 582.9999999999999,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102387] = create_condition!(
  bot: temp_dump,
  position_x: 804.0,
  position_y: 742.9999999999999,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>1}
)

node_map[102388] = create_condition!(
  bot: temp_dump,
  position_x: 1644.0,
  position_y: 1323.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102389] = create_condition!(
  bot: temp_dump,
  position_x: 1048.0,
  position_y: 773.9999999999999,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102390] = create_action!(
  bot: temp_dump,
  position_x: 904.0,
  position_y: 988.0,
  action_type: "return",
  value: 200
)

node_map[102391] = create_organizer!(
  bot: temp_dump,
  position_x: -940.9999999914507,
  position_y: 14.999999999999886,
  title: "Avoid Stalemate",
  notes: ""
)

node_map[102392] = create_condition!(
  bot: temp_dump,
  position_x: -940.9999999914507,
  position_y: 174.9999999999999,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102393] = create_condition!(
  bot: temp_dump,
  position_x: -940.9999999914507,
  position_y: 334.9999999999999,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102394] = create_action!(
  bot: temp_dump,
  position_x: -940.9999999914507,
  position_y: 494.9999999999999,
  action_type: "return",
  value: -100
)

node_map[102395] = create_action!(
  bot: temp_dump,
  position_x: 3226.0,
  position_y: 607.9999999999999,
  action_type: "add",
  value: 11
)

node_map[102396] = create_organizer!(
  bot: temp_dump,
  position_x: 3034.0,
  position_y: -410.1666666664679,
  title: "Organizer",
  notes: ""
)

node_map[102397] = create_condition!(
  bot: temp_dump,
  position_x: 3461.0,
  position_y: 1.9999999999998863,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102398] = create_condition!(
  bot: temp_dump,
  position_x: 3285.0,
  position_y: 241.9999999999999,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"bishop",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102399] = create_condition!(
  bot: temp_dump,
  position_x: 3657.0,
  position_y: 253.9999999999999,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102400] = create_condition!(
  bot: temp_dump,
  position_x: 3459.0,
  position_y: 249.9999999999999,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"knight",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>1}
)

node_map[102401] = create_action!(
  bot: temp_dump,
  position_x: 3433.0,
  position_y: 614.9999999999999,
  action_type: "add",
  value: 12
)

node_map[102402] = create_action!(
  bot: temp_dump,
  position_x: 3653.0,
  position_y: 606.9999999999999,
  action_type: "add",
  value: 5
)

connect!(node_map[102296], node_map[102297])
connect!(node_map[102296], node_map[102321])
connect!(node_map[102296], node_map[102340])
connect!(node_map[102296], node_map[102341])
connect!(node_map[102296], node_map[102344])
connect!(node_map[102296], node_map[102353])
connect!(node_map[102296], node_map[102373])
connect!(node_map[102296], node_map[102379])
connect!(node_map[102296], node_map[102386])
connect!(node_map[102296], node_map[102391])
connect!(node_map[102296], node_map[102396])
connect!(node_map[102297], node_map[102298])
connect!(node_map[102298], node_map[102299])
connect!(node_map[102299], node_map[102300])
connect!(node_map[102301], node_map[102302])
connect!(node_map[102302], node_map[102303])
connect!(node_map[102303], node_map[102304])
connect!(node_map[102303], node_map[102305])
connect!(node_map[102304], node_map[102306])
connect!(node_map[102305], node_map[102306])
connect!(node_map[102307], node_map[102308])
connect!(node_map[102308], node_map[102309])
connect!(node_map[102309], node_map[102310])
connect!(node_map[102310], node_map[102311])
connect!(node_map[102310], node_map[102312])
connect!(node_map[102311], node_map[102313])
connect!(node_map[102312], node_map[102313])
connect!(node_map[102314], node_map[102315])
connect!(node_map[102315], node_map[102316])
connect!(node_map[102316], node_map[102317])
connect!(node_map[102317], node_map[102318])
connect!(node_map[102317], node_map[102319])
connect!(node_map[102318], node_map[102320])
connect!(node_map[102319], node_map[102320])
connect!(node_map[102321], node_map[102301])
connect!(node_map[102321], node_map[102307])
connect!(node_map[102321], node_map[102314])
connect!(node_map[102321], node_map[102322])
connect!(node_map[102322], node_map[102323])
connect!(node_map[102323], node_map[102324])
connect!(node_map[102324], node_map[102325])
connect!(node_map[102325], node_map[102326])
connect!(node_map[102326], node_map[102327])
connect!(node_map[102328], node_map[102329])
connect!(node_map[102329], node_map[102330])
connect!(node_map[102330], node_map[102331])
connect!(node_map[102330], node_map[102332])
connect!(node_map[102331], node_map[102333])
connect!(node_map[102332], node_map[102333])
connect!(node_map[102334], node_map[102335])
connect!(node_map[102335], node_map[102336])
connect!(node_map[102336], node_map[102337])
connect!(node_map[102336], node_map[102338])
connect!(node_map[102337], node_map[102339])
connect!(node_map[102338], node_map[102339])
connect!(node_map[102340], node_map[102334])
connect!(node_map[102340], node_map[102328])
connect!(node_map[102341], node_map[102342])
connect!(node_map[102342], node_map[102343])
connect!(node_map[102344], node_map[102346])
connect!(node_map[102345], node_map[102348])
connect!(node_map[102345], node_map[102347])
connect!(node_map[102346], node_map[102345])
connect!(node_map[102346], node_map[102351])
connect!(node_map[102347], node_map[102349])
connect!(node_map[102348], node_map[102350])
connect!(node_map[102349], node_map[102350])
connect!(node_map[102351], node_map[102352])
connect!(node_map[102353], node_map[102354])
connect!(node_map[102354], node_map[102355])
connect!(node_map[102355], node_map[102356])
connect!(node_map[102356], node_map[102357])
connect!(node_map[102357], node_map[102358])
connect!(node_map[102358], node_map[102359])
connect!(node_map[102359], node_map[102360])
connect!(node_map[102360], node_map[102361])
connect!(node_map[102361], node_map[102362])
connect!(node_map[102362], node_map[102363])
connect!(node_map[102363], node_map[102364])
connect!(node_map[102364], node_map[102365])
connect!(node_map[102365], node_map[102366])
connect!(node_map[102366], node_map[102367])
connect!(node_map[102367], node_map[102369])
connect!(node_map[102367], node_map[102370])
connect!(node_map[102367], node_map[102371])
connect!(node_map[102367], node_map[102372])
connect!(node_map[102369], node_map[102375])
connect!(node_map[102370], node_map[102368])
connect!(node_map[102371], node_map[102376])
connect!(node_map[102372], node_map[102377])
connect!(node_map[102373], node_map[102374])
connect!(node_map[102378], node_map[102383])
connect!(node_map[102379], node_map[102378])
connect!(node_map[102379], node_map[102381])
connect!(node_map[102381], node_map[102382])
connect!(node_map[102382], node_map[102383])
connect!(node_map[102383], node_map[102385])
connect!(node_map[102385], node_map[102384])
connect!(node_map[102386], node_map[102387])
connect!(node_map[102386], node_map[102389])
connect!(node_map[102387], node_map[102390])
connect!(node_map[102389], node_map[102390])
connect!(node_map[102391], node_map[102392])
connect!(node_map[102392], node_map[102393])
connect!(node_map[102393], node_map[102394])
connect!(node_map[102396], node_map[102397])
connect!(node_map[102397], node_map[102398])
connect!(node_map[102397], node_map[102400])
connect!(node_map[102397], node_map[102399])
connect!(node_map[102398], node_map[102395])
connect!(node_map[102399], node_map[102402])
connect!(node_map[102400], node_map[102401])

temp_dump.compile_program!
