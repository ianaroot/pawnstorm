# Standalone seed file for Phoenix Dump.

require_relative 'helpers'

user = seed_user!

phoenix_dump = user.bots.find_or_initialize_by(name: "Phoenix Dump")
phoenix_dump.description = "A behavior-preserving refactor target for Phoenix using shared graph trunks for the Phoenix-specific conversion and discipline branches. Migrated from Phoenix v2 by bots:migrate_to_v2_grammar_clone."
phoenix_dump.save!

reset_bot_graph!(phoenix_dump)

node_map = { 102575 => phoenix_dump.root_node }

node_map[102576] = create_organizer!(
  bot: phoenix_dump,
  position_x: -356.0,
  position_y: 180.0,
  title: "Terminal",
  notes: ""
)

node_map[102577] = create_organizer!(
  bot: phoenix_dump,
  position_x: 6746.666687011719,
  position_y: 124.0,
  title: "Opening",
  notes: ""
)

node_map[102578] = create_organizer!(
  bot: phoenix_dump,
  position_x: -2610.665771484375,
  position_y: 1864.0,
  title: "Tactics",
  notes: ""
)

node_map[102579] = create_organizer!(
  bot: phoenix_dump,
  position_x: 1960.0,
  position_y: 220.0,
  title: "Queen Strategy",
  notes: ""
)

node_map[102580] = create_organizer!(
  bot: phoenix_dump,
  position_x: 532.0,
  position_y: 3328.0,
  title: "King Pressure",
  notes: ""
)

node_map[102581] = create_organizer!(
  bot: phoenix_dump,
  position_x: 3924.0,
  position_y: 1164.0,
  title: "Endgame",
  notes: ""
)

node_map[102582] = create_organizer!(
  bot: phoenix_dump,
  position_x: 4956.0,
  position_y: 2980.0,
  title: "Fallback",
  notes: ""
)

node_map[102583] = create_condition!(
  bot: phoenix_dump,
  position_x: -396.0,
  position_y: 340.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[102584] = create_condition!(
  bot: phoenix_dump,
  position_x: -336.0,
  position_y: 490.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102585] = create_action!(
  bot: phoenix_dump,
  position_x: -396.0,
  position_y: 640.0,
  action_type: "return",
  value: 100
)

node_map[102586] = create_condition!(
  bot: phoenix_dump,
  position_x: -176.0,
  position_y: 340.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102587] = create_condition!(
  bot: phoenix_dump,
  position_x: -116.0,
  position_y: 490.0,
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

node_map[102588] = create_action!(
  bot: phoenix_dump,
  position_x: -176.0,
  position_y: 640.0,
  action_type: "return",
  value: -100
)

node_map[102589] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 284.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102590] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 434.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102591] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 584.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102592] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 734.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102593] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 884.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102594] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 1034.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102595] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 1184.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102596] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 1334.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102597] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 1484.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102598] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 1634.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102599] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 1784.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[102600] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 1934.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[102601] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 2084.0,
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

node_map[102602] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 2234.0,
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

node_map[102603] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 2384.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102604] = create_condition!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 2534.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102605] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 2684.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102606] = create_condition!(
  bot: phoenix_dump,
  position_x: 6626.666687011719,
  position_y: 2834.0,
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

node_map[102607] = create_action!(
  bot: phoenix_dump,
  position_x: 6706.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 12
)

node_map[102608] = create_condition!(
  bot: phoenix_dump,
  position_x: 6886.666687011719,
  position_y: 2834.0,
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

node_map[102609] = create_action!(
  bot: phoenix_dump,
  position_x: 6966.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 12
)

node_map[102610] = create_condition!(
  bot: phoenix_dump,
  position_x: 7106.666687011719,
  position_y: 2384.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102611] = create_condition!(
  bot: phoenix_dump,
  position_x: 7186.666687011719,
  position_y: 2534.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102612] = create_condition!(
  bot: phoenix_dump,
  position_x: 7106.666687011719,
  position_y: 2684.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102613] = create_condition!(
  bot: phoenix_dump,
  position_x: 7106.666687011719,
  position_y: 2834.0,
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

node_map[102614] = create_action!(
  bot: phoenix_dump,
  position_x: 7186.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 11
)

node_map[102615] = create_condition!(
  bot: phoenix_dump,
  position_x: 7366.666687011719,
  position_y: 2834.0,
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

node_map[102616] = create_action!(
  bot: phoenix_dump,
  position_x: 7446.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 11
)

node_map[102617] = create_condition!(
  bot: phoenix_dump,
  position_x: 7586.666687011719,
  position_y: 2384.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102618] = create_condition!(
  bot: phoenix_dump,
  position_x: 7586.666687011719,
  position_y: 2534.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102619] = create_condition!(
  bot: phoenix_dump,
  position_x: 7586.666687011719,
  position_y: 2684.0,
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

node_map[102620] = create_action!(
  bot: phoenix_dump,
  position_x: 7666.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[102621] = create_condition!(
  bot: phoenix_dump,
  position_x: 7846.666687011719,
  position_y: 2684.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102622] = create_action!(
  bot: phoenix_dump,
  position_x: 7926.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[102623] = create_condition!(
  bot: phoenix_dump,
  position_x: 8066.666687011719,
  position_y: 2534.0,
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

node_map[102624] = create_condition!(
  bot: phoenix_dump,
  position_x: 8066.666687011719,
  position_y: 2684.0,
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

node_map[102625] = create_action!(
  bot: phoenix_dump,
  position_x: 8146.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[102626] = create_condition!(
  bot: phoenix_dump,
  position_x: 8326.666687011719,
  position_y: 2684.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102627] = create_action!(
  bot: phoenix_dump,
  position_x: 8406.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[102628] = create_condition!(
  bot: phoenix_dump,
  position_x: -3334.6597900390625,
  position_y: 1992.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[102629] = create_condition!(
  bot: phoenix_dump,
  position_x: -3274.6597900390625,
  position_y: 2142.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102630] = create_action!(
  bot: phoenix_dump,
  position_x: -3334.6597900390625,
  position_y: 2292.0,
  action_type: "return",
  value: 110
)

node_map[102631] = create_action!(
  bot: phoenix_dump,
  position_x: -3014.6597900390625,
  position_y: 2142.0,
  action_type: "return",
  value: 100
)

node_map[102632] = create_condition!(
  bot: phoenix_dump,
  position_x: -1278.665771484375,
  position_y: 3388.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102633] = create_condition!(
  bot: phoenix_dump,
  position_x: -1218.665771484375,
  position_y: 3538.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102634] = create_action!(
  bot: phoenix_dump,
  position_x: -1278.665771484375,
  position_y: 3688.0,
  action_type: "return",
  value: 92
)

node_map[102635] = create_condition!(
  bot: phoenix_dump,
  position_x: -998.665771484375,
  position_y: 3252.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102636] = create_condition!(
  bot: phoenix_dump,
  position_x: -938.665771484375,
  position_y: 3402.0,
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

node_map[102637] = create_condition!(
  bot: phoenix_dump,
  position_x: -998.665771484375,
  position_y: 3552.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102638] = create_action!(
  bot: phoenix_dump,
  position_x: -938.665771484375,
  position_y: 3702.0,
  action_type: "return",
  value: 55
)

node_map[102639] = create_condition!(
  bot: phoenix_dump,
  position_x: -758.665771484375,
  position_y: 3552.0,
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

node_map[102640] = create_action!(
  bot: phoenix_dump,
  position_x: -698.665771484375,
  position_y: 3702.0,
  action_type: "return",
  value: 55
)

node_map[102641] = create_condition!(
  bot: phoenix_dump,
  position_x: -490.665771484375,
  position_y: 3400.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102642] = create_condition!(
  bot: phoenix_dump,
  position_x: -430.665771484375,
  position_y: 3550.0,
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

node_map[102643] = create_condition!(
  bot: phoenix_dump,
  position_x: -490.665771484375,
  position_y: 3700.0,
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

node_map[102644] = create_condition!(
  bot: phoenix_dump,
  position_x: -430.665771484375,
  position_y: 3850.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102645] = create_action!(
  bot: phoenix_dump,
  position_x: -490.665771484375,
  position_y: 4000.0,
  action_type: "return",
  value: 46
)

node_map[102646] = create_condition!(
  bot: phoenix_dump,
  position_x: -1210.665771484375,
  position_y: 2024.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102647] = create_condition!(
  bot: phoenix_dump,
  position_x: -1150.665771484375,
  position_y: 2174.0,
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

node_map[102648] = create_action!(
  bot: phoenix_dump,
  position_x: -1210.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 48
)

node_map[102649] = create_condition!(
  bot: phoenix_dump,
  position_x: -890.665771484375,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102650] = create_condition!(
  bot: phoenix_dump,
  position_x: -950.665771484375,
  position_y: 2324.0,
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

node_map[102651] = create_condition!(
  bot: phoenix_dump,
  position_x: -890.665771484375,
  position_y: 2474.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102652] = create_action!(
  bot: phoenix_dump,
  position_x: -950.665771484375,
  position_y: 2624.0,
  action_type: "return",
  value: 48
)

node_map[102653] = create_condition!(
  bot: phoenix_dump,
  position_x: -630.665771484375,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102654] = create_action!(
  bot: phoenix_dump,
  position_x: -690.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 48
)

node_map[102655] = create_condition!(
  bot: phoenix_dump,
  position_x: -370.665771484375,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102656] = create_condition!(
  bot: phoenix_dump,
  position_x: -430.665771484375,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102657] = create_action!(
  bot: phoenix_dump,
  position_x: -370.665771484375,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[102658] = create_condition!(
  bot: phoenix_dump,
  position_x: -110.665771484375,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102659] = create_condition!(
  bot: phoenix_dump,
  position_x: -170.665771484375,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102660] = create_action!(
  bot: phoenix_dump,
  position_x: -110.665771484375,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[102661] = create_condition!(
  bot: phoenix_dump,
  position_x: 149.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102662] = create_condition!(
  bot: phoenix_dump,
  position_x: 89.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102663] = create_action!(
  bot: phoenix_dump,
  position_x: 149.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[102664] = create_condition!(
  bot: phoenix_dump,
  position_x: 409.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102665] = create_condition!(
  bot: phoenix_dump,
  position_x: 349.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102666] = create_action!(
  bot: phoenix_dump,
  position_x: 409.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[102667] = create_condition!(
  bot: phoenix_dump,
  position_x: -690.665771484375,
  position_y: 2024.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102668] = create_condition!(
  bot: phoenix_dump,
  position_x: -630.665771484375,
  position_y: 2174.0,
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

node_map[102669] = create_action!(
  bot: phoenix_dump,
  position_x: -690.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 40
)

node_map[102670] = create_condition!(
  bot: phoenix_dump,
  position_x: -370.665771484375,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102671] = create_condition!(
  bot: phoenix_dump,
  position_x: -430.665771484375,
  position_y: 2324.0,
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

node_map[102672] = create_condition!(
  bot: phoenix_dump,
  position_x: -370.665771484375,
  position_y: 2474.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102673] = create_action!(
  bot: phoenix_dump,
  position_x: -430.665771484375,
  position_y: 2624.0,
  action_type: "return",
  value: 40
)

node_map[102674] = create_condition!(
  bot: phoenix_dump,
  position_x: -110.665771484375,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102675] = create_action!(
  bot: phoenix_dump,
  position_x: -170.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 40
)

node_map[102676] = create_condition!(
  bot: phoenix_dump,
  position_x: 149.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102677] = create_condition!(
  bot: phoenix_dump,
  position_x: 89.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102678] = create_action!(
  bot: phoenix_dump,
  position_x: 149.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[102679] = create_condition!(
  bot: phoenix_dump,
  position_x: 409.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102680] = create_condition!(
  bot: phoenix_dump,
  position_x: 349.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102681] = create_action!(
  bot: phoenix_dump,
  position_x: 409.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[102682] = create_condition!(
  bot: phoenix_dump,
  position_x: 669.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102683] = create_condition!(
  bot: phoenix_dump,
  position_x: 609.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102684] = create_action!(
  bot: phoenix_dump,
  position_x: 669.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[102685] = create_condition!(
  bot: phoenix_dump,
  position_x: 929.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102686] = create_condition!(
  bot: phoenix_dump,
  position_x: 869.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102687] = create_action!(
  bot: phoenix_dump,
  position_x: 929.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[102688] = create_condition!(
  bot: phoenix_dump,
  position_x: -170.665771484375,
  position_y: 2024.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"bishop",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102689] = create_condition!(
  bot: phoenix_dump,
  position_x: -110.665771484375,
  position_y: 2174.0,
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

node_map[102690] = create_action!(
  bot: phoenix_dump,
  position_x: -170.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[102691] = create_condition!(
  bot: phoenix_dump,
  position_x: 149.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102692] = create_condition!(
  bot: phoenix_dump,
  position_x: 89.334228515625,
  position_y: 2324.0,
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

node_map[102693] = create_condition!(
  bot: phoenix_dump,
  position_x: 149.334228515625,
  position_y: 2474.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102694] = create_action!(
  bot: phoenix_dump,
  position_x: 89.334228515625,
  position_y: 2624.0,
  action_type: "return",
  value: 34
)

node_map[102695] = create_condition!(
  bot: phoenix_dump,
  position_x: 409.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102696] = create_action!(
  bot: phoenix_dump,
  position_x: 349.334228515625,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[102697] = create_condition!(
  bot: phoenix_dump,
  position_x: 669.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102698] = create_condition!(
  bot: phoenix_dump,
  position_x: 609.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102699] = create_action!(
  bot: phoenix_dump,
  position_x: 669.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102700] = create_condition!(
  bot: phoenix_dump,
  position_x: 929.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102701] = create_condition!(
  bot: phoenix_dump,
  position_x: 869.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102702] = create_action!(
  bot: phoenix_dump,
  position_x: 929.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102703] = create_condition!(
  bot: phoenix_dump,
  position_x: 1189.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102704] = create_condition!(
  bot: phoenix_dump,
  position_x: 1129.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102705] = create_action!(
  bot: phoenix_dump,
  position_x: 1189.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102706] = create_condition!(
  bot: phoenix_dump,
  position_x: 1449.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102707] = create_condition!(
  bot: phoenix_dump,
  position_x: 1389.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102708] = create_action!(
  bot: phoenix_dump,
  position_x: 1449.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102709] = create_condition!(
  bot: phoenix_dump,
  position_x: 349.334228515625,
  position_y: 2024.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"knight",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102710] = create_condition!(
  bot: phoenix_dump,
  position_x: 409.334228515625,
  position_y: 2174.0,
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

node_map[102711] = create_action!(
  bot: phoenix_dump,
  position_x: 349.334228515625,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[102712] = create_condition!(
  bot: phoenix_dump,
  position_x: 669.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102713] = create_condition!(
  bot: phoenix_dump,
  position_x: 609.334228515625,
  position_y: 2324.0,
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

node_map[102714] = create_condition!(
  bot: phoenix_dump,
  position_x: 669.334228515625,
  position_y: 2474.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102715] = create_action!(
  bot: phoenix_dump,
  position_x: 609.334228515625,
  position_y: 2624.0,
  action_type: "return",
  value: 34
)

node_map[102716] = create_condition!(
  bot: phoenix_dump,
  position_x: 929.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102717] = create_action!(
  bot: phoenix_dump,
  position_x: 869.334228515625,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[102718] = create_condition!(
  bot: phoenix_dump,
  position_x: 1189.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102719] = create_condition!(
  bot: phoenix_dump,
  position_x: 1129.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102720] = create_action!(
  bot: phoenix_dump,
  position_x: 1189.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102721] = create_condition!(
  bot: phoenix_dump,
  position_x: 1449.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102722] = create_condition!(
  bot: phoenix_dump,
  position_x: 1389.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102723] = create_action!(
  bot: phoenix_dump,
  position_x: 1449.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102724] = create_condition!(
  bot: phoenix_dump,
  position_x: 1709.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102725] = create_condition!(
  bot: phoenix_dump,
  position_x: 1649.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102726] = create_action!(
  bot: phoenix_dump,
  position_x: 1709.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102727] = create_condition!(
  bot: phoenix_dump,
  position_x: 1969.334228515625,
  position_y: 2174.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102728] = create_condition!(
  bot: phoenix_dump,
  position_x: 1909.334228515625,
  position_y: 2324.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102729] = create_action!(
  bot: phoenix_dump,
  position_x: 1969.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[102730] = create_condition!(
  bot: phoenix_dump,
  position_x: -3202.665771484375,
  position_y: 2654.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102731] = create_condition!(
  bot: phoenix_dump,
  position_x: -3142.665771484375,
  position_y: 2804.0,
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

node_map[102732] = create_action!(
  bot: phoenix_dump,
  position_x: -3202.665771484375,
  position_y: 2954.0,
  action_type: "return",
  value: 28
)

node_map[102733] = create_condition!(
  bot: phoenix_dump,
  position_x: -2882.665771484375,
  position_y: 2804.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102734] = create_condition!(
  bot: phoenix_dump,
  position_x: -2942.665771484375,
  position_y: 2954.0,
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

node_map[102735] = create_condition!(
  bot: phoenix_dump,
  position_x: -2882.665771484375,
  position_y: 3104.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102736] = create_action!(
  bot: phoenix_dump,
  position_x: -2942.665771484375,
  position_y: 3254.0,
  action_type: "return",
  value: 28
)

node_map[102737] = create_condition!(
  bot: phoenix_dump,
  position_x: -2622.665771484375,
  position_y: 2804.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102738] = create_action!(
  bot: phoenix_dump,
  position_x: -2682.665771484375,
  position_y: 2954.0,
  action_type: "return",
  value: 28
)

node_map[102739] = create_condition!(
  bot: phoenix_dump,
  position_x: -2362.665771484375,
  position_y: 2804.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102740] = create_condition!(
  bot: phoenix_dump,
  position_x: -2422.665771484375,
  position_y: 2954.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102741] = create_action!(
  bot: phoenix_dump,
  position_x: -2362.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[102742] = create_condition!(
  bot: phoenix_dump,
  position_x: -2102.665771484375,
  position_y: 2804.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102743] = create_condition!(
  bot: phoenix_dump,
  position_x: -2162.665771484375,
  position_y: 2954.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102744] = create_action!(
  bot: phoenix_dump,
  position_x: -2102.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[102745] = create_condition!(
  bot: phoenix_dump,
  position_x: -1842.665771484375,
  position_y: 2804.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102746] = create_condition!(
  bot: phoenix_dump,
  position_x: -1902.665771484375,
  position_y: 2954.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102747] = create_action!(
  bot: phoenix_dump,
  position_x: -1842.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[102748] = create_condition!(
  bot: phoenix_dump,
  position_x: -1582.665771484375,
  position_y: 2804.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102749] = create_condition!(
  bot: phoenix_dump,
  position_x: -1642.665771484375,
  position_y: 2954.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102750] = create_action!(
  bot: phoenix_dump,
  position_x: -1582.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[102751] = create_condition!(
  bot: phoenix_dump,
  position_x: -3294.665771484375,
  position_y: 3546.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"bishop",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102752] = create_condition!(
  bot: phoenix_dump,
  position_x: -3234.665771484375,
  position_y: 3696.0,
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

node_map[102753] = create_action!(
  bot: phoenix_dump,
  position_x: -3294.665771484375,
  position_y: 3846.0,
  action_type: "return",
  value: 26
)

node_map[102754] = create_condition!(
  bot: phoenix_dump,
  position_x: -2974.665771484375,
  position_y: 3696.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102755] = create_condition!(
  bot: phoenix_dump,
  position_x: -3034.665771484375,
  position_y: 3846.0,
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

node_map[102756] = create_condition!(
  bot: phoenix_dump,
  position_x: -2974.665771484375,
  position_y: 3996.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102757] = create_action!(
  bot: phoenix_dump,
  position_x: -3034.665771484375,
  position_y: 4146.0,
  action_type: "return",
  value: 26
)

node_map[102758] = create_condition!(
  bot: phoenix_dump,
  position_x: -2714.665771484375,
  position_y: 3696.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102759] = create_action!(
  bot: phoenix_dump,
  position_x: -2774.665771484375,
  position_y: 3846.0,
  action_type: "return",
  value: 26
)

node_map[102760] = create_condition!(
  bot: phoenix_dump,
  position_x: -2454.665771484375,
  position_y: 3696.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102761] = create_condition!(
  bot: phoenix_dump,
  position_x: -2514.665771484375,
  position_y: 3846.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102762] = create_action!(
  bot: phoenix_dump,
  position_x: -2454.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[102763] = create_condition!(
  bot: phoenix_dump,
  position_x: -2194.665771484375,
  position_y: 3696.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102764] = create_condition!(
  bot: phoenix_dump,
  position_x: -2254.665771484375,
  position_y: 3846.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102765] = create_action!(
  bot: phoenix_dump,
  position_x: -2194.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[102766] = create_condition!(
  bot: phoenix_dump,
  position_x: -1934.665771484375,
  position_y: 3696.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102767] = create_condition!(
  bot: phoenix_dump,
  position_x: -1994.665771484375,
  position_y: 3846.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102768] = create_action!(
  bot: phoenix_dump,
  position_x: -1934.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[102769] = create_condition!(
  bot: phoenix_dump,
  position_x: -1674.665771484375,
  position_y: 3696.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102770] = create_condition!(
  bot: phoenix_dump,
  position_x: -1734.665771484375,
  position_y: 3846.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102771] = create_action!(
  bot: phoenix_dump,
  position_x: -1674.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[102772] = create_condition!(
  bot: phoenix_dump,
  position_x: -2638.665771484375,
  position_y: 4170.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"knight",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102773] = create_condition!(
  bot: phoenix_dump,
  position_x: -2578.665771484375,
  position_y: 4320.0,
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

node_map[102774] = create_action!(
  bot: phoenix_dump,
  position_x: -2638.665771484375,
  position_y: 4470.0,
  action_type: "return",
  value: 26
)

node_map[102775] = create_condition!(
  bot: phoenix_dump,
  position_x: -2318.665771484375,
  position_y: 4320.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102776] = create_condition!(
  bot: phoenix_dump,
  position_x: -2378.665771484375,
  position_y: 4470.0,
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

node_map[102777] = create_condition!(
  bot: phoenix_dump,
  position_x: -2318.665771484375,
  position_y: 4620.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102778] = create_action!(
  bot: phoenix_dump,
  position_x: -2378.665771484375,
  position_y: 4770.0,
  action_type: "return",
  value: 26
)

node_map[102779] = create_condition!(
  bot: phoenix_dump,
  position_x: -2058.665771484375,
  position_y: 4320.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102780] = create_action!(
  bot: phoenix_dump,
  position_x: -2118.665771484375,
  position_y: 4470.0,
  action_type: "return",
  value: 26
)

node_map[102781] = create_condition!(
  bot: phoenix_dump,
  position_x: -1798.665771484375,
  position_y: 4320.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102782] = create_condition!(
  bot: phoenix_dump,
  position_x: -1858.665771484375,
  position_y: 4470.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102783] = create_action!(
  bot: phoenix_dump,
  position_x: -1798.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[102784] = create_condition!(
  bot: phoenix_dump,
  position_x: -1538.665771484375,
  position_y: 4320.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102785] = create_condition!(
  bot: phoenix_dump,
  position_x: -1598.665771484375,
  position_y: 4470.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102786] = create_action!(
  bot: phoenix_dump,
  position_x: -1538.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[102787] = create_condition!(
  bot: phoenix_dump,
  position_x: -1278.665771484375,
  position_y: 4320.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102788] = create_condition!(
  bot: phoenix_dump,
  position_x: -1338.665771484375,
  position_y: 4470.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102789] = create_action!(
  bot: phoenix_dump,
  position_x: -1278.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[102790] = create_condition!(
  bot: phoenix_dump,
  position_x: -1018.665771484375,
  position_y: 4320.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102791] = create_condition!(
  bot: phoenix_dump,
  position_x: -1078.665771484375,
  position_y: 4470.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102792] = create_action!(
  bot: phoenix_dump,
  position_x: -1018.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[102793] = create_condition!(
  bot: phoenix_dump,
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

node_map[102794] = create_condition!(
  bot: phoenix_dump,
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

node_map[102795] = create_condition!(
  bot: phoenix_dump,
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

node_map[102796] = create_action!(
  bot: phoenix_dump,
  position_x: 1890.0,
  position_y: 830.0,
  action_type: "return",
  value: 80
)

node_map[102797] = create_condition!(
  bot: phoenix_dump,
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

node_map[102798] = create_action!(
  bot: phoenix_dump,
  position_x: 2150.0,
  position_y: 830.0,
  action_type: "return",
  value: 80
)

node_map[102799] = create_condition!(
  bot: phoenix_dump,
  position_x: 2340.0,
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

node_map[102800] = create_condition!(
  bot: phoenix_dump,
  position_x: 2410.0,
  position_y: 680.0,
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

node_map[102801] = create_condition!(
  bot: phoenix_dump,
  position_x: 2340.0,
  position_y: 830.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102802] = create_action!(
  bot: phoenix_dump,
  position_x: 2410.0,
  position_y: 980.0,
  action_type: "add",
  value: 14
)

node_map[102803] = create_condition!(
  bot: phoenix_dump,
  position_x: 2600.0,
  position_y: 830.0,
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

node_map[102804] = create_action!(
  bot: phoenix_dump,
  position_x: 2670.0,
  position_y: 980.0,
  action_type: "add",
  value: 14
)

node_map[102805] = create_condition!(
  bot: phoenix_dump,
  position_x: 2860.0,
  position_y: 830.0,
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

node_map[102806] = create_action!(
  bot: phoenix_dump,
  position_x: 2930.0,
  position_y: 980.0,
  action_type: "add",
  value: 8
)

node_map[102807] = create_condition!(
  bot: phoenix_dump,
  position_x: 3120.0,
  position_y: 830.0,
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

node_map[102808] = create_action!(
  bot: phoenix_dump,
  position_x: 3190.0,
  position_y: 980.0,
  action_type: "add",
  value: 8
)

node_map[102809] = create_condition!(
  bot: phoenix_dump,
  position_x: 3380.0,
  position_y: 830.0,
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

node_map[102810] = create_action!(
  bot: phoenix_dump,
  position_x: 3450.0,
  position_y: 980.0,
  action_type: "add",
  value: 8
)

node_map[102811] = create_condition!(
  bot: phoenix_dump,
  position_x: 3640.0,
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

node_map[102812] = create_action!(
  bot: phoenix_dump,
  position_x: 3710.0,
  position_y: 680.0,
  action_type: "return",
  value: -120
)

node_map[102813] = create_condition!(
  bot: phoenix_dump,
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
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102814] = create_condition!(
  bot: phoenix_dump,
  position_x: 3970.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102815] = create_action!(
  bot: phoenix_dump,
  position_x: 3900.0,
  position_y: 830.0,
  action_type: "return",
  value: -120
)

node_map[102816] = create_condition!(
  bot: phoenix_dump,
  position_x: 4160.0,
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

node_map[102817] = create_condition!(
  bot: phoenix_dump,
  position_x: 4230.0,
  position_y: 680.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102818] = create_condition!(
  bot: phoenix_dump,
  position_x: 4160.0,
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

node_map[102819] = create_action!(
  bot: phoenix_dump,
  position_x: 4230.0,
  position_y: 980.0,
  action_type: "subtract",
  value: 12
)

node_map[102820] = create_condition!(
  bot: phoenix_dump,
  position_x: 432.0,
  position_y: 3488.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102821] = create_condition!(
  bot: phoenix_dump,
  position_x: 432.0,
  position_y: 3638.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102822] = create_condition!(
  bot: phoenix_dump,
  position_x: 432.0,
  position_y: 3788.0,
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

node_map[102823] = create_action!(
  bot: phoenix_dump,
  position_x: 502.0,
  position_y: 3938.0,
  action_type: "return",
  value: 34
)

node_map[102824] = create_action!(
  bot: phoenix_dump,
  position_x: 1052.0,
  position_y: 3788.0,
  action_type: "add",
  value: 12
)

node_map[102825] = create_condition!(
  bot: phoenix_dump,
  position_x: 852.0,
  position_y: 3638.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102826] = create_action!(
  bot: phoenix_dump,
  position_x: 922.0,
  position_y: 3788.0,
  action_type: "add",
  value: 16
)

node_map[102827] = create_condition!(
  bot: phoenix_dump,
  position_x: 1332.0,
  position_y: 3488.0,
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

node_map[102828] = create_condition!(
  bot: phoenix_dump,
  position_x: 1332.0,
  position_y: 3638.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102829] = create_condition!(
  bot: phoenix_dump,
  position_x: 1332.0,
  position_y: 3788.0,
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

node_map[102830] = create_action!(
  bot: phoenix_dump,
  position_x: 1402.0,
  position_y: 3938.0,
  action_type: "return",
  value: 34
)

node_map[102831] = create_action!(
  bot: phoenix_dump,
  position_x: 1952.0,
  position_y: 3788.0,
  action_type: "add",
  value: 12
)

node_map[102832] = create_condition!(
  bot: phoenix_dump,
  position_x: 1752.0,
  position_y: 3638.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102833] = create_action!(
  bot: phoenix_dump,
  position_x: 1822.0,
  position_y: 3788.0,
  action_type: "add",
  value: 16
)

node_map[102834] = create_condition!(
  bot: phoenix_dump,
  position_x: 1272.0,
  position_y: 4628.0,
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

node_map[102835] = create_condition!(
  bot: phoenix_dump,
  position_x: 1272.0,
  position_y: 4778.0,
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

node_map[102836] = create_condition!(
  bot: phoenix_dump,
  position_x: 1342.0,
  position_y: 4928.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102837] = create_condition!(
  bot: phoenix_dump,
  position_x: 1272.0,
  position_y: 5348.0,
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

node_map[102838] = create_condition!(
  bot: phoenix_dump,
  position_x: 1342.0,
  position_y: 5498.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102839] = create_condition!(
  bot: phoenix_dump,
  position_x: 1512.0,
  position_y: 5078.0,
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

node_map[102840] = create_action!(
  bot: phoenix_dump,
  position_x: 1582.0,
  position_y: 5228.0,
  action_type: "return",
  value: 32
)

node_map[102841] = create_condition!(
  bot: phoenix_dump,
  position_x: 1512.0,
  position_y: 5648.0,
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

node_map[102842] = create_action!(
  bot: phoenix_dump,
  position_x: 1582.0,
  position_y: 5798.0,
  action_type: "return",
  value: 32
)

node_map[102843] = create_condition!(
  bot: phoenix_dump,
  position_x: 1752.0,
  position_y: 5078.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102844] = create_condition!(
  bot: phoenix_dump,
  position_x: 1822.0,
  position_y: 5228.0,
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

node_map[102845] = create_condition!(
  bot: phoenix_dump,
  position_x: 1752.0,
  position_y: 5378.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102846] = create_action!(
  bot: phoenix_dump,
  position_x: 1822.0,
  position_y: 5528.0,
  action_type: "return",
  value: 32
)

node_map[102847] = create_condition!(
  bot: phoenix_dump,
  position_x: 1752.0,
  position_y: 5648.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102848] = create_condition!(
  bot: phoenix_dump,
  position_x: 1822.0,
  position_y: 5798.0,
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

node_map[102849] = create_condition!(
  bot: phoenix_dump,
  position_x: 1752.0,
  position_y: 5948.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102850] = create_action!(
  bot: phoenix_dump,
  position_x: 1822.0,
  position_y: 6098.0,
  action_type: "return",
  value: 32
)

node_map[102851] = create_condition!(
  bot: phoenix_dump,
  position_x: 1992.0,
  position_y: 5078.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102852] = create_action!(
  bot: phoenix_dump,
  position_x: 2062.0,
  position_y: 5228.0,
  action_type: "return",
  value: 32
)

node_map[102853] = create_condition!(
  bot: phoenix_dump,
  position_x: 1992.0,
  position_y: 5648.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102854] = create_action!(
  bot: phoenix_dump,
  position_x: 2062.0,
  position_y: 5798.0,
  action_type: "return",
  value: 32
)

node_map[102855] = create_condition!(
  bot: phoenix_dump,
  position_x: 2232.0,
  position_y: 5078.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102856] = create_condition!(
  bot: phoenix_dump,
  position_x: 2302.0,
  position_y: 5228.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102857] = create_action!(
  bot: phoenix_dump,
  position_x: 2232.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[102858] = create_condition!(
  bot: phoenix_dump,
  position_x: 2232.0,
  position_y: 5648.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102859] = create_condition!(
  bot: phoenix_dump,
  position_x: 2302.0,
  position_y: 5798.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102860] = create_action!(
  bot: phoenix_dump,
  position_x: 2232.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[102861] = create_condition!(
  bot: phoenix_dump,
  position_x: 2472.0,
  position_y: 5078.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102862] = create_condition!(
  bot: phoenix_dump,
  position_x: 2542.0,
  position_y: 5228.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102863] = create_action!(
  bot: phoenix_dump,
  position_x: 2472.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[102864] = create_condition!(
  bot: phoenix_dump,
  position_x: 2472.0,
  position_y: 5648.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102865] = create_condition!(
  bot: phoenix_dump,
  position_x: 2542.0,
  position_y: 5798.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102866] = create_action!(
  bot: phoenix_dump,
  position_x: 2472.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[102867] = create_condition!(
  bot: phoenix_dump,
  position_x: 2712.0,
  position_y: 5078.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102868] = create_condition!(
  bot: phoenix_dump,
  position_x: 2782.0,
  position_y: 5228.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102869] = create_action!(
  bot: phoenix_dump,
  position_x: 2712.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[102870] = create_condition!(
  bot: phoenix_dump,
  position_x: 2712.0,
  position_y: 5648.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102871] = create_condition!(
  bot: phoenix_dump,
  position_x: 2782.0,
  position_y: 5798.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102872] = create_action!(
  bot: phoenix_dump,
  position_x: 2712.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[102873] = create_condition!(
  bot: phoenix_dump,
  position_x: 2952.0,
  position_y: 5078.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102874] = create_condition!(
  bot: phoenix_dump,
  position_x: 3022.0,
  position_y: 5228.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102875] = create_action!(
  bot: phoenix_dump,
  position_x: 2952.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[102876] = create_condition!(
  bot: phoenix_dump,
  position_x: 2952.0,
  position_y: 5648.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102877] = create_condition!(
  bot: phoenix_dump,
  position_x: 3022.0,
  position_y: 5798.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102878] = create_action!(
  bot: phoenix_dump,
  position_x: 2952.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[102879] = create_condition!(
  bot: phoenix_dump,
  position_x: 3804.0,
  position_y: 1324.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[102880] = create_condition!(
  bot: phoenix_dump,
  position_x: 3874.0,
  position_y: 1474.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[102881] = create_condition!(
  bot: phoenix_dump,
  position_x: 3804.0,
  position_y: 1624.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102882] = create_condition!(
  bot: phoenix_dump,
  position_x: 3804.0,
  position_y: 1774.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102883] = create_action!(
  bot: phoenix_dump,
  position_x: 3874.0,
  position_y: 1924.0,
  action_type: "return",
  value: 88
)

node_map[102884] = create_condition!(
  bot: phoenix_dump,
  position_x: 4064.0,
  position_y: 1774.0,
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

node_map[102885] = create_action!(
  bot: phoenix_dump,
  position_x: 4134.0,
  position_y: 1924.0,
  action_type: "return",
  value: 88
)

node_map[102886] = create_condition!(
  bot: phoenix_dump,
  position_x: 4324.0,
  position_y: 1624.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102887] = create_condition!(
  bot: phoenix_dump,
  position_x: 4324.0,
  position_y: 1774.0,
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

node_map[102888] = create_action!(
  bot: phoenix_dump,
  position_x: 4394.0,
  position_y: 1924.0,
  action_type: "return",
  value: 22
)

node_map[102889] = create_condition!(
  bot: phoenix_dump,
  position_x: 4584.0,
  position_y: 1774.0,
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

node_map[102890] = create_action!(
  bot: phoenix_dump,
  position_x: 4654.0,
  position_y: 1924.0,
  action_type: "return",
  value: 22
)

node_map[102891] = create_condition!(
  bot: phoenix_dump,
  position_x: 4844.0,
  position_y: 1624.0,
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

node_map[102892] = create_condition!(
  bot: phoenix_dump,
  position_x: 4844.0,
  position_y: 1774.0,
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

node_map[102893] = create_action!(
  bot: phoenix_dump,
  position_x: 4914.0,
  position_y: 1924.0,
  action_type: "add",
  value: 14
)

node_map[102894] = create_condition!(
  bot: phoenix_dump,
  position_x: 5104.0,
  position_y: 1774.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102895] = create_action!(
  bot: phoenix_dump,
  position_x: 5174.0,
  position_y: 1924.0,
  action_type: "add",
  value: 14
)

node_map[102896] = create_condition!(
  bot: phoenix_dump,
  position_x: 5364.0,
  position_y: 1624.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102897] = create_condition!(
  bot: phoenix_dump,
  position_x: 5434.0,
  position_y: 1774.0,
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

node_map[102898] = create_condition!(
  bot: phoenix_dump,
  position_x: 5364.0,
  position_y: 1924.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102899] = create_action!(
  bot: phoenix_dump,
  position_x: 5434.0,
  position_y: 2074.0,
  action_type: "return",
  value: 32
)

node_map[102900] = create_condition!(
  bot: phoenix_dump,
  position_x: 5624.0,
  position_y: 1924.0,
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

node_map[102901] = create_action!(
  bot: phoenix_dump,
  position_x: 5694.0,
  position_y: 2074.0,
  action_type: "return",
  value: 32
)

node_map[102902] = create_condition!(
  bot: phoenix_dump,
  position_x: 5884.0,
  position_y: 1624.0,
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

node_map[102903] = create_condition!(
  bot: phoenix_dump,
  position_x: 5954.0,
  position_y: 1774.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102904] = create_condition!(
  bot: phoenix_dump,
  position_x: 5884.0,
  position_y: 1924.0,
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

node_map[102905] = create_action!(
  bot: phoenix_dump,
  position_x: 5954.0,
  position_y: 2074.0,
  action_type: "add",
  value: 8
)

node_map[102906] = create_condition!(
  bot: phoenix_dump,
  position_x: 6144.0,
  position_y: 1924.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102907] = create_action!(
  bot: phoenix_dump,
  position_x: 6214.0,
  position_y: 2074.0,
  action_type: "add",
  value: 8
)

node_map[102908] = create_condition!(
  bot: phoenix_dump,
  position_x: 4836.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102909] = create_condition!(
  bot: phoenix_dump,
  position_x: 4906.0,
  position_y: 3290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102910] = create_condition!(
  bot: phoenix_dump,
  position_x: 4836.0,
  position_y: 3440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102911] = create_condition!(
  bot: phoenix_dump,
  position_x: 4906.0,
  position_y: 3590.0,
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

node_map[102912] = create_condition!(
  bot: phoenix_dump,
  position_x: 4836.0,
  position_y: 3740.0,
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

node_map[102913] = create_action!(
  bot: phoenix_dump,
  position_x: 4906.0,
  position_y: 3890.0,
  action_type: "add",
  value: 7
)

node_map[102914] = create_condition!(
  bot: phoenix_dump,
  position_x: 5096.0,
  position_y: 3740.0,
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

node_map[102915] = create_action!(
  bot: phoenix_dump,
  position_x: 5166.0,
  position_y: 3890.0,
  action_type: "add",
  value: 7
)

node_map[102916] = create_condition!(
  bot: phoenix_dump,
  position_x: 5356.0,
  position_y: 3740.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102917] = create_condition!(
  bot: phoenix_dump,
  position_x: 5426.0,
  position_y: 3890.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102918] = create_action!(
  bot: phoenix_dump,
  position_x: 5356.0,
  position_y: 4040.0,
  action_type: "add",
  value: 7
)

node_map[102919] = create_condition!(
  bot: phoenix_dump,
  position_x: 5616.0,
  position_y: 3440.0,
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

node_map[102920] = create_condition!(
  bot: phoenix_dump,
  position_x: 5686.0,
  position_y: 3590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102921] = create_action!(
  bot: phoenix_dump,
  position_x: 5616.0,
  position_y: 3740.0,
  action_type: "add",
  value: 5
)

node_map[102922] = create_condition!(
  bot: phoenix_dump,
  position_x: 5876.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102923] = create_condition!(
  bot: phoenix_dump,
  position_x: 5946.0,
  position_y: 3290.0,
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

node_map[102924] = create_condition!(
  bot: phoenix_dump,
  position_x: 5876.0,
  position_y: 3440.0,
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

node_map[102925] = create_condition!(
  bot: phoenix_dump,
  position_x: 5946.0,
  position_y: 3590.0,
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

node_map[102926] = create_action!(
  bot: phoenix_dump,
  position_x: 5876.0,
  position_y: 3740.0,
  action_type: "return",
  value: 26
)

node_map[102927] = create_condition!(
  bot: phoenix_dump,
  position_x: 6136.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102928] = create_condition!(
  bot: phoenix_dump,
  position_x: 6136.0,
  position_y: 3290.0,
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

node_map[102929] = create_condition!(
  bot: phoenix_dump,
  position_x: 6206.0,
  position_y: 3440.0,
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

node_map[102930] = create_condition!(
  bot: phoenix_dump,
  position_x: 6136.0,
  position_y: 3590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102931] = create_action!(
  bot: phoenix_dump,
  position_x: 6206.0,
  position_y: 3740.0,
  action_type: "return",
  value: 18
)

node_map[102932] = create_condition!(
  bot: phoenix_dump,
  position_x: 6396.0,
  position_y: 3290.0,
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

node_map[102933] = create_condition!(
  bot: phoenix_dump,
  position_x: 6466.0,
  position_y: 3440.0,
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

node_map[102934] = create_condition!(
  bot: phoenix_dump,
  position_x: 6396.0,
  position_y: 3590.0,
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

node_map[102935] = create_action!(
  bot: phoenix_dump,
  position_x: 6466.0,
  position_y: 3740.0,
  action_type: "return",
  value: 18
)

node_map[102936] = create_condition!(
  bot: phoenix_dump,
  position_x: 6656.0,
  position_y: 3140.0,
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

node_map[102937] = create_condition!(
  bot: phoenix_dump,
  position_x: 6656.0,
  position_y: 3290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102938] = create_condition!(
  bot: phoenix_dump,
  position_x: 6726.0,
  position_y: 3440.0,
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

node_map[102939] = create_action!(
  bot: phoenix_dump,
  position_x: 6656.0,
  position_y: 3590.0,
  action_type: "add",
  value: 8
)

node_map[102940] = create_condition!(
  bot: phoenix_dump,
  position_x: 6986.0,
  position_y: 3440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102941] = create_action!(
  bot: phoenix_dump,
  position_x: 6916.0,
  position_y: 3590.0,
  action_type: "add",
  value: 8
)

node_map[102942] = create_condition!(
  bot: phoenix_dump,
  position_x: 7176.0,
  position_y: 3860.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102943] = create_condition!(
  bot: phoenix_dump,
  position_x: 7246.0,
  position_y: 4010.0,
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

node_map[102944] = create_action!(
  bot: phoenix_dump,
  position_x: 7176.0,
  position_y: 4160.0,
  action_type: "add",
  value: 8
)

node_map[102945] = create_condition!(
  bot: phoenix_dump,
  position_x: 7506.0,
  position_y: 4010.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102946] = create_action!(
  bot: phoenix_dump,
  position_x: 7436.0,
  position_y: 4160.0,
  action_type: "add",
  value: 8
)

node_map[102947] = create_condition!(
  bot: phoenix_dump,
  position_x: 7176.0,
  position_y: 3140.0,
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

node_map[102948] = create_condition!(
  bot: phoenix_dump,
  position_x: 7176.0,
  position_y: 3290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102949] = create_condition!(
  bot: phoenix_dump,
  position_x: 7246.0,
  position_y: 3440.0,
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

node_map[102950] = create_action!(
  bot: phoenix_dump,
  position_x: 7176.0,
  position_y: 3590.0,
  action_type: "add",
  value: 6
)

node_map[102951] = create_condition!(
  bot: phoenix_dump,
  position_x: 7506.0,
  position_y: 3440.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102952] = create_action!(
  bot: phoenix_dump,
  position_x: 7436.0,
  position_y: 3590.0,
  action_type: "add",
  value: 6
)

node_map[102953] = create_condition!(
  bot: phoenix_dump,
  position_x: 7696.0,
  position_y: 3860.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102954] = create_condition!(
  bot: phoenix_dump,
  position_x: 7766.0,
  position_y: 4010.0,
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

node_map[102955] = create_action!(
  bot: phoenix_dump,
  position_x: 7696.0,
  position_y: 4160.0,
  action_type: "add",
  value: 6
)

node_map[102956] = create_condition!(
  bot: phoenix_dump,
  position_x: 8026.0,
  position_y: 4010.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102957] = create_action!(
  bot: phoenix_dump,
  position_x: 7956.0,
  position_y: 4160.0,
  action_type: "add",
  value: 6
)

node_map[102958] = create_condition!(
  bot: phoenix_dump,
  position_x: 7696.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102959] = create_condition!(
  bot: phoenix_dump,
  position_x: 7766.0,
  position_y: 3290.0,
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

node_map[102960] = create_condition!(
  bot: phoenix_dump,
  position_x: 7696.0,
  position_y: 3440.0,
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

node_map[102961] = create_condition!(
  bot: phoenix_dump,
  position_x: 7766.0,
  position_y: 3590.0,
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

node_map[102962] = create_action!(
  bot: phoenix_dump,
  position_x: 7696.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 10
)

node_map[102963] = create_condition!(
  bot: phoenix_dump,
  position_x: 7696.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102964] = create_condition!(
  bot: phoenix_dump,
  position_x: 7766.0,
  position_y: 3290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102965] = create_condition!(
  bot: phoenix_dump,
  position_x: 7696.0,
  position_y: 3440.0,
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

node_map[102966] = create_action!(
  bot: phoenix_dump,
  position_x: 7766.0,
  position_y: 3590.0,
  action_type: "subtract",
  value: 6
)

node_map[102967] = create_condition!(
  bot: phoenix_dump,
  position_x: 8026.0,
  position_y: 3590.0,
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

node_map[102968] = create_action!(
  bot: phoenix_dump,
  position_x: 7956.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[102969] = create_condition!(
  bot: phoenix_dump,
  position_x: 8286.0,
  position_y: 3590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102970] = create_action!(
  bot: phoenix_dump,
  position_x: 8216.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[102971] = create_condition!(
  bot: phoenix_dump,
  position_x: 7956.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102972] = create_condition!(
  bot: phoenix_dump,
  position_x: 8026.0,
  position_y: 3290.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102973] = create_condition!(
  bot: phoenix_dump,
  position_x: 7956.0,
  position_y: 3440.0,
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

node_map[102974] = create_action!(
  bot: phoenix_dump,
  position_x: 8026.0,
  position_y: 3590.0,
  action_type: "subtract",
  value: 6
)

node_map[102975] = create_condition!(
  bot: phoenix_dump,
  position_x: 8286.0,
  position_y: 3590.0,
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

node_map[102976] = create_action!(
  bot: phoenix_dump,
  position_x: 8216.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[102977] = create_condition!(
  bot: phoenix_dump,
  position_x: 8546.0,
  position_y: 3590.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102978] = create_action!(
  bot: phoenix_dump,
  position_x: 8476.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[102979] = create_condition!(
  bot: phoenix_dump,
  position_x: 9256.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102980] = create_action!(
  bot: phoenix_dump,
  position_x: 9326.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 18
)

node_map[102981] = create_condition!(
  bot: phoenix_dump,
  position_x: 9516.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102982] = create_action!(
  bot: phoenix_dump,
  position_x: 9586.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 14
)

node_map[102983] = create_condition!(
  bot: phoenix_dump,
  position_x: 9776.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102984] = create_action!(
  bot: phoenix_dump,
  position_x: 9846.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 10
)

node_map[102985] = create_condition!(
  bot: phoenix_dump,
  position_x: 10036.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"bishop",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102986] = create_action!(
  bot: phoenix_dump,
  position_x: 10106.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 12
)

node_map[102987] = create_condition!(
  bot: phoenix_dump,
  position_x: 10296.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"knight",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102988] = create_action!(
  bot: phoenix_dump,
  position_x: 10366.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 12
)

node_map[102989] = create_condition!(
  bot: phoenix_dump,
  position_x: 10556.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"bishop",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102990] = create_action!(
  bot: phoenix_dump,
  position_x: 10626.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 8
)

node_map[102991] = create_condition!(
  bot: phoenix_dump,
  position_x: 10816.0,
  position_y: 3140.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"knight",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonValue"=>"prior_board_state"}
)

node_map[102992] = create_action!(
  bot: phoenix_dump,
  position_x: 10886.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 8
)

node_map[102993] = create_organizer!(
  bot: phoenix_dump,
  position_x: 10880.0,
  position_y: 1080.0,
  title: "Phoenix Conversion",
  notes: ""
)

node_map[102994] = create_organizer!(
  bot: phoenix_dump,
  position_x: 11380.0,
  position_y: 1080.0,
  title: "Phoenix Discipline",
  notes: ""
)

node_map[102995] = create_condition!(
  bot: phoenix_dump,
  position_x: 10740.0,
  position_y: 1240.0,
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

node_map[102996] = create_condition!(
  bot: phoenix_dump,
  position_x: 10740.0,
  position_y: 1390.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[102997] = create_condition!(
  bot: phoenix_dump,
  position_x: 10810.0,
  position_y: 1540.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102998] = create_condition!(
  bot: phoenix_dump,
  position_x: 10740.0,
  position_y: 1690.0,
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

node_map[102999] = create_action!(
  bot: phoenix_dump,
  position_x: 10810.0,
  position_y: 1840.0,
  action_type: "return",
  value: 24
)

node_map[103000] = create_condition!(
  bot: phoenix_dump,
  position_x: 11360.0,
  position_y: 1690.0,
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

node_map[103001] = create_action!(
  bot: phoenix_dump,
  position_x: 11430.0,
  position_y: 1840.0,
  action_type: "return",
  value: 22
)

node_map[103002] = create_condition!(
  bot: phoenix_dump,
  position_x: 11980.0,
  position_y: 1690.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103003] = create_condition!(
  bot: phoenix_dump,
  position_x: 12050.0,
  position_y: 1840.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103004] = create_condition!(
  bot: phoenix_dump,
  position_x: 11980.0,
  position_y: 1990.0,
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

node_map[103005] = create_action!(
  bot: phoenix_dump,
  position_x: 12050.0,
  position_y: 2140.0,
  action_type: "return",
  value: 36
)

node_map[103006] = create_condition!(
  bot: phoenix_dump,
  position_x: 11680.0,
  position_y: 1240.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103007] = create_condition!(
  bot: phoenix_dump,
  position_x: 11680.0,
  position_y: 1390.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103008] = create_condition!(
  bot: phoenix_dump,
  position_x: 11750.0,
  position_y: 1540.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103009] = create_condition!(
  bot: phoenix_dump,
  position_x: 11680.0,
  position_y: 1690.0,
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

node_map[103010] = create_action!(
  bot: phoenix_dump,
  position_x: 11750.0,
  position_y: 1840.0,
  action_type: "return",
  value: 24
)

node_map[103011] = create_condition!(
  bot: phoenix_dump,
  position_x: 12300.0,
  position_y: 1690.0,
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

node_map[103012] = create_action!(
  bot: phoenix_dump,
  position_x: 12370.0,
  position_y: 1840.0,
  action_type: "return",
  value: 22
)

node_map[103013] = create_condition!(
  bot: phoenix_dump,
  position_x: 12920.0,
  position_y: 1690.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103014] = create_condition!(
  bot: phoenix_dump,
  position_x: 12990.0,
  position_y: 1840.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103015] = create_condition!(
  bot: phoenix_dump,
  position_x: 12920.0,
  position_y: 1990.0,
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

node_map[103016] = create_action!(
  bot: phoenix_dump,
  position_x: 12990.0,
  position_y: 2140.0,
  action_type: "return",
  value: 36
)

node_map[103017] = create_condition!(
  bot: phoenix_dump,
  position_x: 11240.0,
  position_y: 1240.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103018] = create_condition!(
  bot: phoenix_dump,
  position_x: 11240.0,
  position_y: 1390.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103019] = create_condition!(
  bot: phoenix_dump,
  position_x: 11310.0,
  position_y: 1540.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103020] = create_condition!(
  bot: phoenix_dump,
  position_x: 11240.0,
  position_y: 1690.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103021] = create_condition!(
  bot: phoenix_dump,
  position_x: 11310.0,
  position_y: 1840.0,
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

node_map[103022] = create_action!(
  bot: phoenix_dump,
  position_x: 11240.0,
  position_y: 1990.0,
  action_type: "subtract",
  value: 18
)

node_map[103023] = create_condition!(
  bot: phoenix_dump,
  position_x: 11570.0,
  position_y: 1840.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[103024] = create_action!(
  bot: phoenix_dump,
  position_x: 11500.0,
  position_y: 1990.0,
  action_type: "subtract",
  value: 18
)

node_map[103025] = create_condition!(
  bot: phoenix_dump,
  position_x: 11760.0,
  position_y: 1390.0,
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

node_map[103026] = create_condition!(
  bot: phoenix_dump,
  position_x: 11830.0,
  position_y: 1540.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103027] = create_condition!(
  bot: phoenix_dump,
  position_x: 11760.0,
  position_y: 1690.0,
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

node_map[103028] = create_action!(
  bot: phoenix_dump,
  position_x: 11830.0,
  position_y: 1840.0,
  action_type: "subtract",
  value: 18
)

connect!(node_map[102575], node_map[102576])
connect!(node_map[102575], node_map[102577])
connect!(node_map[102575], node_map[102578])
connect!(node_map[102575], node_map[102579])
connect!(node_map[102575], node_map[102580])
connect!(node_map[102575], node_map[102581])
connect!(node_map[102575], node_map[102582])
connect!(node_map[102575], node_map[102993])
connect!(node_map[102575], node_map[102994])
connect!(node_map[102576], node_map[102583])
connect!(node_map[102576], node_map[102586])
connect!(node_map[102577], node_map[102589])
connect!(node_map[102578], node_map[102628])
connect!(node_map[102578], node_map[102632])
connect!(node_map[102578], node_map[102635])
connect!(node_map[102578], node_map[102641])
connect!(node_map[102578], node_map[102646])
connect!(node_map[102578], node_map[102667])
connect!(node_map[102578], node_map[102688])
connect!(node_map[102578], node_map[102709])
connect!(node_map[102578], node_map[102730])
connect!(node_map[102578], node_map[102751])
connect!(node_map[102578], node_map[102772])
connect!(node_map[102579], node_map[102793])
connect!(node_map[102580], node_map[102820])
connect!(node_map[102580], node_map[102827])
connect!(node_map[102580], node_map[102834])
connect!(node_map[102581], node_map[102879])
connect!(node_map[102582], node_map[102908])
connect!(node_map[102582], node_map[102922])
connect!(node_map[102582], node_map[102927])
connect!(node_map[102582], node_map[102936])
connect!(node_map[102582], node_map[102947])
connect!(node_map[102582], node_map[102958])
connect!(node_map[102582], node_map[102963])
connect!(node_map[102582], node_map[102971])
connect!(node_map[102582], node_map[102979])
connect!(node_map[102582], node_map[102981])
connect!(node_map[102582], node_map[102983])
connect!(node_map[102582], node_map[102985])
connect!(node_map[102582], node_map[102987])
connect!(node_map[102582], node_map[102989])
connect!(node_map[102582], node_map[102991])
connect!(node_map[102583], node_map[102584])
connect!(node_map[102584], node_map[102585])
connect!(node_map[102586], node_map[102587])
connect!(node_map[102587], node_map[102588])
connect!(node_map[102589], node_map[102590])
connect!(node_map[102590], node_map[102591])
connect!(node_map[102591], node_map[102592])
connect!(node_map[102592], node_map[102593])
connect!(node_map[102593], node_map[102594])
connect!(node_map[102594], node_map[102595])
connect!(node_map[102595], node_map[102596])
connect!(node_map[102596], node_map[102597])
connect!(node_map[102597], node_map[102598])
connect!(node_map[102598], node_map[102599])
connect!(node_map[102599], node_map[102600])
connect!(node_map[102600], node_map[102601])
connect!(node_map[102601], node_map[102602])
connect!(node_map[102602], node_map[102603])
connect!(node_map[102602], node_map[102610])
connect!(node_map[102602], node_map[102617])
connect!(node_map[102603], node_map[102604])
connect!(node_map[102604], node_map[102605])
connect!(node_map[102605], node_map[102606])
connect!(node_map[102605], node_map[102608])
connect!(node_map[102606], node_map[102607])
connect!(node_map[102608], node_map[102609])
connect!(node_map[102610], node_map[102611])
connect!(node_map[102611], node_map[102612])
connect!(node_map[102612], node_map[102613])
connect!(node_map[102612], node_map[102615])
connect!(node_map[102613], node_map[102614])
connect!(node_map[102615], node_map[102616])
connect!(node_map[102617], node_map[102618])
connect!(node_map[102617], node_map[102623])
connect!(node_map[102618], node_map[102619])
connect!(node_map[102618], node_map[102621])
connect!(node_map[102619], node_map[102620])
connect!(node_map[102621], node_map[102622])
connect!(node_map[102623], node_map[102624])
connect!(node_map[102623], node_map[102626])
connect!(node_map[102624], node_map[102625])
connect!(node_map[102626], node_map[102627])
connect!(node_map[102628], node_map[102629])
connect!(node_map[102628], node_map[102631])
connect!(node_map[102629], node_map[102630])
connect!(node_map[102632], node_map[102633])
connect!(node_map[102633], node_map[102634])
connect!(node_map[102635], node_map[102636])
connect!(node_map[102636], node_map[102637])
connect!(node_map[102636], node_map[102639])
connect!(node_map[102637], node_map[102638])
connect!(node_map[102639], node_map[102640])
connect!(node_map[102641], node_map[102642])
connect!(node_map[102642], node_map[102643])
connect!(node_map[102643], node_map[102644])
connect!(node_map[102644], node_map[102645])
connect!(node_map[102646], node_map[102647])
connect!(node_map[102646], node_map[102649])
connect!(node_map[102646], node_map[102653])
connect!(node_map[102646], node_map[102655])
connect!(node_map[102646], node_map[102658])
connect!(node_map[102646], node_map[102661])
connect!(node_map[102646], node_map[102664])
connect!(node_map[102647], node_map[102648])
connect!(node_map[102649], node_map[102650])
connect!(node_map[102650], node_map[102651])
connect!(node_map[102651], node_map[102652])
connect!(node_map[102653], node_map[102654])
connect!(node_map[102655], node_map[102656])
connect!(node_map[102656], node_map[102657])
connect!(node_map[102658], node_map[102659])
connect!(node_map[102659], node_map[102660])
connect!(node_map[102661], node_map[102662])
connect!(node_map[102662], node_map[102663])
connect!(node_map[102664], node_map[102665])
connect!(node_map[102665], node_map[102666])
connect!(node_map[102667], node_map[102668])
connect!(node_map[102667], node_map[102670])
connect!(node_map[102667], node_map[102674])
connect!(node_map[102667], node_map[102676])
connect!(node_map[102667], node_map[102679])
connect!(node_map[102667], node_map[102682])
connect!(node_map[102667], node_map[102685])
connect!(node_map[102668], node_map[102669])
connect!(node_map[102670], node_map[102671])
connect!(node_map[102671], node_map[102672])
connect!(node_map[102672], node_map[102673])
connect!(node_map[102674], node_map[102675])
connect!(node_map[102676], node_map[102677])
connect!(node_map[102677], node_map[102678])
connect!(node_map[102679], node_map[102680])
connect!(node_map[102680], node_map[102681])
connect!(node_map[102682], node_map[102683])
connect!(node_map[102683], node_map[102684])
connect!(node_map[102685], node_map[102686])
connect!(node_map[102686], node_map[102687])
connect!(node_map[102688], node_map[102689])
connect!(node_map[102688], node_map[102691])
connect!(node_map[102688], node_map[102695])
connect!(node_map[102688], node_map[102697])
connect!(node_map[102688], node_map[102700])
connect!(node_map[102688], node_map[102703])
connect!(node_map[102688], node_map[102706])
connect!(node_map[102689], node_map[102690])
connect!(node_map[102691], node_map[102692])
connect!(node_map[102692], node_map[102693])
connect!(node_map[102693], node_map[102694])
connect!(node_map[102695], node_map[102696])
connect!(node_map[102697], node_map[102698])
connect!(node_map[102698], node_map[102699])
connect!(node_map[102700], node_map[102701])
connect!(node_map[102701], node_map[102702])
connect!(node_map[102703], node_map[102704])
connect!(node_map[102704], node_map[102705])
connect!(node_map[102706], node_map[102707])
connect!(node_map[102707], node_map[102708])
connect!(node_map[102709], node_map[102710])
connect!(node_map[102709], node_map[102712])
connect!(node_map[102709], node_map[102716])
connect!(node_map[102709], node_map[102718])
connect!(node_map[102709], node_map[102721])
connect!(node_map[102709], node_map[102724])
connect!(node_map[102709], node_map[102727])
connect!(node_map[102710], node_map[102711])
connect!(node_map[102712], node_map[102713])
connect!(node_map[102713], node_map[102714])
connect!(node_map[102714], node_map[102715])
connect!(node_map[102716], node_map[102717])
connect!(node_map[102718], node_map[102719])
connect!(node_map[102719], node_map[102720])
connect!(node_map[102721], node_map[102722])
connect!(node_map[102722], node_map[102723])
connect!(node_map[102724], node_map[102725])
connect!(node_map[102725], node_map[102726])
connect!(node_map[102727], node_map[102728])
connect!(node_map[102728], node_map[102729])
connect!(node_map[102730], node_map[102731])
connect!(node_map[102730], node_map[102733])
connect!(node_map[102730], node_map[102737])
connect!(node_map[102730], node_map[102739])
connect!(node_map[102730], node_map[102742])
connect!(node_map[102730], node_map[102745])
connect!(node_map[102730], node_map[102748])
connect!(node_map[102731], node_map[102732])
connect!(node_map[102733], node_map[102734])
connect!(node_map[102734], node_map[102735])
connect!(node_map[102735], node_map[102736])
connect!(node_map[102737], node_map[102738])
connect!(node_map[102739], node_map[102740])
connect!(node_map[102740], node_map[102741])
connect!(node_map[102742], node_map[102743])
connect!(node_map[102743], node_map[102744])
connect!(node_map[102745], node_map[102746])
connect!(node_map[102746], node_map[102747])
connect!(node_map[102748], node_map[102749])
connect!(node_map[102749], node_map[102750])
connect!(node_map[102751], node_map[102752])
connect!(node_map[102751], node_map[102754])
connect!(node_map[102751], node_map[102758])
connect!(node_map[102751], node_map[102760])
connect!(node_map[102751], node_map[102763])
connect!(node_map[102751], node_map[102766])
connect!(node_map[102751], node_map[102769])
connect!(node_map[102752], node_map[102753])
connect!(node_map[102754], node_map[102755])
connect!(node_map[102755], node_map[102756])
connect!(node_map[102756], node_map[102757])
connect!(node_map[102758], node_map[102759])
connect!(node_map[102760], node_map[102761])
connect!(node_map[102761], node_map[102762])
connect!(node_map[102763], node_map[102764])
connect!(node_map[102764], node_map[102765])
connect!(node_map[102766], node_map[102767])
connect!(node_map[102767], node_map[102768])
connect!(node_map[102769], node_map[102770])
connect!(node_map[102770], node_map[102771])
connect!(node_map[102772], node_map[102773])
connect!(node_map[102772], node_map[102775])
connect!(node_map[102772], node_map[102779])
connect!(node_map[102772], node_map[102781])
connect!(node_map[102772], node_map[102784])
connect!(node_map[102772], node_map[102787])
connect!(node_map[102772], node_map[102790])
connect!(node_map[102773], node_map[102774])
connect!(node_map[102775], node_map[102776])
connect!(node_map[102776], node_map[102777])
connect!(node_map[102777], node_map[102778])
connect!(node_map[102779], node_map[102780])
connect!(node_map[102781], node_map[102782])
connect!(node_map[102782], node_map[102783])
connect!(node_map[102784], node_map[102785])
connect!(node_map[102785], node_map[102786])
connect!(node_map[102787], node_map[102788])
connect!(node_map[102788], node_map[102789])
connect!(node_map[102790], node_map[102791])
connect!(node_map[102791], node_map[102792])
connect!(node_map[102793], node_map[102794])
connect!(node_map[102793], node_map[102799])
connect!(node_map[102793], node_map[102811])
connect!(node_map[102793], node_map[102813])
connect!(node_map[102793], node_map[102816])
connect!(node_map[102794], node_map[102795])
connect!(node_map[102794], node_map[102797])
connect!(node_map[102795], node_map[102796])
connect!(node_map[102797], node_map[102798])
connect!(node_map[102799], node_map[102800])
connect!(node_map[102800], node_map[102801])
connect!(node_map[102800], node_map[102803])
connect!(node_map[102800], node_map[102805])
connect!(node_map[102800], node_map[102807])
connect!(node_map[102800], node_map[102809])
connect!(node_map[102801], node_map[102802])
connect!(node_map[102803], node_map[102804])
connect!(node_map[102805], node_map[102806])
connect!(node_map[102807], node_map[102808])
connect!(node_map[102809], node_map[102810])
connect!(node_map[102811], node_map[102812])
connect!(node_map[102813], node_map[102814])
connect!(node_map[102814], node_map[102815])
connect!(node_map[102816], node_map[102817])
connect!(node_map[102817], node_map[102818])
connect!(node_map[102818], node_map[102819])
connect!(node_map[102820], node_map[102821])
connect!(node_map[102820], node_map[102825])
connect!(node_map[102821], node_map[102822])
connect!(node_map[102821], node_map[102824])
connect!(node_map[102822], node_map[102823])
connect!(node_map[102825], node_map[102826])
connect!(node_map[102827], node_map[102828])
connect!(node_map[102827], node_map[102832])
connect!(node_map[102828], node_map[102829])
connect!(node_map[102828], node_map[102831])
connect!(node_map[102829], node_map[102830])
connect!(node_map[102832], node_map[102833])
connect!(node_map[102834], node_map[102835])
connect!(node_map[102834], node_map[102837])
connect!(node_map[102835], node_map[102836])
connect!(node_map[102836], node_map[102839])
connect!(node_map[102836], node_map[102843])
connect!(node_map[102836], node_map[102851])
connect!(node_map[102836], node_map[102855])
connect!(node_map[102836], node_map[102861])
connect!(node_map[102836], node_map[102867])
connect!(node_map[102836], node_map[102873])
connect!(node_map[102837], node_map[102838])
connect!(node_map[102838], node_map[102841])
connect!(node_map[102838], node_map[102847])
connect!(node_map[102838], node_map[102853])
connect!(node_map[102838], node_map[102858])
connect!(node_map[102838], node_map[102864])
connect!(node_map[102838], node_map[102870])
connect!(node_map[102838], node_map[102876])
connect!(node_map[102839], node_map[102840])
connect!(node_map[102841], node_map[102842])
connect!(node_map[102843], node_map[102844])
connect!(node_map[102844], node_map[102845])
connect!(node_map[102845], node_map[102846])
connect!(node_map[102847], node_map[102848])
connect!(node_map[102848], node_map[102849])
connect!(node_map[102849], node_map[102850])
connect!(node_map[102851], node_map[102852])
connect!(node_map[102853], node_map[102854])
connect!(node_map[102855], node_map[102856])
connect!(node_map[102856], node_map[102857])
connect!(node_map[102858], node_map[102859])
connect!(node_map[102859], node_map[102860])
connect!(node_map[102861], node_map[102862])
connect!(node_map[102862], node_map[102863])
connect!(node_map[102864], node_map[102865])
connect!(node_map[102865], node_map[102866])
connect!(node_map[102867], node_map[102868])
connect!(node_map[102868], node_map[102869])
connect!(node_map[102870], node_map[102871])
connect!(node_map[102871], node_map[102872])
connect!(node_map[102873], node_map[102874])
connect!(node_map[102874], node_map[102875])
connect!(node_map[102876], node_map[102877])
connect!(node_map[102877], node_map[102878])
connect!(node_map[102879], node_map[102880])
connect!(node_map[102880], node_map[102881])
connect!(node_map[102880], node_map[102886])
connect!(node_map[102880], node_map[102891])
connect!(node_map[102880], node_map[102896])
connect!(node_map[102880], node_map[102902])
connect!(node_map[102881], node_map[102882])
connect!(node_map[102881], node_map[102884])
connect!(node_map[102882], node_map[102883])
connect!(node_map[102884], node_map[102885])
connect!(node_map[102886], node_map[102887])
connect!(node_map[102886], node_map[102889])
connect!(node_map[102887], node_map[102888])
connect!(node_map[102889], node_map[102890])
connect!(node_map[102891], node_map[102892])
connect!(node_map[102891], node_map[102894])
connect!(node_map[102892], node_map[102893])
connect!(node_map[102894], node_map[102895])
connect!(node_map[102896], node_map[102897])
connect!(node_map[102897], node_map[102898])
connect!(node_map[102897], node_map[102900])
connect!(node_map[102898], node_map[102899])
connect!(node_map[102900], node_map[102901])
connect!(node_map[102902], node_map[102903])
connect!(node_map[102903], node_map[102904])
connect!(node_map[102903], node_map[102906])
connect!(node_map[102904], node_map[102905])
connect!(node_map[102906], node_map[102907])
connect!(node_map[102908], node_map[102909])
connect!(node_map[102909], node_map[102910])
connect!(node_map[102909], node_map[102919])
connect!(node_map[102910], node_map[102911])
connect!(node_map[102911], node_map[102912])
connect!(node_map[102911], node_map[102914])
connect!(node_map[102911], node_map[102916])
connect!(node_map[102912], node_map[102913])
connect!(node_map[102914], node_map[102915])
connect!(node_map[102916], node_map[102917])
connect!(node_map[102917], node_map[102918])
connect!(node_map[102919], node_map[102920])
connect!(node_map[102920], node_map[102921])
connect!(node_map[102922], node_map[102923])
connect!(node_map[102923], node_map[102924])
connect!(node_map[102924], node_map[102925])
connect!(node_map[102925], node_map[102926])
connect!(node_map[102927], node_map[102928])
connect!(node_map[102927], node_map[102932])
connect!(node_map[102928], node_map[102929])
connect!(node_map[102929], node_map[102930])
connect!(node_map[102930], node_map[102931])
connect!(node_map[102932], node_map[102933])
connect!(node_map[102933], node_map[102934])
connect!(node_map[102934], node_map[102935])
connect!(node_map[102936], node_map[102937])
connect!(node_map[102936], node_map[102942])
connect!(node_map[102937], node_map[102938])
connect!(node_map[102937], node_map[102940])
connect!(node_map[102938], node_map[102939])
connect!(node_map[102940], node_map[102941])
connect!(node_map[102942], node_map[102943])
connect!(node_map[102942], node_map[102945])
connect!(node_map[102943], node_map[102944])
connect!(node_map[102945], node_map[102946])
connect!(node_map[102947], node_map[102948])
connect!(node_map[102947], node_map[102953])
connect!(node_map[102948], node_map[102949])
connect!(node_map[102948], node_map[102951])
connect!(node_map[102949], node_map[102950])
connect!(node_map[102951], node_map[102952])
connect!(node_map[102953], node_map[102954])
connect!(node_map[102953], node_map[102956])
connect!(node_map[102954], node_map[102955])
connect!(node_map[102956], node_map[102957])
connect!(node_map[102958], node_map[102959])
connect!(node_map[102959], node_map[102960])
connect!(node_map[102960], node_map[102961])
connect!(node_map[102961], node_map[102962])
connect!(node_map[102963], node_map[102964])
connect!(node_map[102964], node_map[102965])
connect!(node_map[102965], node_map[102966])
connect!(node_map[102965], node_map[102967])
connect!(node_map[102965], node_map[102969])
connect!(node_map[102967], node_map[102968])
connect!(node_map[102969], node_map[102970])
connect!(node_map[102971], node_map[102972])
connect!(node_map[102972], node_map[102973])
connect!(node_map[102973], node_map[102974])
connect!(node_map[102973], node_map[102975])
connect!(node_map[102973], node_map[102977])
connect!(node_map[102975], node_map[102976])
connect!(node_map[102977], node_map[102978])
connect!(node_map[102979], node_map[102980])
connect!(node_map[102981], node_map[102982])
connect!(node_map[102983], node_map[102984])
connect!(node_map[102985], node_map[102986])
connect!(node_map[102987], node_map[102988])
connect!(node_map[102989], node_map[102990])
connect!(node_map[102991], node_map[102992])
connect!(node_map[102993], node_map[102995])
connect!(node_map[102993], node_map[103006])
connect!(node_map[102994], node_map[103017])
connect!(node_map[102995], node_map[102996])
connect!(node_map[102996], node_map[102997])
connect!(node_map[102997], node_map[102998])
connect!(node_map[102997], node_map[103000])
connect!(node_map[102997], node_map[103002])
connect!(node_map[102998], node_map[102999])
connect!(node_map[103000], node_map[103001])
connect!(node_map[103002], node_map[103003])
connect!(node_map[103003], node_map[103004])
connect!(node_map[103004], node_map[103005])
connect!(node_map[103006], node_map[103007])
connect!(node_map[103007], node_map[103008])
connect!(node_map[103008], node_map[103009])
connect!(node_map[103008], node_map[103011])
connect!(node_map[103008], node_map[103013])
connect!(node_map[103009], node_map[103010])
connect!(node_map[103011], node_map[103012])
connect!(node_map[103013], node_map[103014])
connect!(node_map[103014], node_map[103015])
connect!(node_map[103015], node_map[103016])
connect!(node_map[103017], node_map[103018])
connect!(node_map[103017], node_map[103025])
connect!(node_map[103018], node_map[103019])
connect!(node_map[103019], node_map[103020])
connect!(node_map[103020], node_map[103021])
connect!(node_map[103020], node_map[103023])
connect!(node_map[103021], node_map[103022])
connect!(node_map[103023], node_map[103024])
connect!(node_map[103025], node_map[103026])
connect!(node_map[103026], node_map[103027])
connect!(node_map[103027], node_map[103028])

phoenix_dump.compile_program!
