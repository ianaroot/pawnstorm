# Standalone seed file for Bishop Dump.

require_relative 'helpers'

user = seed_user!

bishop_dump = user.bots.find_or_initialize_by(name: "Bishop Dump")
bishop_dump.description = "A behavior-preserving refactor target for Bishop using shared graph trunks instead of repeated flat seed paths. Migrated from Bishop v2 by bots:migrate_to_v2_grammar_clone."
bishop_dump.save!

reset_bot_graph!(bishop_dump)

node_map = { 103968 => bishop_dump.root_node }

node_map[103969] = create_organizer!(
  bot: bishop_dump,
  position_x: 120.0,
  position_y: 120.0,
  title: "Terminal",
  notes: ""
)

node_map[103970] = create_organizer!(
  bot: bishop_dump,
  position_x: 760.0,
  position_y: 120.0,
  title: "Opening",
  notes: ""
)

node_map[103971] = create_organizer!(
  bot: bishop_dump,
  position_x: 460.0,
  position_y: 1730.0,
  title: "Tactics",
  notes: ""
)

node_map[103972] = create_organizer!(
  bot: bishop_dump,
  position_x: 1880.0,
  position_y: 980.0,
  title: "King Pressure",
  notes: ""
)

node_map[103973] = create_organizer!(
  bot: bishop_dump,
  position_x: 2850.0,
  position_y: 760.0,
  title: "Endgame",
  notes: ""
)

node_map[103974] = create_organizer!(
  bot: bishop_dump,
  position_x: 3900.0,
  position_y: 1260.0,
  title: "Fallback",
  notes: ""
)

node_map[103975] = create_condition!(
  bot: bishop_dump,
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

node_map[103976] = create_condition!(
  bot: bishop_dump,
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

node_map[103977] = create_action!(
  bot: bishop_dump,
  position_x: 80.0,
  position_y: 580.0,
  action_type: "return",
  value: 100
)

node_map[103978] = create_condition!(
  bot: bishop_dump,
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

node_map[103979] = create_condition!(
  bot: bishop_dump,
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

node_map[103980] = create_action!(
  bot: bishop_dump,
  position_x: 300.0,
  position_y: 580.0,
  action_type: "return",
  value: -100
)

node_map[103981] = create_condition!(
  bot: bishop_dump,
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

node_map[103982] = create_condition!(
  bot: bishop_dump,
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

node_map[103983] = create_condition!(
  bot: bishop_dump,
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

node_map[103984] = create_condition!(
  bot: bishop_dump,
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

node_map[103985] = create_condition!(
  bot: bishop_dump,
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

node_map[103986] = create_condition!(
  bot: bishop_dump,
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

node_map[103987] = create_condition!(
  bot: bishop_dump,
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

node_map[103988] = create_condition!(
  bot: bishop_dump,
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

node_map[103989] = create_condition!(
  bot: bishop_dump,
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

node_map[103990] = create_condition!(
  bot: bishop_dump,
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

node_map[103991] = create_condition!(
  bot: bishop_dump,
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

node_map[103992] = create_condition!(
  bot: bishop_dump,
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

node_map[103993] = create_condition!(
  bot: bishop_dump,
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

node_map[103994] = create_condition!(
  bot: bishop_dump,
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

node_map[103995] = create_condition!(
  bot: bishop_dump,
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

node_map[103996] = create_condition!(
  bot: bishop_dump,
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

node_map[103997] = create_condition!(
  bot: bishop_dump,
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

node_map[103998] = create_condition!(
  bot: bishop_dump,
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

node_map[103999] = create_action!(
  bot: bishop_dump,
  position_x: 660.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[104000] = create_condition!(
  bot: bishop_dump,
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

node_map[104001] = create_action!(
  bot: bishop_dump,
  position_x: 920.0,
  position_y: 2980.0,
  action_type: "add",
  value: 12
)

node_map[104002] = create_condition!(
  bot: bishop_dump,
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

node_map[104003] = create_condition!(
  bot: bishop_dump,
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

node_map[104004] = create_condition!(
  bot: bishop_dump,
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

node_map[104005] = create_condition!(
  bot: bishop_dump,
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

node_map[104006] = create_action!(
  bot: bishop_dump,
  position_x: 1180.0,
  position_y: 2980.0,
  action_type: "add",
  value: 11
)

node_map[104007] = create_condition!(
  bot: bishop_dump,
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

node_map[104008] = create_action!(
  bot: bishop_dump,
  position_x: 1440.0,
  position_y: 2980.0,
  action_type: "add",
  value: 11
)

node_map[104009] = create_condition!(
  bot: bishop_dump,
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

node_map[104010] = create_condition!(
  bot: bishop_dump,
  position_x: 1700.0,
  position_y: 2530.0,
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

node_map[104011] = create_condition!(
  bot: bishop_dump,
  position_x: 1780.0,
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

node_map[104012] = create_action!(
  bot: bishop_dump,
  position_x: 1700.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[104013] = create_condition!(
  bot: bishop_dump,
  position_x: 2300.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104014] = create_action!(
  bot: bishop_dump,
  position_x: 2220.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[104015] = create_condition!(
  bot: bishop_dump,
  position_x: 2220.0,
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

node_map[104016] = create_condition!(
  bot: bishop_dump,
  position_x: 2300.0,
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

node_map[104017] = create_action!(
  bot: bishop_dump,
  position_x: 2220.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[104018] = create_condition!(
  bot: bishop_dump,
  position_x: 2820.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104019] = create_action!(
  bot: bishop_dump,
  position_x: 2740.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[104020] = create_condition!(
  bot: bishop_dump,
  position_x: 360.0,
  position_y: 1890.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[104021] = create_condition!(
  bot: bishop_dump,
  position_x: 420.0,
  position_y: 2040.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104022] = create_action!(
  bot: bishop_dump,
  position_x: 360.0,
  position_y: 2190.0,
  action_type: "return",
  value: 110
)

node_map[104023] = create_action!(
  bot: bishop_dump,
  position_x: 680.0,
  position_y: 2040.0,
  action_type: "return",
  value: 100
)

node_map[104024] = create_condition!(
  bot: bishop_dump,
  position_x: 900.0,
  position_y: 1890.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104025] = create_condition!(
  bot: bishop_dump,
  position_x: 960.0,
  position_y: 2040.0,
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

node_map[104026] = create_condition!(
  bot: bishop_dump,
  position_x: 900.0,
  position_y: 2190.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104027] = create_action!(
  bot: bishop_dump,
  position_x: 960.0,
  position_y: 2340.0,
  action_type: "return",
  value: 55
)

node_map[104028] = create_condition!(
  bot: bishop_dump,
  position_x: 1180.0,
  position_y: 2190.0,
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

node_map[104029] = create_action!(
  bot: bishop_dump,
  position_x: 1240.0,
  position_y: 2340.0,
  action_type: "return",
  value: 55
)

node_map[104030] = create_condition!(
  bot: bishop_dump,
  position_x: 1740.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104031] = create_condition!(
  bot: bishop_dump,
  position_x: 1810.0,
  position_y: 1290.0,
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

node_map[104032] = create_condition!(
  bot: bishop_dump,
  position_x: 1740.0,
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

node_map[104033] = create_action!(
  bot: bishop_dump,
  position_x: 1810.0,
  position_y: 1590.0,
  action_type: "return",
  value: 34
)

node_map[104034] = create_condition!(
  bot: bishop_dump,
  position_x: 1740.0,
  position_y: 1710.0,
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

node_map[104035] = create_condition!(
  bot: bishop_dump,
  position_x: 1810.0,
  position_y: 1860.0,
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

node_map[104036] = create_condition!(
  bot: bishop_dump,
  position_x: 1740.0,
  position_y: 2010.0,
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

node_map[104037] = create_action!(
  bot: bishop_dump,
  position_x: 1810.0,
  position_y: 2160.0,
  action_type: "return",
  value: 30
)

node_map[104038] = create_condition!(
  bot: bishop_dump,
  position_x: 1740.0,
  position_y: 2280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104039] = create_condition!(
  bot: bishop_dump,
  position_x: 1810.0,
  position_y: 2430.0,
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

node_map[104040] = create_action!(
  bot: bishop_dump,
  position_x: 1740.0,
  position_y: 2580.0,
  action_type: "add",
  value: 14
)

node_map[104041] = create_condition!(
  bot: bishop_dump,
  position_x: 1970.0,
  position_y: 1140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104042] = create_condition!(
  bot: bishop_dump,
  position_x: 2040.0,
  position_y: 1290.0,
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

node_map[104043] = create_condition!(
  bot: bishop_dump,
  position_x: 1970.0,
  position_y: 1440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104044] = create_action!(
  bot: bishop_dump,
  position_x: 2040.0,
  position_y: 1590.0,
  action_type: "return",
  value: 34
)

node_map[104045] = create_condition!(
  bot: bishop_dump,
  position_x: 1970.0,
  position_y: 1710.0,
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

node_map[104046] = create_condition!(
  bot: bishop_dump,
  position_x: 2040.0,
  position_y: 1860.0,
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

node_map[104047] = create_condition!(
  bot: bishop_dump,
  position_x: 1970.0,
  position_y: 2010.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104048] = create_action!(
  bot: bishop_dump,
  position_x: 2040.0,
  position_y: 2160.0,
  action_type: "return",
  value: 30
)

node_map[104049] = create_condition!(
  bot: bishop_dump,
  position_x: 1970.0,
  position_y: 2280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104050] = create_condition!(
  bot: bishop_dump,
  position_x: 2040.0,
  position_y: 2430.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104051] = create_action!(
  bot: bishop_dump,
  position_x: 1970.0,
  position_y: 2580.0,
  action_type: "add",
  value: 14
)

node_map[104052] = create_condition!(
  bot: bishop_dump,
  position_x: 2720.0,
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

node_map[104053] = create_condition!(
  bot: bishop_dump,
  position_x: 2790.0,
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

node_map[104054] = create_condition!(
  bot: bishop_dump,
  position_x: 2720.0,
  position_y: 1220.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104055] = create_condition!(
  bot: bishop_dump,
  position_x: 2790.0,
  position_y: 1370.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104056] = create_action!(
  bot: bishop_dump,
  position_x: 2720.0,
  position_y: 1520.0,
  action_type: "return",
  value: 95
)

node_map[104057] = create_condition!(
  bot: bishop_dump,
  position_x: 3050.0,
  position_y: 1370.0,
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

node_map[104058] = create_action!(
  bot: bishop_dump,
  position_x: 2980.0,
  position_y: 1520.0,
  action_type: "return",
  value: 95
)

node_map[104059] = create_condition!(
  bot: bishop_dump,
  position_x: 3240.0,
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

node_map[104060] = create_condition!(
  bot: bishop_dump,
  position_x: 3310.0,
  position_y: 1370.0,
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

node_map[104061] = create_action!(
  bot: bishop_dump,
  position_x: 3240.0,
  position_y: 1520.0,
  action_type: "return",
  value: 24
)

node_map[104062] = create_condition!(
  bot: bishop_dump,
  position_x: 3570.0,
  position_y: 1370.0,
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

node_map[104063] = create_action!(
  bot: bishop_dump,
  position_x: 3500.0,
  position_y: 1520.0,
  action_type: "return",
  value: 24
)

node_map[104064] = create_condition!(
  bot: bishop_dump,
  position_x: 3760.0,
  position_y: 1220.0,
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

node_map[104065] = create_action!(
  bot: bishop_dump,
  position_x: 3830.0,
  position_y: 1370.0,
  action_type: "add",
  value: 12
)

node_map[104066] = create_condition!(
  bot: bishop_dump,
  position_x: 3920.0,
  position_y: 1220.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104067] = create_condition!(
  bot: bishop_dump,
  position_x: 3990.0,
  position_y: 1370.0,
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

node_map[104068] = create_condition!(
  bot: bishop_dump,
  position_x: 3920.0,
  position_y: 1520.0,
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

node_map[104069] = create_action!(
  bot: bishop_dump,
  position_x: 3990.0,
  position_y: 1670.0,
  action_type: "return",
  value: 28
)

node_map[104070] = create_condition!(
  bot: bishop_dump,
  position_x: 4150.0,
  position_y: 1520.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104071] = create_action!(
  bot: bishop_dump,
  position_x: 4220.0,
  position_y: 1670.0,
  action_type: "return",
  value: 28
)

node_map[104072] = create_condition!(
  bot: bishop_dump,
  position_x: 3860.0,
  position_y: 1420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104073] = create_condition!(
  bot: bishop_dump,
  position_x: 3930.0,
  position_y: 1570.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104074] = create_condition!(
  bot: bishop_dump,
  position_x: 3860.0,
  position_y: 1720.0,
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

node_map[104075] = create_condition!(
  bot: bishop_dump,
  position_x: 3930.0,
  position_y: 1870.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104076] = create_condition!(
  bot: bishop_dump,
  position_x: 3860.0,
  position_y: 2020.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"exclude"}
)

node_map[104077] = create_action!(
  bot: bishop_dump,
  position_x: 3930.0,
  position_y: 2170.0,
  action_type: "add",
  value: 7
)

node_map[104078] = create_condition!(
  bot: bishop_dump,
  position_x: 4120.0,
  position_y: 2020.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104079] = create_action!(
  bot: bishop_dump,
  position_x: 4190.0,
  position_y: 2170.0,
  action_type: "add",
  value: 7
)

node_map[104080] = create_condition!(
  bot: bishop_dump,
  position_x: 4380.0,
  position_y: 1420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104081] = create_condition!(
  bot: bishop_dump,
  position_x: 4450.0,
  position_y: 1570.0,
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

node_map[104082] = create_condition!(
  bot: bishop_dump,
  position_x: 4380.0,
  position_y: 1720.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104083] = create_action!(
  bot: bishop_dump,
  position_x: 4450.0,
  position_y: 1870.0,
  action_type: "add",
  value: 6
)

node_map[104084] = create_condition!(
  bot: bishop_dump,
  position_x: 4640.0,
  position_y: 1420.0,
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

node_map[104085] = create_action!(
  bot: bishop_dump,
  position_x: 4710.0,
  position_y: 1570.0,
  action_type: "add",
  value: 6
)

node_map[104086] = create_condition!(
  bot: bishop_dump,
  position_x: 4900.0,
  position_y: 1420.0,
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

node_map[104087] = create_condition!(
  bot: bishop_dump,
  position_x: 4970.0,
  position_y: 1570.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104088] = create_action!(
  bot: bishop_dump,
  position_x: 4900.0,
  position_y: 1720.0,
  action_type: "add",
  value: 5
)

node_map[104089] = create_condition!(
  bot: bishop_dump,
  position_x: 5160.0,
  position_y: 1420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104090] = create_condition!(
  bot: bishop_dump,
  position_x: 5230.0,
  position_y: 1570.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[104091] = create_condition!(
  bot: bishop_dump,
  position_x: 5160.0,
  position_y: 1720.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104092] = create_condition!(
  bot: bishop_dump,
  position_x: 5230.0,
  position_y: 1870.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104093] = create_action!(
  bot: bishop_dump,
  position_x: 5160.0,
  position_y: 2020.0,
  action_type: "subtract",
  value: 8
)

node_map[104094] = create_condition!(
  bot: bishop_dump,
  position_x: 5420.0,
  position_y: 1420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104095] = create_condition!(
  bot: bishop_dump,
  position_x: 5490.0,
  position_y: 1570.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[104096] = create_condition!(
  bot: bishop_dump,
  position_x: 5420.0,
  position_y: 1720.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104097] = create_condition!(
  bot: bishop_dump,
  position_x: 5490.0,
  position_y: 1870.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[104098] = create_action!(
  bot: bishop_dump,
  position_x: 5420.0,
  position_y: 2020.0,
  action_type: "subtract",
  value: 8
)

connect!(node_map[103968], node_map[103969])
connect!(node_map[103968], node_map[103970])
connect!(node_map[103968], node_map[103971])
connect!(node_map[103968], node_map[103972])
connect!(node_map[103968], node_map[103973])
connect!(node_map[103968], node_map[103974])
connect!(node_map[103969], node_map[103975])
connect!(node_map[103969], node_map[103978])
connect!(node_map[103970], node_map[103981])
connect!(node_map[103971], node_map[104020])
connect!(node_map[103971], node_map[104024])
connect!(node_map[103972], node_map[104030])
connect!(node_map[103972], node_map[104034])
connect!(node_map[103972], node_map[104038])
connect!(node_map[103972], node_map[104041])
connect!(node_map[103972], node_map[104045])
connect!(node_map[103972], node_map[104049])
connect!(node_map[103973], node_map[104052])
connect!(node_map[103974], node_map[104072])
connect!(node_map[103974], node_map[104080])
connect!(node_map[103974], node_map[104084])
connect!(node_map[103974], node_map[104086])
connect!(node_map[103974], node_map[104089])
connect!(node_map[103974], node_map[104094])
connect!(node_map[103975], node_map[103976])
connect!(node_map[103976], node_map[103977])
connect!(node_map[103978], node_map[103979])
connect!(node_map[103979], node_map[103980])
connect!(node_map[103981], node_map[103982])
connect!(node_map[103982], node_map[103983])
connect!(node_map[103983], node_map[103984])
connect!(node_map[103984], node_map[103985])
connect!(node_map[103985], node_map[103986])
connect!(node_map[103986], node_map[103987])
connect!(node_map[103987], node_map[103988])
connect!(node_map[103988], node_map[103989])
connect!(node_map[103989], node_map[103990])
connect!(node_map[103990], node_map[103991])
connect!(node_map[103991], node_map[103992])
connect!(node_map[103992], node_map[103993])
connect!(node_map[103993], node_map[103994])
connect!(node_map[103994], node_map[103995])
connect!(node_map[103994], node_map[104002])
connect!(node_map[103994], node_map[104009])
connect!(node_map[103995], node_map[103996])
connect!(node_map[103996], node_map[103997])
connect!(node_map[103997], node_map[103998])
connect!(node_map[103997], node_map[104000])
connect!(node_map[103998], node_map[103999])
connect!(node_map[104000], node_map[104001])
connect!(node_map[104002], node_map[104003])
connect!(node_map[104003], node_map[104004])
connect!(node_map[104004], node_map[104005])
connect!(node_map[104004], node_map[104007])
connect!(node_map[104005], node_map[104006])
connect!(node_map[104007], node_map[104008])
connect!(node_map[104009], node_map[104010])
connect!(node_map[104009], node_map[104015])
connect!(node_map[104010], node_map[104011])
connect!(node_map[104010], node_map[104013])
connect!(node_map[104011], node_map[104012])
connect!(node_map[104013], node_map[104014])
connect!(node_map[104015], node_map[104016])
connect!(node_map[104015], node_map[104018])
connect!(node_map[104016], node_map[104017])
connect!(node_map[104018], node_map[104019])
connect!(node_map[104020], node_map[104021])
connect!(node_map[104020], node_map[104023])
connect!(node_map[104021], node_map[104022])
connect!(node_map[104024], node_map[104025])
connect!(node_map[104025], node_map[104026])
connect!(node_map[104025], node_map[104028])
connect!(node_map[104026], node_map[104027])
connect!(node_map[104028], node_map[104029])
connect!(node_map[104030], node_map[104031])
connect!(node_map[104031], node_map[104032])
connect!(node_map[104032], node_map[104033])
connect!(node_map[104034], node_map[104035])
connect!(node_map[104035], node_map[104036])
connect!(node_map[104036], node_map[104037])
connect!(node_map[104038], node_map[104039])
connect!(node_map[104039], node_map[104040])
connect!(node_map[104041], node_map[104042])
connect!(node_map[104042], node_map[104043])
connect!(node_map[104043], node_map[104044])
connect!(node_map[104045], node_map[104046])
connect!(node_map[104046], node_map[104047])
connect!(node_map[104047], node_map[104048])
connect!(node_map[104049], node_map[104050])
connect!(node_map[104050], node_map[104051])
connect!(node_map[104052], node_map[104053])
connect!(node_map[104053], node_map[104054])
connect!(node_map[104053], node_map[104059])
connect!(node_map[104053], node_map[104064])
connect!(node_map[104053], node_map[104066])
connect!(node_map[104054], node_map[104055])
connect!(node_map[104054], node_map[104057])
connect!(node_map[104055], node_map[104056])
connect!(node_map[104057], node_map[104058])
connect!(node_map[104059], node_map[104060])
connect!(node_map[104059], node_map[104062])
connect!(node_map[104060], node_map[104061])
connect!(node_map[104062], node_map[104063])
connect!(node_map[104064], node_map[104065])
connect!(node_map[104066], node_map[104067])
connect!(node_map[104067], node_map[104068])
connect!(node_map[104067], node_map[104070])
connect!(node_map[104068], node_map[104069])
connect!(node_map[104070], node_map[104071])
connect!(node_map[104072], node_map[104073])
connect!(node_map[104073], node_map[104074])
connect!(node_map[104074], node_map[104075])
connect!(node_map[104075], node_map[104076])
connect!(node_map[104075], node_map[104078])
connect!(node_map[104076], node_map[104077])
connect!(node_map[104078], node_map[104079])
connect!(node_map[104080], node_map[104081])
connect!(node_map[104081], node_map[104082])
connect!(node_map[104082], node_map[104083])
connect!(node_map[104084], node_map[104085])
connect!(node_map[104086], node_map[104087])
connect!(node_map[104087], node_map[104088])
connect!(node_map[104089], node_map[104090])
connect!(node_map[104090], node_map[104091])
connect!(node_map[104091], node_map[104092])
connect!(node_map[104092], node_map[104093])
connect!(node_map[104094], node_map[104095])
connect!(node_map[104095], node_map[104096])
connect!(node_map[104096], node_map[104097])
connect!(node_map[104097], node_map[104098])

bishop_dump.compile_program!
