# Standalone seed file for Wolverine Dump.

require_relative 'helpers'

user = seed_user!

wolverine_dump = user.bots.find_or_initialize_by(name: "Wolverine Dump")
wolverine_dump.description = "A fresh tactical bot focused on king-entry safety, forcing pressure, and decisive conversion once the opposing king loosens. Migrated from Wolverine v2 by bots:migrate_to_v2_grammar_clone."
wolverine_dump.save!

reset_bot_graph!(wolverine_dump)

node_map = { 104269 => wolverine_dump.root_node }

node_map[104270] = create_organizer!(
  bot: wolverine_dump,
  position_x: 120.0,
  position_y: 120.0,
  title: "Terminal",
  notes: ""
)

node_map[104271] = create_organizer!(
  bot: wolverine_dump,
  position_x: 900.0,
  position_y: 120.0,
  title: "Opening",
  notes: ""
)

node_map[104272] = create_organizer!(
  bot: wolverine_dump,
  position_x: 600.0,
  position_y: 1640.0,
  title: "Tactics",
  notes: ""
)

node_map[104273] = create_organizer!(
  bot: wolverine_dump,
  position_x: 2080.0,
  position_y: 980.0,
  title: "King Pressure",
  notes: ""
)

node_map[104274] = create_organizer!(
  bot: wolverine_dump,
  position_x: 3400.0,
  position_y: 760.0,
  title: "Endgame",
  notes: ""
)

node_map[104275] = create_organizer!(
  bot: wolverine_dump,
  position_x: 4700.0,
  position_y: 980.0,
  title: "Fallback",
  notes: ""
)

node_map[104276] = create_condition!(
  bot: wolverine_dump,
  position_x: 80.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[104277] = create_condition!(
  bot: wolverine_dump,
  position_x: 140.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[104278] = create_score!(
  bot: wolverine_dump,
  position_x: 80.0,
  position_y: 580.0,
  action_type: "return",
  value: 100
)

node_map[104279] = create_condition!(
  bot: wolverine_dump,
  position_x: 300.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[104280] = create_condition!(
  bot: wolverine_dump,
  position_x: 360.0,
  position_y: 430.0,
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

node_map[104281] = create_score!(
  bot: wolverine_dump,
  position_x: 300.0,
  position_y: 580.0,
  action_type: "return",
  value: -100
)

node_map[104282] = create_condition!(
  bot: wolverine_dump,
  position_x: 760.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104283] = create_condition!(
  bot: wolverine_dump,
  position_x: 840.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104284] = create_condition!(
  bot: wolverine_dump,
  position_x: 760.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[104285] = create_condition!(
  bot: wolverine_dump,
  position_x: 840.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[104286] = create_condition!(
  bot: wolverine_dump,
  position_x: 760.0,
  position_y: 880.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[104287] = create_condition!(
  bot: wolverine_dump,
  position_x: 840.0,
  position_y: 1030.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[104288] = create_condition!(
  bot: wolverine_dump,
  position_x: 760.0,
  position_y: 1180.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104289] = create_condition!(
  bot: wolverine_dump,
  position_x: 840.0,
  position_y: 1330.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104290] = create_condition!(
  bot: wolverine_dump,
  position_x: 760.0,
  position_y: 1480.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[104291] = create_condition!(
  bot: wolverine_dump,
  position_x: 840.0,
  position_y: 1630.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[104292] = create_condition!(
  bot: wolverine_dump,
  position_x: 760.0,
  position_y: 1780.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[104293] = create_condition!(
  bot: wolverine_dump,
  position_x: 840.0,
  position_y: 1930.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[104294] = create_condition!(
  bot: wolverine_dump,
  position_x: 760.0,
  position_y: 2080.0,
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

node_map[104295] = create_condition!(
  bot: wolverine_dump,
  position_x: 840.0,
  position_y: 2230.0,
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

node_map[104296] = create_condition!(
  bot: wolverine_dump,
  position_x: 1160.0,
  position_y: 2380.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104297] = create_condition!(
  bot: wolverine_dump,
  position_x: 1240.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104298] = create_condition!(
  bot: wolverine_dump,
  position_x: 1160.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104299] = create_condition!(
  bot: wolverine_dump,
  position_x: 1160.0,
  position_y: 2830.0,
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

node_map[104300] = create_score!(
  bot: wolverine_dump,
  position_x: 1240.0,
  position_y: 2980.0,
  action_type: "add",
  value: 13
)

node_map[104301] = create_condition!(
  bot: wolverine_dump,
  position_x: 1420.0,
  position_y: 2830.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104302] = create_score!(
  bot: wolverine_dump,
  position_x: 1500.0,
  position_y: 2980.0,
  action_type: "add",
  value: 13
)

node_map[104303] = create_condition!(
  bot: wolverine_dump,
  position_x: 1720.0,
  position_y: 2380.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104304] = create_condition!(
  bot: wolverine_dump,
  position_x: 1800.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104305] = create_condition!(
  bot: wolverine_dump,
  position_x: 1720.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104306] = create_condition!(
  bot: wolverine_dump,
  position_x: 1720.0,
  position_y: 2830.0,
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

node_map[104307] = create_score!(
  bot: wolverine_dump,
  position_x: 1800.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[104308] = create_condition!(
  bot: wolverine_dump,
  position_x: 1980.0,
  position_y: 2830.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104309] = create_score!(
  bot: wolverine_dump,
  position_x: 2060.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[104310] = create_condition!(
  bot: wolverine_dump,
  position_x: 2280.0,
  position_y: 2380.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104311] = create_condition!(
  bot: wolverine_dump,
  position_x: 2280.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104312] = create_condition!(
  bot: wolverine_dump,
  position_x: 2360.0,
  position_y: 2680.0,
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

node_map[104313] = create_score!(
  bot: wolverine_dump,
  position_x: 2280.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[104314] = create_condition!(
  bot: wolverine_dump,
  position_x: 2640.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104315] = create_condition!(
  bot: wolverine_dump,
  position_x: 2720.0,
  position_y: 2680.0,
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

node_map[104316] = create_score!(
  bot: wolverine_dump,
  position_x: 2640.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[104317] = create_condition!(
  bot: wolverine_dump,
  position_x: 420.0,
  position_y: 1800.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[104318] = create_condition!(
  bot: wolverine_dump,
  position_x: 480.0,
  position_y: 1950.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104319] = create_score!(
  bot: wolverine_dump,
  position_x: 420.0,
  position_y: 2100.0,
  action_type: "return",
  value: 110
)

node_map[104320] = create_score!(
  bot: wolverine_dump,
  position_x: 740.0,
  position_y: 1950.0,
  action_type: "return",
  value: 100
)

node_map[104321] = create_condition!(
  bot: wolverine_dump,
  position_x: 900.0,
  position_y: 1800.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104322] = create_condition!(
  bot: wolverine_dump,
  position_x: 960.0,
  position_y: 1950.0,
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

node_map[104323] = create_condition!(
  bot: wolverine_dump,
  position_x: 900.0,
  position_y: 2100.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104324] = create_score!(
  bot: wolverine_dump,
  position_x: 960.0,
  position_y: 2250.0,
  action_type: "return",
  value: 58
)

node_map[104325] = create_condition!(
  bot: wolverine_dump,
  position_x: 1140.0,
  position_y: 2100.0,
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

node_map[104326] = create_score!(
  bot: wolverine_dump,
  position_x: 1200.0,
  position_y: 2250.0,
  action_type: "return",
  value: 58
)

node_map[104327] = create_condition!(
  bot: wolverine_dump,
  position_x: 1380.0,
  position_y: 1800.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104328] = create_condition!(
  bot: wolverine_dump,
  position_x: 1440.0,
  position_y: 1950.0,
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

node_map[104329] = create_condition!(
  bot: wolverine_dump,
  position_x: 1380.0,
  position_y: 2100.0,
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

node_map[104330] = create_condition!(
  bot: wolverine_dump,
  position_x: 1440.0,
  position_y: 2250.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104331] = create_score!(
  bot: wolverine_dump,
  position_x: 1380.0,
  position_y: 2400.0,
  action_type: "return",
  value: 48
)

node_map[104332] = create_condition!(
  bot: wolverine_dump,
  position_x: 1840.0,
  position_y: 1800.0,
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

node_map[104333] = create_condition!(
  bot: wolverine_dump,
  position_x: 1900.0,
  position_y: 1950.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104334] = create_condition!(
  bot: wolverine_dump,
  position_x: 1840.0,
  position_y: 2100.0,
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

node_map[104335] = create_score!(
  bot: wolverine_dump,
  position_x: 1900.0,
  position_y: 2250.0,
  action_type: "return",
  value: 42
)

node_map[104336] = create_condition!(
  bot: wolverine_dump,
  position_x: 2220.0,
  position_y: 1950.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104337] = create_condition!(
  bot: wolverine_dump,
  position_x: 2160.0,
  position_y: 2100.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104338] = create_score!(
  bot: wolverine_dump,
  position_x: 2220.0,
  position_y: 2250.0,
  action_type: "return",
  value: 36
)

node_map[104339] = create_condition!(
  bot: wolverine_dump,
  position_x: 2540.0,
  position_y: 1950.0,
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

node_map[104340] = create_condition!(
  bot: wolverine_dump,
  position_x: 2480.0,
  position_y: 2100.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104341] = create_score!(
  bot: wolverine_dump,
  position_x: 2540.0,
  position_y: 2250.0,
  action_type: "return",
  value: 34
)

node_map[104342] = create_condition!(
  bot: wolverine_dump,
  position_x: 2560.0,
  position_y: 1800.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104343] = create_condition!(
  bot: wolverine_dump,
  position_x: 2620.0,
  position_y: 1950.0,
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

node_map[104344] = create_condition!(
  bot: wolverine_dump,
  position_x: 2560.0,
  position_y: 2100.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104345] = create_condition!(
  bot: wolverine_dump,
  position_x: 2620.0,
  position_y: 2250.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104346] = create_condition!(
  bot: wolverine_dump,
  position_x: 2560.0,
  position_y: 2400.0,
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

node_map[104347] = create_score!(
  bot: wolverine_dump,
  position_x: 2620.0,
  position_y: 2550.0,
  action_type: "return",
  value: 42
)

node_map[104348] = create_condition!(
  bot: wolverine_dump,
  position_x: 2940.0,
  position_y: 2250.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104349] = create_condition!(
  bot: wolverine_dump,
  position_x: 2880.0,
  position_y: 2400.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104350] = create_score!(
  bot: wolverine_dump,
  position_x: 2940.0,
  position_y: 2550.0,
  action_type: "return",
  value: 36
)

node_map[104351] = create_condition!(
  bot: wolverine_dump,
  position_x: 3260.0,
  position_y: 2250.0,
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

node_map[104352] = create_condition!(
  bot: wolverine_dump,
  position_x: 3200.0,
  position_y: 2400.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104353] = create_score!(
  bot: wolverine_dump,
  position_x: 3260.0,
  position_y: 2550.0,
  action_type: "return",
  value: 34
)

node_map[104354] = create_condition!(
  bot: wolverine_dump,
  position_x: 1960.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104355] = create_condition!(
  bot: wolverine_dump,
  position_x: 1960.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104356] = create_condition!(
  bot: wolverine_dump,
  position_x: 2030.0,
  position_y: 1440.0,
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

node_map[104357] = create_score!(
  bot: wolverine_dump,
  position_x: 1960.0,
  position_y: 1590.0,
  action_type: "return",
  value: 34
)

node_map[104358] = create_condition!(
  bot: wolverine_dump,
  position_x: 2550.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104359] = create_score!(
  bot: wolverine_dump,
  position_x: 2480.0,
  position_y: 1590.0,
  action_type: "add",
  value: 18
)

node_map[104360] = create_score!(
  bot: wolverine_dump,
  position_x: 3070.0,
  position_y: 1440.0,
  action_type: "add",
  value: 12
)

node_map[104361] = create_condition!(
  bot: wolverine_dump,
  position_x: 2880.0,
  position_y: 1140.0,
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

node_map[104362] = create_condition!(
  bot: wolverine_dump,
  position_x: 2880.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104363] = create_condition!(
  bot: wolverine_dump,
  position_x: 2950.0,
  position_y: 1440.0,
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

node_map[104364] = create_score!(
  bot: wolverine_dump,
  position_x: 2880.0,
  position_y: 1590.0,
  action_type: "return",
  value: 34
)

node_map[104365] = create_condition!(
  bot: wolverine_dump,
  position_x: 3470.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104366] = create_score!(
  bot: wolverine_dump,
  position_x: 3400.0,
  position_y: 1590.0,
  action_type: "add",
  value: 18
)

node_map[104367] = create_score!(
  bot: wolverine_dump,
  position_x: 3990.0,
  position_y: 1440.0,
  action_type: "add",
  value: 12
)

node_map[104368] = create_condition!(
  bot: wolverine_dump,
  position_x: 3000.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104369] = create_condition!(
  bot: wolverine_dump,
  position_x: 3070.0,
  position_y: 1290.0,
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

node_map[104370] = create_condition!(
  bot: wolverine_dump,
  position_x: 3000.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104371] = create_condition!(
  bot: wolverine_dump,
  position_x: 3070.0,
  position_y: 1590.0,
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

node_map[104372] = create_score!(
  bot: wolverine_dump,
  position_x: 3000.0,
  position_y: 1740.0,
  action_type: "return",
  value: 32
)

node_map[104373] = create_condition!(
  bot: wolverine_dump,
  position_x: 3340.0,
  position_y: 1140.0,
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

node_map[104374] = create_condition!(
  bot: wolverine_dump,
  position_x: 3410.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104375] = create_condition!(
  bot: wolverine_dump,
  position_x: 3340.0,
  position_y: 1440.0,
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

node_map[104376] = create_score!(
  bot: wolverine_dump,
  position_x: 3410.0,
  position_y: 1590.0,
  action_type: "return",
  value: 30
)

node_map[104377] = create_condition!(
  bot: wolverine_dump,
  position_x: 3260.0,
  position_y: 920.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[104378] = create_condition!(
  bot: wolverine_dump,
  position_x: 3330.0,
  position_y: 1070.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[104379] = create_condition!(
  bot: wolverine_dump,
  position_x: 3260.0,
  position_y: 1220.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104380] = create_condition!(
  bot: wolverine_dump,
  position_x: 3330.0,
  position_y: 1370.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104381] = create_score!(
  bot: wolverine_dump,
  position_x: 3260.0,
  position_y: 1520.0,
  action_type: "return",
  value: 30
)

node_map[104382] = create_condition!(
  bot: wolverine_dump,
  position_x: 3800.0,
  position_y: 1520.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104383] = create_score!(
  bot: wolverine_dump,
  position_x: 3870.0,
  position_y: 1670.0,
  action_type: "return",
  value: 26
)

node_map[104384] = create_condition!(
  bot: wolverine_dump,
  position_x: 4340.0,
  position_y: 1520.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104385] = create_condition!(
  bot: wolverine_dump,
  position_x: 4410.0,
  position_y: 1670.0,
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

node_map[104386] = create_condition!(
  bot: wolverine_dump,
  position_x: 4340.0,
  position_y: 1820.0,
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

node_map[104387] = create_score!(
  bot: wolverine_dump,
  position_x: 4410.0,
  position_y: 1970.0,
  action_type: "add",
  value: 18
)

node_map[104388] = create_condition!(
  bot: wolverine_dump,
  position_x: 4620.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104389] = create_condition!(
  bot: wolverine_dump,
  position_x: 4690.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>1}
)

node_map[104390] = create_condition!(
  bot: wolverine_dump,
  position_x: 4620.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104391] = create_condition!(
  bot: wolverine_dump,
  position_x: 4690.0,
  position_y: 1590.0,
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

node_map[104392] = create_score!(
  bot: wolverine_dump,
  position_x: 4620.0,
  position_y: 1740.0,
  action_type: "return",
  value: 26
)

node_map[104393] = create_condition!(
  bot: wolverine_dump,
  position_x: 4940.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104394] = create_condition!(
  bot: wolverine_dump,
  position_x: 5010.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>2}
)

node_map[104395] = create_condition!(
  bot: wolverine_dump,
  position_x: 4940.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104396] = create_condition!(
  bot: wolverine_dump,
  position_x: 5010.0,
  position_y: 1590.0,
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

node_map[104397] = create_condition!(
  bot: wolverine_dump,
  position_x: 4940.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104398] = create_score!(
  bot: wolverine_dump,
  position_x: 5010.0,
  position_y: 1890.0,
  action_type: "add",
  value: 8
)

node_map[104399] = create_condition!(
  bot: wolverine_dump,
  position_x: 5580.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>1}
)

node_map[104400] = create_condition!(
  bot: wolverine_dump,
  position_x: 5650.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104401] = create_condition!(
  bot: wolverine_dump,
  position_x: 5580.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104402] = create_score!(
  bot: wolverine_dump,
  position_x: 5650.0,
  position_y: 1590.0,
  action_type: "return",
  value: -90
)

node_map[104403] = create_condition!(
  bot: wolverine_dump,
  position_x: 5970.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104404] = create_condition!(
  bot: wolverine_dump,
  position_x: 5900.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104405] = create_score!(
  bot: wolverine_dump,
  position_x: 5970.0,
  position_y: 1590.0,
  action_type: "return",
  value: -90
)

node_map[104406] = create_condition!(
  bot: wolverine_dump,
  position_x: 6290.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104407] = create_condition!(
  bot: wolverine_dump,
  position_x: 6220.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104408] = create_score!(
  bot: wolverine_dump,
  position_x: 6290.0,
  position_y: 1590.0,
  action_type: "return",
  value: -120
)

node_map[104409] = create_condition!(
  bot: wolverine_dump,
  position_x: 6220.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104410] = create_condition!(
  bot: wolverine_dump,
  position_x: 6140.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[104411] = create_condition!(
  bot: wolverine_dump,
  position_x: 6210.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104412] = create_condition!(
  bot: wolverine_dump,
  position_x: 6140.0,
  position_y: 1590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104413] = create_score!(
  bot: wolverine_dump,
  position_x: 6210.0,
  position_y: 1740.0,
  action_type: "subtract",
  value: 18
)

node_map[104414] = create_condition!(
  bot: wolverine_dump,
  position_x: 6460.0,
  position_y: 1290.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104415] = create_score!(
  bot: wolverine_dump,
  position_x: 6530.0,
  position_y: 1440.0,
  action_type: "return",
  value: -120
)

connect!(node_map[104269], node_map[104270])
connect!(node_map[104269], node_map[104271])
connect!(node_map[104269], node_map[104272])
connect!(node_map[104269], node_map[104273])
connect!(node_map[104269], node_map[104274])
connect!(node_map[104269], node_map[104275])
connect!(node_map[104270], node_map[104276])
connect!(node_map[104270], node_map[104279])
connect!(node_map[104271], node_map[104282])
connect!(node_map[104272], node_map[104317])
connect!(node_map[104272], node_map[104321])
connect!(node_map[104272], node_map[104327])
connect!(node_map[104272], node_map[104332])
connect!(node_map[104272], node_map[104342])
connect!(node_map[104273], node_map[104354])
connect!(node_map[104273], node_map[104361])
connect!(node_map[104273], node_map[104368])
connect!(node_map[104273], node_map[104373])
connect!(node_map[104274], node_map[104377])
connect!(node_map[104275], node_map[104388])
connect!(node_map[104275], node_map[104393])
connect!(node_map[104275], node_map[104399])
connect!(node_map[104275], node_map[104409])
connect!(node_map[104276], node_map[104277])
connect!(node_map[104277], node_map[104278])
connect!(node_map[104279], node_map[104280])
connect!(node_map[104280], node_map[104281])
connect!(node_map[104282], node_map[104283])
connect!(node_map[104283], node_map[104284])
connect!(node_map[104284], node_map[104285])
connect!(node_map[104285], node_map[104286])
connect!(node_map[104286], node_map[104287])
connect!(node_map[104287], node_map[104288])
connect!(node_map[104288], node_map[104289])
connect!(node_map[104289], node_map[104290])
connect!(node_map[104290], node_map[104291])
connect!(node_map[104291], node_map[104292])
connect!(node_map[104292], node_map[104293])
connect!(node_map[104293], node_map[104294])
connect!(node_map[104294], node_map[104295])
connect!(node_map[104295], node_map[104296])
connect!(node_map[104295], node_map[104303])
connect!(node_map[104295], node_map[104310])
connect!(node_map[104296], node_map[104297])
connect!(node_map[104297], node_map[104298])
connect!(node_map[104298], node_map[104299])
connect!(node_map[104298], node_map[104301])
connect!(node_map[104299], node_map[104300])
connect!(node_map[104301], node_map[104302])
connect!(node_map[104303], node_map[104304])
connect!(node_map[104304], node_map[104305])
connect!(node_map[104305], node_map[104306])
connect!(node_map[104305], node_map[104308])
connect!(node_map[104306], node_map[104307])
connect!(node_map[104308], node_map[104309])
connect!(node_map[104310], node_map[104311])
connect!(node_map[104310], node_map[104314])
connect!(node_map[104311], node_map[104312])
connect!(node_map[104312], node_map[104313])
connect!(node_map[104314], node_map[104315])
connect!(node_map[104315], node_map[104316])
connect!(node_map[104317], node_map[104318])
connect!(node_map[104317], node_map[104320])
connect!(node_map[104318], node_map[104319])
connect!(node_map[104321], node_map[104322])
connect!(node_map[104322], node_map[104323])
connect!(node_map[104322], node_map[104325])
connect!(node_map[104323], node_map[104324])
connect!(node_map[104325], node_map[104326])
connect!(node_map[104327], node_map[104328])
connect!(node_map[104328], node_map[104329])
connect!(node_map[104329], node_map[104330])
connect!(node_map[104330], node_map[104331])
connect!(node_map[104332], node_map[104333])
connect!(node_map[104332], node_map[104336])
connect!(node_map[104332], node_map[104339])
connect!(node_map[104333], node_map[104334])
connect!(node_map[104334], node_map[104335])
connect!(node_map[104336], node_map[104337])
connect!(node_map[104337], node_map[104338])
connect!(node_map[104339], node_map[104340])
connect!(node_map[104340], node_map[104341])
connect!(node_map[104342], node_map[104343])
connect!(node_map[104343], node_map[104344])
connect!(node_map[104344], node_map[104345])
connect!(node_map[104344], node_map[104348])
connect!(node_map[104344], node_map[104351])
connect!(node_map[104345], node_map[104346])
connect!(node_map[104346], node_map[104347])
connect!(node_map[104348], node_map[104349])
connect!(node_map[104349], node_map[104350])
connect!(node_map[104351], node_map[104352])
connect!(node_map[104352], node_map[104353])
connect!(node_map[104354], node_map[104355])
connect!(node_map[104355], node_map[104356])
connect!(node_map[104355], node_map[104358])
connect!(node_map[104355], node_map[104360])
connect!(node_map[104356], node_map[104357])
connect!(node_map[104358], node_map[104359])
connect!(node_map[104361], node_map[104362])
connect!(node_map[104362], node_map[104363])
connect!(node_map[104362], node_map[104365])
connect!(node_map[104362], node_map[104367])
connect!(node_map[104363], node_map[104364])
connect!(node_map[104365], node_map[104366])
connect!(node_map[104368], node_map[104369])
connect!(node_map[104369], node_map[104370])
connect!(node_map[104370], node_map[104371])
connect!(node_map[104371], node_map[104372])
connect!(node_map[104373], node_map[104374])
connect!(node_map[104374], node_map[104375])
connect!(node_map[104375], node_map[104376])
connect!(node_map[104377], node_map[104378])
connect!(node_map[104378], node_map[104379])
connect!(node_map[104379], node_map[104380])
connect!(node_map[104380], node_map[104381])
connect!(node_map[104380], node_map[104382])
connect!(node_map[104380], node_map[104384])
connect!(node_map[104382], node_map[104383])
connect!(node_map[104384], node_map[104385])
connect!(node_map[104385], node_map[104386])
connect!(node_map[104386], node_map[104387])
connect!(node_map[104388], node_map[104389])
connect!(node_map[104389], node_map[104390])
connect!(node_map[104390], node_map[104391])
connect!(node_map[104391], node_map[104392])
connect!(node_map[104393], node_map[104394])
connect!(node_map[104394], node_map[104395])
connect!(node_map[104395], node_map[104396])
connect!(node_map[104396], node_map[104397])
connect!(node_map[104397], node_map[104398])
connect!(node_map[104399], node_map[104400])
connect!(node_map[104399], node_map[104403])
connect!(node_map[104399], node_map[104406])
connect!(node_map[104400], node_map[104401])
connect!(node_map[104401], node_map[104402])
connect!(node_map[104403], node_map[104404])
connect!(node_map[104404], node_map[104405])
connect!(node_map[104406], node_map[104407])
connect!(node_map[104407], node_map[104408])
connect!(node_map[104409], node_map[104410])
connect!(node_map[104409], node_map[104414])
connect!(node_map[104410], node_map[104411])
connect!(node_map[104411], node_map[104412])
connect!(node_map[104412], node_map[104413])
connect!(node_map[104414], node_map[104415])

wolverine_dump.compile_program!
