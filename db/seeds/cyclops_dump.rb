# Standalone seed file for Cyclops Dump.

require_relative 'helpers'

user = seed_user!

cyclops_dump = user.bots.find_or_initialize_by(name: "Cyclops Dump")
cyclops_dump.description = "A behavior-preserving refactor target for Cyclops using shared graph trunks instead of repeated flat seed paths. Migrated from Cyclops v2 by bots:migrate_to_v2_grammar_clone."
cyclops_dump.save!

reset_bot_graph!(cyclops_dump)

node_map = { 102403 => cyclops_dump.root_node }

node_map[102404] = create_organizer!(
  bot: cyclops_dump,
  position_x: -120.0,
  position_y: -520.0,
  title: "Terminal",
  notes: ""
)

node_map[102405] = create_organizer!(
  bot: cyclops_dump,
  position_x: -1280.0,
  position_y: 40.0,
  title: "Tactics",
  notes: ""
)

node_map[102406] = create_organizer!(
  bot: cyclops_dump,
  position_x: -1040.0,
  position_y: 1140.0,
  title: "Pressure",
  notes: ""
)

node_map[102407] = create_organizer!(
  bot: cyclops_dump,
  position_x: -520.0,
  position_y: 2140.0,
  title: "Fallback",
  notes: ""
)

node_map[102408] = create_organizer!(
  bot: cyclops_dump,
  position_x: 1760.0,
  position_y: 1740.0,
  title: "Endgame",
  notes: ""
)

node_map[102409] = create_organizer!(
  bot: cyclops_dump,
  position_x: 4060.0,
  position_y: 220.0,
  title: "Opening",
  notes: ""
)

node_map[102410] = create_condition!(
  bot: cyclops_dump,
  position_x: -180.0,
  position_y: -360.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[102411] = create_condition!(
  bot: cyclops_dump,
  position_x: -120.0,
  position_y: -210.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102412] = create_action!(
  bot: cyclops_dump,
  position_x: -180.0,
  position_y: -60.0,
  action_type: "return",
  value: 100
)

node_map[102413] = create_condition!(
  bot: cyclops_dump,
  position_x: 80.0,
  position_y: -360.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102414] = create_condition!(
  bot: cyclops_dump,
  position_x: 140.0,
  position_y: -210.0,
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

node_map[102415] = create_action!(
  bot: cyclops_dump,
  position_x: 80.0,
  position_y: -60.0,
  action_type: "return",
  value: -100
)

node_map[102416] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 120.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102417] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 270.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102418] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102419] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 570.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102420] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 720.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102421] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 870.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102422] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1020.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102423] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 1170.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102424] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1320.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102425] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 1470.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102426] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1620.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102427] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 1770.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102428] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1920.0,
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

node_map[102429] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 2070.0,
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

node_map[102430] = create_condition!(
  bot: cyclops_dump,
  position_x: 3600.0,
  position_y: 2070.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102431] = create_condition!(
  bot: cyclops_dump,
  position_x: 3670.0,
  position_y: 2220.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102432] = create_condition!(
  bot: cyclops_dump,
  position_x: 3600.0,
  position_y: 2370.0,
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

node_map[102433] = create_action!(
  bot: cyclops_dump,
  position_x: 3670.0,
  position_y: 2520.0,
  action_type: "return",
  value: 14
)

node_map[102434] = create_condition!(
  bot: cyclops_dump,
  position_x: 4240.0,
  position_y: 2070.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102435] = create_condition!(
  bot: cyclops_dump,
  position_x: 4310.0,
  position_y: 2220.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102436] = create_condition!(
  bot: cyclops_dump,
  position_x: 4240.0,
  position_y: 2370.0,
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

node_map[102437] = create_action!(
  bot: cyclops_dump,
  position_x: 4310.0,
  position_y: 2520.0,
  action_type: "return",
  value: 13
)

node_map[102438] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 120.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102439] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 270.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102440] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102441] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 570.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102442] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 720.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102443] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 870.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102444] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1020.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102445] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 1170.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102446] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1320.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102447] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 1470.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102448] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1620.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102449] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 1770.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102450] = create_condition!(
  bot: cyclops_dump,
  position_x: 3920.0,
  position_y: 1920.0,
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

node_map[102451] = create_condition!(
  bot: cyclops_dump,
  position_x: 3990.0,
  position_y: 2070.0,
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

node_map[102452] = create_condition!(
  bot: cyclops_dump,
  position_x: 4560.0,
  position_y: 2220.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102453] = create_condition!(
  bot: cyclops_dump,
  position_x: 4560.0,
  position_y: 2370.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102454] = create_condition!(
  bot: cyclops_dump,
  position_x: 4630.0,
  position_y: 2520.0,
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

node_map[102455] = create_action!(
  bot: cyclops_dump,
  position_x: 4560.0,
  position_y: 2670.0,
  action_type: "add",
  value: 9
)

node_map[102456] = create_condition!(
  bot: cyclops_dump,
  position_x: 4840.0,
  position_y: 2370.0,
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

node_map[102457] = create_condition!(
  bot: cyclops_dump,
  position_x: 4910.0,
  position_y: 2520.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102458] = create_action!(
  bot: cyclops_dump,
  position_x: 4840.0,
  position_y: 2670.0,
  action_type: "add",
  value: 8
)

node_map[102459] = create_condition!(
  bot: cyclops_dump,
  position_x: -1500.0,
  position_y: 180.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[102460] = create_condition!(
  bot: cyclops_dump,
  position_x: -1800.0,
  position_y: 180.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102461] = create_action!(
  bot: cyclops_dump,
  position_x: -1740.0,
  position_y: 330.0,
  action_type: "return",
  value: 110
)

node_map[102462] = create_action!(
  bot: cyclops_dump,
  position_x: -1200.0,
  position_y: 180.0,
  action_type: "return",
  value: 100
)

node_map[102463] = create_condition!(
  bot: cyclops_dump,
  position_x: -920.0,
  position_y: 40.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102464] = create_condition!(
  bot: cyclops_dump,
  position_x: -860.0,
  position_y: 190.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102465] = create_action!(
  bot: cyclops_dump,
  position_x: -920.0,
  position_y: 340.0,
  action_type: "return",
  value: 90
)

node_map[102466] = create_condition!(
  bot: cyclops_dump,
  position_x: -760.0,
  position_y: 460.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102467] = create_condition!(
  bot: cyclops_dump,
  position_x: -700.0,
  position_y: 610.0,
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

node_map[102468] = create_condition!(
  bot: cyclops_dump,
  position_x: -760.0,
  position_y: 760.0,
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

node_map[102469] = create_action!(
  bot: cyclops_dump,
  position_x: -700.0,
  position_y: 910.0,
  action_type: "return",
  value: 58
)

node_map[102470] = create_condition!(
  bot: cyclops_dump,
  position_x: -180.0,
  position_y: 40.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102471] = create_condition!(
  bot: cyclops_dump,
  position_x: -120.0,
  position_y: 190.0,
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

node_map[102472] = create_condition!(
  bot: cyclops_dump,
  position_x: -180.0,
  position_y: 340.0,
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

node_map[102473] = create_condition!(
  bot: cyclops_dump,
  position_x: -120.0,
  position_y: 490.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102474] = create_action!(
  bot: cyclops_dump,
  position_x: -180.0,
  position_y: 640.0,
  action_type: "return",
  value: 48
)

node_map[102475] = create_condition!(
  bot: cyclops_dump,
  position_x: 140.0,
  position_y: 420.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102476] = create_condition!(
  bot: cyclops_dump,
  position_x: 200.0,
  position_y: 570.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102477] = create_action!(
  bot: cyclops_dump,
  position_x: 140.0,
  position_y: 720.0,
  action_type: "return",
  value: 44
)

node_map[102478] = create_condition!(
  bot: cyclops_dump,
  position_x: -1440.0,
  position_y: 1200.0,
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

node_map[102479] = create_condition!(
  bot: cyclops_dump,
  position_x: -1800.0,
  position_y: 940.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102480] = create_condition!(
  bot: cyclops_dump,
  position_x: -1730.0,
  position_y: 1090.0,
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

node_map[102481] = create_action!(
  bot: cyclops_dump,
  position_x: -1800.0,
  position_y: 1240.0,
  action_type: "return",
  value: 34
)

node_map[102482] = create_condition!(
  bot: cyclops_dump,
  position_x: -1800.0,
  position_y: 1460.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102483] = create_condition!(
  bot: cyclops_dump,
  position_x: -1730.0,
  position_y: 1610.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102484] = create_condition!(
  bot: cyclops_dump,
  position_x: -1800.0,
  position_y: 1760.0,
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

node_map[102485] = create_action!(
  bot: cyclops_dump,
  position_x: -1730.0,
  position_y: 1910.0,
  action_type: "return",
  value: 24
)

node_map[102486] = create_condition!(
  bot: cyclops_dump,
  position_x: -1080.0,
  position_y: 940.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102487] = create_condition!(
  bot: cyclops_dump,
  position_x: -1010.0,
  position_y: 1090.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102488] = create_condition!(
  bot: cyclops_dump,
  position_x: -1080.0,
  position_y: 1240.0,
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

node_map[102489] = create_action!(
  bot: cyclops_dump,
  position_x: -1010.0,
  position_y: 1390.0,
  action_type: "return",
  value: 22
)

node_map[102490] = create_condition!(
  bot: cyclops_dump,
  position_x: -1080.0,
  position_y: 1460.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102491] = create_action!(
  bot: cyclops_dump,
  position_x: -1010.0,
  position_y: 1610.0,
  action_type: "add",
  value: 16
)

node_map[102492] = create_condition!(
  bot: cyclops_dump,
  position_x: -240.0,
  position_y: 1480.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102493] = create_condition!(
  bot: cyclops_dump,
  position_x: -600.0,
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

node_map[102494] = create_condition!(
  bot: cyclops_dump,
  position_x: -530.0,
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

node_map[102495] = create_action!(
  bot: cyclops_dump,
  position_x: -600.0,
  position_y: 1520.0,
  action_type: "return",
  value: 34
)

node_map[102496] = create_condition!(
  bot: cyclops_dump,
  position_x: -600.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102497] = create_condition!(
  bot: cyclops_dump,
  position_x: -530.0,
  position_y: 1890.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102498] = create_condition!(
  bot: cyclops_dump,
  position_x: -600.0,
  position_y: 2040.0,
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

node_map[102499] = create_action!(
  bot: cyclops_dump,
  position_x: -530.0,
  position_y: 2190.0,
  action_type: "return",
  value: 24
)

node_map[102500] = create_condition!(
  bot: cyclops_dump,
  position_x: 120.0,
  position_y: 1220.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102501] = create_condition!(
  bot: cyclops_dump,
  position_x: 190.0,
  position_y: 1370.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102502] = create_condition!(
  bot: cyclops_dump,
  position_x: 120.0,
  position_y: 1520.0,
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

node_map[102503] = create_action!(
  bot: cyclops_dump,
  position_x: 190.0,
  position_y: 1670.0,
  action_type: "return",
  value: 22
)

node_map[102504] = create_condition!(
  bot: cyclops_dump,
  position_x: 120.0,
  position_y: 1740.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102505] = create_action!(
  bot: cyclops_dump,
  position_x: 190.0,
  position_y: 1890.0,
  action_type: "add",
  value: 16
)

node_map[102506] = create_condition!(
  bot: cyclops_dump,
  position_x: 760.0,
  position_y: 1120.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102507] = create_condition!(
  bot: cyclops_dump,
  position_x: 830.0,
  position_y: 1270.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102508] = create_condition!(
  bot: cyclops_dump,
  position_x: 760.0,
  position_y: 1420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102509] = create_condition!(
  bot: cyclops_dump,
  position_x: 500.0,
  position_y: 1420.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102510] = create_action!(
  bot: cyclops_dump,
  position_x: 570.0,
  position_y: 1570.0,
  action_type: "subtract",
  value: 14
)

node_map[102511] = create_condition!(
  bot: cyclops_dump,
  position_x: 1020.0,
  position_y: 1420.0,
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

node_map[102512] = create_action!(
  bot: cyclops_dump,
  position_x: 1090.0,
  position_y: 1570.0,
  action_type: "subtract",
  value: 14
)

node_map[102513] = create_condition!(
  bot: cyclops_dump,
  position_x: 1460.0,
  position_y: 1900.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[102514] = create_condition!(
  bot: cyclops_dump,
  position_x: 1530.0,
  position_y: 2050.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[102515] = create_condition!(
  bot: cyclops_dump,
  position_x: 1460.0,
  position_y: 2200.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102516] = create_condition!(
  bot: cyclops_dump,
  position_x: 1530.0,
  position_y: 2350.0,
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

node_map[102517] = create_action!(
  bot: cyclops_dump,
  position_x: 1460.0,
  position_y: 2500.0,
  action_type: "return",
  value: 88
)

node_map[102518] = create_condition!(
  bot: cyclops_dump,
  position_x: 1820.0,
  position_y: 2200.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102519] = create_condition!(
  bot: cyclops_dump,
  position_x: 1890.0,
  position_y: 2350.0,
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

node_map[102520] = create_action!(
  bot: cyclops_dump,
  position_x: 1820.0,
  position_y: 2500.0,
  action_type: "return",
  value: 24
)

node_map[102521] = create_condition!(
  bot: cyclops_dump,
  position_x: 2460.0,
  position_y: 2140.0,
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

node_map[102522] = create_condition!(
  bot: cyclops_dump,
  position_x: 2120.0,
  position_y: 2140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102523] = create_condition!(
  bot: cyclops_dump,
  position_x: 2190.0,
  position_y: 2290.0,
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

node_map[102524] = create_action!(
  bot: cyclops_dump,
  position_x: 2120.0,
  position_y: 2440.0,
  action_type: "return",
  value: 34
)

node_map[102525] = create_condition!(
  bot: cyclops_dump,
  position_x: 2800.0,
  position_y: 2140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102526] = create_condition!(
  bot: cyclops_dump,
  position_x: 2870.0,
  position_y: 2290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102527] = create_condition!(
  bot: cyclops_dump,
  position_x: 2800.0,
  position_y: 2440.0,
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

node_map[102528] = create_action!(
  bot: cyclops_dump,
  position_x: 2870.0,
  position_y: 2590.0,
  action_type: "return",
  value: 36
)

node_map[102529] = create_condition!(
  bot: cyclops_dump,
  position_x: 3440.0,
  position_y: 2440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102530] = create_condition!(
  bot: cyclops_dump,
  position_x: 3100.0,
  position_y: 2440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102531] = create_condition!(
  bot: cyclops_dump,
  position_x: 3170.0,
  position_y: 2590.0,
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

node_map[102532] = create_action!(
  bot: cyclops_dump,
  position_x: 3100.0,
  position_y: 2740.0,
  action_type: "return",
  value: 34
)

node_map[102533] = create_condition!(
  bot: cyclops_dump,
  position_x: 3780.0,
  position_y: 2440.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102534] = create_condition!(
  bot: cyclops_dump,
  position_x: 3850.0,
  position_y: 2590.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102535] = create_condition!(
  bot: cyclops_dump,
  position_x: 3780.0,
  position_y: 2740.0,
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

node_map[102536] = create_action!(
  bot: cyclops_dump,
  position_x: 3850.0,
  position_y: 2890.0,
  action_type: "return",
  value: 36
)

node_map[102537] = create_condition!(
  bot: cyclops_dump,
  position_x: -980.0,
  position_y: 2280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102538] = create_condition!(
  bot: cyclops_dump,
  position_x: -910.0,
  position_y: 2430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102539] = create_condition!(
  bot: cyclops_dump,
  position_x: -980.0,
  position_y: 2580.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102540] = create_condition!(
  bot: cyclops_dump,
  position_x: -1260.0,
  position_y: 2580.0,
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

node_map[102541] = create_action!(
  bot: cyclops_dump,
  position_x: -1190.0,
  position_y: 2730.0,
  action_type: "add",
  value: 7
)

node_map[102542] = create_condition!(
  bot: cyclops_dump,
  position_x: -980.0,
  position_y: 2800.0,
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

node_map[102543] = create_action!(
  bot: cyclops_dump,
  position_x: -910.0,
  position_y: 2950.0,
  action_type: "add",
  value: 7
)

node_map[102544] = create_condition!(
  bot: cyclops_dump,
  position_x: -700.0,
  position_y: 2580.0,
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

node_map[102545] = create_action!(
  bot: cyclops_dump,
  position_x: -630.0,
  position_y: 2730.0,
  action_type: "add",
  value: 7
)

node_map[102546] = create_condition!(
  bot: cyclops_dump,
  position_x: -60.0,
  position_y: 2140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102547] = create_condition!(
  bot: cyclops_dump,
  position_x: 10.0,
  position_y: 2290.0,
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

node_map[102548] = create_condition!(
  bot: cyclops_dump,
  position_x: -60.0,
  position_y: 2440.0,
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

node_map[102549] = create_condition!(
  bot: cyclops_dump,
  position_x: 10.0,
  position_y: 2590.0,
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

node_map[102550] = create_action!(
  bot: cyclops_dump,
  position_x: -60.0,
  position_y: 2740.0,
  action_type: "return",
  value: 26
)

node_map[102551] = create_condition!(
  bot: cyclops_dump,
  position_x: 300.0,
  position_y: 2460.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102552] = create_condition!(
  bot: cyclops_dump,
  position_x: 370.0,
  position_y: 2610.0,
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

node_map[102553] = create_condition!(
  bot: cyclops_dump,
  position_x: 300.0,
  position_y: 2760.0,
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

node_map[102554] = create_condition!(
  bot: cyclops_dump,
  position_x: 370.0,
  position_y: 2910.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102555] = create_action!(
  bot: cyclops_dump,
  position_x: 300.0,
  position_y: 3060.0,
  action_type: "return",
  value: 18
)

node_map[102556] = create_condition!(
  bot: cyclops_dump,
  position_x: 900.0,
  position_y: 2180.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102557] = create_condition!(
  bot: cyclops_dump,
  position_x: 640.0,
  position_y: 2180.0,
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

node_map[102558] = create_action!(
  bot: cyclops_dump,
  position_x: 710.0,
  position_y: 2330.0,
  action_type: "return",
  value: -120
)

node_map[102559] = create_condition!(
  bot: cyclops_dump,
  position_x: 1160.0,
  position_y: 2180.0,
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

node_map[102560] = create_condition!(
  bot: cyclops_dump,
  position_x: 1230.0,
  position_y: 2330.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102561] = create_action!(
  bot: cyclops_dump,
  position_x: 1160.0,
  position_y: 2480.0,
  action_type: "return",
  value: -120
)

node_map[102562] = create_condition!(
  bot: cyclops_dump,
  position_x: 1360.0,
  position_y: 2520.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102563] = create_condition!(
  bot: cyclops_dump,
  position_x: 1430.0,
  position_y: 2670.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102564] = create_condition!(
  bot: cyclops_dump,
  position_x: 1360.0,
  position_y: 2820.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>0}
)

node_map[102565] = create_condition!(
  bot: cyclops_dump,
  position_x: 1100.0,
  position_y: 2820.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102566] = create_action!(
  bot: cyclops_dump,
  position_x: 1170.0,
  position_y: 2970.0,
  action_type: "subtract",
  value: 8
)

node_map[102567] = create_condition!(
  bot: cyclops_dump,
  position_x: 1620.0,
  position_y: 2820.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102568] = create_action!(
  bot: cyclops_dump,
  position_x: 1690.0,
  position_y: 2970.0,
  action_type: "subtract",
  value: 8
)

node_map[102569] = create_condition!(
  bot: cyclops_dump,
  position_x: 1880.0,
  position_y: 2240.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102570] = create_condition!(
  bot: cyclops_dump,
  position_x: 1950.0,
  position_y: 2390.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102571] = create_condition!(
  bot: cyclops_dump,
  position_x: 1880.0,
  position_y: 2540.0,
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

node_map[102572] = create_condition!(
  bot: cyclops_dump,
  position_x: 1950.0,
  position_y: 2690.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102573] = create_condition!(
  bot: cyclops_dump,
  position_x: 1880.0,
  position_y: 2840.0,
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

node_map[102574] = create_action!(
  bot: cyclops_dump,
  position_x: 1950.0,
  position_y: 2990.0,
  action_type: "subtract",
  value: 10
)

connect!(node_map[102403], node_map[102404])
connect!(node_map[102403], node_map[102405])
connect!(node_map[102403], node_map[102406])
connect!(node_map[102403], node_map[102407])
connect!(node_map[102403], node_map[102408])
connect!(node_map[102403], node_map[102409])
connect!(node_map[102404], node_map[102410])
connect!(node_map[102404], node_map[102413])
connect!(node_map[102405], node_map[102459])
connect!(node_map[102405], node_map[102463])
connect!(node_map[102405], node_map[102466])
connect!(node_map[102405], node_map[102470])
connect!(node_map[102405], node_map[102475])
connect!(node_map[102406], node_map[102478])
connect!(node_map[102406], node_map[102492])
connect!(node_map[102406], node_map[102506])
connect!(node_map[102407], node_map[102537])
connect!(node_map[102407], node_map[102546])
connect!(node_map[102407], node_map[102551])
connect!(node_map[102407], node_map[102556])
connect!(node_map[102407], node_map[102562])
connect!(node_map[102407], node_map[102569])
connect!(node_map[102408], node_map[102513])
connect!(node_map[102409], node_map[102416])
connect!(node_map[102409], node_map[102438])
connect!(node_map[102410], node_map[102411])
connect!(node_map[102411], node_map[102412])
connect!(node_map[102413], node_map[102414])
connect!(node_map[102414], node_map[102415])
connect!(node_map[102416], node_map[102417])
connect!(node_map[102417], node_map[102418])
connect!(node_map[102418], node_map[102419])
connect!(node_map[102419], node_map[102420])
connect!(node_map[102420], node_map[102421])
connect!(node_map[102421], node_map[102422])
connect!(node_map[102422], node_map[102423])
connect!(node_map[102423], node_map[102424])
connect!(node_map[102424], node_map[102425])
connect!(node_map[102425], node_map[102426])
connect!(node_map[102426], node_map[102427])
connect!(node_map[102427], node_map[102428])
connect!(node_map[102428], node_map[102429])
connect!(node_map[102429], node_map[102430])
connect!(node_map[102429], node_map[102434])
connect!(node_map[102430], node_map[102431])
connect!(node_map[102431], node_map[102432])
connect!(node_map[102432], node_map[102433])
connect!(node_map[102434], node_map[102435])
connect!(node_map[102435], node_map[102436])
connect!(node_map[102436], node_map[102437])
connect!(node_map[102438], node_map[102439])
connect!(node_map[102439], node_map[102440])
connect!(node_map[102440], node_map[102441])
connect!(node_map[102441], node_map[102442])
connect!(node_map[102442], node_map[102443])
connect!(node_map[102443], node_map[102444])
connect!(node_map[102444], node_map[102445])
connect!(node_map[102445], node_map[102446])
connect!(node_map[102446], node_map[102447])
connect!(node_map[102447], node_map[102448])
connect!(node_map[102448], node_map[102449])
connect!(node_map[102449], node_map[102450])
connect!(node_map[102450], node_map[102451])
connect!(node_map[102451], node_map[102452])
connect!(node_map[102452], node_map[102453])
connect!(node_map[102452], node_map[102456])
connect!(node_map[102453], node_map[102454])
connect!(node_map[102454], node_map[102455])
connect!(node_map[102456], node_map[102457])
connect!(node_map[102457], node_map[102458])
connect!(node_map[102459], node_map[102460])
connect!(node_map[102459], node_map[102462])
connect!(node_map[102460], node_map[102461])
connect!(node_map[102463], node_map[102464])
connect!(node_map[102464], node_map[102465])
connect!(node_map[102466], node_map[102467])
connect!(node_map[102467], node_map[102468])
connect!(node_map[102468], node_map[102469])
connect!(node_map[102470], node_map[102471])
connect!(node_map[102471], node_map[102472])
connect!(node_map[102472], node_map[102473])
connect!(node_map[102473], node_map[102474])
connect!(node_map[102475], node_map[102476])
connect!(node_map[102476], node_map[102477])
connect!(node_map[102478], node_map[102479])
connect!(node_map[102478], node_map[102482])
connect!(node_map[102478], node_map[102486])
connect!(node_map[102478], node_map[102490])
connect!(node_map[102479], node_map[102480])
connect!(node_map[102480], node_map[102481])
connect!(node_map[102482], node_map[102483])
connect!(node_map[102483], node_map[102484])
connect!(node_map[102484], node_map[102485])
connect!(node_map[102486], node_map[102487])
connect!(node_map[102487], node_map[102488])
connect!(node_map[102488], node_map[102489])
connect!(node_map[102490], node_map[102491])
connect!(node_map[102492], node_map[102493])
connect!(node_map[102492], node_map[102496])
connect!(node_map[102492], node_map[102500])
connect!(node_map[102492], node_map[102504])
connect!(node_map[102493], node_map[102494])
connect!(node_map[102494], node_map[102495])
connect!(node_map[102496], node_map[102497])
connect!(node_map[102497], node_map[102498])
connect!(node_map[102498], node_map[102499])
connect!(node_map[102500], node_map[102501])
connect!(node_map[102501], node_map[102502])
connect!(node_map[102502], node_map[102503])
connect!(node_map[102504], node_map[102505])
connect!(node_map[102506], node_map[102507])
connect!(node_map[102507], node_map[102508])
connect!(node_map[102508], node_map[102509])
connect!(node_map[102508], node_map[102511])
connect!(node_map[102509], node_map[102510])
connect!(node_map[102511], node_map[102512])
connect!(node_map[102513], node_map[102514])
connect!(node_map[102514], node_map[102515])
connect!(node_map[102514], node_map[102518])
connect!(node_map[102514], node_map[102521])
connect!(node_map[102514], node_map[102529])
connect!(node_map[102515], node_map[102516])
connect!(node_map[102516], node_map[102517])
connect!(node_map[102518], node_map[102519])
connect!(node_map[102519], node_map[102520])
connect!(node_map[102521], node_map[102522])
connect!(node_map[102521], node_map[102525])
connect!(node_map[102522], node_map[102523])
connect!(node_map[102523], node_map[102524])
connect!(node_map[102525], node_map[102526])
connect!(node_map[102526], node_map[102527])
connect!(node_map[102527], node_map[102528])
connect!(node_map[102529], node_map[102530])
connect!(node_map[102529], node_map[102533])
connect!(node_map[102530], node_map[102531])
connect!(node_map[102531], node_map[102532])
connect!(node_map[102533], node_map[102534])
connect!(node_map[102534], node_map[102535])
connect!(node_map[102535], node_map[102536])
connect!(node_map[102537], node_map[102538])
connect!(node_map[102538], node_map[102539])
connect!(node_map[102539], node_map[102540])
connect!(node_map[102539], node_map[102542])
connect!(node_map[102539], node_map[102544])
connect!(node_map[102540], node_map[102541])
connect!(node_map[102542], node_map[102543])
connect!(node_map[102544], node_map[102545])
connect!(node_map[102546], node_map[102547])
connect!(node_map[102547], node_map[102548])
connect!(node_map[102548], node_map[102549])
connect!(node_map[102549], node_map[102550])
connect!(node_map[102551], node_map[102552])
connect!(node_map[102552], node_map[102553])
connect!(node_map[102553], node_map[102554])
connect!(node_map[102554], node_map[102555])
connect!(node_map[102556], node_map[102557])
connect!(node_map[102556], node_map[102559])
connect!(node_map[102557], node_map[102558])
connect!(node_map[102559], node_map[102560])
connect!(node_map[102560], node_map[102561])
connect!(node_map[102562], node_map[102563])
connect!(node_map[102563], node_map[102564])
connect!(node_map[102564], node_map[102565])
connect!(node_map[102564], node_map[102567])
connect!(node_map[102565], node_map[102566])
connect!(node_map[102567], node_map[102568])
connect!(node_map[102569], node_map[102570])
connect!(node_map[102570], node_map[102571])
connect!(node_map[102571], node_map[102572])
connect!(node_map[102572], node_map[102573])
connect!(node_map[102573], node_map[102574])

cyclops_dump.compile_program!
