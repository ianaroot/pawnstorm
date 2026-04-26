# Standalone seed file for Gambit Dump.

require_relative 'helpers'

user = seed_user!

gambit_dump = user.bots.find_or_initialize_by(name: "Gambit Dump")
gambit_dump.description = "A behavior-preserving refactor target for Gambit using shared graph trunks instead of repeated flat seed paths. Migrated from Gambit v2 by bots:migrate_to_v2_grammar_clone."
gambit_dump.save!

reset_bot_graph!(gambit_dump)

node_map = { 104099 => gambit_dump.root_node }

node_map[104100] = create_organizer!(
  bot: gambit_dump,
  position_x: 120.0,
  position_y: 120.0,
  title: "Terminal",
  notes: ""
)

node_map[104101] = create_organizer!(
  bot: gambit_dump,
  position_x: 760.0,
  position_y: 120.0,
  title: "Opening",
  notes: ""
)

node_map[104102] = create_organizer!(
  bot: gambit_dump,
  position_x: 520.0,
  position_y: 1820.0,
  title: "Tactics",
  notes: ""
)

node_map[104103] = create_organizer!(
  bot: gambit_dump,
  position_x: 2040.0,
  position_y: 1180.0,
  title: "King Pressure",
  notes: ""
)

node_map[104104] = create_organizer!(
  bot: gambit_dump,
  position_x: 3020.0,
  position_y: 880.0,
  title: "Endgame",
  notes: ""
)

node_map[104105] = create_organizer!(
  bot: gambit_dump,
  position_x: 4040.0,
  position_y: 1360.0,
  title: "Fallback",
  notes: ""
)

node_map[104106] = create_condition!(
  bot: gambit_dump,
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

node_map[104107] = create_condition!(
  bot: gambit_dump,
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

node_map[104108] = create_score!(
  bot: gambit_dump,
  position_x: 80.0,
  position_y: 580.0,
  action_type: "return",
  value: 100
)

node_map[104109] = create_condition!(
  bot: gambit_dump,
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

node_map[104110] = create_condition!(
  bot: gambit_dump,
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

node_map[104111] = create_score!(
  bot: gambit_dump,
  position_x: 300.0,
  position_y: 580.0,
  action_type: "return",
  value: -100
)

node_map[104112] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104113] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104114] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104115] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104116] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104117] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104118] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104119] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104120] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104121] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104122] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104123] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104124] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104125] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104126] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
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

node_map[104127] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104128] = create_condition!(
  bot: gambit_dump,
  position_x: 660.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104129] = create_condition!(
  bot: gambit_dump,
  position_x: 740.0,
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

node_map[104130] = create_score!(
  bot: gambit_dump,
  position_x: 660.0,
  position_y: 2980.0,
  action_type: "add",
  value: 13
)

node_map[104131] = create_condition!(
  bot: gambit_dump,
  position_x: 1000.0,
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

node_map[104132] = create_score!(
  bot: gambit_dump,
  position_x: 920.0,
  position_y: 2980.0,
  action_type: "add",
  value: 13
)

node_map[104133] = create_condition!(
  bot: gambit_dump,
  position_x: 1180.0,
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

node_map[104134] = create_condition!(
  bot: gambit_dump,
  position_x: 1260.0,
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

node_map[104135] = create_condition!(
  bot: gambit_dump,
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

node_map[104136] = create_condition!(
  bot: gambit_dump,
  position_x: 1260.0,
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

node_map[104137] = create_score!(
  bot: gambit_dump,
  position_x: 1180.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[104138] = create_condition!(
  bot: gambit_dump,
  position_x: 1520.0,
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

node_map[104139] = create_score!(
  bot: gambit_dump,
  position_x: 1440.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[104140] = create_condition!(
  bot: gambit_dump,
  position_x: 1700.0,
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

node_map[104141] = create_condition!(
  bot: gambit_dump,
  position_x: 1780.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104142] = create_condition!(
  bot: gambit_dump,
  position_x: 1700.0,
  position_y: 2680.0,
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
   "subjectComparisonValue"=>0}
)

node_map[104143] = create_condition!(
  bot: gambit_dump,
  position_x: 1700.0,
  position_y: 2830.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104144] = create_condition!(
  bot: gambit_dump,
  position_x: 1700.0,
  position_y: 2980.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104145] = create_condition!(
  bot: gambit_dump,
  position_x: 1700.0,
  position_y: 3130.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[104146] = create_score!(
  bot: gambit_dump,
  position_x: 1780.0,
  position_y: 3280.0,
  action_type: "add",
  value: 10
)

node_map[104147] = create_condition!(
  bot: gambit_dump,
  position_x: 1940.0,
  position_y: 3130.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[104148] = create_score!(
  bot: gambit_dump,
  position_x: 2020.0,
  position_y: 3280.0,
  action_type: "add",
  value: 10
)

node_map[104149] = create_condition!(
  bot: gambit_dump,
  position_x: 2180.0,
  position_y: 2980.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104150] = create_condition!(
  bot: gambit_dump,
  position_x: 2180.0,
  position_y: 3130.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[104151] = create_score!(
  bot: gambit_dump,
  position_x: 2260.0,
  position_y: 3280.0,
  action_type: "add",
  value: 10
)

node_map[104152] = create_condition!(
  bot: gambit_dump,
  position_x: 2420.0,
  position_y: 3130.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[104153] = create_score!(
  bot: gambit_dump,
  position_x: 2500.0,
  position_y: 3280.0,
  action_type: "add",
  value: 10
)

node_map[104154] = create_condition!(
  bot: gambit_dump,
  position_x: 2740.0,
  position_y: 2830.0,
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

node_map[104155] = create_condition!(
  bot: gambit_dump,
  position_x: 2820.0,
  position_y: 2980.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[104156] = create_score!(
  bot: gambit_dump,
  position_x: 2740.0,
  position_y: 3130.0,
  action_type: "add",
  value: 9
)

node_map[104157] = create_condition!(
  bot: gambit_dump,
  position_x: 3080.0,
  position_y: 2980.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[104158] = create_score!(
  bot: gambit_dump,
  position_x: 3000.0,
  position_y: 3130.0,
  action_type: "add",
  value: 9
)

node_map[104159] = create_condition!(
  bot: gambit_dump,
  position_x: 420.0,
  position_y: 1980.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[104160] = create_condition!(
  bot: gambit_dump,
  position_x: 480.0,
  position_y: 2130.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104161] = create_score!(
  bot: gambit_dump,
  position_x: 420.0,
  position_y: 2280.0,
  action_type: "return",
  value: 110
)

node_map[104162] = create_score!(
  bot: gambit_dump,
  position_x: 740.0,
  position_y: 2130.0,
  action_type: "return",
  value: 100
)

node_map[104163] = create_condition!(
  bot: gambit_dump,
  position_x: 940.0,
  position_y: 1980.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104164] = create_condition!(
  bot: gambit_dump,
  position_x: 1000.0,
  position_y: 2130.0,
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

node_map[104165] = create_condition!(
  bot: gambit_dump,
  position_x: 940.0,
  position_y: 2280.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104166] = create_score!(
  bot: gambit_dump,
  position_x: 1000.0,
  position_y: 2430.0,
  action_type: "return",
  value: 60
)

node_map[104167] = create_condition!(
  bot: gambit_dump,
  position_x: 1180.0,
  position_y: 2280.0,
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

node_map[104168] = create_score!(
  bot: gambit_dump,
  position_x: 1240.0,
  position_y: 2430.0,
  action_type: "return",
  value: 60
)

node_map[104169] = create_condition!(
  bot: gambit_dump,
  position_x: 1440.0,
  position_y: 1980.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104170] = create_condition!(
  bot: gambit_dump,
  position_x: 1500.0,
  position_y: 2130.0,
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

node_map[104171] = create_condition!(
  bot: gambit_dump,
  position_x: 1440.0,
  position_y: 2280.0,
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

node_map[104172] = create_condition!(
  bot: gambit_dump,
  position_x: 1500.0,
  position_y: 2430.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104173] = create_score!(
  bot: gambit_dump,
  position_x: 1440.0,
  position_y: 2580.0,
  action_type: "return",
  value: 52
)

node_map[104174] = create_condition!(
  bot: gambit_dump,
  position_x: 1700.0,
  position_y: 1980.0,
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

node_map[104175] = create_condition!(
  bot: gambit_dump,
  position_x: 1760.0,
  position_y: 2130.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104176] = create_condition!(
  bot: gambit_dump,
  position_x: 1700.0,
  position_y: 2280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104177] = create_condition!(
  bot: gambit_dump,
  position_x: 1760.0,
  position_y: 2430.0,
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

node_map[104178] = create_score!(
  bot: gambit_dump,
  position_x: 1700.0,
  position_y: 2580.0,
  action_type: "return",
  value: 34
)

node_map[104179] = create_condition!(
  bot: gambit_dump,
  position_x: 2020.0,
  position_y: 2430.0,
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

node_map[104180] = create_score!(
  bot: gambit_dump,
  position_x: 1960.0,
  position_y: 2580.0,
  action_type: "return",
  value: 34
)

node_map[104181] = create_condition!(
  bot: gambit_dump,
  position_x: 2220.0,
  position_y: 1980.0,
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

node_map[104182] = create_condition!(
  bot: gambit_dump,
  position_x: 2280.0,
  position_y: 2130.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104183] = create_condition!(
  bot: gambit_dump,
  position_x: 2220.0,
  position_y: 2280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104184] = create_condition!(
  bot: gambit_dump,
  position_x: 2280.0,
  position_y: 2430.0,
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

node_map[104185] = create_score!(
  bot: gambit_dump,
  position_x: 2220.0,
  position_y: 2580.0,
  action_type: "return",
  value: 28
)

node_map[104186] = create_condition!(
  bot: gambit_dump,
  position_x: 2540.0,
  position_y: 2430.0,
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

node_map[104187] = create_score!(
  bot: gambit_dump,
  position_x: 2480.0,
  position_y: 2580.0,
  action_type: "return",
  value: 28
)

node_map[104188] = create_condition!(
  bot: gambit_dump,
  position_x: 1920.0,
  position_y: 1340.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104189] = create_condition!(
  bot: gambit_dump,
  position_x: 1990.0,
  position_y: 1490.0,
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

node_map[104190] = create_condition!(
  bot: gambit_dump,
  position_x: 1920.0,
  position_y: 1640.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104191] = create_score!(
  bot: gambit_dump,
  position_x: 1990.0,
  position_y: 1790.0,
  action_type: "return",
  value: 30
)

node_map[104192] = create_condition!(
  bot: gambit_dump,
  position_x: 1920.0,
  position_y: 1910.0,
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

node_map[104193] = create_condition!(
  bot: gambit_dump,
  position_x: 1990.0,
  position_y: 2060.0,
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

node_map[104194] = create_condition!(
  bot: gambit_dump,
  position_x: 1920.0,
  position_y: 2210.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104195] = create_score!(
  bot: gambit_dump,
  position_x: 1990.0,
  position_y: 2360.0,
  action_type: "return",
  value: 26
)

node_map[104196] = create_condition!(
  bot: gambit_dump,
  position_x: 2180.0,
  position_y: 1340.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104197] = create_condition!(
  bot: gambit_dump,
  position_x: 2250.0,
  position_y: 1490.0,
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

node_map[104198] = create_condition!(
  bot: gambit_dump,
  position_x: 2180.0,
  position_y: 1640.0,
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

node_map[104199] = create_score!(
  bot: gambit_dump,
  position_x: 2250.0,
  position_y: 1790.0,
  action_type: "return",
  value: 30
)

node_map[104200] = create_condition!(
  bot: gambit_dump,
  position_x: 2180.0,
  position_y: 1910.0,
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

node_map[104201] = create_condition!(
  bot: gambit_dump,
  position_x: 2250.0,
  position_y: 2060.0,
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

node_map[104202] = create_condition!(
  bot: gambit_dump,
  position_x: 2180.0,
  position_y: 2210.0,
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

node_map[104203] = create_score!(
  bot: gambit_dump,
  position_x: 2250.0,
  position_y: 2360.0,
  action_type: "return",
  value: 26
)

node_map[104204] = create_condition!(
  bot: gambit_dump,
  position_x: 2900.0,
  position_y: 1040.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[104205] = create_condition!(
  bot: gambit_dump,
  position_x: 2970.0,
  position_y: 1190.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[104206] = create_condition!(
  bot: gambit_dump,
  position_x: 2900.0,
  position_y: 1340.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104207] = create_condition!(
  bot: gambit_dump,
  position_x: 2970.0,
  position_y: 1490.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104208] = create_score!(
  bot: gambit_dump,
  position_x: 2900.0,
  position_y: 1640.0,
  action_type: "return",
  value: 90
)

node_map[104209] = create_condition!(
  bot: gambit_dump,
  position_x: 3230.0,
  position_y: 1490.0,
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

node_map[104210] = create_score!(
  bot: gambit_dump,
  position_x: 3160.0,
  position_y: 1640.0,
  action_type: "return",
  value: 90
)

node_map[104211] = create_condition!(
  bot: gambit_dump,
  position_x: 3420.0,
  position_y: 1340.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104212] = create_condition!(
  bot: gambit_dump,
  position_x: 3490.0,
  position_y: 1490.0,
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

node_map[104213] = create_score!(
  bot: gambit_dump,
  position_x: 3420.0,
  position_y: 1640.0,
  action_type: "return",
  value: 22
)

node_map[104214] = create_condition!(
  bot: gambit_dump,
  position_x: 3750.0,
  position_y: 1490.0,
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

node_map[104215] = create_score!(
  bot: gambit_dump,
  position_x: 3680.0,
  position_y: 1640.0,
  action_type: "return",
  value: 22
)

node_map[104216] = create_condition!(
  bot: gambit_dump,
  position_x: 3940.0,
  position_y: 1340.0,
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

node_map[104217] = create_score!(
  bot: gambit_dump,
  position_x: 4010.0,
  position_y: 1490.0,
  action_type: "add",
  value: 12
)

node_map[104218] = create_condition!(
  bot: gambit_dump,
  position_x: 3940.0,
  position_y: 1520.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104219] = create_condition!(
  bot: gambit_dump,
  position_x: 4010.0,
  position_y: 1670.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104220] = create_condition!(
  bot: gambit_dump,
  position_x: 4220.0,
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
   "subjectComparisonValue"=>1}
)

node_map[104221] = create_condition!(
  bot: gambit_dump,
  position_x: 4290.0,
  position_y: 1970.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104222] = create_condition!(
  bot: gambit_dump,
  position_x: 3940.0,
  position_y: 2120.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"exclude"}
)

node_map[104223] = create_score!(
  bot: gambit_dump,
  position_x: 4010.0,
  position_y: 2270.0,
  action_type: "add",
  value: 8
)

node_map[104224] = create_condition!(
  bot: gambit_dump,
  position_x: 4220.0,
  position_y: 2120.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104225] = create_score!(
  bot: gambit_dump,
  position_x: 4290.0,
  position_y: 2270.0,
  action_type: "add",
  value: 8
)

node_map[104226] = create_condition!(
  bot: gambit_dump,
  position_x: 4500.0,
  position_y: 1820.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104227] = create_condition!(
  bot: gambit_dump,
  position_x: 4570.0,
  position_y: 1970.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104228] = create_condition!(
  bot: gambit_dump,
  position_x: 4500.0,
  position_y: 2120.0,
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

node_map[104229] = create_score!(
  bot: gambit_dump,
  position_x: 4570.0,
  position_y: 2270.0,
  action_type: "add",
  value: 7
)

node_map[104230] = create_condition!(
  bot: gambit_dump,
  position_x: 4780.0,
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

node_map[104231] = create_score!(
  bot: gambit_dump,
  position_x: 4850.0,
  position_y: 1970.0,
  action_type: "add",
  value: 7
)

node_map[104232] = create_condition!(
  bot: gambit_dump,
  position_x: 5040.0,
  position_y: 1820.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104233] = create_condition!(
  bot: gambit_dump,
  position_x: 5110.0,
  position_y: 1970.0,
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

node_map[104234] = create_score!(
  bot: gambit_dump,
  position_x: 5040.0,
  position_y: 2120.0,
  action_type: "add",
  value: 6
)

node_map[104235] = create_condition!(
  bot: gambit_dump,
  position_x: 5300.0,
  position_y: 1820.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104236] = create_condition!(
  bot: gambit_dump,
  position_x: 5300.0,
  position_y: 1970.0,
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

node_map[104237] = create_score!(
  bot: gambit_dump,
  position_x: 5370.0,
  position_y: 2120.0,
  action_type: "add",
  value: 6
)

node_map[104238] = create_condition!(
  bot: gambit_dump,
  position_x: 5560.0,
  position_y: 1970.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104239] = create_score!(
  bot: gambit_dump,
  position_x: 5630.0,
  position_y: 2120.0,
  action_type: "add",
  value: 6
)

node_map[104240] = create_condition!(
  bot: gambit_dump,
  position_x: 5820.0,
  position_y: 1820.0,
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

node_map[104241] = create_condition!(
  bot: gambit_dump,
  position_x: 5820.0,
  position_y: 1970.0,
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

node_map[104242] = create_score!(
  bot: gambit_dump,
  position_x: 5890.0,
  position_y: 2120.0,
  action_type: "add",
  value: 6
)

node_map[104243] = create_condition!(
  bot: gambit_dump,
  position_x: 6080.0,
  position_y: 1970.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104244] = create_score!(
  bot: gambit_dump,
  position_x: 6150.0,
  position_y: 2120.0,
  action_type: "add",
  value: 6
)

node_map[104245] = create_condition!(
  bot: gambit_dump,
  position_x: 6340.0,
  position_y: 1520.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104246] = create_condition!(
  bot: gambit_dump,
  position_x: 6340.0,
  position_y: 1670.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[104247] = create_condition!(
  bot: gambit_dump,
  position_x: 6410.0,
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

node_map[104248] = create_score!(
  bot: gambit_dump,
  position_x: 6340.0,
  position_y: 1970.0,
  action_type: "add",
  value: 6
)

node_map[104249] = create_condition!(
  bot: gambit_dump,
  position_x: 6930.0,
  position_y: 1820.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104250] = create_score!(
  bot: gambit_dump,
  position_x: 6860.0,
  position_y: 1970.0,
  action_type: "add",
  value: 6
)

node_map[104251] = create_condition!(
  bot: gambit_dump,
  position_x: 6860.0,
  position_y: 1670.0,
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

node_map[104252] = create_condition!(
  bot: gambit_dump,
  position_x: 6930.0,
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

node_map[104253] = create_score!(
  bot: gambit_dump,
  position_x: 6860.0,
  position_y: 1970.0,
  action_type: "add",
  value: 6
)

node_map[104254] = create_condition!(
  bot: gambit_dump,
  position_x: 7450.0,
  position_y: 1820.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104255] = create_score!(
  bot: gambit_dump,
  position_x: 7380.0,
  position_y: 1970.0,
  action_type: "add",
  value: 6
)

node_map[104256] = create_condition!(
  bot: gambit_dump,
  position_x: 7380.0,
  position_y: 1520.0,
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

node_map[104257] = create_condition!(
  bot: gambit_dump,
  position_x: 7450.0,
  position_y: 1670.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104258] = create_score!(
  bot: gambit_dump,
  position_x: 7380.0,
  position_y: 1820.0,
  action_type: "add",
  value: 5
)

node_map[104259] = create_condition!(
  bot: gambit_dump,
  position_x: 7640.0,
  position_y: 1520.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104260] = create_condition!(
  bot: gambit_dump,
  position_x: 7710.0,
  position_y: 1670.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[104261] = create_condition!(
  bot: gambit_dump,
  position_x: 7640.0,
  position_y: 1820.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104262] = create_condition!(
  bot: gambit_dump,
  position_x: 7710.0,
  position_y: 1970.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104263] = create_score!(
  bot: gambit_dump,
  position_x: 7640.0,
  position_y: 2120.0,
  action_type: "subtract",
  value: 10
)

node_map[104264] = create_condition!(
  bot: gambit_dump,
  position_x: 7900.0,
  position_y: 1520.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104265] = create_condition!(
  bot: gambit_dump,
  position_x: 7970.0,
  position_y: 1670.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[104266] = create_condition!(
  bot: gambit_dump,
  position_x: 7900.0,
  position_y: 1820.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104267] = create_condition!(
  bot: gambit_dump,
  position_x: 7970.0,
  position_y: 1970.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104268] = create_score!(
  bot: gambit_dump,
  position_x: 7900.0,
  position_y: 2120.0,
  action_type: "subtract",
  value: 10
)

connect!(node_map[104099], node_map[104100])
connect!(node_map[104099], node_map[104101])
connect!(node_map[104099], node_map[104102])
connect!(node_map[104099], node_map[104103])
connect!(node_map[104099], node_map[104104])
connect!(node_map[104099], node_map[104105])
connect!(node_map[104100], node_map[104106])
connect!(node_map[104100], node_map[104109])
connect!(node_map[104101], node_map[104112])
connect!(node_map[104102], node_map[104159])
connect!(node_map[104102], node_map[104163])
connect!(node_map[104102], node_map[104169])
connect!(node_map[104102], node_map[104174])
connect!(node_map[104102], node_map[104181])
connect!(node_map[104103], node_map[104188])
connect!(node_map[104103], node_map[104192])
connect!(node_map[104103], node_map[104196])
connect!(node_map[104103], node_map[104200])
connect!(node_map[104104], node_map[104204])
connect!(node_map[104105], node_map[104218])
connect!(node_map[104105], node_map[104245])
connect!(node_map[104105], node_map[104256])
connect!(node_map[104105], node_map[104259])
connect!(node_map[104105], node_map[104264])
connect!(node_map[104106], node_map[104107])
connect!(node_map[104107], node_map[104108])
connect!(node_map[104109], node_map[104110])
connect!(node_map[104110], node_map[104111])
connect!(node_map[104112], node_map[104113])
connect!(node_map[104113], node_map[104114])
connect!(node_map[104114], node_map[104115])
connect!(node_map[104115], node_map[104116])
connect!(node_map[104116], node_map[104117])
connect!(node_map[104117], node_map[104118])
connect!(node_map[104118], node_map[104119])
connect!(node_map[104119], node_map[104120])
connect!(node_map[104120], node_map[104121])
connect!(node_map[104121], node_map[104122])
connect!(node_map[104122], node_map[104123])
connect!(node_map[104123], node_map[104124])
connect!(node_map[104124], node_map[104125])
connect!(node_map[104125], node_map[104126])
connect!(node_map[104125], node_map[104133])
connect!(node_map[104125], node_map[104140])
connect!(node_map[104126], node_map[104127])
connect!(node_map[104127], node_map[104128])
connect!(node_map[104128], node_map[104129])
connect!(node_map[104128], node_map[104131])
connect!(node_map[104129], node_map[104130])
connect!(node_map[104131], node_map[104132])
connect!(node_map[104133], node_map[104134])
connect!(node_map[104134], node_map[104135])
connect!(node_map[104135], node_map[104136])
connect!(node_map[104135], node_map[104138])
connect!(node_map[104136], node_map[104137])
connect!(node_map[104138], node_map[104139])
connect!(node_map[104140], node_map[104141])
connect!(node_map[104141], node_map[104142])
connect!(node_map[104142], node_map[104143])
connect!(node_map[104142], node_map[104154])
connect!(node_map[104143], node_map[104144])
connect!(node_map[104143], node_map[104149])
connect!(node_map[104144], node_map[104145])
connect!(node_map[104144], node_map[104147])
connect!(node_map[104145], node_map[104146])
connect!(node_map[104147], node_map[104148])
connect!(node_map[104149], node_map[104150])
connect!(node_map[104149], node_map[104152])
connect!(node_map[104150], node_map[104151])
connect!(node_map[104152], node_map[104153])
connect!(node_map[104154], node_map[104155])
connect!(node_map[104154], node_map[104157])
connect!(node_map[104155], node_map[104156])
connect!(node_map[104157], node_map[104158])
connect!(node_map[104159], node_map[104160])
connect!(node_map[104159], node_map[104162])
connect!(node_map[104160], node_map[104161])
connect!(node_map[104163], node_map[104164])
connect!(node_map[104164], node_map[104165])
connect!(node_map[104164], node_map[104167])
connect!(node_map[104165], node_map[104166])
connect!(node_map[104167], node_map[104168])
connect!(node_map[104169], node_map[104170])
connect!(node_map[104170], node_map[104171])
connect!(node_map[104171], node_map[104172])
connect!(node_map[104172], node_map[104173])
connect!(node_map[104174], node_map[104175])
connect!(node_map[104175], node_map[104176])
connect!(node_map[104176], node_map[104177])
connect!(node_map[104176], node_map[104179])
connect!(node_map[104177], node_map[104178])
connect!(node_map[104179], node_map[104180])
connect!(node_map[104181], node_map[104182])
connect!(node_map[104182], node_map[104183])
connect!(node_map[104183], node_map[104184])
connect!(node_map[104183], node_map[104186])
connect!(node_map[104184], node_map[104185])
connect!(node_map[104186], node_map[104187])
connect!(node_map[104188], node_map[104189])
connect!(node_map[104189], node_map[104190])
connect!(node_map[104190], node_map[104191])
connect!(node_map[104192], node_map[104193])
connect!(node_map[104193], node_map[104194])
connect!(node_map[104194], node_map[104195])
connect!(node_map[104196], node_map[104197])
connect!(node_map[104197], node_map[104198])
connect!(node_map[104198], node_map[104199])
connect!(node_map[104200], node_map[104201])
connect!(node_map[104201], node_map[104202])
connect!(node_map[104202], node_map[104203])
connect!(node_map[104204], node_map[104205])
connect!(node_map[104205], node_map[104206])
connect!(node_map[104205], node_map[104211])
connect!(node_map[104205], node_map[104216])
connect!(node_map[104206], node_map[104207])
connect!(node_map[104206], node_map[104209])
connect!(node_map[104207], node_map[104208])
connect!(node_map[104209], node_map[104210])
connect!(node_map[104211], node_map[104212])
connect!(node_map[104211], node_map[104214])
connect!(node_map[104212], node_map[104213])
connect!(node_map[104214], node_map[104215])
connect!(node_map[104216], node_map[104217])
connect!(node_map[104218], node_map[104219])
connect!(node_map[104219], node_map[104220])
connect!(node_map[104219], node_map[104226])
connect!(node_map[104219], node_map[104230])
connect!(node_map[104219], node_map[104232])
connect!(node_map[104219], node_map[104235])
connect!(node_map[104219], node_map[104240])
connect!(node_map[104220], node_map[104221])
connect!(node_map[104221], node_map[104222])
connect!(node_map[104221], node_map[104224])
connect!(node_map[104222], node_map[104223])
connect!(node_map[104224], node_map[104225])
connect!(node_map[104226], node_map[104227])
connect!(node_map[104227], node_map[104228])
connect!(node_map[104228], node_map[104229])
connect!(node_map[104230], node_map[104231])
connect!(node_map[104232], node_map[104233])
connect!(node_map[104233], node_map[104234])
connect!(node_map[104235], node_map[104236])
connect!(node_map[104235], node_map[104238])
connect!(node_map[104236], node_map[104237])
connect!(node_map[104238], node_map[104239])
connect!(node_map[104240], node_map[104241])
connect!(node_map[104240], node_map[104243])
connect!(node_map[104241], node_map[104242])
connect!(node_map[104243], node_map[104244])
connect!(node_map[104245], node_map[104246])
connect!(node_map[104245], node_map[104251])
connect!(node_map[104246], node_map[104247])
connect!(node_map[104246], node_map[104249])
connect!(node_map[104247], node_map[104248])
connect!(node_map[104249], node_map[104250])
connect!(node_map[104251], node_map[104252])
connect!(node_map[104251], node_map[104254])
connect!(node_map[104252], node_map[104253])
connect!(node_map[104254], node_map[104255])
connect!(node_map[104256], node_map[104257])
connect!(node_map[104257], node_map[104258])
connect!(node_map[104259], node_map[104260])
connect!(node_map[104260], node_map[104261])
connect!(node_map[104261], node_map[104262])
connect!(node_map[104262], node_map[104263])
connect!(node_map[104264], node_map[104265])
connect!(node_map[104265], node_map[104266])
connect!(node_map[104266], node_map[104267])
connect!(node_map[104267], node_map[104268])

gambit_dump.compile_program!
