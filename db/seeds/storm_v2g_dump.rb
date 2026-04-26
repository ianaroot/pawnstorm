# Standalone seed file for Storm V2_G Dump.

require_relative 'helpers'

user = seed_user!

storm_v2_g_dump = user.bots.find_or_initialize_by(name: "Storm V2_G Dump")
storm_v2_g_dump.description = "A behavior-preserving refactor target for Storm using shared graph trunks for the repeated opening, queen, endgame, and fallback families. Migrated from Storm v2 by bots:migrate_to_v2_grammar_clone."
storm_v2_g_dump.save!

reset_bot_graph!(storm_v2_g_dump)

node_map = { 100969 => storm_v2_g_dump.root_node }

node_map[100970] = create_organizer!(
  bot: storm_v2_g_dump,
  position_x: 120.0,
  position_y: 120.0,
  title: "Terminal",
  notes: ""
)

node_map[100971] = create_organizer!(
  bot: storm_v2_g_dump,
  position_x: 820.0,
  position_y: 120.0,
  title: "Opening",
  notes: ""
)

node_map[100972] = create_organizer!(
  bot: storm_v2_g_dump,
  position_x: 560.0,
  position_y: 1780.0,
  title: "Tactics",
  notes: ""
)

node_map[100973] = create_organizer!(
  bot: storm_v2_g_dump,
  position_x: 1960.0,
  position_y: 220.0,
  title: "Queen Strategy",
  notes: ""
)

node_map[100974] = create_organizer!(
  bot: storm_v2_g_dump,
  position_x: 2200.0,
  position_y: 1320.0,
  title: "King Pressure",
  notes: ""
)

node_map[100975] = create_organizer!(
  bot: storm_v2_g_dump,
  position_x: 3240.0,
  position_y: 900.0,
  title: "Endgame",
  notes: ""
)

node_map[100976] = create_organizer!(
  bot: storm_v2_g_dump,
  position_x: 4380.0,
  position_y: 1280.0,
  title: "Fallback",
  notes: ""
)

node_map[100977] = create_condition!(
  bot: storm_v2_g_dump,
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

node_map[100978] = create_condition!(
  bot: storm_v2_g_dump,
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

node_map[100979] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 80.0,
  position_y: 580.0,
  action_type: "return",
  value: 100
)

node_map[100980] = create_condition!(
  bot: storm_v2_g_dump,
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

node_map[100981] = create_condition!(
  bot: storm_v2_g_dump,
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

node_map[100982] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 300.0,
  position_y: 580.0,
  action_type: "return",
  value: -100
)

node_map[100983] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 700.0,
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

node_map[100984] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 780.0,
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

node_map[100985] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 700.0,
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

node_map[100986] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 780.0,
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

node_map[100987] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 700.0,
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

node_map[100988] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 780.0,
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

node_map[100989] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 700.0,
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

node_map[100990] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 780.0,
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

node_map[100991] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 700.0,
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

node_map[100992] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 780.0,
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

node_map[100993] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 700.0,
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

node_map[100994] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 780.0,
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

node_map[100995] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 700.0,
  position_y: 2080.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonValue"=>0}
)

node_map[100996] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 780.0,
  position_y: 2230.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonValue"=>0}
)

node_map[100997] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1180.0,
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

node_map[100998] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1260.0,
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

node_map[100999] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1180.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101000] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1180.0,
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

node_map[101001] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 1260.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[101002] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1440.0,
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

node_map[101003] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 1520.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[101004] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1780.0,
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

node_map[101005] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1860.0,
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

node_map[101006] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1780.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101007] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1780.0,
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

node_map[101008] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 1860.0,
  position_y: 2980.0,
  action_type: "add",
  value: 11
)

node_map[101009] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2040.0,
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

node_map[101010] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2120.0,
  position_y: 2980.0,
  action_type: "add",
  value: 11
)

node_map[101011] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2380.0,
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

node_map[101012] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2380.0,
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

node_map[101013] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2380.0,
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

node_map[101014] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2460.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[101015] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2640.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101016] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2720.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[101017] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2900.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101018] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2900.0,
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

node_map[101019] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2980.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[101020] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3160.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101021] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3240.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[101022] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 420.0,
  position_y: 1940.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[101023] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 480.0,
  position_y: 2090.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101024] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 420.0,
  position_y: 2240.0,
  action_type: "return",
  value: 110
)

node_map[101025] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 740.0,
  position_y: 2090.0,
  action_type: "return",
  value: 100
)

node_map[101026] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 940.0,
  position_y: 1940.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101027] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1000.0,
  position_y: 2090.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>1}
)

node_map[101028] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 940.0,
  position_y: 2240.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101029] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 1000.0,
  position_y: 2390.0,
  action_type: "return",
  value: 55
)

node_map[101030] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1180.0,
  position_y: 2240.0,
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

node_map[101031] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 1240.0,
  position_y: 2390.0,
  action_type: "return",
  value: 55
)

node_map[101032] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 680.0,
  position_y: 1940.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101033] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 740.0,
  position_y: 2090.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101034] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 680.0,
  position_y: 2240.0,
  action_type: "return",
  value: 92
)

node_map[101035] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1440.0,
  position_y: 1940.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101036] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1500.0,
  position_y: 2090.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonValue"=>0}
)

node_map[101037] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1440.0,
  position_y: 2240.0,
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

node_map[101038] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1500.0,
  position_y: 2390.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101039] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 1440.0,
  position_y: 2540.0,
  action_type: "return",
  value: 46
)

node_map[101040] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1820.0,
  position_y: 380.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101041] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1820.0,
  position_y: 530.0,
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

node_map[101042] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 1820.0,
  position_y: 680.0,
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

node_map[101043] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 1890.0,
  position_y: 830.0,
  action_type: "return",
  value: 80
)

node_map[101044] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2080.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101045] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2150.0,
  position_y: 830.0,
  action_type: "return",
  value: 80
)

node_map[101046] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2600.0,
  position_y: 530.0,
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

node_map[101047] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2600.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101048] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2670.0,
  position_y: 830.0,
  action_type: "add",
  value: 10
)

node_map[101049] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2860.0,
  position_y: 680.0,
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

node_map[101050] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2930.0,
  position_y: 830.0,
  action_type: "add",
  value: 10
)

node_map[101051] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3120.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101052] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3190.0,
  position_y: 830.0,
  action_type: "add",
  value: 8
)

node_map[101053] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3380.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101054] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3450.0,
  position_y: 830.0,
  action_type: "add",
  value: 8
)

node_map[101055] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3640.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101056] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3710.0,
  position_y: 830.0,
  action_type: "add",
  value: 8
)

node_map[101057] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3900.0,
  position_y: 530.0,
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

node_map[101058] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3970.0,
  position_y: 680.0,
  action_type: "return",
  value: -120
)

node_map[101059] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4160.0,
  position_y: 530.0,
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

node_map[101060] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4230.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101061] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4160.0,
  position_y: 830.0,
  action_type: "return",
  value: -120
)

node_map[101062] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4420.0,
  position_y: 530.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101063] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4490.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[101064] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4420.0,
  position_y: 830.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101065] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4490.0,
  position_y: 980.0,
  action_type: "subtract",
  value: 12
)

node_map[101066] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2100.0,
  position_y: 1480.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101067] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2170.0,
  position_y: 1630.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101068] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2100.0,
  position_y: 1780.0,
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

node_map[101069] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2170.0,
  position_y: 1930.0,
  action_type: "return",
  value: 24
)

node_map[101070] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2790.0,
  position_y: 1630.0,
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

node_map[101071] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 2720.0,
  position_y: 1780.0,
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

node_map[101072] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 2790.0,
  position_y: 1930.0,
  action_type: "return",
  value: 20
)

node_map[101073] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3000.0,
  position_y: 1480.0,
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

node_map[101074] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3070.0,
  position_y: 1630.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101075] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3000.0,
  position_y: 1780.0,
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

node_map[101076] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3070.0,
  position_y: 1930.0,
  action_type: "return",
  value: 24
)

node_map[101077] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3690.0,
  position_y: 1630.0,
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

node_map[101078] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3620.0,
  position_y: 1780.0,
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

node_map[101079] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3690.0,
  position_y: 1930.0,
  action_type: "return",
  value: 20
)

node_map[101080] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3120.0,
  position_y: 1060.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[101081] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3190.0,
  position_y: 1210.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[101082] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3120.0,
  position_y: 1360.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[101083] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3120.0,
  position_y: 1510.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101084] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3190.0,
  position_y: 1660.0,
  action_type: "return",
  value: 88
)

node_map[101085] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3380.0,
  position_y: 1510.0,
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

node_map[101086] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3450.0,
  position_y: 1660.0,
  action_type: "return",
  value: 88
)

node_map[101087] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3640.0,
  position_y: 1360.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101088] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3640.0,
  position_y: 1510.0,
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

node_map[101089] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3710.0,
  position_y: 1660.0,
  action_type: "return",
  value: 22
)

node_map[101090] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 3900.0,
  position_y: 1510.0,
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

node_map[101091] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 3970.0,
  position_y: 1660.0,
  action_type: "return",
  value: 22
)

node_map[101092] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4160.0,
  position_y: 1360.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101093] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4160.0,
  position_y: 1510.0,
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

node_map[101094] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4230.0,
  position_y: 1660.0,
  action_type: "add",
  value: 14
)

node_map[101095] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4420.0,
  position_y: 1510.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101096] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4490.0,
  position_y: 1660.0,
  action_type: "add",
  value: 14
)

node_map[101097] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4680.0,
  position_y: 1360.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101098] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4680.0,
  position_y: 1510.0,
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

node_map[101099] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4750.0,
  position_y: 1660.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101100] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4680.0,
  position_y: 1810.0,
  action_type: "add",
  value: 8
)

node_map[101101] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4940.0,
  position_y: 1510.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101102] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5010.0,
  position_y: 1660.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101103] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4940.0,
  position_y: 1810.0,
  action_type: "add",
  value: 8
)

node_map[101104] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4260.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101105] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4330.0,
  position_y: 1590.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[101106] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4260.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101107] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4260.0,
  position_y: 1890.0,
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

node_map[101108] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4260.0,
  position_y: 2040.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101109] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4330.0,
  position_y: 2190.0,
  action_type: "add",
  value: 7
)

node_map[101110] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4520.0,
  position_y: 2040.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101111] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4590.0,
  position_y: 2190.0,
  action_type: "add",
  value: 7
)

node_map[101112] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4780.0,
  position_y: 1890.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101113] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 4850.0,
  position_y: 2040.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101114] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 4780.0,
  position_y: 2190.0,
  action_type: "add",
  value: 7
)

node_map[101115] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5040.0,
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
   "subjectComparisonValue"=>1}
)

node_map[101116] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 5110.0,
  position_y: 1590.0,
  action_type: "add",
  value: 5
)

node_map[101117] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5300.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101118] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5300.0,
  position_y: 1590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101119] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5370.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101120] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5300.0,
  position_y: 1890.0,
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

node_map[101121] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 5370.0,
  position_y: 2040.0,
  action_type: "return",
  value: 26
)

node_map[101122] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 7120.0,
  position_y: 1590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101123] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 7190.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101124] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 7120.0,
  position_y: 1890.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101125] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 7190.0,
  position_y: 2040.0,
  action_type: "subtract",
  value: 10
)

node_map[101126] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5560.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[101127] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5560.0,
  position_y: 1590.0,
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

node_map[101128] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5630.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101129] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5560.0,
  position_y: 1890.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101130] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 5630.0,
  position_y: 2040.0,
  action_type: "return",
  value: 18
)

node_map[101131] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5820.0,
  position_y: 1590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101132] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5890.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[101133] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 5820.0,
  position_y: 1890.0,
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

node_map[101134] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 5890.0,
  position_y: 2040.0,
  action_type: "return",
  value: 18
)

node_map[101135] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6080.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101136] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6150.0,
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

node_map[101137] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6080.0,
  position_y: 1740.0,
  action_type: "add",
  value: 8
)

node_map[101138] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6410.0,
  position_y: 1590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101139] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6340.0,
  position_y: 1740.0,
  action_type: "add",
  value: 8
)

node_map[101140] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6080.0,
  position_y: 2010.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101141] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6150.0,
  position_y: 2160.0,
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

node_map[101142] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6080.0,
  position_y: 2310.0,
  action_type: "add",
  value: 8
)

node_map[101143] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6410.0,
  position_y: 2160.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101144] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6340.0,
  position_y: 2310.0,
  action_type: "add",
  value: 8
)

node_map[101145] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6600.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101146] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6670.0,
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

node_map[101147] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6600.0,
  position_y: 1740.0,
  action_type: "add",
  value: 6
)

node_map[101148] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6930.0,
  position_y: 1590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101149] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6860.0,
  position_y: 1740.0,
  action_type: "add",
  value: 6
)

node_map[101150] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6600.0,
  position_y: 2010.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[101151] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6670.0,
  position_y: 2160.0,
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

node_map[101152] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6600.0,
  position_y: 2310.0,
  action_type: "add",
  value: 6
)

node_map[101153] = create_condition!(
  bot: storm_v2_g_dump,
  position_x: 6930.0,
  position_y: 2160.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[101154] = create_score!(
  bot: storm_v2_g_dump,
  position_x: 6860.0,
  position_y: 2310.0,
  action_type: "add",
  value: 6
)

connect!(node_map[100969], node_map[100970])
connect!(node_map[100969], node_map[100971])
connect!(node_map[100969], node_map[100972])
connect!(node_map[100969], node_map[100973])
connect!(node_map[100969], node_map[100974])
connect!(node_map[100969], node_map[100975])
connect!(node_map[100969], node_map[100976])
connect!(node_map[100970], node_map[100977])
connect!(node_map[100970], node_map[100980])
connect!(node_map[100971], node_map[100983])
connect!(node_map[100972], node_map[101022])
connect!(node_map[100972], node_map[101026])
connect!(node_map[100972], node_map[101032])
connect!(node_map[100972], node_map[101035])
connect!(node_map[100973], node_map[101040])
connect!(node_map[100974], node_map[101066])
connect!(node_map[100974], node_map[101073])
connect!(node_map[100975], node_map[101080])
connect!(node_map[100976], node_map[101104])
connect!(node_map[100976], node_map[101117])
connect!(node_map[100976], node_map[101126])
connect!(node_map[100977], node_map[100978])
connect!(node_map[100978], node_map[100979])
connect!(node_map[100980], node_map[100981])
connect!(node_map[100981], node_map[100982])
connect!(node_map[100983], node_map[100984])
connect!(node_map[100984], node_map[100985])
connect!(node_map[100985], node_map[100986])
connect!(node_map[100986], node_map[100987])
connect!(node_map[100987], node_map[100988])
connect!(node_map[100988], node_map[100989])
connect!(node_map[100989], node_map[100990])
connect!(node_map[100990], node_map[100991])
connect!(node_map[100991], node_map[100992])
connect!(node_map[100992], node_map[100993])
connect!(node_map[100993], node_map[100994])
connect!(node_map[100994], node_map[100995])
connect!(node_map[100995], node_map[100996])
connect!(node_map[100996], node_map[100997])
connect!(node_map[100996], node_map[101004])
connect!(node_map[100996], node_map[101011])
connect!(node_map[100997], node_map[100998])
connect!(node_map[100998], node_map[100999])
connect!(node_map[100999], node_map[101000])
connect!(node_map[100999], node_map[101002])
connect!(node_map[101000], node_map[101001])
connect!(node_map[101002], node_map[101003])
connect!(node_map[101004], node_map[101005])
connect!(node_map[101005], node_map[101006])
connect!(node_map[101006], node_map[101007])
connect!(node_map[101006], node_map[101009])
connect!(node_map[101007], node_map[101008])
connect!(node_map[101009], node_map[101010])
connect!(node_map[101011], node_map[101012])
connect!(node_map[101011], node_map[101017])
connect!(node_map[101012], node_map[101013])
connect!(node_map[101012], node_map[101015])
connect!(node_map[101013], node_map[101014])
connect!(node_map[101015], node_map[101016])
connect!(node_map[101017], node_map[101018])
connect!(node_map[101017], node_map[101020])
connect!(node_map[101018], node_map[101019])
connect!(node_map[101020], node_map[101021])
connect!(node_map[101022], node_map[101023])
connect!(node_map[101022], node_map[101025])
connect!(node_map[101023], node_map[101024])
connect!(node_map[101026], node_map[101027])
connect!(node_map[101027], node_map[101028])
connect!(node_map[101027], node_map[101030])
connect!(node_map[101028], node_map[101029])
connect!(node_map[101030], node_map[101031])
connect!(node_map[101032], node_map[101033])
connect!(node_map[101033], node_map[101034])
connect!(node_map[101035], node_map[101036])
connect!(node_map[101036], node_map[101037])
connect!(node_map[101037], node_map[101038])
connect!(node_map[101038], node_map[101039])
connect!(node_map[101040], node_map[101041])
connect!(node_map[101040], node_map[101046])
connect!(node_map[101040], node_map[101057])
connect!(node_map[101040], node_map[101059])
connect!(node_map[101040], node_map[101062])
connect!(node_map[101041], node_map[101042])
connect!(node_map[101041], node_map[101044])
connect!(node_map[101042], node_map[101043])
connect!(node_map[101044], node_map[101045])
connect!(node_map[101046], node_map[101047])
connect!(node_map[101046], node_map[101049])
connect!(node_map[101046], node_map[101051])
connect!(node_map[101046], node_map[101053])
connect!(node_map[101046], node_map[101055])
connect!(node_map[101047], node_map[101048])
connect!(node_map[101049], node_map[101050])
connect!(node_map[101051], node_map[101052])
connect!(node_map[101053], node_map[101054])
connect!(node_map[101055], node_map[101056])
connect!(node_map[101057], node_map[101058])
connect!(node_map[101059], node_map[101060])
connect!(node_map[101060], node_map[101061])
connect!(node_map[101062], node_map[101063])
connect!(node_map[101063], node_map[101064])
connect!(node_map[101064], node_map[101065])
connect!(node_map[101066], node_map[101067])
connect!(node_map[101066], node_map[101070])
connect!(node_map[101067], node_map[101068])
connect!(node_map[101068], node_map[101069])
connect!(node_map[101070], node_map[101071])
connect!(node_map[101071], node_map[101072])
connect!(node_map[101073], node_map[101074])
connect!(node_map[101073], node_map[101077])
connect!(node_map[101074], node_map[101075])
connect!(node_map[101075], node_map[101076])
connect!(node_map[101077], node_map[101078])
connect!(node_map[101078], node_map[101079])
connect!(node_map[101080], node_map[101081])
connect!(node_map[101081], node_map[101082])
connect!(node_map[101081], node_map[101087])
connect!(node_map[101081], node_map[101092])
connect!(node_map[101081], node_map[101097])
connect!(node_map[101082], node_map[101083])
connect!(node_map[101082], node_map[101085])
connect!(node_map[101083], node_map[101084])
connect!(node_map[101085], node_map[101086])
connect!(node_map[101087], node_map[101088])
connect!(node_map[101087], node_map[101090])
connect!(node_map[101088], node_map[101089])
connect!(node_map[101090], node_map[101091])
connect!(node_map[101092], node_map[101093])
connect!(node_map[101092], node_map[101095])
connect!(node_map[101093], node_map[101094])
connect!(node_map[101095], node_map[101096])
connect!(node_map[101097], node_map[101098])
connect!(node_map[101097], node_map[101101])
connect!(node_map[101098], node_map[101099])
connect!(node_map[101099], node_map[101100])
connect!(node_map[101101], node_map[101102])
connect!(node_map[101102], node_map[101103])
connect!(node_map[101104], node_map[101105])
connect!(node_map[101105], node_map[101106])
connect!(node_map[101106], node_map[101107])
connect!(node_map[101106], node_map[101112])
connect!(node_map[101106], node_map[101115])
connect!(node_map[101107], node_map[101108])
connect!(node_map[101107], node_map[101110])
connect!(node_map[101108], node_map[101109])
connect!(node_map[101110], node_map[101111])
connect!(node_map[101112], node_map[101113])
connect!(node_map[101113], node_map[101114])
connect!(node_map[101115], node_map[101116])
connect!(node_map[101117], node_map[101118])
connect!(node_map[101117], node_map[101122])
connect!(node_map[101117], node_map[101135])
connect!(node_map[101117], node_map[101145])
connect!(node_map[101118], node_map[101119])
connect!(node_map[101119], node_map[101120])
connect!(node_map[101120], node_map[101121])
connect!(node_map[101122], node_map[101123])
connect!(node_map[101123], node_map[101124])
connect!(node_map[101124], node_map[101125])
connect!(node_map[101126], node_map[101127])
connect!(node_map[101126], node_map[101131])
connect!(node_map[101126], node_map[101140])
connect!(node_map[101126], node_map[101150])
connect!(node_map[101127], node_map[101128])
connect!(node_map[101128], node_map[101129])
connect!(node_map[101129], node_map[101130])
connect!(node_map[101131], node_map[101132])
connect!(node_map[101132], node_map[101133])
connect!(node_map[101133], node_map[101134])
connect!(node_map[101135], node_map[101136])
connect!(node_map[101135], node_map[101138])
connect!(node_map[101136], node_map[101137])
connect!(node_map[101138], node_map[101139])
connect!(node_map[101140], node_map[101141])
connect!(node_map[101140], node_map[101143])
connect!(node_map[101141], node_map[101142])
connect!(node_map[101143], node_map[101144])
connect!(node_map[101145], node_map[101146])
connect!(node_map[101145], node_map[101148])
connect!(node_map[101146], node_map[101147])
connect!(node_map[101148], node_map[101149])
connect!(node_map[101150], node_map[101151])
connect!(node_map[101150], node_map[101153])
connect!(node_map[101151], node_map[101152])
connect!(node_map[101153], node_map[101154])

storm_v2_g_dump.compile_program!
