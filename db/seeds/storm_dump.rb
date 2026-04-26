# Standalone seed file for Storm Dump.

require_relative 'helpers'

user = seed_user!

storm_dump = user.bots.find_or_initialize_by(name: "Storm Dump")
storm_dump.description = "A behavior-preserving refactor target for Storm using shared graph trunks for the repeated opening, queen, endgame, and fallback families. Migrated from Storm v2 by bots:migrate_to_v2_grammar_clone."
storm_dump.save!

reset_bot_graph!(storm_dump)

node_map = { 103447 => storm_dump.root_node }

node_map[103448] = create_organizer!(
  bot: storm_dump,
  position_x: 120.0,
  position_y: 120.0,
  title: "Terminal",
  notes: ""
)

node_map[103449] = create_organizer!(
  bot: storm_dump,
  position_x: 1156.0,
  position_y: -45.3333740234375,
  title: "Opening",
  notes: ""
)

node_map[103450] = create_organizer!(
  bot: storm_dump,
  position_x: -368.00103759765625,
  position_y: 1732.0,
  title: "Tactics",
  notes: ""
)

node_map[103451] = create_organizer!(
  bot: storm_dump,
  position_x: 1808.0,
  position_y: 212.0,
  title: "Queen Strategy",
  notes: ""
)

node_map[103452] = create_organizer!(
  bot: storm_dump,
  position_x: 2200.0,
  position_y: 1320.0,
  title: "King Pressure",
  notes: ""
)

node_map[103453] = create_organizer!(
  bot: storm_dump,
  position_x: 3240.0,
  position_y: 900.0,
  title: "Endgame",
  notes: ""
)

node_map[103454] = create_organizer!(
  bot: storm_dump,
  position_x: 4380.0,
  position_y: 1280.0,
  title: "Fallback",
  notes: ""
)

node_map[103455] = create_condition!(
  bot: storm_dump,
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

node_map[103456] = create_condition!(
  bot: storm_dump,
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

node_map[103457] = create_score!(
  bot: storm_dump,
  position_x: 80.0,
  position_y: 580.0,
  action_type: "return",
  value: 100
)

node_map[103458] = create_condition!(
  bot: storm_dump,
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

node_map[103459] = create_condition!(
  bot: storm_dump,
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

node_map[103460] = create_score!(
  bot: storm_dump,
  position_x: 300.0,
  position_y: 580.0,
  action_type: "return",
  value: -100
)

node_map[103461] = create_condition!(
  bot: storm_dump,
  position_x: 1036.0,
  position_y: 114.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103462] = create_condition!(
  bot: storm_dump,
  position_x: 1116.0,
  position_y: 264.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103463] = create_condition!(
  bot: storm_dump,
  position_x: 1036.0,
  position_y: 414.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103464] = create_condition!(
  bot: storm_dump,
  position_x: 1116.0,
  position_y: 564.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103465] = create_condition!(
  bot: storm_dump,
  position_x: 1036.0,
  position_y: 714.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103466] = create_condition!(
  bot: storm_dump,
  position_x: 1116.0,
  position_y: 864.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[103467] = create_condition!(
  bot: storm_dump,
  position_x: 1036.0,
  position_y: 1014.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103468] = create_condition!(
  bot: storm_dump,
  position_x: 1116.0,
  position_y: 1164.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103469] = create_condition!(
  bot: storm_dump,
  position_x: 1036.0,
  position_y: 1314.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103470] = create_condition!(
  bot: storm_dump,
  position_x: 1116.0,
  position_y: 1464.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103471] = create_condition!(
  bot: storm_dump,
  position_x: 1036.0,
  position_y: 1614.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103472] = create_condition!(
  bot: storm_dump,
  position_x: 1116.0,
  position_y: 1764.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[103473] = create_condition!(
  bot: storm_dump,
  position_x: 1036.0,
  position_y: 1914.6666259765625,
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

node_map[103474] = create_condition!(
  bot: storm_dump,
  position_x: 1116.0,
  position_y: 2064.6666259765625,
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

node_map[103475] = create_condition!(
  bot: storm_dump,
  position_x: 1516.0,
  position_y: 2214.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103476] = create_condition!(
  bot: storm_dump,
  position_x: 1596.0,
  position_y: 2364.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103477] = create_condition!(
  bot: storm_dump,
  position_x: 1516.0,
  position_y: 2514.6666259765625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103478] = create_condition!(
  bot: storm_dump,
  position_x: 1516.0,
  position_y: 2664.6666259765625,
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

node_map[103479] = create_score!(
  bot: storm_dump,
  position_x: 1596.0,
  position_y: 2814.6666259765625,
  action_type: "add",
  value: 12
)

node_map[103480] = create_condition!(
  bot: storm_dump,
  position_x: 1776.0,
  position_y: 2664.6666259765625,
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

node_map[103481] = create_score!(
  bot: storm_dump,
  position_x: 1856.0,
  position_y: 2814.6666259765625,
  action_type: "add",
  value: 12
)

node_map[103482] = create_condition!(
  bot: storm_dump,
  position_x: 2116.0,
  position_y: 2214.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103483] = create_condition!(
  bot: storm_dump,
  position_x: 2196.0,
  position_y: 2364.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103484] = create_condition!(
  bot: storm_dump,
  position_x: 2116.0,
  position_y: 2514.6666259765625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103485] = create_condition!(
  bot: storm_dump,
  position_x: 2116.0,
  position_y: 2664.6666259765625,
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

node_map[103486] = create_score!(
  bot: storm_dump,
  position_x: 2196.0,
  position_y: 2814.6666259765625,
  action_type: "add",
  value: 11
)

node_map[103487] = create_condition!(
  bot: storm_dump,
  position_x: 2376.0,
  position_y: 2664.6666259765625,
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

node_map[103488] = create_score!(
  bot: storm_dump,
  position_x: 2456.0,
  position_y: 2814.6666259765625,
  action_type: "add",
  value: 11
)

node_map[103489] = create_condition!(
  bot: storm_dump,
  position_x: 2716.0,
  position_y: 2214.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103490] = create_condition!(
  bot: storm_dump,
  position_x: 2716.0,
  position_y: 2364.6666259765625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103491] = create_condition!(
  bot: storm_dump,
  position_x: 2716.0,
  position_y: 2514.6666259765625,
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

node_map[103492] = create_score!(
  bot: storm_dump,
  position_x: 2796.0,
  position_y: 2664.6666259765625,
  action_type: "add",
  value: 8
)

node_map[103493] = create_condition!(
  bot: storm_dump,
  position_x: 2976.0,
  position_y: 2514.6666259765625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103494] = create_score!(
  bot: storm_dump,
  position_x: 3056.0,
  position_y: 2664.6666259765625,
  action_type: "add",
  value: 8
)

node_map[103495] = create_condition!(
  bot: storm_dump,
  position_x: 3236.0,
  position_y: 2364.6666259765625,
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

node_map[103496] = create_condition!(
  bot: storm_dump,
  position_x: 3236.0,
  position_y: 2514.6666259765625,
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

node_map[103497] = create_score!(
  bot: storm_dump,
  position_x: 3316.0,
  position_y: 2664.6666259765625,
  action_type: "add",
  value: 8
)

node_map[103498] = create_condition!(
  bot: storm_dump,
  position_x: 3496.0,
  position_y: 2514.6666259765625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103499] = create_score!(
  bot: storm_dump,
  position_x: 3576.0,
  position_y: 2664.6666259765625,
  action_type: "add",
  value: 8
)

node_map[103500] = create_condition!(
  bot: storm_dump,
  position_x: -508.00103759765625,
  position_y: 1892.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[103501] = create_condition!(
  bot: storm_dump,
  position_x: -448.00103759765625,
  position_y: 2042.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103502] = create_score!(
  bot: storm_dump,
  position_x: -508.00103759765625,
  position_y: 2192.0,
  action_type: "return",
  value: 110
)

node_map[103503] = create_score!(
  bot: storm_dump,
  position_x: -188.00103759765625,
  position_y: 2042.0,
  action_type: "return",
  value: 100
)

node_map[103504] = create_condition!(
  bot: storm_dump,
  position_x: 11.99896240234375,
  position_y: 1892.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103505] = create_condition!(
  bot: storm_dump,
  position_x: 71.99896240234375,
  position_y: 2042.0,
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

node_map[103506] = create_condition!(
  bot: storm_dump,
  position_x: 11.99896240234375,
  position_y: 2192.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103507] = create_score!(
  bot: storm_dump,
  position_x: 71.99896240234375,
  position_y: 2342.0,
  action_type: "return",
  value: 55
)

node_map[103508] = create_condition!(
  bot: storm_dump,
  position_x: 251.99896240234375,
  position_y: 2192.0,
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

node_map[103509] = create_score!(
  bot: storm_dump,
  position_x: 311.99896240234375,
  position_y: 2342.0,
  action_type: "return",
  value: 55
)

node_map[103510] = create_condition!(
  bot: storm_dump,
  position_x: -248.00103759765625,
  position_y: 1892.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103511] = create_condition!(
  bot: storm_dump,
  position_x: -188.00103759765625,
  position_y: 2042.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103512] = create_score!(
  bot: storm_dump,
  position_x: -248.00103759765625,
  position_y: 2192.0,
  action_type: "return",
  value: 92
)

node_map[103513] = create_condition!(
  bot: storm_dump,
  position_x: 511.99896240234375,
  position_y: 1892.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103514] = create_condition!(
  bot: storm_dump,
  position_x: 571.9989624023438,
  position_y: 2042.0,
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

node_map[103515] = create_condition!(
  bot: storm_dump,
  position_x: 511.99896240234375,
  position_y: 2192.0,
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

node_map[103516] = create_condition!(
  bot: storm_dump,
  position_x: 571.9989624023438,
  position_y: 2342.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103517] = create_score!(
  bot: storm_dump,
  position_x: 511.99896240234375,
  position_y: 2492.0,
  action_type: "return",
  value: 46
)

node_map[103518] = create_condition!(
  bot: storm_dump,
  position_x: 1668.0,
  position_y: 372.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103519] = create_condition!(
  bot: storm_dump,
  position_x: 1668.0,
  position_y: 522.0,
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

node_map[103520] = create_condition!(
  bot: storm_dump,
  position_x: 1668.0,
  position_y: 672.0,
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

node_map[103521] = create_score!(
  bot: storm_dump,
  position_x: 1738.0,
  position_y: 822.0,
  action_type: "return",
  value: 80
)

node_map[103522] = create_condition!(
  bot: storm_dump,
  position_x: 1928.0,
  position_y: 672.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103523] = create_score!(
  bot: storm_dump,
  position_x: 1998.0,
  position_y: 822.0,
  action_type: "return",
  value: 80
)

node_map[103524] = create_condition!(
  bot: storm_dump,
  position_x: 2448.0,
  position_y: 522.0,
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

node_map[103525] = create_condition!(
  bot: storm_dump,
  position_x: 2448.0,
  position_y: 672.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103526] = create_score!(
  bot: storm_dump,
  position_x: 2518.0,
  position_y: 822.0,
  action_type: "add",
  value: 10
)

node_map[103527] = create_condition!(
  bot: storm_dump,
  position_x: 2708.0,
  position_y: 672.0,
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

node_map[103528] = create_score!(
  bot: storm_dump,
  position_x: 2778.0,
  position_y: 822.0,
  action_type: "add",
  value: 10
)

node_map[103529] = create_condition!(
  bot: storm_dump,
  position_x: 2968.0,
  position_y: 672.0,
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

node_map[103530] = create_score!(
  bot: storm_dump,
  position_x: 3038.0,
  position_y: 822.0,
  action_type: "add",
  value: 8
)

node_map[103531] = create_condition!(
  bot: storm_dump,
  position_x: 3228.0,
  position_y: 672.0,
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

node_map[103532] = create_score!(
  bot: storm_dump,
  position_x: 3298.0,
  position_y: 822.0,
  action_type: "add",
  value: 8
)

node_map[103533] = create_condition!(
  bot: storm_dump,
  position_x: 3488.0,
  position_y: 672.0,
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

node_map[103534] = create_score!(
  bot: storm_dump,
  position_x: 3558.0,
  position_y: 822.0,
  action_type: "add",
  value: 8
)

node_map[103535] = create_condition!(
  bot: storm_dump,
  position_x: 3748.0,
  position_y: 522.0,
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

node_map[103536] = create_score!(
  bot: storm_dump,
  position_x: 3818.0,
  position_y: 672.0,
  action_type: "return",
  value: -120
)

node_map[103537] = create_condition!(
  bot: storm_dump,
  position_x: 4008.0,
  position_y: 522.0,
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

node_map[103538] = create_condition!(
  bot: storm_dump,
  position_x: 4078.0,
  position_y: 672.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103539] = create_score!(
  bot: storm_dump,
  position_x: 4008.0,
  position_y: 822.0,
  action_type: "return",
  value: -120
)

node_map[103540] = create_condition!(
  bot: storm_dump,
  position_x: 4268.0,
  position_y: 522.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103541] = create_condition!(
  bot: storm_dump,
  position_x: 4338.0,
  position_y: 672.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103542] = create_condition!(
  bot: storm_dump,
  position_x: 4268.0,
  position_y: 822.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103543] = create_score!(
  bot: storm_dump,
  position_x: 4338.0,
  position_y: 972.0,
  action_type: "subtract",
  value: 12
)

node_map[103544] = create_condition!(
  bot: storm_dump,
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

node_map[103545] = create_condition!(
  bot: storm_dump,
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

node_map[103546] = create_condition!(
  bot: storm_dump,
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

node_map[103547] = create_score!(
  bot: storm_dump,
  position_x: 2170.0,
  position_y: 1930.0,
  action_type: "return",
  value: 24
)

node_map[103548] = create_condition!(
  bot: storm_dump,
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

node_map[103549] = create_condition!(
  bot: storm_dump,
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

node_map[103550] = create_score!(
  bot: storm_dump,
  position_x: 2790.0,
  position_y: 1930.0,
  action_type: "return",
  value: 20
)

node_map[103551] = create_condition!(
  bot: storm_dump,
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

node_map[103552] = create_condition!(
  bot: storm_dump,
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

node_map[103553] = create_condition!(
  bot: storm_dump,
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

node_map[103554] = create_score!(
  bot: storm_dump,
  position_x: 3070.0,
  position_y: 1930.0,
  action_type: "return",
  value: 24
)

node_map[103555] = create_condition!(
  bot: storm_dump,
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

node_map[103556] = create_condition!(
  bot: storm_dump,
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

node_map[103557] = create_score!(
  bot: storm_dump,
  position_x: 3690.0,
  position_y: 1930.0,
  action_type: "return",
  value: 20
)

node_map[103558] = create_condition!(
  bot: storm_dump,
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

node_map[103559] = create_condition!(
  bot: storm_dump,
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

node_map[103560] = create_condition!(
  bot: storm_dump,
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

node_map[103561] = create_condition!(
  bot: storm_dump,
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

node_map[103562] = create_score!(
  bot: storm_dump,
  position_x: 3190.0,
  position_y: 1660.0,
  action_type: "return",
  value: 88
)

node_map[103563] = create_condition!(
  bot: storm_dump,
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

node_map[103564] = create_score!(
  bot: storm_dump,
  position_x: 3450.0,
  position_y: 1660.0,
  action_type: "return",
  value: 88
)

node_map[103565] = create_condition!(
  bot: storm_dump,
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

node_map[103566] = create_condition!(
  bot: storm_dump,
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

node_map[103567] = create_score!(
  bot: storm_dump,
  position_x: 3710.0,
  position_y: 1660.0,
  action_type: "return",
  value: 22
)

node_map[103568] = create_condition!(
  bot: storm_dump,
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

node_map[103569] = create_score!(
  bot: storm_dump,
  position_x: 3970.0,
  position_y: 1660.0,
  action_type: "return",
  value: 22
)

node_map[103570] = create_condition!(
  bot: storm_dump,
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
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[103571] = create_condition!(
  bot: storm_dump,
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

node_map[103572] = create_score!(
  bot: storm_dump,
  position_x: 4230.0,
  position_y: 1660.0,
  action_type: "add",
  value: 14
)

node_map[103573] = create_condition!(
  bot: storm_dump,
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

node_map[103574] = create_score!(
  bot: storm_dump,
  position_x: 4490.0,
  position_y: 1660.0,
  action_type: "add",
  value: 14
)

node_map[103575] = create_condition!(
  bot: storm_dump,
  position_x: 4680.0,
  position_y: 1360.0,
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

node_map[103576] = create_condition!(
  bot: storm_dump,
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

node_map[103577] = create_condition!(
  bot: storm_dump,
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

node_map[103578] = create_score!(
  bot: storm_dump,
  position_x: 4680.0,
  position_y: 1810.0,
  action_type: "add",
  value: 8
)

node_map[103579] = create_condition!(
  bot: storm_dump,
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

node_map[103580] = create_condition!(
  bot: storm_dump,
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

node_map[103581] = create_score!(
  bot: storm_dump,
  position_x: 4940.0,
  position_y: 1810.0,
  action_type: "add",
  value: 8
)

node_map[103582] = create_condition!(
  bot: storm_dump,
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

node_map[103583] = create_condition!(
  bot: storm_dump,
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

node_map[103584] = create_condition!(
  bot: storm_dump,
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

node_map[103585] = create_condition!(
  bot: storm_dump,
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

node_map[103586] = create_condition!(
  bot: storm_dump,
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
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[103587] = create_score!(
  bot: storm_dump,
  position_x: 4330.0,
  position_y: 2190.0,
  action_type: "add",
  value: 7
)

node_map[103588] = create_condition!(
  bot: storm_dump,
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
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[103589] = create_score!(
  bot: storm_dump,
  position_x: 4590.0,
  position_y: 2190.0,
  action_type: "add",
  value: 7
)

node_map[103590] = create_condition!(
  bot: storm_dump,
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

node_map[103591] = create_condition!(
  bot: storm_dump,
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

node_map[103592] = create_score!(
  bot: storm_dump,
  position_x: 4780.0,
  position_y: 2190.0,
  action_type: "add",
  value: 7
)

node_map[103593] = create_condition!(
  bot: storm_dump,
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

node_map[103594] = create_score!(
  bot: storm_dump,
  position_x: 5110.0,
  position_y: 1590.0,
  action_type: "add",
  value: 5
)

node_map[103595] = create_condition!(
  bot: storm_dump,
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

node_map[103596] = create_condition!(
  bot: storm_dump,
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

node_map[103597] = create_condition!(
  bot: storm_dump,
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

node_map[103598] = create_condition!(
  bot: storm_dump,
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

node_map[103599] = create_score!(
  bot: storm_dump,
  position_x: 5370.0,
  position_y: 2040.0,
  action_type: "return",
  value: 26
)

node_map[103600] = create_condition!(
  bot: storm_dump,
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

node_map[103601] = create_condition!(
  bot: storm_dump,
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

node_map[103602] = create_condition!(
  bot: storm_dump,
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

node_map[103603] = create_score!(
  bot: storm_dump,
  position_x: 7190.0,
  position_y: 2040.0,
  action_type: "subtract",
  value: 10
)

node_map[103604] = create_condition!(
  bot: storm_dump,
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

node_map[103605] = create_condition!(
  bot: storm_dump,
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

node_map[103606] = create_condition!(
  bot: storm_dump,
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

node_map[103607] = create_condition!(
  bot: storm_dump,
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

node_map[103608] = create_score!(
  bot: storm_dump,
  position_x: 5630.0,
  position_y: 2040.0,
  action_type: "return",
  value: 18
)

node_map[103609] = create_condition!(
  bot: storm_dump,
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

node_map[103610] = create_condition!(
  bot: storm_dump,
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

node_map[103611] = create_condition!(
  bot: storm_dump,
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

node_map[103612] = create_score!(
  bot: storm_dump,
  position_x: 5890.0,
  position_y: 2040.0,
  action_type: "return",
  value: 18
)

node_map[103613] = create_condition!(
  bot: storm_dump,
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
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[103614] = create_condition!(
  bot: storm_dump,
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

node_map[103615] = create_score!(
  bot: storm_dump,
  position_x: 6080.0,
  position_y: 1740.0,
  action_type: "add",
  value: 8
)

node_map[103616] = create_condition!(
  bot: storm_dump,
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

node_map[103617] = create_score!(
  bot: storm_dump,
  position_x: 6340.0,
  position_y: 1740.0,
  action_type: "add",
  value: 8
)

node_map[103618] = create_condition!(
  bot: storm_dump,
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
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[103619] = create_condition!(
  bot: storm_dump,
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

node_map[103620] = create_score!(
  bot: storm_dump,
  position_x: 6080.0,
  position_y: 2310.0,
  action_type: "add",
  value: 8
)

node_map[103621] = create_condition!(
  bot: storm_dump,
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

node_map[103622] = create_score!(
  bot: storm_dump,
  position_x: 6340.0,
  position_y: 2310.0,
  action_type: "add",
  value: 8
)

node_map[103623] = create_condition!(
  bot: storm_dump,
  position_x: 6600.0,
  position_y: 1440.0,
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

node_map[103624] = create_condition!(
  bot: storm_dump,
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

node_map[103625] = create_score!(
  bot: storm_dump,
  position_x: 6600.0,
  position_y: 1740.0,
  action_type: "add",
  value: 6
)

node_map[103626] = create_condition!(
  bot: storm_dump,
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

node_map[103627] = create_score!(
  bot: storm_dump,
  position_x: 6860.0,
  position_y: 1740.0,
  action_type: "add",
  value: 6
)

node_map[103628] = create_condition!(
  bot: storm_dump,
  position_x: 6600.0,
  position_y: 2010.0,
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

node_map[103629] = create_condition!(
  bot: storm_dump,
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

node_map[103630] = create_score!(
  bot: storm_dump,
  position_x: 6600.0,
  position_y: 2310.0,
  action_type: "add",
  value: 6
)

node_map[103631] = create_condition!(
  bot: storm_dump,
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

node_map[103632] = create_score!(
  bot: storm_dump,
  position_x: 6860.0,
  position_y: 2310.0,
  action_type: "add",
  value: 6
)

connect!(node_map[103447], node_map[103448])
connect!(node_map[103447], node_map[103449])
connect!(node_map[103447], node_map[103450])
connect!(node_map[103447], node_map[103451])
connect!(node_map[103447], node_map[103452])
connect!(node_map[103447], node_map[103453])
connect!(node_map[103447], node_map[103454])
connect!(node_map[103448], node_map[103455])
connect!(node_map[103448], node_map[103458])
connect!(node_map[103449], node_map[103461])
connect!(node_map[103450], node_map[103500])
connect!(node_map[103450], node_map[103504])
connect!(node_map[103450], node_map[103510])
connect!(node_map[103450], node_map[103513])
connect!(node_map[103451], node_map[103518])
connect!(node_map[103452], node_map[103544])
connect!(node_map[103452], node_map[103551])
connect!(node_map[103453], node_map[103558])
connect!(node_map[103454], node_map[103582])
connect!(node_map[103454], node_map[103595])
connect!(node_map[103454], node_map[103604])
connect!(node_map[103455], node_map[103456])
connect!(node_map[103456], node_map[103457])
connect!(node_map[103458], node_map[103459])
connect!(node_map[103459], node_map[103460])
connect!(node_map[103461], node_map[103462])
connect!(node_map[103462], node_map[103463])
connect!(node_map[103463], node_map[103464])
connect!(node_map[103464], node_map[103465])
connect!(node_map[103465], node_map[103466])
connect!(node_map[103466], node_map[103467])
connect!(node_map[103467], node_map[103468])
connect!(node_map[103468], node_map[103469])
connect!(node_map[103469], node_map[103470])
connect!(node_map[103470], node_map[103471])
connect!(node_map[103471], node_map[103472])
connect!(node_map[103472], node_map[103473])
connect!(node_map[103473], node_map[103474])
connect!(node_map[103474], node_map[103475])
connect!(node_map[103474], node_map[103482])
connect!(node_map[103474], node_map[103489])
connect!(node_map[103475], node_map[103476])
connect!(node_map[103476], node_map[103477])
connect!(node_map[103477], node_map[103478])
connect!(node_map[103477], node_map[103480])
connect!(node_map[103478], node_map[103479])
connect!(node_map[103480], node_map[103481])
connect!(node_map[103482], node_map[103483])
connect!(node_map[103483], node_map[103484])
connect!(node_map[103484], node_map[103485])
connect!(node_map[103484], node_map[103487])
connect!(node_map[103485], node_map[103486])
connect!(node_map[103487], node_map[103488])
connect!(node_map[103489], node_map[103490])
connect!(node_map[103489], node_map[103495])
connect!(node_map[103490], node_map[103491])
connect!(node_map[103490], node_map[103493])
connect!(node_map[103491], node_map[103492])
connect!(node_map[103493], node_map[103494])
connect!(node_map[103495], node_map[103496])
connect!(node_map[103495], node_map[103498])
connect!(node_map[103496], node_map[103497])
connect!(node_map[103498], node_map[103499])
connect!(node_map[103500], node_map[103501])
connect!(node_map[103500], node_map[103503])
connect!(node_map[103501], node_map[103502])
connect!(node_map[103504], node_map[103505])
connect!(node_map[103505], node_map[103506])
connect!(node_map[103505], node_map[103508])
connect!(node_map[103506], node_map[103507])
connect!(node_map[103508], node_map[103509])
connect!(node_map[103510], node_map[103511])
connect!(node_map[103511], node_map[103512])
connect!(node_map[103513], node_map[103514])
connect!(node_map[103514], node_map[103515])
connect!(node_map[103515], node_map[103516])
connect!(node_map[103516], node_map[103517])
connect!(node_map[103518], node_map[103519])
connect!(node_map[103518], node_map[103524])
connect!(node_map[103518], node_map[103535])
connect!(node_map[103518], node_map[103537])
connect!(node_map[103518], node_map[103540])
connect!(node_map[103519], node_map[103520])
connect!(node_map[103519], node_map[103522])
connect!(node_map[103520], node_map[103521])
connect!(node_map[103522], node_map[103523])
connect!(node_map[103524], node_map[103525])
connect!(node_map[103524], node_map[103527])
connect!(node_map[103524], node_map[103529])
connect!(node_map[103524], node_map[103531])
connect!(node_map[103524], node_map[103533])
connect!(node_map[103525], node_map[103526])
connect!(node_map[103527], node_map[103528])
connect!(node_map[103529], node_map[103530])
connect!(node_map[103531], node_map[103532])
connect!(node_map[103533], node_map[103534])
connect!(node_map[103535], node_map[103536])
connect!(node_map[103537], node_map[103538])
connect!(node_map[103538], node_map[103539])
connect!(node_map[103540], node_map[103541])
connect!(node_map[103541], node_map[103542])
connect!(node_map[103542], node_map[103543])
connect!(node_map[103544], node_map[103545])
connect!(node_map[103544], node_map[103548])
connect!(node_map[103545], node_map[103546])
connect!(node_map[103546], node_map[103547])
connect!(node_map[103548], node_map[103549])
connect!(node_map[103549], node_map[103550])
connect!(node_map[103551], node_map[103552])
connect!(node_map[103551], node_map[103555])
connect!(node_map[103552], node_map[103553])
connect!(node_map[103553], node_map[103554])
connect!(node_map[103555], node_map[103556])
connect!(node_map[103556], node_map[103557])
connect!(node_map[103558], node_map[103559])
connect!(node_map[103559], node_map[103560])
connect!(node_map[103559], node_map[103565])
connect!(node_map[103559], node_map[103570])
connect!(node_map[103559], node_map[103575])
connect!(node_map[103560], node_map[103561])
connect!(node_map[103560], node_map[103563])
connect!(node_map[103561], node_map[103562])
connect!(node_map[103563], node_map[103564])
connect!(node_map[103565], node_map[103566])
connect!(node_map[103565], node_map[103568])
connect!(node_map[103566], node_map[103567])
connect!(node_map[103568], node_map[103569])
connect!(node_map[103570], node_map[103571])
connect!(node_map[103570], node_map[103573])
connect!(node_map[103571], node_map[103572])
connect!(node_map[103573], node_map[103574])
connect!(node_map[103575], node_map[103576])
connect!(node_map[103575], node_map[103579])
connect!(node_map[103576], node_map[103577])
connect!(node_map[103577], node_map[103578])
connect!(node_map[103579], node_map[103580])
connect!(node_map[103580], node_map[103581])
connect!(node_map[103582], node_map[103583])
connect!(node_map[103583], node_map[103584])
connect!(node_map[103584], node_map[103585])
connect!(node_map[103584], node_map[103590])
connect!(node_map[103584], node_map[103593])
connect!(node_map[103585], node_map[103586])
connect!(node_map[103585], node_map[103588])
connect!(node_map[103586], node_map[103587])
connect!(node_map[103588], node_map[103589])
connect!(node_map[103590], node_map[103591])
connect!(node_map[103591], node_map[103592])
connect!(node_map[103593], node_map[103594])
connect!(node_map[103595], node_map[103596])
connect!(node_map[103595], node_map[103600])
connect!(node_map[103595], node_map[103613])
connect!(node_map[103595], node_map[103623])
connect!(node_map[103596], node_map[103597])
connect!(node_map[103597], node_map[103598])
connect!(node_map[103598], node_map[103599])
connect!(node_map[103600], node_map[103601])
connect!(node_map[103601], node_map[103602])
connect!(node_map[103602], node_map[103603])
connect!(node_map[103604], node_map[103605])
connect!(node_map[103604], node_map[103609])
connect!(node_map[103604], node_map[103618])
connect!(node_map[103604], node_map[103628])
connect!(node_map[103605], node_map[103606])
connect!(node_map[103606], node_map[103607])
connect!(node_map[103607], node_map[103608])
connect!(node_map[103609], node_map[103610])
connect!(node_map[103610], node_map[103611])
connect!(node_map[103611], node_map[103612])
connect!(node_map[103613], node_map[103614])
connect!(node_map[103613], node_map[103616])
connect!(node_map[103614], node_map[103615])
connect!(node_map[103616], node_map[103617])
connect!(node_map[103618], node_map[103619])
connect!(node_map[103618], node_map[103621])
connect!(node_map[103619], node_map[103620])
connect!(node_map[103621], node_map[103622])
connect!(node_map[103623], node_map[103624])
connect!(node_map[103623], node_map[103626])
connect!(node_map[103624], node_map[103625])
connect!(node_map[103626], node_map[103627])
connect!(node_map[103628], node_map[103629])
connect!(node_map[103628], node_map[103631])
connect!(node_map[103629], node_map[103630])
connect!(node_map[103631], node_map[103632])

storm_dump.compile_program!
