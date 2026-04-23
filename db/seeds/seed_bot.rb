# Standalone seed file for Clone newBot!.

require_relative 'helpers'

user = seed_user!

seed_bot = user.bots.find_or_initialize_by(name: "Seed Bot")
seed_bot.description = ""
seed_bot.save!

reset_bot_graph!(seed_bot)

node_map = { 110574 => seed_bot.root_node }

node_map[110575] = create_condition!(
  bot: seed_bot,
  position_x: 3799.5898714902737,
  position_y: 3346.177796724234,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110576] = create_action!(
  bot: seed_bot,
  position_x: 3691.8610180994024,
  position_y: 3737.6205472629763,
  action_type: "add",
  value: 5
)

node_map[110577] = create_condition!(
  bot: seed_bot,
  position_x: 3800.345466950181,
  position_y: 3564.343317537908,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110578] = create_organizer!(
  bot: seed_bot,
  position_x: -2563.545654708767,
  position_y: -235.57421875,
  title: "Organizer",
  notes: ""
)

node_map[110580] = create_organizer!(
  bot: seed_bot,
  position_x: 213.890625,
  position_y: 2273.3125,
  title: "Organizer",
  notes: ""
)

node_map[110581] = create_organizer!(
  bot: seed_bot,
  position_x: 5176.703125,
  position_y: 2178.140625,
  title: "Organizer",
  notes: ""
)

node_map[110582] = create_condition!(
  bot: seed_bot,
  position_x: 2090.534279897932,
  position_y: 2940.995021969621,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "subjectFilterMode"=>"exclude",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110587] = create_organizer!(
  bot: seed_bot,
  position_x: 3144.877768713129,
  position_y: 2878.5386778535085,
  title: "Strip King Shelter",
  notes: ""
)

node_map[110593] = create_condition!(
  bot: seed_bot,
  position_x: 3307.0339984325915,
  position_y: 3831.6873175848705,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110594] = create_action!(
  bot: seed_bot,
  position_x: 3206.3273115001616,
  position_y: 3985.0166310972577,
  action_type: "add",
  value: 18
)

node_map[110595] = create_organizer!(
  bot: seed_bot,
  position_x: -1641.2812500000002,
  position_y: 929.826171875,
  title: "Endgame",
  notes: ""
)

node_map[110596] = create_condition!(
  bot: seed_bot,
  position_x: -1619.2812500000002,
  position_y: 1123.701171875,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "target"=>"exact_number",
   "targetTotal"=>3}
)

node_map[110597] = create_condition!(
  bot: seed_bot,
  position_x: 3097.82941813553,
  position_y: 3742.2669976750294,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110598] = create_condition!(
  bot: seed_bot,
  position_x: 3306.541791116359,
  position_y: 3622.268024238547,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110599] = create_condition!(
  bot: seed_bot,
  position_x: 3163.363900508439,
  position_y: 3052.637975404955,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>1}
)

node_map[110603] = create_condition!(
  bot: seed_bot,
  position_x: 3185.2791458280913,
  position_y: 3481.7709175377927,
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
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110604] = create_condition!(
  bot: seed_bot,
  position_x: -1619.2812500000002,
  position_y: 1342.201171875,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "target"=>"exact_number",
   "targetTotal"=>3}
)

node_map[110605] = create_condition!(
  bot: seed_bot,
  position_x: -2312.6250000000005,
  position_y: 2077.775390625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include"}
)

node_map[110606] = create_action!(
  bot: seed_bot,
  position_x: -2043.1093750000002,
  position_y: 2380.228515625,
  action_type: "return",
  value: 7
)

node_map[110607] = create_organizer!(
  bot: seed_bot,
  position_x: -3498.123779708767,
  position_y: 267.46484375,
  title: "Avoid Stalemate",
  notes: ""
)

node_map[110608] = create_condition!(
  bot: seed_bot,
  position_x: -3478.139404708767,
  position_y: 464.85546875,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110609] = create_organizer!(
  bot: seed_bot,
  position_x: 6224.953125,
  position_y: 2925.140625,
  title: "Free capture",
  notes: ""
)

node_map[110610] = create_condition!(
  bot: seed_bot,
  position_x: 6246.890625,
  position_y: 3119.046875,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>1}
)

node_map[110611] = create_condition!(
  bot: seed_bot,
  position_x: 6250.0625,
  position_y: 3341.53125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110612] = create_action!(
  bot: seed_bot,
  position_x: 6249.03125,
  position_y: 3614.890625,
  action_type: "add",
  value: 60
)

node_map[110613] = create_condition!(
  bot: seed_bot,
  position_x: -3478.139404708767,
  position_y: 703.98046875,
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
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110614] = create_condition!(
  bot: seed_bot,
  position_x: 5497.359375,
  position_y: 3513.28125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"less_than",
   "target"=>"captured_piece",
   "targetFilter"=>"any"}
)

node_map[110615] = create_action!(
  bot: seed_bot,
  position_x: 5495.265625,
  position_y: 3722.875,
  action_type: "add",
  value: 30
)

node_map[110616] = create_action!(
  bot: seed_bot,
  position_x: -3472.873779708767,
  position_y: 920.57421875,
  action_type: "return",
  value: -1000
)

node_map[110617] = create_condition!(
  bot: seed_bot,
  position_x: -2946.2187500000005,
  position_y: 2260.96875,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"king",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110618] = create_organizer!(
  bot: seed_bot,
  position_x: -2098.78125,
  position_y: 1890.90234375,
  title: "push safe pawns",
  notes: ""
)

node_map[110619] = create_organizer!(
  bot: seed_bot,
  position_x: 4991.15625,
  position_y: 2901.125,
  title: "avoid hanging pieces",
  notes: ""
)

node_map[110620] = create_condition!(
  bot: seed_bot,
  position_x: 5009.484375,
  position_y: 3101.140625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110621] = create_action!(
  bot: seed_bot,
  position_x: -1324.7187500000005,
  position_y: 2391.90625,
  action_type: "add",
  value: 16
)

node_map[110622] = create_condition!(
  bot: seed_bot,
  position_x: -2946.5625000000005,
  position_y: 2451.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"rook",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110623] = create_condition!(
  bot: seed_bot,
  position_x: 5010.015625,
  position_y: 3306.3125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110624] = create_action!(
  bot: seed_bot,
  position_x: -2950.9375000000005,
  position_y: 2679.703125,
  action_type: "add",
  value: 12
)

node_map[110625] = create_condition!(
  bot: seed_bot,
  position_x: 5013.9375,
  position_y: 3502.59375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110626] = create_action!(
  bot: seed_bot,
  position_x: 5009.515625,
  position_y: 3709.0625,
  action_type: "subtract",
  value: 20
)

node_map[110627] = create_condition!(
  bot: seed_bot,
  position_x: -1326.7812500000005,
  position_y: 2153.015625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "subjectFilterMode"=>"include",
   "targetTotal"=>1}
)

node_map[110628] = create_organizer!(
  bot: seed_bot,
  position_x: 6466.625,
  position_y: 2930.71875,
  title: "Safe promotion",
  notes: ""
)

node_map[110629] = create_condition!(
  bot: seed_bot,
  position_x: 6485.15625,
  position_y: 3122.875,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "target"=>"prior_board_state"}
)

node_map[110630] = create_condition!(
  bot: seed_bot,
  position_x: 6477.453125,
  position_y: 3332.90625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110631] = create_action!(
  bot: seed_bot,
  position_x: 6475.484375,
  position_y: 3553.890625,
  action_type: "add",
  value: 30
)

node_map[110632] = create_organizer!(
  bot: seed_bot,
  position_x: -3262.155339688708,
  position_y: 786.0639488678571,
  title: "Opening Game Condition",
  notes: ""
)

node_map[110633] = create_organizer!(
  bot: seed_bot,
  position_x: -1349.0156250000002,
  position_y: 1747.953125,
  title: "Attack pawns",
  notes: ""
)

node_map[110634] = create_action!(
  bot: seed_bot,
  position_x: -543.796875,
  position_y: 826.57421875,
  action_type: "subtract",
  value: 20
)

node_map[110635] = create_condition!(
  bot: seed_bot,
  position_x: -1517.5937500000005,
  position_y: 2165.671875,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110636] = create_condition!(
  bot: seed_bot,
  position_x: -4111.977361564938,
  position_y: 1648.9938004503565,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "target"=>"prior_board_state"}
)

node_map[110637] = create_organizer!(
  bot: seed_bot,
  position_x: 4258.28125,
  position_y: -36.234375,
  title: "recapture",
  notes: ""
)

node_map[110638] = create_condition!(
  bot: seed_bot,
  position_x: 4276.703125,
  position_y: 178.8125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy_captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>1}
)

node_map[110639] = create_condition!(
  bot: seed_bot,
  position_x: 4272.484375,
  position_y: 390.46875,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy_moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"same_piece",
   "target"=>"captured_piece",
   "targetFilter"=>"any"}
)

node_map[110640] = create_condition!(
  bot: seed_bot,
  position_x: 4266.875,
  position_y: 595.875,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy_moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "target"=>"enemy_captured_piece",
   "targetFilter"=>"any"}
)

node_map[110641] = create_condition!(
  bot: seed_bot,
  position_x: -1519.2031250000005,
  position_y: 1931.46875,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110642] = create_action!(
  bot: seed_bot,
  position_x: 4253.09375,
  position_y: 821.5,
  action_type: "add",
  value: 15
)

node_map[110643] = create_action!(
  bot: seed_bot,
  position_x: -1528.4843750000005,
  position_y: 2396.453125,
  action_type: "add",
  value: 15
)

node_map[110644] = create_condition!(
  bot: seed_bot,
  position_x: -2159.71875,
  position_y: 2090.40234375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110645] = create_action!(
  bot: seed_bot,
  position_x: 4461.0,
  position_y: 3649.625,
  action_type: "add",
  value: 15
)

node_map[110646] = create_condition!(
  bot: seed_bot,
  position_x: -1995.1562500000002,
  position_y: 2086.05859375,
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
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110647] = create_organizer!(
  bot: seed_bot,
  position_x: 4449.625,
  position_y: 3035.4375,
  title: "Kick material",
  notes: ""
)

node_map[110648] = create_condition!(
  bot: seed_bot,
  position_x: -533.921875,
  position_y: 471.58984375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"include"}
)

node_map[110649] = create_organizer!(
  bot: seed_bot,
  position_x: -559.5,
  position_y: 186.58984375,
  title: "Queen safety",
  notes: ""
)

node_map[110650] = create_condition!(
  bot: seed_bot,
  position_x: 4469.78125,
  position_y: 3230.984375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"exclude"}
)

node_map[110652] = create_condition!(
  bot: seed_bot,
  position_x: 4466.6875,
  position_y: 3446.359375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include"}
)

node_map[110653] = create_condition!(
  bot: seed_bot,
  position_x: -749.46875,
  position_y: 449.90234375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>0}
)

node_map[110654] = create_condition!(
  bot: seed_bot,
  position_x: -755.265625,
  position_y: 667.30859375,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110655] = create_condition!(
  bot: seed_bot,
  position_x: -366.60227272727275,
  position_y: 456.395596590909,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110656] = create_condition!(
  bot: seed_bot,
  position_x: -366.57102272727275,
  position_y: 666.692471590909,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110657] = create_action!(
  bot: seed_bot,
  position_x: -369.43039772727275,
  position_y: 865.051846590909,
  action_type: "add",
  value: 150
)

node_map[110658] = create_condition!(
  bot: seed_bot,
  position_x: 4762.296875,
  position_y: 3595.984375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[110659] = create_condition!(
  bot: seed_bot,
  position_x: -4234.864118613422,
  position_y: 2033.3632006682483,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"exclude"}
)

node_map[110660] = create_action!(
  bot: seed_bot,
  position_x: 4754.859375,
  position_y: 3804.171875,
  action_type: "add",
  value: 30
)

node_map[110661] = create_condition!(
  bot: seed_bot,
  position_x: -3780.5814685178557,
  position_y: 580.548828125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"less_than",
   "target"=>"exact_number",
   "targetTotal"=>5}
)

node_map[110662] = create_organizer!(
  bot: seed_bot,
  position_x: 6961.65625,
  position_y: 2970.015625,
  title: "Queen pressure",
  notes: ""
)

node_map[110663] = create_condition!(
  bot: seed_bot,
  position_x: 6984.09375,
  position_y: 3160.703125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>1}
)

node_map[110664] = create_condition!(
  bot: seed_bot,
  position_x: 6983.265625,
  position_y: 3361.5,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"queen",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110665] = create_condition!(
  bot: seed_bot,
  position_x: -3778.6752185178557,
  position_y: 373.064453125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "subjectFilterMode"=>"include",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110666] = create_organizer!(
  bot: seed_bot,
  position_x: -3796.6752185178557,
  position_y: 172.423828125,
  title: "Force stalemate when losing",
  notes: ""
)

node_map[110667] = create_action!(
  bot: seed_bot,
  position_x: 6980.546875,
  position_y: 3968.515625,
  action_type: "add",
  value: 25
)

node_map[110668] = create_condition!(
  bot: seed_bot,
  position_x: 4776.734375,
  position_y: 3177.53125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>0}
)

node_map[110669] = create_organizer!(
  bot: seed_bot,
  position_x: -813.0455731149591,
  position_y: 2657.65625,
  title: "Discoverd attack",
  notes: ""
)

node_map[110670] = create_condition!(
  bot: seed_bot,
  position_x: -4236.742985350878,
  position_y: 2238.7966692343625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110671] = create_action!(
  bot: seed_bot,
  position_x: -4125.4669793101475,
  position_y: 2431.912409589091,
  action_type: "add",
  value: 10
)

node_map[110672] = create_condition!(
  bot: seed_bot,
  position_x: 4771.953125,
  position_y: 3391.0625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"exclude"}
)

node_map[110673] = create_condition!(
  bot: seed_bot,
  position_x: -785.9361981149591,
  position_y: 2881.265625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"exclude",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>0}
)

node_map[110674] = create_condition!(
  bot: seed_bot,
  position_x: -786.5299481149591,
  position_y: 3107.140625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110675] = create_action!(
  bot: seed_bot,
  position_x: -785.2330731149591,
  position_y: 3548.5,
  action_type: "add",
  value: 20
)

node_map[110676] = create_organizer!(
  bot: seed_bot,
  position_x: 4756.546875,
  position_y: 2986.671875,
  title: "Discovered check",
  notes: ""
)

node_map[110677] = create_condition!(
  bot: seed_bot,
  position_x: -3792.2220935178557,
  position_y: 800.408203125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110678] = create_organizer!(
  bot: seed_bot,
  position_x: -4115.094360725112,
  position_y: 1448.1142019891759,
  title: "Safe Knight Development",
  notes: ""
)

node_map[110679] = create_condition!(
  bot: seed_bot,
  position_x: -3792.2220935178557,
  position_y: 1012.798828125,
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
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110680] = create_organizer!(
  bot: seed_bot,
  position_x: -569.4049481149591,
  position_y: 2674.921875,
  title: "Open file rook",
  notes: ""
)

node_map[110681] = create_organizer!(
  bot: seed_bot,
  position_x: -116.44599799069897,
  position_y: 2701.53125,
  title: "Dual king threat",
  notes: ""
)

node_map[110682] = create_condition!(
  bot: seed_bot,
  position_x: -4117.985222814891,
  position_y: 1850.3892531689512,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>1}
)

node_map[110683] = create_condition!(
  bot: seed_bot,
  position_x: -98.22724799069897,
  position_y: 2908.1875,
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
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>1}
)

node_map[110684] = create_organizer!(
  bot: seed_bot,
  position_x: 553.647752009301,
  position_y: 2764.40625,
  title: "Discourage pawn roaming",
  notes: ""
)

node_map[110685] = create_condition!(
  bot: seed_bot,
  position_x: -554.6549481149591,
  position_y: 2859.40625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "subjectFilterMode"=>"include",
   "target"=>"prior_board_state"}
)

node_map[110686] = create_condition!(
  bot: seed_bot,
  position_x: 1003.4075518850404,
  position_y: 2958.03125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"major",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"major",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"value",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110687] = create_organizer!(
  bot: seed_bot,
  position_x: 987.1888018850404,
  position_y: 2778.328125,
  title: "Connect majors",
  notes: "NOT BEHAVING AS DESIRED\ncounts aggregate value of allies defending and defended"
)

node_map[110688] = create_condition!(
  bot: seed_bot,
  position_x: -1835.7968750000002,
  position_y: 2082.40234375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110689] = create_organizer!(
  bot: seed_bot,
  position_x: 5641.578125,
  position_y: 2902.0625,
  title: "Escape check safely",
  notes: ""
)

node_map[110690] = create_condition!(
  bot: seed_bot,
  position_x: 5660.03125,
  position_y: 3110.296875,
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
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110691] = create_action!(
  bot: seed_bot,
  position_x: 5893.109375,
  position_y: 3668.421875,
  action_type: "add",
  value: 5
)

node_map[110692] = create_condition!(
  bot: seed_bot,
  position_x: 5898.0,
  position_y: 3259.328125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"major",
   "targetFilterMode"=>"exclude"}
)

node_map[110693] = create_organizer!(
  bot: seed_bot,
  position_x: 6712.3125,
  position_y: 2934.5,
  title: "Hide from attacks",
  notes: ""
)

node_map[110694] = create_action!(
  bot: seed_bot,
  position_x: 6720.96875,
  position_y: 3402.84375,
  action_type: "subtract",
  value: 5
)

node_map[110695] = create_condition!(
  bot: seed_bot,
  position_x: 6730.03125,
  position_y: 3136.734375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy_moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"exclude"}
)

node_map[110696] = create_organizer!(
  bot: seed_bot,
  position_x: 4042.65625,
  position_y: -12.3125,
  title: "Retain defense",
  notes: ""
)

node_map[110697] = create_condition!(
  bot: seed_bot,
  position_x: 4057.203125,
  position_y: 193.40625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110698] = create_action!(
  bot: seed_bot,
  position_x: 1000.5950518850404,
  position_y: 3183.25,
  action_type: "add",
  value: 8
)

node_map[110699] = create_action!(
  bot: seed_bot,
  position_x: -3792.2220935178557,
  position_y: 1240.986328125,
  action_type: "return",
  value: 1000
)

node_map[110700] = create_action!(
  bot: seed_bot,
  position_x: -100.32099799069897,
  position_y: 3127.390625,
  action_type: "add",
  value: 30
)

node_map[110701] = create_action!(
  bot: seed_bot,
  position_x: 4053.296875,
  position_y: 404.453125,
  action_type: "subtract",
  value: 3
)

node_map[110702] = create_condition!(
  bot: seed_bot,
  position_x: -1141.521839263717,
  position_y: 2934.4813452486137,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"exclude",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>1}
)

node_map[110703] = create_action!(
  bot: seed_bot,
  position_x: 578.835252009301,
  position_y: 3147.0,
  action_type: "subtract",
  value: 1
)

node_map[110704] = create_condition!(
  bot: seed_bot,
  position_x: -555.3111981149591,
  position_y: 3288.515625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"major",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include"}
)

node_map[110705] = create_action!(
  bot: seed_bot,
  position_x: -552.4205731149591,
  position_y: 3518.171875,
  action_type: "add",
  value: 7
)

node_map[110706] = create_condition!(
  bot: seed_bot,
  position_x: -554.8268231149591,
  position_y: 3069.359375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"major",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110707] = create_condition!(
  bot: seed_bot,
  position_x: 581.647752009301,
  position_y: 2940.640625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110708] = create_organizer!(
  bot: seed_bot,
  position_x: -1163.7624616794856,
  position_y: 2668.782128659633,
  title: "Knight Fork",
  notes: ""
)

node_map[110709] = create_condition!(
  bot: seed_bot,
  position_x: 6984.265625,
  position_y: 3560.765625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include"}
)

node_map[110710] = create_condition!(
  bot: seed_bot,
  position_x: 6984.9375,
  position_y: 3769.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110711] = create_organizer!(
  bot: seed_bot,
  position_x: -1497.4375,
  position_y: 2636.734375,
  title: "Safety",
  notes: ""
)

node_map[110712] = create_condition!(
  bot: seed_bot,
  position_x: -1477.890625,
  position_y: 2836.59375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110713] = create_action!(
  bot: seed_bot,
  position_x: -1478.984375,
  position_y: 3058.359375,
  action_type: "subtract",
  value: 5
)

node_map[110714] = create_condition!(
  bot: seed_bot,
  position_x: -4028.898532326948,
  position_y: 200.818359375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[110715] = create_action!(
  bot: seed_bot,
  position_x: -4028.898532326948,
  position_y: 520.818359375,
  action_type: "return",
  value: 1000
)

node_map[110716] = create_condition!(
  bot: seed_bot,
  position_x: -1263.099964263717,
  position_y: 3078.4969702486137,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110717] = create_action!(
  bot: seed_bot,
  position_x: -1034.1837217016237,
  position_y: 3404.311764450028,
  action_type: "add",
  value: 30
)

node_map[110718] = create_organizer!(
  bot: seed_bot,
  position_x: -4028.898532326948,
  position_y: 40.818359375,
  title: "Checkmate",
  notes: ""
)

node_map[110719] = create_condition!(
  bot: seed_bot,
  position_x: -1024.553089263717,
  position_y: 3074.9032202486137,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110720] = create_condition!(
  bot: seed_bot,
  position_x: -4028.898532326948,
  position_y: 360.818359375,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110722] = create_condition!(
  bot: seed_bot,
  position_x: -1261.7289474609734,
  position_y: 3261.1234418720137,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110725] = create_organizer!(
  bot: seed_bot,
  position_x: 6029.182592343537,
  position_y: 2936.219737804577,
  title: "Avoid Pawn Attacks",
  notes: ""
)

node_map[110726] = create_organizer!(
  bot: seed_bot,
  position_x: 1431.7539644706833,
  position_y: 2769.799238498473,
  title: "Winning Capture",
  notes: ""
)

node_map[110728] = create_action!(
  bot: seed_bot,
  position_x: 3833.9966466106634,
  position_y: 303.5901779308567,
  action_type: "add",
  value: 3
)

node_map[110729] = create_action!(
  bot: seed_bot,
  position_x: 6053.0494630274725,
  position_y: 3352.571145419119,
  action_type: "subtract",
  value: 8
)

node_map[110730] = create_action!(
  bot: seed_bot,
  position_x: 1450.966390022532,
  position_y: 3221.71522198286,
  action_type: "add",
  value: 50
)

node_map[110731] = create_organizer!(
  bot: seed_bot,
  position_x: 3825.9966466106634,
  position_y: -16.409822069143274,
  title: "Any Capture",
  notes: ""
)

node_map[110732] = create_condition!(
  bot: seed_bot,
  position_x: -782.640625,
  position_y: 3332.9375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110733] = create_condition!(
  bot: seed_bot,
  position_x: 6058.2525880274725,
  position_y: 3145.7728409134256,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"exclude"}
)

node_map[110734] = create_action!(
  bot: seed_bot,
  position_x: 5368.03125,
  position_y: 3661.515625,
  action_type: "add",
  value: 100
)

node_map[110735] = create_condition!(
  bot: seed_bot,
  position_x: -190.64914772727275,
  position_y: 673.8735795454547,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110736] = create_condition!(
  bot: seed_bot,
  position_x: 1454.966390022532,
  position_y: 2995.1330339047167,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110737] = create_condition!(
  bot: seed_bot,
  position_x: 3837.9966466106634,
  position_y: 143.59017793085673,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110738] = create_condition!(
  bot: seed_bot,
  position_x: -184.747159090909,
  position_y: 869.2485795454547,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110739] = create_condition!(
  bot: seed_bot,
  position_x: 5641.03125,
  position_y: 3425.5,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"major",
   "targetFilterMode"=>"exclude"}
)

node_map[110740] = create_action!(
  bot: seed_bot,
  position_x: 5638.03125,
  position_y: 3654.859375,
  action_type: "add",
  value: 20
)

node_map[110741] = create_condition!(
  bot: seed_bot,
  position_x: -188.9076704545455,
  position_y: 1067.8352272727275,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110742] = create_condition!(
  bot: seed_bot,
  position_x: 5757.21875,
  position_y: 3309.5625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include"}
)

node_map[110743] = create_action!(
  bot: seed_bot,
  position_x: -183.1051136363635,
  position_y: 1265.8267045454545,
  action_type: "add",
  value: 60
)

node_map[110744] = create_action!(
  bot: seed_bot,
  position_x: 5752.140625,
  position_y: 3539.3125,
  action_type: "add",
  value: 10
)

node_map[110745] = create_condition!(
  bot: seed_bot,
  position_x: 5500.578125,
  position_y: 3275.390625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "target"=>"exact_number",
   "targetTotal"=>0}
)

node_map[110746] = create_condition!(
  bot: seed_bot,
  position_x: 5373.5,
  position_y: 3428.953125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110747] = create_condition!(
  bot: seed_bot,
  position_x: -181.32102272727275,
  position_y: 469.37784090909076,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include"}
)

node_map[110748] = create_organizer!(
  bot: seed_bot,
  position_x: -3258.3204430594838,
  position_y: 1718.6154672259277,
  title: "castling",
  notes: ""
)

node_map[110749] = create_condition!(
  bot: seed_bot,
  position_x: -3380.0120930434427,
  position_y: 2324.652204403681,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"king",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110750] = create_condition!(
  bot: seed_bot,
  position_x: -2954.4689667069442,
  position_y: 1874.7179414831658,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>1}
)

node_map[110751] = create_condition!(
  bot: seed_bot,
  position_x: -3238.738645491754,
  position_y: 1918.9277522439565,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110752] = create_action!(
  bot: seed_bot,
  position_x: -3243.4928269620364,
  position_y: 2546.6393041046804,
  action_type: "add",
  value: 10
)

node_map[110753] = create_condition!(
  bot: seed_bot,
  position_x: -3108.9113425411992,
  position_y: 2328.277017643131,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110754] = create_condition!(
  bot: seed_bot,
  position_x: -3236.8520075900624,
  position_y: 2104.8873618298194,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "target"=>"prior_board_state"}
)

node_map[110755] = create_condition!(
  bot: seed_bot,
  position_x: -3240.7553459057476,
  position_y: 2323.415255196643,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110756] = create_condition!(
  bot: seed_bot,
  position_x: -2952.180749144759,
  position_y: 2055.5088775457725,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"king",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110757] = create_condition!(
  bot: seed_bot,
  position_x: -3473.7880542887906,
  position_y: 1870.70497153312,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "operator"=>"adjacent",
   "target"=>"allied",
   "targetFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"equal_to",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>0}
)

node_map[110758] = create_action!(
  bot: seed_bot,
  position_x: -3476.83544884169,
  position_y: 2097.653946112416,
  action_type: "subtract",
  value: 5
)

node_map[110759] = create_organizer!(
  bot: seed_bot,
  position_x: 5178.939734746634,
  position_y: 3046.9620482486785,
  title: "Improve Pawn Mobility",
  notes: ""
)

node_map[110760] = create_action!(
  bot: seed_bot,
  position_x: 5190.567927230999,
  position_y: 3461.6630746140045,
  action_type: "add",
  value: 5
)

node_map[110762] = create_condition!(
  bot: seed_bot,
  position_x: 5200.550570507774,
  position_y: 3245.900739166401,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110763] = create_condition!(
  bot: seed_bot,
  position_x: -4025.1049579201517,
  position_y: 2143.279314399475,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110764] = create_organizer!(
  bot: seed_bot,
  position_x: -3761.37114848514,
  position_y: 1635.3140708968667,
  title: "Safe Bishop Development",
  notes: ""
)

node_map[110765] = create_condition!(
  bot: seed_bot,
  position_x: -3865.175906501011,
  position_y: 2217.5244006534685,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110766] = create_action!(
  bot: seed_bot,
  position_x: -3755.778767197737,
  position_y: 2616.0736095743114,
  action_type: "add",
  value: 10
)

node_map[110767] = create_condition!(
  bot: seed_bot,
  position_x: -3748.2970107024807,
  position_y: 2034.5504531541715,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110768] = create_condition!(
  bot: seed_bot,
  position_x: -3742.289149452528,
  position_y: 1833.1550004355768,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "subjectFilterMode"=>"include",
   "target"=>"prior_board_state"}
)

node_map[110769] = create_condition!(
  bot: seed_bot,
  position_x: -3867.054773238467,
  position_y: 2422.957869219583,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectFilterMode"=>"include",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110770] = create_condition!(
  bot: seed_bot,
  position_x: -3655.4167458077413,
  position_y: 2327.4405143846952,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110771] = create_condition!(
  bot: seed_bot,
  position_x: -3241.6801889193925,
  position_y: 1052.7679267381745,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "target"=>"exact_number",
   "targetTotal"=>34}
)

node_map[110772] = create_condition!(
  bot: seed_bot,
  position_x: -3240.8126909476928,
  position_y: 1269.928541099559,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "target"=>"exact_number",
   "targetTotal"=>34}
)

node_map[110773] = create_condition!(
  bot: seed_bot,
  position_x: 244.20301999526828,
  position_y: 2912.859409300139,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"exclude",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>1}
)

node_map[110774] = create_organizer!(
  bot: seed_bot,
  position_x: 223.9936475794998,
  position_y: 2697.7383177111583,
  title: "Bishop Fork",
  notes: ""
)

node_map[110775] = create_condition!(
  bot: seed_bot,
  position_x: 1139.0053954958819,
  position_y: 3359.077964583056,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110776] = create_organizer!(
  bot: seed_bot,
  position_x: 770.0642434149913,
  position_y: 2788.250959771902,
  title: "Rook skewer",
  notes: ""
)

node_map[110777] = create_action!(
  bot: seed_bot,
  position_x: 810.2104675704932,
  position_y: 3643.06946169549,
  action_type: "return",
  value: 15
)

node_map[110778] = create_condition!(
  bot: seed_bot,
  position_x: 906.7087229665613,
  position_y: 3422.2993186860913,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110779] = create_action!(
  bot: seed_bot,
  position_x: 380.4161375573617,
  position_y: 3445.221078501553,
  action_type: "add",
  value: 20
)

node_map[110780] = create_condition!(
  bot: seed_bot,
  position_x: 1224.2204275531976,
  position_y: 2958.4743891264607,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"value",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"moved_piece"}
)

node_map[110781] = create_condition!(
  bot: seed_bot,
  position_x: 1226.2474166615566,
  position_y: 3154.0698609448646,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110782] = create_condition!(
  bot: seed_bot,
  position_x: 106.04676999526828,
  position_y: 3057.500034300139,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110783] = create_condition!(
  bot: seed_bot,
  position_x: 108.105286798012,
  position_y: 3298.345255923539,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110784] = create_condition!(
  bot: seed_bot,
  position_x: 1342.7681744145664,
  position_y: 3365.2417025143245,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110785] = create_condition!(
  bot: seed_bot,
  position_x: 793.4704934149913,
  position_y: 2974.875959771902,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"exclude",
   "subjectComparisonMetric"=>"value",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"moved_piece"}
)

node_map[110786] = create_condition!(
  bot: seed_bot,
  position_x: 790.1879652135513,
  position_y: 3211.1274771166313,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110787] = create_condition!(
  bot: seed_bot,
  position_x: 702.9459440478763,
  position_y: 3416.135580754823,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110788] = create_organizer!(
  bot: seed_bot,
  position_x: 1977.3064900635445,
  position_y: 2765.7349187727013,
  title: "Queen Pin",
  notes: ""
)

node_map[110789] = create_condition!(
  bot: seed_bot,
  position_x: 1907.1592105974057,
  position_y: 2940.0406374597947,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"value",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110790] = create_condition!(
  bot: seed_bot,
  position_x: 379.8905199952683,
  position_y: 3061.656284300139,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110791] = create_action!(
  bot: seed_bot,
  position_x: 1246.2699190184985,
  position_y: 3586.0118455237234,
  action_type: "add",
  value: 15
)

node_map[110792] = create_action!(
  bot: seed_bot,
  position_x: 1999.4704702964027,
  position_y: 3546.7704271457,
  action_type: "add",
  value: 15
)

node_map[110793] = create_organizer!(
  bot: seed_bot,
  position_x: 1207.6820161129208,
  position_y: 2772.9703634992834,
  title: "Queen skewer",
  notes: ""
)

node_map[110794] = create_condition!(
  bot: seed_bot,
  position_x: 1998.971037231655,
  position_y: 3131.428309024262,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0,
   "targetComparisonMetric"=>"value",
   "targetComparator"=>"less_than",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>9}
)

node_map[110795] = create_condition!(
  bot: seed_bot,
  position_x: 1902.172294852923,
  position_y: 3330.009819584155,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110796] = create_condition!(
  bot: seed_bot,
  position_x: 2079.234810745452,
  position_y: 3333.723279111087,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110797] = create_organizer!(
  bot: seed_bot,
  position_x: 2311.9163700397376,
  position_y: 2778.077466128586,
  title: "Rook Pin",
  notes: ""
)

node_map[110798] = create_condition!(
  bot: seed_bot,
  position_x: 2423.792553364082,
  position_y: 3420.7158671203597,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110799] = create_condition!(
  bot: seed_bot,
  position_x: 2675.497099773885,
  position_y: 3457.9781199876984,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110800] = create_condition!(
  bot: seed_bot,
  position_x: 2332.6942434264756,
  position_y: 2989.370212272568,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"rook",
   "subjectFilterMode"=>"exclude",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110802] = create_condition!(
  bot: seed_bot,
  position_x: 2847.393871407559,
  position_y: 3458.659052710754,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110803] = create_condition!(
  bot: seed_bot,
  position_x: 2343.528779850285,
  position_y: 3218.420897033535,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0,
   "targetComparisonMetric"=>"value",
   "targetComparator"=>"less_than",
   "targetComparisonSource"=>"exact_number",
   "targetComparisonSourceTotal"=>5}
)

node_map[110804] = create_condition!(
  bot: seed_bot,
  position_x: 3593.9342042062303,
  position_y: 3088.709967832873,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[110805] = create_condition!(
  bot: seed_bot,
  position_x: 2757.7725757512094,
  position_y: 3028.9669813239634,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "target"=>"prior_board_state"}
)

node_map[110806] = create_condition!(
  bot: seed_bot,
  position_x: 2246.7300374715533,
  position_y: 3417.002407593428,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110807] = create_action!(
  bot: seed_bot,
  position_x: 2344.028212915033,
  position_y: 3633.763015154973,
  action_type: "add",
  value: 15
)

node_map[110808] = create_organizer!(
  bot: seed_bot,
  position_x: 2737.7469633958895,
  position_y: 2857.298270569782,
  title: "Tighten The Net",
  notes: ""
)

node_map[110809] = create_action!(
  bot: seed_bot,
  position_x: 2767.223096574225,
  position_y: 3644.957499848163,
  action_type: "add",
  value: 17
)

node_map[110810] = create_condition!(
  bot: seed_bot,
  position_x: 2679.187946001482,
  position_y: 3225.8723420051447,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "subjectFilterMode"=>"include",
   "target"=>"exact_number",
   "targetTotal"=>1}
)

node_map[110811] = create_condition!(
  bot: seed_bot,
  position_x: 2846.814333171455,
  position_y: 3225.0092481665515,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110813] = create_organizer!(
  bot: seed_bot,
  position_x: 3666.8198262240508,
  position_y: 2905.661736709835,
  title: "Direct King Pressure",
  notes: ""
)

node_map[110814] = create_condition!(
  bot: seed_bot,
  position_x: 3597.928069329471,
  position_y: 3435.5779825268723,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110846] = create_condition!(
  bot: seed_bot,
  position_x: -1192.9687500000005,
  position_y: 1947.140625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "targetFilterMode"=>"include"}
)

node_map[110847] = create_condition!(
  bot: seed_bot,
  position_x: -1189.0312500000005,
  position_y: 2171.796875,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110848] = create_action!(
  bot: seed_bot,
  position_x: -1203.9375000000005,
  position_y: 2380.5625,
  action_type: "add",
  value: 19
)

node_map[110849] = create_condition!(
  bot: seed_bot,
  position_x: -1689.7656250000005,
  position_y: 2068.75,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include"}
)

node_map[110850] = create_organizer!(
  bot: seed_bot,
  position_x: 1723.125,
  position_y: 3881.75,
  title: "Winning attack",
  notes: ""
)

node_map[110851] = create_condition!(
  bot: seed_bot,
  position_x: 1747.15625,
  position_y: 4096.328125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"value",
   "targetComparator"=>"greater_than",
   "targetComparisonSource"=>"moved_piece"}
)

node_map[110852] = create_action!(
  bot: seed_bot,
  position_x: 1751.078125,
  position_y: 4325.453125,
  action_type: "add",
  value: 4
)

node_map[110860] = create_condition!(
  bot: seed_bot,
  position_x: 3052.859375,
  position_y: 3270.625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"adjacent",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[110861] = create_condition!(
  bot: seed_bot,
  position_x: 3290.0,
  position_y: 3258.890625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[110862] = create_condition!(
  bot: seed_bot,
  position_x: 3804.4375000000005,
  position_y: 3098.78125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"shield",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"greater_than",
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110880] = create_action!(
  bot: seed_bot,
  position_x: 3585.4339177870324,
  position_y: 5034.02482824375,
  action_type: "add",
  value: 18
)

node_map[110881] = create_condition!(
  bot: seed_bot,
  position_x: 3686.1406047194623,
  position_y: 4880.695514731362,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110882] = create_condition!(
  bot: seed_bot,
  position_x: 3561.84550679531,
  position_y: 4324.864922551446,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "target"=>"exact_number",
   "targetTotal"=>1}
)

node_map[110883] = create_organizer!(
  bot: seed_bot,
  position_x: 3543.359375,
  position_y: 4150.765625,
  title: "Strip King Shelter",
  notes: ""
)

node_map[110884] = create_condition!(
  bot: seed_bot,
  position_x: 3476.936024422401,
  position_y: 4791.275194821521,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110885] = create_condition!(
  bot: seed_bot,
  position_x: 4241.3125,
  position_y: 4471.0625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110886] = create_condition!(
  bot: seed_bot,
  position_x: 3685.64839740323,
  position_y: 4671.276221385038,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110887] = create_organizer!(
  bot: seed_bot,
  position_x: 4108.542454733777,
  position_y: 4030.546439985601,
  title: "Direct King Pressure",
  notes: ""
)

node_map[110888] = create_condition!(
  bot: seed_bot,
  position_x: 4039.650697839197,
  position_y: 4560.462685802639,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110889] = create_condition!(
  bot: seed_bot,
  position_x: 4242.068095459907,
  position_y: 4689.228020813674,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110890] = create_condition!(
  bot: seed_bot,
  position_x: 4414.96875,
  position_y: 4533.140625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"equal_to",
   "subjectComparisonSource"=>"exact_number",
   "subjectComparisonSourceTotal"=>0}
)

node_map[110891] = create_action!(
  bot: seed_bot,
  position_x: 4133.583646609129,
  position_y: 4862.505250538742,
  action_type: "add",
  value: 15
)

node_map[110892] = create_condition!(
  bot: seed_bot,
  position_x: 4503.53125,
  position_y: 4320.1875,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"exclude"}
)

node_map[110893] = create_condition!(
  bot: seed_bot,
  position_x: 4035.6568327159566,
  position_y: 4213.594671108639,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[110894] = create_organizer!(
  bot: seed_bot,
  position_x: 4483.375,
  position_y: 4124.640625,
  title: "Kick material",
  notes: ""
)

node_map[110895] = create_action!(
  bot: seed_bot,
  position_x: 4501.40625,
  position_y: 4768.09375,
  action_type: "add",
  value: 15
)

node_map[110896] = create_condition!(
  bot: seed_bot,
  position_x: 4593.625,
  position_y: 4544.9375,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any",
   "subjectFilterMode"=>"include"}
)

node_map[110897] = create_organizer!(
  bot: seed_bot,
  position_x: 4855.8125,
  position_y: 4126.0,
  title: "Improve Pawn Mobility",
  notes: ""
)

node_map[110898] = create_action!(
  bot: seed_bot,
  position_x: 4885.596942484365,
  position_y: 4522.4666513653265,
  action_type: "add",
  value: 5
)

node_map[110899] = create_condition!(
  bot: seed_bot,
  position_x: 4975.405095403925,
  position_y: 4327.218374363776,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110900] = create_condition!(
  bot: seed_bot,
  position_x: 4794.78271076114,
  position_y: 4325.001190917723,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"defend",
   "target"=>"allied",
   "targetFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"greater_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110901] = create_condition!(
  bot: seed_bot,
  position_x: 3564.385752114962,
  position_y: 4530.779114684285,
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
   "subjectComparisonSource"=>"prior_board_state"}
)

node_map[110902] = create_organizer!(
  bot: seed_bot,
  position_x: 1092.390625,
  position_y: 847.125,
  title: "Winning",
  notes: ""
)

node_map[110903] = create_condition!(
  bot: seed_bot,
  position_x: 1021.984375,
  position_y: 1060.390625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"minor",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "target"=>"enemy",
   "subjectFilterMode"=>"include",
   "targetFilter"=>"minor",
   "targetFilterMode"=>"include"}
)

node_map[110904] = create_condition!(
  bot: seed_bot,
  position_x: 1198.9375,
  position_y: 1054.515625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"major",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "target"=>"enemy",
   "subjectFilterMode"=>"include",
   "targetFilter"=>"major",
   "targetFilterMode"=>"include"}
)

node_map[110905] = create_condition!(
  bot: seed_bot,
  position_x: 1117.046875,
  position_y: 1271.625,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "target"=>"enemy",
   "targetFilter"=>"any"}
)

node_map[110906] = create_condition!(
  bot: seed_bot,
  position_x: 681.84375,
  position_y: 1750.203125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "targetComparisonMetric"=>"value",
   "targetComparator"=>"greater_than_or_equal_to",
   "targetComparisonSource"=>"moved_piece"}
)

node_map[110907] = create_organizer!(
  bot: seed_bot,
  position_x: 774.65625,
  position_y: 1524.671875,
  title: "Even trade",
  notes: ""
)

node_map[110908] = create_condition!(
  bot: seed_bot,
  position_x: 916.40625,
  position_y: 1748.953125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than_or_equal_to",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110909] = create_action!(
  bot: seed_bot,
  position_x: 677.28125,
  position_y: 2156.484375,
  action_type: "add",
  value: 14
)

node_map[110910] = create_action!(
  bot: seed_bot,
  position_x: 912.921875,
  position_y: 1979.015625,
  action_type: "add",
  value: 12
)

node_map[110911] = create_condition!(
  bot: seed_bot,
  position_x: 685.390625,
  position_y: 1958.65625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[110912] = create_organizer!(
  bot: seed_bot,
  position_x: 1852.453125,
  position_y: 840.0,
  title: "Organizer",
  notes: ""
)

node_map[110913] = create_condition!(
  bot: seed_bot,
  position_x: 1793.484375,
  position_y: 1303.90625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"cover",
   "target"=>"allied",
   "targetFilter"=>"major",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110914] = create_action!(
  bot: seed_bot,
  position_x: 1788.375,
  position_y: 1504.15625,
  action_type: "subtract",
  value: 1
)

node_map[110915] = create_organizer!(
  bot: seed_bot,
  position_x: 1856.96875,
  position_y: 1094.921875,
  title: "Pawns protect majors",
  notes: ""
)

node_map[110916] = create_condition!(
  bot: seed_bot,
  position_x: 1978.640625,
  position_y: 1273.078125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "operator"=>"shield",
   "target"=>"allied",
   "targetFilter"=>"major",
   "subjectFilterMode"=>"include",
   "targetFilterMode"=>"include",
   "targetComparisonMetric"=>"count",
   "targetComparator"=>"less_than",
   "targetComparisonSource"=>"prior_board_state"}
)

node_map[110917] = create_action!(
  bot: seed_bot,
  position_x: 1979.6875,
  position_y: 1483.265625,
  action_type: "subtract",
  value: 10
)

node_map[110920] = create_condition!(
  bot: seed_bot,
  position_x: 5896.75,
  position_y: 3463.96875,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "target"=>"exact_number",
   "subjectFilterMode"=>"include",
   "targetTotal"=>0}
)

node_map[111955] = create_condition!(
  bot: seed_bot,
  position_x: 2805.71875,
  position_y: 35.765625,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"any"}
)

connect!(node_map[110575], node_map[110577])
connect!(node_map[110577], node_map[110576])
connect!(node_map[110578], node_map[110607])
connect!(node_map[110578], node_map[110666])
connect!(node_map[110578], node_map[110718])
connect!(node_map[110578], node_map[110632])
connect!(node_map[110578], node_map[110595])
connect!(node_map[110580], node_map[110708])
connect!(node_map[110580], node_map[110726])
connect!(node_map[110580], node_map[110774])
connect!(node_map[110580], node_map[110793])
connect!(node_map[110580], node_map[110776])
connect!(node_map[110580], node_map[110788])
connect!(node_map[110580], node_map[110669])
connect!(node_map[110580], node_map[110681])
connect!(node_map[110580], node_map[110684])
connect!(node_map[110580], node_map[110687])
connect!(node_map[110580], node_map[110680])
connect!(node_map[110580], node_map[110711])
connect!(node_map[110581], node_map[110725])
connect!(node_map[110581], node_map[110759])
connect!(node_map[110581], node_map[110808])
connect!(node_map[110581], node_map[110813])
connect!(node_map[110581], node_map[110587])
connect!(node_map[110581], node_map[110609])
connect!(node_map[110581], node_map[110619])
connect!(node_map[110581], node_map[110628])
connect!(node_map[110581], node_map[110647])
connect!(node_map[110581], node_map[110676])
connect!(node_map[110581], node_map[110662])
connect!(node_map[110581], node_map[110689])
connect!(node_map[110581], node_map[110693])
connect!(node_map[110582], node_map[110794])
connect!(node_map[110587], node_map[110599])
connect!(node_map[110593], node_map[110594])
connect!(node_map[110595], node_map[110596])
connect!(node_map[110596], node_map[110604])
connect!(node_map[110597], node_map[110594])
connect!(node_map[110598], node_map[110593])
connect!(node_map[110603], node_map[110597])
connect!(node_map[110603], node_map[110598])
connect!(node_map[110605], node_map[110606])
connect!(node_map[110607], node_map[110608])
connect!(node_map[110608], node_map[110613])
connect!(node_map[110609], node_map[110610])
connect!(node_map[110610], node_map[110611])
connect!(node_map[110611], node_map[110612])
connect!(node_map[110574], node_map[110649])
connect!(node_map[110574], node_map[110578])
connect!(node_map[110574], node_map[110580])
connect!(node_map[110574], node_map[110581])
connect!(node_map[110613], node_map[110616])
connect!(node_map[110614], node_map[110615])
connect!(node_map[110617], node_map[110622])
connect!(node_map[110618], node_map[110605])
connect!(node_map[110618], node_map[110644])
connect!(node_map[110618], node_map[110646])
connect!(node_map[110618], node_map[110688])
connect!(node_map[110619], node_map[110620])
connect!(node_map[110620], node_map[110623])
connect!(node_map[110622], node_map[110624])
connect!(node_map[110623], node_map[110625])
connect!(node_map[110625], node_map[110626])
connect!(node_map[110627], node_map[110621])
connect!(node_map[110628], node_map[110629])
connect!(node_map[110629], node_map[110630])
connect!(node_map[110630], node_map[110631])
connect!(node_map[110632], node_map[110771])
connect!(node_map[110633], node_map[110641])
connect!(node_map[110635], node_map[110643])
connect!(node_map[110636], node_map[110682])
connect!(node_map[110637], node_map[110638])
connect!(node_map[110638], node_map[110639])
connect!(node_map[110639], node_map[110640])
connect!(node_map[110640], node_map[110642])
connect!(node_map[110641], node_map[110635])
connect!(node_map[110644], node_map[110606])
connect!(node_map[110646], node_map[110606])
connect!(node_map[110647], node_map[110650])
connect!(node_map[110648], node_map[110634])
connect!(node_map[110649], node_map[110653])
connect!(node_map[110649], node_map[110648])
connect!(node_map[110649], node_map[110655])
connect!(node_map[110649], node_map[110747])
connect!(node_map[110650], node_map[110652])
connect!(node_map[110652], node_map[110645])
connect!(node_map[110653], node_map[110654])
connect!(node_map[110654], node_map[110634])
connect!(node_map[110655], node_map[110656])
connect!(node_map[110656], node_map[110657])
connect!(node_map[110658], node_map[110660])
connect!(node_map[110659], node_map[110670])
connect!(node_map[110661], node_map[110677])
connect!(node_map[110662], node_map[110663])
connect!(node_map[110663], node_map[110664])
connect!(node_map[110664], node_map[110709])
connect!(node_map[110665], node_map[110661])
connect!(node_map[110666], node_map[110665])
connect!(node_map[110668], node_map[110672])
connect!(node_map[110669], node_map[110673])
connect!(node_map[110670], node_map[110671])
connect!(node_map[110672], node_map[110658])
connect!(node_map[110673], node_map[110674])
connect!(node_map[110674], node_map[110732])
connect!(node_map[110676], node_map[110668])
connect!(node_map[110677], node_map[110679])
connect!(node_map[110678], node_map[110636])
connect!(node_map[110679], node_map[110699])
connect!(node_map[110680], node_map[110685])
connect!(node_map[110681], node_map[110683])
connect!(node_map[110682], node_map[110659])
connect!(node_map[110682], node_map[110763])
connect!(node_map[110683], node_map[110700])
connect!(node_map[110684], node_map[110707])
connect!(node_map[110685], node_map[110706])
connect!(node_map[110686], node_map[110698])
connect!(node_map[110687], node_map[110686])
connect!(node_map[110688], node_map[110606])
connect!(node_map[110689], node_map[110690])
connect!(node_map[110690], node_map[110692])
connect!(node_map[110690], node_map[110742])
connect!(node_map[110690], node_map[110745])
connect!(node_map[110693], node_map[110695])
connect!(node_map[110695], node_map[110694])
connect!(node_map[110696], node_map[110697])
connect!(node_map[110697], node_map[110701])
connect!(node_map[110702], node_map[110716])
connect!(node_map[110702], node_map[110719])
connect!(node_map[110704], node_map[110705])
connect!(node_map[110706], node_map[110704])
connect!(node_map[110707], node_map[110703])
connect!(node_map[110708], node_map[110702])
connect!(node_map[110709], node_map[110710])
connect!(node_map[110710], node_map[110667])
connect!(node_map[110711], node_map[110712])
connect!(node_map[110712], node_map[110713])
connect!(node_map[110714], node_map[110720])
connect!(node_map[110716], node_map[110722])
connect!(node_map[110718], node_map[110714])
connect!(node_map[110719], node_map[110717])
connect!(node_map[110720], node_map[110715])
connect!(node_map[110722], node_map[110717])
connect!(node_map[110725], node_map[110733])
connect!(node_map[110726], node_map[110736])
connect!(node_map[110731], node_map[110737])
connect!(node_map[110732], node_map[110675])
connect!(node_map[110733], node_map[110729])
connect!(node_map[110735], node_map[110738])
connect!(node_map[110736], node_map[110730])
connect!(node_map[110737], node_map[110728])
connect!(node_map[110738], node_map[110741])
connect!(node_map[110739], node_map[110740])
connect!(node_map[110741], node_map[110743])
connect!(node_map[110742], node_map[110744])
connect!(node_map[110745], node_map[110746])
connect!(node_map[110745], node_map[110739])
connect!(node_map[110745], node_map[110614])
connect!(node_map[110746], node_map[110734])
connect!(node_map[110747], node_map[110735])
connect!(node_map[110748], node_map[110751])
connect!(node_map[110748], node_map[110750])
connect!(node_map[110748], node_map[110757])
connect!(node_map[110749], node_map[110752])
connect!(node_map[110750], node_map[110756])
connect!(node_map[110751], node_map[110754])
connect!(node_map[110753], node_map[110752])
connect!(node_map[110754], node_map[110749])
connect!(node_map[110754], node_map[110753])
connect!(node_map[110754], node_map[110755])
connect!(node_map[110755], node_map[110752])
connect!(node_map[110756], node_map[110617])
connect!(node_map[110757], node_map[110758])
connect!(node_map[110759], node_map[110762])
connect!(node_map[110762], node_map[110760])
connect!(node_map[110763], node_map[110671])
connect!(node_map[110764], node_map[110768])
connect!(node_map[110765], node_map[110769])
connect!(node_map[110767], node_map[110765])
connect!(node_map[110767], node_map[110770])
connect!(node_map[110768], node_map[110767])
connect!(node_map[110769], node_map[110766])
connect!(node_map[110770], node_map[110766])
connect!(node_map[110771], node_map[110772])
connect!(node_map[110772], node_map[110678])
connect!(node_map[110772], node_map[110764])
connect!(node_map[110773], node_map[110782])
connect!(node_map[110773], node_map[110790])
connect!(node_map[110774], node_map[110773])
connect!(node_map[110775], node_map[110791])
connect!(node_map[110776], node_map[110785])
connect!(node_map[110778], node_map[110777])
connect!(node_map[110780], node_map[110781])
connect!(node_map[110781], node_map[110775])
connect!(node_map[110781], node_map[110784])
connect!(node_map[110782], node_map[110783])
connect!(node_map[110783], node_map[110779])
connect!(node_map[110784], node_map[110791])
connect!(node_map[110785], node_map[110786])
connect!(node_map[110786], node_map[110778])
connect!(node_map[110786], node_map[110787])
connect!(node_map[110787], node_map[110777])
connect!(node_map[110788], node_map[110789])
connect!(node_map[110788], node_map[110582])
connect!(node_map[110789], node_map[110794])
connect!(node_map[110790], node_map[110779])
connect!(node_map[110793], node_map[110780])
connect!(node_map[110794], node_map[110795])
connect!(node_map[110794], node_map[110796])
connect!(node_map[110795], node_map[110792])
connect!(node_map[110796], node_map[110792])
connect!(node_map[110797], node_map[110800])
connect!(node_map[110798], node_map[110807])
connect!(node_map[110799], node_map[110809])
connect!(node_map[110802], node_map[110809])
connect!(node_map[110803], node_map[110798])
connect!(node_map[110803], node_map[110806])
connect!(node_map[110804], node_map[110814])
connect!(node_map[110804], node_map[110575])
connect!(node_map[110805], node_map[110810])
connect!(node_map[110805], node_map[110811])
connect!(node_map[110806], node_map[110807])
connect!(node_map[110808], node_map[110805])
connect!(node_map[110810], node_map[110802])
connect!(node_map[110810], node_map[110799])
connect!(node_map[110811], node_map[110802])
connect!(node_map[110811], node_map[110799])
connect!(node_map[110813], node_map[110804])
connect!(node_map[110814], node_map[110576])
connect!(node_map[110846], node_map[110847])
connect!(node_map[110847], node_map[110848])
connect!(node_map[110641], node_map[110627])
connect!(node_map[110633], node_map[110846])
connect!(node_map[110604], node_map[110633])
connect!(node_map[110618], node_map[110849])
connect!(node_map[110849], node_map[110606])
connect!(node_map[110604], node_map[110618])
connect!(node_map[110772], node_map[110748])
connect!(node_map[110580], node_map[110850])
connect!(node_map[110850], node_map[110851])
connect!(node_map[110851], node_map[110852])
connect!(node_map[110800], node_map[110803])
connect!(node_map[110580], node_map[110797])
connect!(node_map[110599], node_map[110861])
connect!(node_map[110599], node_map[110860])
connect!(node_map[110860], node_map[110603])
connect!(node_map[110861], node_map[110603])
connect!(node_map[110813], node_map[110862])
connect!(node_map[110862], node_map[110575])
connect!(node_map[110862], node_map[110814])
connect!(node_map[110882], node_map[110901])
connect!(node_map[110881], node_map[110880])
connect!(node_map[110886], node_map[110881])
connect!(node_map[110883], node_map[110882])
connect!(node_map[110901], node_map[110884])
connect!(node_map[110901], node_map[110886])
connect!(node_map[110885], node_map[110889])
connect!(node_map[110893], node_map[110885])
connect!(node_map[110887], node_map[110893])
connect!(node_map[110889], node_map[110891])
connect!(node_map[110888], node_map[110891])
connect!(node_map[110893], node_map[110888])
connect!(node_map[110890], node_map[110895])
connect!(node_map[110892], node_map[110896])
connect!(node_map[110892], node_map[110890])
connect!(node_map[110894], node_map[110892])
connect!(node_map[110896], node_map[110895])
connect!(node_map[110897], node_map[110899])
connect!(node_map[110897], node_map[110900])
connect!(node_map[110899], node_map[110898])
connect!(node_map[110900], node_map[110898])
connect!(node_map[110884], node_map[110880])
connect!(node_map[110902], node_map[110903])
connect!(node_map[110902], node_map[110904])
connect!(node_map[110903], node_map[110905])
connect!(node_map[110904], node_map[110905])
connect!(node_map[110905], node_map[110907])
connect!(node_map[110907], node_map[110906])
connect!(node_map[110907], node_map[110908])
connect!(node_map[110908], node_map[110910])
connect!(node_map[110906], node_map[110911])
connect!(node_map[110911], node_map[110909])
connect!(node_map[110913], node_map[110914])
connect!(node_map[110912], node_map[110915])
connect!(node_map[110915], node_map[110913])
connect!(node_map[110915], node_map[110916])
connect!(node_map[110916], node_map[110917])
connect!(node_map[110692], node_map[110920])
connect!(node_map[110920], node_map[110691])

seed_bot.compile_program!
