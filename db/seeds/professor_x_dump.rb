# Standalone seed file for Professor X Dump.

require_relative 'helpers'

user = seed_user!

professor_x_dump = user.bots.find_or_initialize_by(name: "Professor X Dump")
professor_x_dump.description = "A sharper Phoenix clone with extra tactical strike and king-pressure conversion overlays inspired by the original Wolverine concept. Migrated from Professor X v2 by bots:migrate_to_v2_grammar_clone."
professor_x_dump.save!

reset_bot_graph!(professor_x_dump)

node_map = { 104416 => professor_x_dump.root_node }

node_map[104417] = create_organizer!(
  bot: professor_x_dump,
  position_x: -356.0,
  position_y: 180.0,
  title: "Terminal",
  notes: ""
)

node_map[104418] = create_organizer!(
  bot: professor_x_dump,
  position_x: 6746.666687011719,
  position_y: 124.0,
  title: "Opening",
  notes: ""
)

node_map[104419] = create_organizer!(
  bot: professor_x_dump,
  position_x: -2610.665771484375,
  position_y: 1864.0,
  title: "Tactics",
  notes: ""
)

node_map[104420] = create_organizer!(
  bot: professor_x_dump,
  position_x: 1960.0,
  position_y: 220.0,
  title: "Queen Strategy",
  notes: ""
)

node_map[104421] = create_organizer!(
  bot: professor_x_dump,
  position_x: 532.0,
  position_y: 3328.0,
  title: "King Pressure",
  notes: ""
)

node_map[104422] = create_organizer!(
  bot: professor_x_dump,
  position_x: 3924.0,
  position_y: 1164.0,
  title: "Endgame",
  notes: ""
)

node_map[104423] = create_organizer!(
  bot: professor_x_dump,
  position_x: 4956.0,
  position_y: 2980.0,
  title: "Fallback",
  notes: ""
)

node_map[104424] = create_condition!(
  bot: professor_x_dump,
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

node_map[104425] = create_condition!(
  bot: professor_x_dump,
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

node_map[104426] = create_action!(
  bot: professor_x_dump,
  position_x: -396.0,
  position_y: 640.0,
  action_type: "return",
  value: 100
)

node_map[104427] = create_condition!(
  bot: professor_x_dump,
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

node_map[104428] = create_condition!(
  bot: professor_x_dump,
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

node_map[104429] = create_action!(
  bot: professor_x_dump,
  position_x: -176.0,
  position_y: 640.0,
  action_type: "return",
  value: -100
)

node_map[104430] = create_condition!(
  bot: professor_x_dump,
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

node_map[104431] = create_condition!(
  bot: professor_x_dump,
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

node_map[104432] = create_condition!(
  bot: professor_x_dump,
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

node_map[104433] = create_condition!(
  bot: professor_x_dump,
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

node_map[104434] = create_condition!(
  bot: professor_x_dump,
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

node_map[104435] = create_condition!(
  bot: professor_x_dump,
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

node_map[104436] = create_condition!(
  bot: professor_x_dump,
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

node_map[104437] = create_condition!(
  bot: professor_x_dump,
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

node_map[104438] = create_condition!(
  bot: professor_x_dump,
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

node_map[104439] = create_condition!(
  bot: professor_x_dump,
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

node_map[104440] = create_condition!(
  bot: professor_x_dump,
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

node_map[104441] = create_condition!(
  bot: professor_x_dump,
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

node_map[104442] = create_condition!(
  bot: professor_x_dump,
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

node_map[104443] = create_condition!(
  bot: professor_x_dump,
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

node_map[104444] = create_condition!(
  bot: professor_x_dump,
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

node_map[104445] = create_condition!(
  bot: professor_x_dump,
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

node_map[104446] = create_condition!(
  bot: professor_x_dump,
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

node_map[104447] = create_condition!(
  bot: professor_x_dump,
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

node_map[104448] = create_action!(
  bot: professor_x_dump,
  position_x: 6706.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 12
)

node_map[104449] = create_condition!(
  bot: professor_x_dump,
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

node_map[104450] = create_action!(
  bot: professor_x_dump,
  position_x: 6966.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 12
)

node_map[104451] = create_condition!(
  bot: professor_x_dump,
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

node_map[104452] = create_condition!(
  bot: professor_x_dump,
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

node_map[104453] = create_condition!(
  bot: professor_x_dump,
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

node_map[104454] = create_condition!(
  bot: professor_x_dump,
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

node_map[104455] = create_action!(
  bot: professor_x_dump,
  position_x: 7186.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 11
)

node_map[104456] = create_condition!(
  bot: professor_x_dump,
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

node_map[104457] = create_action!(
  bot: professor_x_dump,
  position_x: 7446.666687011719,
  position_y: 2984.0,
  action_type: "add",
  value: 11
)

node_map[104458] = create_condition!(
  bot: professor_x_dump,
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

node_map[104459] = create_condition!(
  bot: professor_x_dump,
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

node_map[104460] = create_condition!(
  bot: professor_x_dump,
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

node_map[104461] = create_action!(
  bot: professor_x_dump,
  position_x: 7666.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[104462] = create_condition!(
  bot: professor_x_dump,
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

node_map[104463] = create_action!(
  bot: professor_x_dump,
  position_x: 7926.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[104464] = create_condition!(
  bot: professor_x_dump,
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

node_map[104465] = create_condition!(
  bot: professor_x_dump,
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

node_map[104466] = create_action!(
  bot: professor_x_dump,
  position_x: 8146.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[104467] = create_condition!(
  bot: professor_x_dump,
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

node_map[104468] = create_action!(
  bot: professor_x_dump,
  position_x: 8406.666687011719,
  position_y: 2834.0,
  action_type: "add",
  value: 8
)

node_map[104469] = create_condition!(
  bot: professor_x_dump,
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

node_map[104470] = create_condition!(
  bot: professor_x_dump,
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

node_map[104471] = create_action!(
  bot: professor_x_dump,
  position_x: -3334.6597900390625,
  position_y: 2292.0,
  action_type: "return",
  value: 110
)

node_map[104472] = create_action!(
  bot: professor_x_dump,
  position_x: -3014.6597900390625,
  position_y: 2142.0,
  action_type: "return",
  value: 100
)

node_map[104473] = create_condition!(
  bot: professor_x_dump,
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

node_map[104474] = create_condition!(
  bot: professor_x_dump,
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

node_map[104475] = create_action!(
  bot: professor_x_dump,
  position_x: -1278.665771484375,
  position_y: 3688.0,
  action_type: "return",
  value: 92
)

node_map[104476] = create_condition!(
  bot: professor_x_dump,
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

node_map[104477] = create_condition!(
  bot: professor_x_dump,
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

node_map[104478] = create_condition!(
  bot: professor_x_dump,
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

node_map[104479] = create_action!(
  bot: professor_x_dump,
  position_x: -938.665771484375,
  position_y: 3702.0,
  action_type: "return",
  value: 55
)

node_map[104480] = create_condition!(
  bot: professor_x_dump,
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

node_map[104481] = create_action!(
  bot: professor_x_dump,
  position_x: -698.665771484375,
  position_y: 3702.0,
  action_type: "return",
  value: 55
)

node_map[104482] = create_condition!(
  bot: professor_x_dump,
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

node_map[104483] = create_condition!(
  bot: professor_x_dump,
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

node_map[104484] = create_condition!(
  bot: professor_x_dump,
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

node_map[104485] = create_condition!(
  bot: professor_x_dump,
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

node_map[104486] = create_action!(
  bot: professor_x_dump,
  position_x: -490.665771484375,
  position_y: 4000.0,
  action_type: "return",
  value: 46
)

node_map[104487] = create_condition!(
  bot: professor_x_dump,
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

node_map[104488] = create_condition!(
  bot: professor_x_dump,
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

node_map[104489] = create_action!(
  bot: professor_x_dump,
  position_x: -1210.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 48
)

node_map[104490] = create_condition!(
  bot: professor_x_dump,
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

node_map[104491] = create_condition!(
  bot: professor_x_dump,
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

node_map[104492] = create_condition!(
  bot: professor_x_dump,
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

node_map[104493] = create_action!(
  bot: professor_x_dump,
  position_x: -950.665771484375,
  position_y: 2624.0,
  action_type: "return",
  value: 48
)

node_map[104494] = create_condition!(
  bot: professor_x_dump,
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

node_map[104495] = create_action!(
  bot: professor_x_dump,
  position_x: -690.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 48
)

node_map[104496] = create_condition!(
  bot: professor_x_dump,
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

node_map[104497] = create_condition!(
  bot: professor_x_dump,
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

node_map[104498] = create_action!(
  bot: professor_x_dump,
  position_x: -370.665771484375,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[104499] = create_condition!(
  bot: professor_x_dump,
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

node_map[104500] = create_condition!(
  bot: professor_x_dump,
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

node_map[104501] = create_action!(
  bot: professor_x_dump,
  position_x: -110.665771484375,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[104502] = create_condition!(
  bot: professor_x_dump,
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

node_map[104503] = create_condition!(
  bot: professor_x_dump,
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

node_map[104504] = create_action!(
  bot: professor_x_dump,
  position_x: 149.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[104505] = create_condition!(
  bot: professor_x_dump,
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

node_map[104506] = create_condition!(
  bot: professor_x_dump,
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

node_map[104507] = create_action!(
  bot: professor_x_dump,
  position_x: 409.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 48
)

node_map[104508] = create_condition!(
  bot: professor_x_dump,
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

node_map[104509] = create_condition!(
  bot: professor_x_dump,
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

node_map[104510] = create_action!(
  bot: professor_x_dump,
  position_x: -690.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 40
)

node_map[104511] = create_condition!(
  bot: professor_x_dump,
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

node_map[104512] = create_condition!(
  bot: professor_x_dump,
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

node_map[104513] = create_condition!(
  bot: professor_x_dump,
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

node_map[104514] = create_action!(
  bot: professor_x_dump,
  position_x: -430.665771484375,
  position_y: 2624.0,
  action_type: "return",
  value: 40
)

node_map[104515] = create_condition!(
  bot: professor_x_dump,
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

node_map[104516] = create_action!(
  bot: professor_x_dump,
  position_x: -170.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 40
)

node_map[104517] = create_condition!(
  bot: professor_x_dump,
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

node_map[104518] = create_condition!(
  bot: professor_x_dump,
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

node_map[104519] = create_action!(
  bot: professor_x_dump,
  position_x: 149.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[104520] = create_condition!(
  bot: professor_x_dump,
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

node_map[104521] = create_condition!(
  bot: professor_x_dump,
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

node_map[104522] = create_action!(
  bot: professor_x_dump,
  position_x: 409.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[104523] = create_condition!(
  bot: professor_x_dump,
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

node_map[104524] = create_condition!(
  bot: professor_x_dump,
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

node_map[104525] = create_action!(
  bot: professor_x_dump,
  position_x: 669.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[104526] = create_condition!(
  bot: professor_x_dump,
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

node_map[104527] = create_condition!(
  bot: professor_x_dump,
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

node_map[104528] = create_action!(
  bot: professor_x_dump,
  position_x: 929.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 40
)

node_map[104529] = create_condition!(
  bot: professor_x_dump,
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

node_map[104530] = create_condition!(
  bot: professor_x_dump,
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

node_map[104531] = create_action!(
  bot: professor_x_dump,
  position_x: -170.665771484375,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[104532] = create_condition!(
  bot: professor_x_dump,
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

node_map[104533] = create_condition!(
  bot: professor_x_dump,
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

node_map[104534] = create_condition!(
  bot: professor_x_dump,
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

node_map[104535] = create_action!(
  bot: professor_x_dump,
  position_x: 89.334228515625,
  position_y: 2624.0,
  action_type: "return",
  value: 34
)

node_map[104536] = create_condition!(
  bot: professor_x_dump,
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

node_map[104537] = create_action!(
  bot: professor_x_dump,
  position_x: 349.334228515625,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[104538] = create_condition!(
  bot: professor_x_dump,
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

node_map[104539] = create_condition!(
  bot: professor_x_dump,
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

node_map[104540] = create_action!(
  bot: professor_x_dump,
  position_x: 669.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104541] = create_condition!(
  bot: professor_x_dump,
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

node_map[104542] = create_condition!(
  bot: professor_x_dump,
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

node_map[104543] = create_action!(
  bot: professor_x_dump,
  position_x: 929.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104544] = create_condition!(
  bot: professor_x_dump,
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

node_map[104545] = create_condition!(
  bot: professor_x_dump,
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

node_map[104546] = create_action!(
  bot: professor_x_dump,
  position_x: 1189.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104547] = create_condition!(
  bot: professor_x_dump,
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

node_map[104548] = create_condition!(
  bot: professor_x_dump,
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

node_map[104549] = create_action!(
  bot: professor_x_dump,
  position_x: 1449.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104550] = create_condition!(
  bot: professor_x_dump,
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

node_map[104551] = create_condition!(
  bot: professor_x_dump,
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

node_map[104552] = create_action!(
  bot: professor_x_dump,
  position_x: 349.334228515625,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[104553] = create_condition!(
  bot: professor_x_dump,
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

node_map[104554] = create_condition!(
  bot: professor_x_dump,
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

node_map[104555] = create_condition!(
  bot: professor_x_dump,
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

node_map[104556] = create_action!(
  bot: professor_x_dump,
  position_x: 609.334228515625,
  position_y: 2624.0,
  action_type: "return",
  value: 34
)

node_map[104557] = create_condition!(
  bot: professor_x_dump,
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

node_map[104558] = create_action!(
  bot: professor_x_dump,
  position_x: 869.334228515625,
  position_y: 2324.0,
  action_type: "return",
  value: 34
)

node_map[104559] = create_condition!(
  bot: professor_x_dump,
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

node_map[104560] = create_condition!(
  bot: professor_x_dump,
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

node_map[104561] = create_action!(
  bot: professor_x_dump,
  position_x: 1189.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104562] = create_condition!(
  bot: professor_x_dump,
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

node_map[104563] = create_condition!(
  bot: professor_x_dump,
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

node_map[104564] = create_action!(
  bot: professor_x_dump,
  position_x: 1449.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104565] = create_condition!(
  bot: professor_x_dump,
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

node_map[104566] = create_condition!(
  bot: professor_x_dump,
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

node_map[104567] = create_action!(
  bot: professor_x_dump,
  position_x: 1709.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104568] = create_condition!(
  bot: professor_x_dump,
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

node_map[104569] = create_condition!(
  bot: professor_x_dump,
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

node_map[104570] = create_action!(
  bot: professor_x_dump,
  position_x: 1969.334228515625,
  position_y: 2474.0,
  action_type: "return",
  value: 34
)

node_map[104571] = create_condition!(
  bot: professor_x_dump,
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

node_map[104572] = create_condition!(
  bot: professor_x_dump,
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

node_map[104573] = create_action!(
  bot: professor_x_dump,
  position_x: -3202.665771484375,
  position_y: 2954.0,
  action_type: "return",
  value: 28
)

node_map[104574] = create_condition!(
  bot: professor_x_dump,
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

node_map[104575] = create_condition!(
  bot: professor_x_dump,
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

node_map[104576] = create_condition!(
  bot: professor_x_dump,
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

node_map[104577] = create_action!(
  bot: professor_x_dump,
  position_x: -2942.665771484375,
  position_y: 3254.0,
  action_type: "return",
  value: 28
)

node_map[104578] = create_condition!(
  bot: professor_x_dump,
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

node_map[104579] = create_action!(
  bot: professor_x_dump,
  position_x: -2682.665771484375,
  position_y: 2954.0,
  action_type: "return",
  value: 28
)

node_map[104580] = create_condition!(
  bot: professor_x_dump,
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

node_map[104581] = create_condition!(
  bot: professor_x_dump,
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

node_map[104582] = create_action!(
  bot: professor_x_dump,
  position_x: -2362.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[104583] = create_condition!(
  bot: professor_x_dump,
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

node_map[104584] = create_condition!(
  bot: professor_x_dump,
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

node_map[104585] = create_action!(
  bot: professor_x_dump,
  position_x: -2102.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[104586] = create_condition!(
  bot: professor_x_dump,
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

node_map[104587] = create_condition!(
  bot: professor_x_dump,
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

node_map[104588] = create_action!(
  bot: professor_x_dump,
  position_x: -1842.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[104589] = create_condition!(
  bot: professor_x_dump,
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

node_map[104590] = create_condition!(
  bot: professor_x_dump,
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

node_map[104591] = create_action!(
  bot: professor_x_dump,
  position_x: -1582.665771484375,
  position_y: 3104.0,
  action_type: "return",
  value: 28
)

node_map[104592] = create_condition!(
  bot: professor_x_dump,
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

node_map[104593] = create_condition!(
  bot: professor_x_dump,
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

node_map[104594] = create_action!(
  bot: professor_x_dump,
  position_x: -3294.665771484375,
  position_y: 3846.0,
  action_type: "return",
  value: 26
)

node_map[104595] = create_condition!(
  bot: professor_x_dump,
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

node_map[104596] = create_condition!(
  bot: professor_x_dump,
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

node_map[104597] = create_condition!(
  bot: professor_x_dump,
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

node_map[104598] = create_action!(
  bot: professor_x_dump,
  position_x: -3034.665771484375,
  position_y: 4146.0,
  action_type: "return",
  value: 26
)

node_map[104599] = create_condition!(
  bot: professor_x_dump,
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

node_map[104600] = create_action!(
  bot: professor_x_dump,
  position_x: -2774.665771484375,
  position_y: 3846.0,
  action_type: "return",
  value: 26
)

node_map[104601] = create_condition!(
  bot: professor_x_dump,
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

node_map[104602] = create_condition!(
  bot: professor_x_dump,
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

node_map[104603] = create_action!(
  bot: professor_x_dump,
  position_x: -2454.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[104604] = create_condition!(
  bot: professor_x_dump,
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

node_map[104605] = create_condition!(
  bot: professor_x_dump,
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

node_map[104606] = create_action!(
  bot: professor_x_dump,
  position_x: -2194.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[104607] = create_condition!(
  bot: professor_x_dump,
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

node_map[104608] = create_condition!(
  bot: professor_x_dump,
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

node_map[104609] = create_action!(
  bot: professor_x_dump,
  position_x: -1934.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[104610] = create_condition!(
  bot: professor_x_dump,
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

node_map[104611] = create_condition!(
  bot: professor_x_dump,
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

node_map[104612] = create_action!(
  bot: professor_x_dump,
  position_x: -1674.665771484375,
  position_y: 3996.0,
  action_type: "return",
  value: 26
)

node_map[104613] = create_condition!(
  bot: professor_x_dump,
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

node_map[104614] = create_condition!(
  bot: professor_x_dump,
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

node_map[104615] = create_action!(
  bot: professor_x_dump,
  position_x: -2638.665771484375,
  position_y: 4470.0,
  action_type: "return",
  value: 26
)

node_map[104616] = create_condition!(
  bot: professor_x_dump,
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

node_map[104617] = create_condition!(
  bot: professor_x_dump,
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

node_map[104618] = create_condition!(
  bot: professor_x_dump,
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

node_map[104619] = create_action!(
  bot: professor_x_dump,
  position_x: -2378.665771484375,
  position_y: 4770.0,
  action_type: "return",
  value: 26
)

node_map[104620] = create_condition!(
  bot: professor_x_dump,
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

node_map[104621] = create_action!(
  bot: professor_x_dump,
  position_x: -2118.665771484375,
  position_y: 4470.0,
  action_type: "return",
  value: 26
)

node_map[104622] = create_condition!(
  bot: professor_x_dump,
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

node_map[104623] = create_condition!(
  bot: professor_x_dump,
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

node_map[104624] = create_action!(
  bot: professor_x_dump,
  position_x: -1798.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[104625] = create_condition!(
  bot: professor_x_dump,
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

node_map[104626] = create_condition!(
  bot: professor_x_dump,
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

node_map[104627] = create_action!(
  bot: professor_x_dump,
  position_x: -1538.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[104628] = create_condition!(
  bot: professor_x_dump,
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

node_map[104629] = create_condition!(
  bot: professor_x_dump,
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

node_map[104630] = create_action!(
  bot: professor_x_dump,
  position_x: -1278.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[104631] = create_condition!(
  bot: professor_x_dump,
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

node_map[104632] = create_condition!(
  bot: professor_x_dump,
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

node_map[104633] = create_action!(
  bot: professor_x_dump,
  position_x: -1018.665771484375,
  position_y: 4620.0,
  action_type: "return",
  value: 26
)

node_map[104634] = create_condition!(
  bot: professor_x_dump,
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

node_map[104635] = create_condition!(
  bot: professor_x_dump,
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

node_map[104636] = create_condition!(
  bot: professor_x_dump,
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

node_map[104637] = create_action!(
  bot: professor_x_dump,
  position_x: 1890.0,
  position_y: 830.0,
  action_type: "return",
  value: 80
)

node_map[104638] = create_condition!(
  bot: professor_x_dump,
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

node_map[104639] = create_action!(
  bot: professor_x_dump,
  position_x: 2150.0,
  position_y: 830.0,
  action_type: "return",
  value: 80
)

node_map[104640] = create_condition!(
  bot: professor_x_dump,
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

node_map[104641] = create_condition!(
  bot: professor_x_dump,
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

node_map[104642] = create_condition!(
  bot: professor_x_dump,
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

node_map[104643] = create_action!(
  bot: professor_x_dump,
  position_x: 2410.0,
  position_y: 980.0,
  action_type: "add",
  value: 14
)

node_map[104644] = create_condition!(
  bot: professor_x_dump,
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

node_map[104645] = create_action!(
  bot: professor_x_dump,
  position_x: 2670.0,
  position_y: 980.0,
  action_type: "add",
  value: 14
)

node_map[104646] = create_condition!(
  bot: professor_x_dump,
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

node_map[104647] = create_action!(
  bot: professor_x_dump,
  position_x: 2930.0,
  position_y: 980.0,
  action_type: "add",
  value: 8
)

node_map[104648] = create_condition!(
  bot: professor_x_dump,
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

node_map[104649] = create_action!(
  bot: professor_x_dump,
  position_x: 3190.0,
  position_y: 980.0,
  action_type: "add",
  value: 8
)

node_map[104650] = create_condition!(
  bot: professor_x_dump,
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

node_map[104651] = create_action!(
  bot: professor_x_dump,
  position_x: 3450.0,
  position_y: 980.0,
  action_type: "add",
  value: 8
)

node_map[104652] = create_condition!(
  bot: professor_x_dump,
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

node_map[104653] = create_action!(
  bot: professor_x_dump,
  position_x: 3710.0,
  position_y: 680.0,
  action_type: "return",
  value: -120
)

node_map[104654] = create_condition!(
  bot: professor_x_dump,
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

node_map[104655] = create_condition!(
  bot: professor_x_dump,
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

node_map[104656] = create_action!(
  bot: professor_x_dump,
  position_x: 3900.0,
  position_y: 830.0,
  action_type: "return",
  value: -120
)

node_map[104657] = create_condition!(
  bot: professor_x_dump,
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

node_map[104658] = create_condition!(
  bot: professor_x_dump,
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

node_map[104659] = create_condition!(
  bot: professor_x_dump,
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

node_map[104660] = create_action!(
  bot: professor_x_dump,
  position_x: 4230.0,
  position_y: 980.0,
  action_type: "subtract",
  value: 12
)

node_map[104661] = create_condition!(
  bot: professor_x_dump,
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

node_map[104662] = create_condition!(
  bot: professor_x_dump,
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

node_map[104663] = create_condition!(
  bot: professor_x_dump,
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

node_map[104664] = create_action!(
  bot: professor_x_dump,
  position_x: 502.0,
  position_y: 3938.0,
  action_type: "return",
  value: 34
)

node_map[104665] = create_action!(
  bot: professor_x_dump,
  position_x: 1052.0,
  position_y: 3788.0,
  action_type: "add",
  value: 12
)

node_map[104666] = create_condition!(
  bot: professor_x_dump,
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

node_map[104667] = create_action!(
  bot: professor_x_dump,
  position_x: 922.0,
  position_y: 3788.0,
  action_type: "add",
  value: 16
)

node_map[104668] = create_condition!(
  bot: professor_x_dump,
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

node_map[104669] = create_condition!(
  bot: professor_x_dump,
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

node_map[104670] = create_condition!(
  bot: professor_x_dump,
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

node_map[104671] = create_action!(
  bot: professor_x_dump,
  position_x: 1402.0,
  position_y: 3938.0,
  action_type: "return",
  value: 34
)

node_map[104672] = create_action!(
  bot: professor_x_dump,
  position_x: 1952.0,
  position_y: 3788.0,
  action_type: "add",
  value: 12
)

node_map[104673] = create_condition!(
  bot: professor_x_dump,
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

node_map[104674] = create_action!(
  bot: professor_x_dump,
  position_x: 1822.0,
  position_y: 3788.0,
  action_type: "add",
  value: 16
)

node_map[104675] = create_condition!(
  bot: professor_x_dump,
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

node_map[104676] = create_condition!(
  bot: professor_x_dump,
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

node_map[104677] = create_condition!(
  bot: professor_x_dump,
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

node_map[104678] = create_condition!(
  bot: professor_x_dump,
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

node_map[104679] = create_condition!(
  bot: professor_x_dump,
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

node_map[104680] = create_condition!(
  bot: professor_x_dump,
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

node_map[104681] = create_action!(
  bot: professor_x_dump,
  position_x: 1582.0,
  position_y: 5228.0,
  action_type: "return",
  value: 32
)

node_map[104682] = create_condition!(
  bot: professor_x_dump,
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

node_map[104683] = create_action!(
  bot: professor_x_dump,
  position_x: 1582.0,
  position_y: 5798.0,
  action_type: "return",
  value: 32
)

node_map[104684] = create_condition!(
  bot: professor_x_dump,
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

node_map[104685] = create_condition!(
  bot: professor_x_dump,
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

node_map[104686] = create_condition!(
  bot: professor_x_dump,
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

node_map[104687] = create_action!(
  bot: professor_x_dump,
  position_x: 1822.0,
  position_y: 5528.0,
  action_type: "return",
  value: 32
)

node_map[104688] = create_condition!(
  bot: professor_x_dump,
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

node_map[104689] = create_condition!(
  bot: professor_x_dump,
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

node_map[104690] = create_condition!(
  bot: professor_x_dump,
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

node_map[104691] = create_action!(
  bot: professor_x_dump,
  position_x: 1822.0,
  position_y: 6098.0,
  action_type: "return",
  value: 32
)

node_map[104692] = create_condition!(
  bot: professor_x_dump,
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

node_map[104693] = create_action!(
  bot: professor_x_dump,
  position_x: 2062.0,
  position_y: 5228.0,
  action_type: "return",
  value: 32
)

node_map[104694] = create_condition!(
  bot: professor_x_dump,
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

node_map[104695] = create_action!(
  bot: professor_x_dump,
  position_x: 2062.0,
  position_y: 5798.0,
  action_type: "return",
  value: 32
)

node_map[104696] = create_condition!(
  bot: professor_x_dump,
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

node_map[104697] = create_condition!(
  bot: professor_x_dump,
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

node_map[104698] = create_action!(
  bot: professor_x_dump,
  position_x: 2232.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[104699] = create_condition!(
  bot: professor_x_dump,
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

node_map[104700] = create_condition!(
  bot: professor_x_dump,
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

node_map[104701] = create_action!(
  bot: professor_x_dump,
  position_x: 2232.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[104702] = create_condition!(
  bot: professor_x_dump,
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

node_map[104703] = create_condition!(
  bot: professor_x_dump,
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

node_map[104704] = create_action!(
  bot: professor_x_dump,
  position_x: 2472.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[104705] = create_condition!(
  bot: professor_x_dump,
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

node_map[104706] = create_condition!(
  bot: professor_x_dump,
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

node_map[104707] = create_action!(
  bot: professor_x_dump,
  position_x: 2472.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[104708] = create_condition!(
  bot: professor_x_dump,
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

node_map[104709] = create_condition!(
  bot: professor_x_dump,
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

node_map[104710] = create_action!(
  bot: professor_x_dump,
  position_x: 2712.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[104711] = create_condition!(
  bot: professor_x_dump,
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

node_map[104712] = create_condition!(
  bot: professor_x_dump,
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

node_map[104713] = create_action!(
  bot: professor_x_dump,
  position_x: 2712.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[104714] = create_condition!(
  bot: professor_x_dump,
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

node_map[104715] = create_condition!(
  bot: professor_x_dump,
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

node_map[104716] = create_action!(
  bot: professor_x_dump,
  position_x: 2952.0,
  position_y: 5378.0,
  action_type: "return",
  value: 32
)

node_map[104717] = create_condition!(
  bot: professor_x_dump,
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

node_map[104718] = create_condition!(
  bot: professor_x_dump,
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

node_map[104719] = create_action!(
  bot: professor_x_dump,
  position_x: 2952.0,
  position_y: 5948.0,
  action_type: "return",
  value: 32
)

node_map[104720] = create_condition!(
  bot: professor_x_dump,
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

node_map[104721] = create_condition!(
  bot: professor_x_dump,
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

node_map[104722] = create_condition!(
  bot: professor_x_dump,
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

node_map[104723] = create_condition!(
  bot: professor_x_dump,
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

node_map[104724] = create_action!(
  bot: professor_x_dump,
  position_x: 3874.0,
  position_y: 1924.0,
  action_type: "return",
  value: 88
)

node_map[104725] = create_condition!(
  bot: professor_x_dump,
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

node_map[104726] = create_action!(
  bot: professor_x_dump,
  position_x: 4134.0,
  position_y: 1924.0,
  action_type: "return",
  value: 88
)

node_map[104727] = create_condition!(
  bot: professor_x_dump,
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

node_map[104728] = create_condition!(
  bot: professor_x_dump,
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

node_map[104729] = create_action!(
  bot: professor_x_dump,
  position_x: 4394.0,
  position_y: 1924.0,
  action_type: "return",
  value: 22
)

node_map[104730] = create_condition!(
  bot: professor_x_dump,
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

node_map[104731] = create_action!(
  bot: professor_x_dump,
  position_x: 4654.0,
  position_y: 1924.0,
  action_type: "return",
  value: 22
)

node_map[104732] = create_condition!(
  bot: professor_x_dump,
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

node_map[104733] = create_condition!(
  bot: professor_x_dump,
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

node_map[104734] = create_action!(
  bot: professor_x_dump,
  position_x: 4914.0,
  position_y: 1924.0,
  action_type: "add",
  value: 14
)

node_map[104735] = create_condition!(
  bot: professor_x_dump,
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

node_map[104736] = create_action!(
  bot: professor_x_dump,
  position_x: 5174.0,
  position_y: 1924.0,
  action_type: "add",
  value: 14
)

node_map[104737] = create_condition!(
  bot: professor_x_dump,
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

node_map[104738] = create_condition!(
  bot: professor_x_dump,
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

node_map[104739] = create_condition!(
  bot: professor_x_dump,
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

node_map[104740] = create_action!(
  bot: professor_x_dump,
  position_x: 5434.0,
  position_y: 2074.0,
  action_type: "return",
  value: 32
)

node_map[104741] = create_condition!(
  bot: professor_x_dump,
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

node_map[104742] = create_action!(
  bot: professor_x_dump,
  position_x: 5694.0,
  position_y: 2074.0,
  action_type: "return",
  value: 32
)

node_map[104743] = create_condition!(
  bot: professor_x_dump,
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

node_map[104744] = create_condition!(
  bot: professor_x_dump,
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

node_map[104745] = create_condition!(
  bot: professor_x_dump,
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

node_map[104746] = create_action!(
  bot: professor_x_dump,
  position_x: 5954.0,
  position_y: 2074.0,
  action_type: "add",
  value: 8
)

node_map[104747] = create_condition!(
  bot: professor_x_dump,
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

node_map[104748] = create_action!(
  bot: professor_x_dump,
  position_x: 6214.0,
  position_y: 2074.0,
  action_type: "add",
  value: 8
)

node_map[104749] = create_condition!(
  bot: professor_x_dump,
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

node_map[104750] = create_condition!(
  bot: professor_x_dump,
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

node_map[104751] = create_condition!(
  bot: professor_x_dump,
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

node_map[104752] = create_condition!(
  bot: professor_x_dump,
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

node_map[104753] = create_condition!(
  bot: professor_x_dump,
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

node_map[104754] = create_action!(
  bot: professor_x_dump,
  position_x: 4906.0,
  position_y: 3890.0,
  action_type: "add",
  value: 7
)

node_map[104755] = create_condition!(
  bot: professor_x_dump,
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

node_map[104756] = create_action!(
  bot: professor_x_dump,
  position_x: 5166.0,
  position_y: 3890.0,
  action_type: "add",
  value: 7
)

node_map[104757] = create_condition!(
  bot: professor_x_dump,
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

node_map[104758] = create_condition!(
  bot: professor_x_dump,
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

node_map[104759] = create_action!(
  bot: professor_x_dump,
  position_x: 5356.0,
  position_y: 4040.0,
  action_type: "add",
  value: 7
)

node_map[104760] = create_condition!(
  bot: professor_x_dump,
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

node_map[104761] = create_condition!(
  bot: professor_x_dump,
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

node_map[104762] = create_action!(
  bot: professor_x_dump,
  position_x: 5616.0,
  position_y: 3740.0,
  action_type: "add",
  value: 5
)

node_map[104763] = create_condition!(
  bot: professor_x_dump,
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

node_map[104764] = create_condition!(
  bot: professor_x_dump,
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

node_map[104765] = create_condition!(
  bot: professor_x_dump,
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

node_map[104766] = create_condition!(
  bot: professor_x_dump,
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

node_map[104767] = create_action!(
  bot: professor_x_dump,
  position_x: 5876.0,
  position_y: 3740.0,
  action_type: "return",
  value: 26
)

node_map[104768] = create_condition!(
  bot: professor_x_dump,
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

node_map[104769] = create_condition!(
  bot: professor_x_dump,
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

node_map[104770] = create_condition!(
  bot: professor_x_dump,
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

node_map[104771] = create_condition!(
  bot: professor_x_dump,
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

node_map[104772] = create_action!(
  bot: professor_x_dump,
  position_x: 6206.0,
  position_y: 3740.0,
  action_type: "return",
  value: 18
)

node_map[104773] = create_condition!(
  bot: professor_x_dump,
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

node_map[104774] = create_condition!(
  bot: professor_x_dump,
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

node_map[104775] = create_condition!(
  bot: professor_x_dump,
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

node_map[104776] = create_action!(
  bot: professor_x_dump,
  position_x: 6466.0,
  position_y: 3740.0,
  action_type: "return",
  value: 18
)

node_map[104777] = create_condition!(
  bot: professor_x_dump,
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

node_map[104778] = create_condition!(
  bot: professor_x_dump,
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

node_map[104779] = create_condition!(
  bot: professor_x_dump,
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

node_map[104780] = create_action!(
  bot: professor_x_dump,
  position_x: 6656.0,
  position_y: 3590.0,
  action_type: "add",
  value: 8
)

node_map[104781] = create_condition!(
  bot: professor_x_dump,
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

node_map[104782] = create_action!(
  bot: professor_x_dump,
  position_x: 6916.0,
  position_y: 3590.0,
  action_type: "add",
  value: 8
)

node_map[104783] = create_condition!(
  bot: professor_x_dump,
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

node_map[104784] = create_condition!(
  bot: professor_x_dump,
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

node_map[104785] = create_action!(
  bot: professor_x_dump,
  position_x: 7176.0,
  position_y: 4160.0,
  action_type: "add",
  value: 8
)

node_map[104786] = create_condition!(
  bot: professor_x_dump,
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

node_map[104787] = create_action!(
  bot: professor_x_dump,
  position_x: 7436.0,
  position_y: 4160.0,
  action_type: "add",
  value: 8
)

node_map[104788] = create_condition!(
  bot: professor_x_dump,
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

node_map[104789] = create_condition!(
  bot: professor_x_dump,
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

node_map[104790] = create_condition!(
  bot: professor_x_dump,
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

node_map[104791] = create_action!(
  bot: professor_x_dump,
  position_x: 7176.0,
  position_y: 3590.0,
  action_type: "add",
  value: 6
)

node_map[104792] = create_condition!(
  bot: professor_x_dump,
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

node_map[104793] = create_action!(
  bot: professor_x_dump,
  position_x: 7436.0,
  position_y: 3590.0,
  action_type: "add",
  value: 6
)

node_map[104794] = create_condition!(
  bot: professor_x_dump,
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

node_map[104795] = create_condition!(
  bot: professor_x_dump,
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

node_map[104796] = create_action!(
  bot: professor_x_dump,
  position_x: 7696.0,
  position_y: 4160.0,
  action_type: "add",
  value: 6
)

node_map[104797] = create_condition!(
  bot: professor_x_dump,
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

node_map[104798] = create_action!(
  bot: professor_x_dump,
  position_x: 7956.0,
  position_y: 4160.0,
  action_type: "add",
  value: 6
)

node_map[104799] = create_condition!(
  bot: professor_x_dump,
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

node_map[104800] = create_condition!(
  bot: professor_x_dump,
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

node_map[104801] = create_condition!(
  bot: professor_x_dump,
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

node_map[104802] = create_condition!(
  bot: professor_x_dump,
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

node_map[104803] = create_action!(
  bot: professor_x_dump,
  position_x: 7696.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 10
)

node_map[104804] = create_condition!(
  bot: professor_x_dump,
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

node_map[104805] = create_condition!(
  bot: professor_x_dump,
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

node_map[104806] = create_condition!(
  bot: professor_x_dump,
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

node_map[104807] = create_action!(
  bot: professor_x_dump,
  position_x: 7766.0,
  position_y: 3590.0,
  action_type: "subtract",
  value: 6
)

node_map[104808] = create_condition!(
  bot: professor_x_dump,
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

node_map[104809] = create_action!(
  bot: professor_x_dump,
  position_x: 7956.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[104810] = create_condition!(
  bot: professor_x_dump,
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

node_map[104811] = create_action!(
  bot: professor_x_dump,
  position_x: 8216.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[104812] = create_condition!(
  bot: professor_x_dump,
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

node_map[104813] = create_condition!(
  bot: professor_x_dump,
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

node_map[104814] = create_condition!(
  bot: professor_x_dump,
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

node_map[104815] = create_action!(
  bot: professor_x_dump,
  position_x: 8026.0,
  position_y: 3590.0,
  action_type: "subtract",
  value: 6
)

node_map[104816] = create_condition!(
  bot: professor_x_dump,
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

node_map[104817] = create_action!(
  bot: professor_x_dump,
  position_x: 8216.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[104818] = create_condition!(
  bot: professor_x_dump,
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

node_map[104819] = create_action!(
  bot: professor_x_dump,
  position_x: 8476.0,
  position_y: 3740.0,
  action_type: "subtract",
  value: 8
)

node_map[104820] = create_condition!(
  bot: professor_x_dump,
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

node_map[104821] = create_action!(
  bot: professor_x_dump,
  position_x: 9326.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 18
)

node_map[104822] = create_condition!(
  bot: professor_x_dump,
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

node_map[104823] = create_action!(
  bot: professor_x_dump,
  position_x: 9586.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 14
)

node_map[104824] = create_condition!(
  bot: professor_x_dump,
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

node_map[104825] = create_action!(
  bot: professor_x_dump,
  position_x: 9846.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 10
)

node_map[104826] = create_condition!(
  bot: professor_x_dump,
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

node_map[104827] = create_action!(
  bot: professor_x_dump,
  position_x: 10106.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 12
)

node_map[104828] = create_condition!(
  bot: professor_x_dump,
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

node_map[104829] = create_action!(
  bot: professor_x_dump,
  position_x: 10366.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 12
)

node_map[104830] = create_condition!(
  bot: professor_x_dump,
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

node_map[104831] = create_action!(
  bot: professor_x_dump,
  position_x: 10626.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 8
)

node_map[104832] = create_condition!(
  bot: professor_x_dump,
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

node_map[104833] = create_action!(
  bot: professor_x_dump,
  position_x: 10886.0,
  position_y: 3290.0,
  action_type: "subtract",
  value: 8
)

node_map[104834] = create_organizer!(
  bot: professor_x_dump,
  position_x: 10880.0,
  position_y: 1080.0,
  title: "Phoenix Conversion",
  notes: ""
)

node_map[104835] = create_organizer!(
  bot: professor_x_dump,
  position_x: 11380.0,
  position_y: 1080.0,
  title: "Phoenix Discipline",
  notes: ""
)

node_map[104836] = create_condition!(
  bot: professor_x_dump,
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

node_map[104837] = create_condition!(
  bot: professor_x_dump,
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

node_map[104838] = create_condition!(
  bot: professor_x_dump,
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

node_map[104839] = create_condition!(
  bot: professor_x_dump,
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

node_map[104840] = create_action!(
  bot: professor_x_dump,
  position_x: 10810.0,
  position_y: 1840.0,
  action_type: "return",
  value: 24
)

node_map[104841] = create_condition!(
  bot: professor_x_dump,
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

node_map[104842] = create_action!(
  bot: professor_x_dump,
  position_x: 11430.0,
  position_y: 1840.0,
  action_type: "return",
  value: 22
)

node_map[104843] = create_condition!(
  bot: professor_x_dump,
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

node_map[104844] = create_condition!(
  bot: professor_x_dump,
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

node_map[104845] = create_condition!(
  bot: professor_x_dump,
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

node_map[104846] = create_action!(
  bot: professor_x_dump,
  position_x: 12050.0,
  position_y: 2140.0,
  action_type: "return",
  value: 36
)

node_map[104847] = create_condition!(
  bot: professor_x_dump,
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

node_map[104848] = create_condition!(
  bot: professor_x_dump,
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

node_map[104849] = create_condition!(
  bot: professor_x_dump,
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

node_map[104850] = create_condition!(
  bot: professor_x_dump,
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

node_map[104851] = create_action!(
  bot: professor_x_dump,
  position_x: 11750.0,
  position_y: 1840.0,
  action_type: "return",
  value: 24
)

node_map[104852] = create_condition!(
  bot: professor_x_dump,
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

node_map[104853] = create_action!(
  bot: professor_x_dump,
  position_x: 12370.0,
  position_y: 1840.0,
  action_type: "return",
  value: 22
)

node_map[104854] = create_condition!(
  bot: professor_x_dump,
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

node_map[104855] = create_condition!(
  bot: professor_x_dump,
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

node_map[104856] = create_condition!(
  bot: professor_x_dump,
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

node_map[104857] = create_action!(
  bot: professor_x_dump,
  position_x: 12990.0,
  position_y: 2140.0,
  action_type: "return",
  value: 36
)

node_map[104858] = create_condition!(
  bot: professor_x_dump,
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

node_map[104859] = create_condition!(
  bot: professor_x_dump,
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

node_map[104860] = create_condition!(
  bot: professor_x_dump,
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

node_map[104861] = create_condition!(
  bot: professor_x_dump,
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

node_map[104862] = create_condition!(
  bot: professor_x_dump,
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

node_map[104863] = create_action!(
  bot: professor_x_dump,
  position_x: 11240.0,
  position_y: 1990.0,
  action_type: "subtract",
  value: 18
)

node_map[104864] = create_condition!(
  bot: professor_x_dump,
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

node_map[104865] = create_action!(
  bot: professor_x_dump,
  position_x: 11500.0,
  position_y: 1990.0,
  action_type: "subtract",
  value: 18
)

node_map[104866] = create_condition!(
  bot: professor_x_dump,
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

node_map[104867] = create_condition!(
  bot: professor_x_dump,
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

node_map[104868] = create_condition!(
  bot: professor_x_dump,
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

node_map[104869] = create_action!(
  bot: professor_x_dump,
  position_x: 11830.0,
  position_y: 1840.0,
  action_type: "subtract",
  value: 18
)

node_map[104870] = create_organizer!(
  bot: professor_x_dump,
  position_x: 11880.0,
  position_y: 1080.0,
  title: "Professor X Tactics",
  notes: ""
)

node_map[104871] = create_organizer!(
  bot: professor_x_dump,
  position_x: 12380.0,
  position_y: 1080.0,
  title: "Professor X Pressure",
  notes: ""
)

node_map[104872] = create_condition!(
  bot: professor_x_dump,
  position_x: 11740.0,
  position_y: 1240.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[104873] = create_condition!(
  bot: professor_x_dump,
  position_x: 11810.0,
  position_y: 1390.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104874] = create_action!(
  bot: professor_x_dump,
  position_x: 11740.0,
  position_y: 1540.0,
  action_type: "return",
  value: 112
)

node_map[104875] = create_action!(
  bot: professor_x_dump,
  position_x: 12070.0,
  position_y: 1390.0,
  action_type: "return",
  value: 102
)

node_map[104876] = create_condition!(
  bot: professor_x_dump,
  position_x: 12260.0,
  position_y: 1240.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[104877] = create_condition!(
  bot: professor_x_dump,
  position_x: 12330.0,
  position_y: 1390.0,
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

node_map[104878] = create_condition!(
  bot: professor_x_dump,
  position_x: 12260.0,
  position_y: 1540.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104879] = create_action!(
  bot: professor_x_dump,
  position_x: 12330.0,
  position_y: 1690.0,
  action_type: "return",
  value: 60
)

node_map[104880] = create_condition!(
  bot: professor_x_dump,
  position_x: 12500.0,
  position_y: 1540.0,
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

node_map[104881] = create_action!(
  bot: professor_x_dump,
  position_x: 12570.0,
  position_y: 1690.0,
  action_type: "return",
  value: 60
)

node_map[104882] = create_condition!(
  bot: professor_x_dump,
  position_x: 12720.0,
  position_y: 1240.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104883] = create_condition!(
  bot: professor_x_dump,
  position_x: 12790.0,
  position_y: 1390.0,
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

node_map[104884] = create_condition!(
  bot: professor_x_dump,
  position_x: 12720.0,
  position_y: 1540.0,
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

node_map[104885] = create_condition!(
  bot: professor_x_dump,
  position_x: 12790.0,
  position_y: 1690.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104886] = create_action!(
  bot: professor_x_dump,
  position_x: 12720.0,
  position_y: 1840.0,
  action_type: "return",
  value: 50
)

node_map[104887] = create_condition!(
  bot: professor_x_dump,
  position_x: 12240.0,
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

node_map[104888] = create_condition!(
  bot: professor_x_dump,
  position_x: 12310.0,
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

node_map[104889] = create_condition!(
  bot: professor_x_dump,
  position_x: 12240.0,
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

node_map[104890] = create_condition!(
  bot: professor_x_dump,
  position_x: 12310.0,
  position_y: 1690.0,
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

node_map[104891] = create_action!(
  bot: professor_x_dump,
  position_x: 12240.0,
  position_y: 1840.0,
  action_type: "return",
  value: 28
)

node_map[104892] = create_condition!(
  bot: professor_x_dump,
  position_x: 12930.0,
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

node_map[104893] = create_action!(
  bot: professor_x_dump,
  position_x: 12860.0,
  position_y: 1840.0,
  action_type: "return",
  value: 26
)

node_map[104894] = create_condition!(
  bot: professor_x_dump,
  position_x: 13550.0,
  position_y: 1690.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104895] = create_action!(
  bot: professor_x_dump,
  position_x: 13480.0,
  position_y: 1840.0,
  action_type: "add",
  value: 16
)

node_map[104896] = create_condition!(
  bot: professor_x_dump,
  position_x: 13220.0,
  position_y: 1240.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[104897] = create_condition!(
  bot: professor_x_dump,
  position_x: 13290.0,
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

node_map[104898] = create_condition!(
  bot: professor_x_dump,
  position_x: 13220.0,
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

node_map[104899] = create_condition!(
  bot: professor_x_dump,
  position_x: 13290.0,
  position_y: 1690.0,
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

node_map[104900] = create_action!(
  bot: professor_x_dump,
  position_x: 13220.0,
  position_y: 1840.0,
  action_type: "return",
  value: 28
)

node_map[104901] = create_condition!(
  bot: professor_x_dump,
  position_x: 13910.0,
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

node_map[104902] = create_action!(
  bot: professor_x_dump,
  position_x: 13840.0,
  position_y: 1840.0,
  action_type: "return",
  value: 26
)

node_map[104903] = create_condition!(
  bot: professor_x_dump,
  position_x: 14530.0,
  position_y: 1690.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104904] = create_action!(
  bot: professor_x_dump,
  position_x: 14460.0,
  position_y: 1840.0,
  action_type: "add",
  value: 16
)

node_map[104905] = create_condition!(
  bot: professor_x_dump,
  position_x: 13320.0,
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

node_map[104906] = create_condition!(
  bot: professor_x_dump,
  position_x: 13390.0,
  position_y: 1390.0,
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

node_map[104907] = create_condition!(
  bot: professor_x_dump,
  position_x: 13320.0,
  position_y: 1540.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[104908] = create_condition!(
  bot: professor_x_dump,
  position_x: 13390.0,
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
   "subjectComparisonValue"=>0}
)

node_map[104909] = create_action!(
  bot: professor_x_dump,
  position_x: 13320.0,
  position_y: 1840.0,
  action_type: "return",
  value: 34
)

connect!(node_map[104416], node_map[104417])
connect!(node_map[104416], node_map[104418])
connect!(node_map[104416], node_map[104419])
connect!(node_map[104416], node_map[104420])
connect!(node_map[104416], node_map[104421])
connect!(node_map[104416], node_map[104422])
connect!(node_map[104416], node_map[104423])
connect!(node_map[104416], node_map[104834])
connect!(node_map[104416], node_map[104835])
connect!(node_map[104416], node_map[104870])
connect!(node_map[104416], node_map[104871])
connect!(node_map[104417], node_map[104424])
connect!(node_map[104417], node_map[104427])
connect!(node_map[104418], node_map[104430])
connect!(node_map[104419], node_map[104469])
connect!(node_map[104419], node_map[104473])
connect!(node_map[104419], node_map[104476])
connect!(node_map[104419], node_map[104482])
connect!(node_map[104419], node_map[104487])
connect!(node_map[104419], node_map[104508])
connect!(node_map[104419], node_map[104529])
connect!(node_map[104419], node_map[104550])
connect!(node_map[104419], node_map[104571])
connect!(node_map[104419], node_map[104592])
connect!(node_map[104419], node_map[104613])
connect!(node_map[104420], node_map[104634])
connect!(node_map[104421], node_map[104661])
connect!(node_map[104421], node_map[104668])
connect!(node_map[104421], node_map[104675])
connect!(node_map[104422], node_map[104720])
connect!(node_map[104423], node_map[104749])
connect!(node_map[104423], node_map[104763])
connect!(node_map[104423], node_map[104768])
connect!(node_map[104423], node_map[104777])
connect!(node_map[104423], node_map[104788])
connect!(node_map[104423], node_map[104799])
connect!(node_map[104423], node_map[104804])
connect!(node_map[104423], node_map[104812])
connect!(node_map[104423], node_map[104820])
connect!(node_map[104423], node_map[104822])
connect!(node_map[104423], node_map[104824])
connect!(node_map[104423], node_map[104826])
connect!(node_map[104423], node_map[104828])
connect!(node_map[104423], node_map[104830])
connect!(node_map[104423], node_map[104832])
connect!(node_map[104424], node_map[104425])
connect!(node_map[104425], node_map[104426])
connect!(node_map[104427], node_map[104428])
connect!(node_map[104428], node_map[104429])
connect!(node_map[104430], node_map[104431])
connect!(node_map[104431], node_map[104432])
connect!(node_map[104432], node_map[104433])
connect!(node_map[104433], node_map[104434])
connect!(node_map[104434], node_map[104435])
connect!(node_map[104435], node_map[104436])
connect!(node_map[104436], node_map[104437])
connect!(node_map[104437], node_map[104438])
connect!(node_map[104438], node_map[104439])
connect!(node_map[104439], node_map[104440])
connect!(node_map[104440], node_map[104441])
connect!(node_map[104441], node_map[104442])
connect!(node_map[104442], node_map[104443])
connect!(node_map[104443], node_map[104444])
connect!(node_map[104443], node_map[104451])
connect!(node_map[104443], node_map[104458])
connect!(node_map[104444], node_map[104445])
connect!(node_map[104445], node_map[104446])
connect!(node_map[104446], node_map[104447])
connect!(node_map[104446], node_map[104449])
connect!(node_map[104447], node_map[104448])
connect!(node_map[104449], node_map[104450])
connect!(node_map[104451], node_map[104452])
connect!(node_map[104452], node_map[104453])
connect!(node_map[104453], node_map[104454])
connect!(node_map[104453], node_map[104456])
connect!(node_map[104454], node_map[104455])
connect!(node_map[104456], node_map[104457])
connect!(node_map[104458], node_map[104459])
connect!(node_map[104458], node_map[104464])
connect!(node_map[104459], node_map[104460])
connect!(node_map[104459], node_map[104462])
connect!(node_map[104460], node_map[104461])
connect!(node_map[104462], node_map[104463])
connect!(node_map[104464], node_map[104465])
connect!(node_map[104464], node_map[104467])
connect!(node_map[104465], node_map[104466])
connect!(node_map[104467], node_map[104468])
connect!(node_map[104469], node_map[104470])
connect!(node_map[104469], node_map[104472])
connect!(node_map[104470], node_map[104471])
connect!(node_map[104473], node_map[104474])
connect!(node_map[104474], node_map[104475])
connect!(node_map[104476], node_map[104477])
connect!(node_map[104477], node_map[104478])
connect!(node_map[104477], node_map[104480])
connect!(node_map[104478], node_map[104479])
connect!(node_map[104480], node_map[104481])
connect!(node_map[104482], node_map[104483])
connect!(node_map[104483], node_map[104484])
connect!(node_map[104484], node_map[104485])
connect!(node_map[104485], node_map[104486])
connect!(node_map[104487], node_map[104488])
connect!(node_map[104487], node_map[104490])
connect!(node_map[104487], node_map[104494])
connect!(node_map[104487], node_map[104496])
connect!(node_map[104487], node_map[104499])
connect!(node_map[104487], node_map[104502])
connect!(node_map[104487], node_map[104505])
connect!(node_map[104488], node_map[104489])
connect!(node_map[104490], node_map[104491])
connect!(node_map[104491], node_map[104492])
connect!(node_map[104492], node_map[104493])
connect!(node_map[104494], node_map[104495])
connect!(node_map[104496], node_map[104497])
connect!(node_map[104497], node_map[104498])
connect!(node_map[104499], node_map[104500])
connect!(node_map[104500], node_map[104501])
connect!(node_map[104502], node_map[104503])
connect!(node_map[104503], node_map[104504])
connect!(node_map[104505], node_map[104506])
connect!(node_map[104506], node_map[104507])
connect!(node_map[104508], node_map[104509])
connect!(node_map[104508], node_map[104511])
connect!(node_map[104508], node_map[104515])
connect!(node_map[104508], node_map[104517])
connect!(node_map[104508], node_map[104520])
connect!(node_map[104508], node_map[104523])
connect!(node_map[104508], node_map[104526])
connect!(node_map[104509], node_map[104510])
connect!(node_map[104511], node_map[104512])
connect!(node_map[104512], node_map[104513])
connect!(node_map[104513], node_map[104514])
connect!(node_map[104515], node_map[104516])
connect!(node_map[104517], node_map[104518])
connect!(node_map[104518], node_map[104519])
connect!(node_map[104520], node_map[104521])
connect!(node_map[104521], node_map[104522])
connect!(node_map[104523], node_map[104524])
connect!(node_map[104524], node_map[104525])
connect!(node_map[104526], node_map[104527])
connect!(node_map[104527], node_map[104528])
connect!(node_map[104529], node_map[104530])
connect!(node_map[104529], node_map[104532])
connect!(node_map[104529], node_map[104536])
connect!(node_map[104529], node_map[104538])
connect!(node_map[104529], node_map[104541])
connect!(node_map[104529], node_map[104544])
connect!(node_map[104529], node_map[104547])
connect!(node_map[104530], node_map[104531])
connect!(node_map[104532], node_map[104533])
connect!(node_map[104533], node_map[104534])
connect!(node_map[104534], node_map[104535])
connect!(node_map[104536], node_map[104537])
connect!(node_map[104538], node_map[104539])
connect!(node_map[104539], node_map[104540])
connect!(node_map[104541], node_map[104542])
connect!(node_map[104542], node_map[104543])
connect!(node_map[104544], node_map[104545])
connect!(node_map[104545], node_map[104546])
connect!(node_map[104547], node_map[104548])
connect!(node_map[104548], node_map[104549])
connect!(node_map[104550], node_map[104551])
connect!(node_map[104550], node_map[104553])
connect!(node_map[104550], node_map[104557])
connect!(node_map[104550], node_map[104559])
connect!(node_map[104550], node_map[104562])
connect!(node_map[104550], node_map[104565])
connect!(node_map[104550], node_map[104568])
connect!(node_map[104551], node_map[104552])
connect!(node_map[104553], node_map[104554])
connect!(node_map[104554], node_map[104555])
connect!(node_map[104555], node_map[104556])
connect!(node_map[104557], node_map[104558])
connect!(node_map[104559], node_map[104560])
connect!(node_map[104560], node_map[104561])
connect!(node_map[104562], node_map[104563])
connect!(node_map[104563], node_map[104564])
connect!(node_map[104565], node_map[104566])
connect!(node_map[104566], node_map[104567])
connect!(node_map[104568], node_map[104569])
connect!(node_map[104569], node_map[104570])
connect!(node_map[104571], node_map[104572])
connect!(node_map[104571], node_map[104574])
connect!(node_map[104571], node_map[104578])
connect!(node_map[104571], node_map[104580])
connect!(node_map[104571], node_map[104583])
connect!(node_map[104571], node_map[104586])
connect!(node_map[104571], node_map[104589])
connect!(node_map[104572], node_map[104573])
connect!(node_map[104574], node_map[104575])
connect!(node_map[104575], node_map[104576])
connect!(node_map[104576], node_map[104577])
connect!(node_map[104578], node_map[104579])
connect!(node_map[104580], node_map[104581])
connect!(node_map[104581], node_map[104582])
connect!(node_map[104583], node_map[104584])
connect!(node_map[104584], node_map[104585])
connect!(node_map[104586], node_map[104587])
connect!(node_map[104587], node_map[104588])
connect!(node_map[104589], node_map[104590])
connect!(node_map[104590], node_map[104591])
connect!(node_map[104592], node_map[104593])
connect!(node_map[104592], node_map[104595])
connect!(node_map[104592], node_map[104599])
connect!(node_map[104592], node_map[104601])
connect!(node_map[104592], node_map[104604])
connect!(node_map[104592], node_map[104607])
connect!(node_map[104592], node_map[104610])
connect!(node_map[104593], node_map[104594])
connect!(node_map[104595], node_map[104596])
connect!(node_map[104596], node_map[104597])
connect!(node_map[104597], node_map[104598])
connect!(node_map[104599], node_map[104600])
connect!(node_map[104601], node_map[104602])
connect!(node_map[104602], node_map[104603])
connect!(node_map[104604], node_map[104605])
connect!(node_map[104605], node_map[104606])
connect!(node_map[104607], node_map[104608])
connect!(node_map[104608], node_map[104609])
connect!(node_map[104610], node_map[104611])
connect!(node_map[104611], node_map[104612])
connect!(node_map[104613], node_map[104614])
connect!(node_map[104613], node_map[104616])
connect!(node_map[104613], node_map[104620])
connect!(node_map[104613], node_map[104622])
connect!(node_map[104613], node_map[104625])
connect!(node_map[104613], node_map[104628])
connect!(node_map[104613], node_map[104631])
connect!(node_map[104614], node_map[104615])
connect!(node_map[104616], node_map[104617])
connect!(node_map[104617], node_map[104618])
connect!(node_map[104618], node_map[104619])
connect!(node_map[104620], node_map[104621])
connect!(node_map[104622], node_map[104623])
connect!(node_map[104623], node_map[104624])
connect!(node_map[104625], node_map[104626])
connect!(node_map[104626], node_map[104627])
connect!(node_map[104628], node_map[104629])
connect!(node_map[104629], node_map[104630])
connect!(node_map[104631], node_map[104632])
connect!(node_map[104632], node_map[104633])
connect!(node_map[104634], node_map[104635])
connect!(node_map[104634], node_map[104640])
connect!(node_map[104634], node_map[104652])
connect!(node_map[104634], node_map[104654])
connect!(node_map[104634], node_map[104657])
connect!(node_map[104635], node_map[104636])
connect!(node_map[104635], node_map[104638])
connect!(node_map[104636], node_map[104637])
connect!(node_map[104638], node_map[104639])
connect!(node_map[104640], node_map[104641])
connect!(node_map[104641], node_map[104642])
connect!(node_map[104641], node_map[104644])
connect!(node_map[104641], node_map[104646])
connect!(node_map[104641], node_map[104648])
connect!(node_map[104641], node_map[104650])
connect!(node_map[104642], node_map[104643])
connect!(node_map[104644], node_map[104645])
connect!(node_map[104646], node_map[104647])
connect!(node_map[104648], node_map[104649])
connect!(node_map[104650], node_map[104651])
connect!(node_map[104652], node_map[104653])
connect!(node_map[104654], node_map[104655])
connect!(node_map[104655], node_map[104656])
connect!(node_map[104657], node_map[104658])
connect!(node_map[104658], node_map[104659])
connect!(node_map[104659], node_map[104660])
connect!(node_map[104661], node_map[104662])
connect!(node_map[104661], node_map[104666])
connect!(node_map[104662], node_map[104663])
connect!(node_map[104662], node_map[104665])
connect!(node_map[104663], node_map[104664])
connect!(node_map[104666], node_map[104667])
connect!(node_map[104668], node_map[104669])
connect!(node_map[104668], node_map[104673])
connect!(node_map[104669], node_map[104670])
connect!(node_map[104669], node_map[104672])
connect!(node_map[104670], node_map[104671])
connect!(node_map[104673], node_map[104674])
connect!(node_map[104675], node_map[104676])
connect!(node_map[104675], node_map[104678])
connect!(node_map[104676], node_map[104677])
connect!(node_map[104677], node_map[104680])
connect!(node_map[104677], node_map[104684])
connect!(node_map[104677], node_map[104692])
connect!(node_map[104677], node_map[104696])
connect!(node_map[104677], node_map[104702])
connect!(node_map[104677], node_map[104708])
connect!(node_map[104677], node_map[104714])
connect!(node_map[104678], node_map[104679])
connect!(node_map[104679], node_map[104682])
connect!(node_map[104679], node_map[104688])
connect!(node_map[104679], node_map[104694])
connect!(node_map[104679], node_map[104699])
connect!(node_map[104679], node_map[104705])
connect!(node_map[104679], node_map[104711])
connect!(node_map[104679], node_map[104717])
connect!(node_map[104680], node_map[104681])
connect!(node_map[104682], node_map[104683])
connect!(node_map[104684], node_map[104685])
connect!(node_map[104685], node_map[104686])
connect!(node_map[104686], node_map[104687])
connect!(node_map[104688], node_map[104689])
connect!(node_map[104689], node_map[104690])
connect!(node_map[104690], node_map[104691])
connect!(node_map[104692], node_map[104693])
connect!(node_map[104694], node_map[104695])
connect!(node_map[104696], node_map[104697])
connect!(node_map[104697], node_map[104698])
connect!(node_map[104699], node_map[104700])
connect!(node_map[104700], node_map[104701])
connect!(node_map[104702], node_map[104703])
connect!(node_map[104703], node_map[104704])
connect!(node_map[104705], node_map[104706])
connect!(node_map[104706], node_map[104707])
connect!(node_map[104708], node_map[104709])
connect!(node_map[104709], node_map[104710])
connect!(node_map[104711], node_map[104712])
connect!(node_map[104712], node_map[104713])
connect!(node_map[104714], node_map[104715])
connect!(node_map[104715], node_map[104716])
connect!(node_map[104717], node_map[104718])
connect!(node_map[104718], node_map[104719])
connect!(node_map[104720], node_map[104721])
connect!(node_map[104721], node_map[104722])
connect!(node_map[104721], node_map[104727])
connect!(node_map[104721], node_map[104732])
connect!(node_map[104721], node_map[104737])
connect!(node_map[104721], node_map[104743])
connect!(node_map[104722], node_map[104723])
connect!(node_map[104722], node_map[104725])
connect!(node_map[104723], node_map[104724])
connect!(node_map[104725], node_map[104726])
connect!(node_map[104727], node_map[104728])
connect!(node_map[104727], node_map[104730])
connect!(node_map[104728], node_map[104729])
connect!(node_map[104730], node_map[104731])
connect!(node_map[104732], node_map[104733])
connect!(node_map[104732], node_map[104735])
connect!(node_map[104733], node_map[104734])
connect!(node_map[104735], node_map[104736])
connect!(node_map[104737], node_map[104738])
connect!(node_map[104738], node_map[104739])
connect!(node_map[104738], node_map[104741])
connect!(node_map[104739], node_map[104740])
connect!(node_map[104741], node_map[104742])
connect!(node_map[104743], node_map[104744])
connect!(node_map[104744], node_map[104745])
connect!(node_map[104744], node_map[104747])
connect!(node_map[104745], node_map[104746])
connect!(node_map[104747], node_map[104748])
connect!(node_map[104749], node_map[104750])
connect!(node_map[104750], node_map[104751])
connect!(node_map[104750], node_map[104760])
connect!(node_map[104751], node_map[104752])
connect!(node_map[104752], node_map[104753])
connect!(node_map[104752], node_map[104755])
connect!(node_map[104752], node_map[104757])
connect!(node_map[104753], node_map[104754])
connect!(node_map[104755], node_map[104756])
connect!(node_map[104757], node_map[104758])
connect!(node_map[104758], node_map[104759])
connect!(node_map[104760], node_map[104761])
connect!(node_map[104761], node_map[104762])
connect!(node_map[104763], node_map[104764])
connect!(node_map[104764], node_map[104765])
connect!(node_map[104765], node_map[104766])
connect!(node_map[104766], node_map[104767])
connect!(node_map[104768], node_map[104769])
connect!(node_map[104768], node_map[104773])
connect!(node_map[104769], node_map[104770])
connect!(node_map[104770], node_map[104771])
connect!(node_map[104771], node_map[104772])
connect!(node_map[104773], node_map[104774])
connect!(node_map[104774], node_map[104775])
connect!(node_map[104775], node_map[104776])
connect!(node_map[104777], node_map[104778])
connect!(node_map[104777], node_map[104783])
connect!(node_map[104778], node_map[104779])
connect!(node_map[104778], node_map[104781])
connect!(node_map[104779], node_map[104780])
connect!(node_map[104781], node_map[104782])
connect!(node_map[104783], node_map[104784])
connect!(node_map[104783], node_map[104786])
connect!(node_map[104784], node_map[104785])
connect!(node_map[104786], node_map[104787])
connect!(node_map[104788], node_map[104789])
connect!(node_map[104788], node_map[104794])
connect!(node_map[104789], node_map[104790])
connect!(node_map[104789], node_map[104792])
connect!(node_map[104790], node_map[104791])
connect!(node_map[104792], node_map[104793])
connect!(node_map[104794], node_map[104795])
connect!(node_map[104794], node_map[104797])
connect!(node_map[104795], node_map[104796])
connect!(node_map[104797], node_map[104798])
connect!(node_map[104799], node_map[104800])
connect!(node_map[104800], node_map[104801])
connect!(node_map[104801], node_map[104802])
connect!(node_map[104802], node_map[104803])
connect!(node_map[104804], node_map[104805])
connect!(node_map[104805], node_map[104806])
connect!(node_map[104806], node_map[104807])
connect!(node_map[104806], node_map[104808])
connect!(node_map[104806], node_map[104810])
connect!(node_map[104808], node_map[104809])
connect!(node_map[104810], node_map[104811])
connect!(node_map[104812], node_map[104813])
connect!(node_map[104813], node_map[104814])
connect!(node_map[104814], node_map[104815])
connect!(node_map[104814], node_map[104816])
connect!(node_map[104814], node_map[104818])
connect!(node_map[104816], node_map[104817])
connect!(node_map[104818], node_map[104819])
connect!(node_map[104820], node_map[104821])
connect!(node_map[104822], node_map[104823])
connect!(node_map[104824], node_map[104825])
connect!(node_map[104826], node_map[104827])
connect!(node_map[104828], node_map[104829])
connect!(node_map[104830], node_map[104831])
connect!(node_map[104832], node_map[104833])
connect!(node_map[104834], node_map[104836])
connect!(node_map[104834], node_map[104847])
connect!(node_map[104835], node_map[104858])
connect!(node_map[104836], node_map[104837])
connect!(node_map[104837], node_map[104838])
connect!(node_map[104838], node_map[104839])
connect!(node_map[104838], node_map[104841])
connect!(node_map[104838], node_map[104843])
connect!(node_map[104839], node_map[104840])
connect!(node_map[104841], node_map[104842])
connect!(node_map[104843], node_map[104844])
connect!(node_map[104844], node_map[104845])
connect!(node_map[104845], node_map[104846])
connect!(node_map[104847], node_map[104848])
connect!(node_map[104848], node_map[104849])
connect!(node_map[104849], node_map[104850])
connect!(node_map[104849], node_map[104852])
connect!(node_map[104849], node_map[104854])
connect!(node_map[104850], node_map[104851])
connect!(node_map[104852], node_map[104853])
connect!(node_map[104854], node_map[104855])
connect!(node_map[104855], node_map[104856])
connect!(node_map[104856], node_map[104857])
connect!(node_map[104858], node_map[104859])
connect!(node_map[104858], node_map[104866])
connect!(node_map[104859], node_map[104860])
connect!(node_map[104860], node_map[104861])
connect!(node_map[104861], node_map[104862])
connect!(node_map[104861], node_map[104864])
connect!(node_map[104862], node_map[104863])
connect!(node_map[104864], node_map[104865])
connect!(node_map[104866], node_map[104867])
connect!(node_map[104867], node_map[104868])
connect!(node_map[104868], node_map[104869])
connect!(node_map[104870], node_map[104872])
connect!(node_map[104870], node_map[104876])
connect!(node_map[104870], node_map[104882])
connect!(node_map[104871], node_map[104887])
connect!(node_map[104871], node_map[104896])
connect!(node_map[104871], node_map[104905])
connect!(node_map[104872], node_map[104873])
connect!(node_map[104872], node_map[104875])
connect!(node_map[104873], node_map[104874])
connect!(node_map[104876], node_map[104877])
connect!(node_map[104877], node_map[104878])
connect!(node_map[104877], node_map[104880])
connect!(node_map[104878], node_map[104879])
connect!(node_map[104880], node_map[104881])
connect!(node_map[104882], node_map[104883])
connect!(node_map[104883], node_map[104884])
connect!(node_map[104884], node_map[104885])
connect!(node_map[104885], node_map[104886])
connect!(node_map[104887], node_map[104888])
connect!(node_map[104888], node_map[104889])
connect!(node_map[104889], node_map[104890])
connect!(node_map[104889], node_map[104892])
connect!(node_map[104889], node_map[104894])
connect!(node_map[104890], node_map[104891])
connect!(node_map[104892], node_map[104893])
connect!(node_map[104894], node_map[104895])
connect!(node_map[104896], node_map[104897])
connect!(node_map[104897], node_map[104898])
connect!(node_map[104898], node_map[104899])
connect!(node_map[104898], node_map[104901])
connect!(node_map[104898], node_map[104903])
connect!(node_map[104899], node_map[104900])
connect!(node_map[104901], node_map[104902])
connect!(node_map[104903], node_map[104904])
connect!(node_map[104905], node_map[104906])
connect!(node_map[104906], node_map[104907])
connect!(node_map[104907], node_map[104908])
connect!(node_map[104908], node_map[104909])

professor_x_dump.compile_program!
