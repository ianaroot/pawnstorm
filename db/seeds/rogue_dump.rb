# Standalone seed file for Rogue Dump.

require_relative 'helpers'

user = seed_user!

rogue_dump = user.bots.find_or_initialize_by(name: "Rogue Dump")
rogue_dump.description = "A behavior-preserving refactor target for Rogue using shared graph trunks instead of repeated flat seed paths. Migrated from Rogue v2 by bots:migrate_to_v2_grammar_clone."
rogue_dump.save!

reset_bot_graph!(rogue_dump)

node_map = { 103029 => rogue_dump.root_node }

node_map[103030] = create_organizer!(
  bot: rogue_dump,
  position_x: -980.0,
  position_y: -327.3330078125,
  title: "Terminal",
  notes: ""
)

node_map[103031] = create_organizer!(
  bot: rogue_dump,
  position_x: 7255.238115583148,
  position_y: 155.4285714285714,
  title: "Opening",
  notes: ""
)

node_map[103032] = create_organizer!(
  bot: rogue_dump,
  position_x: -3914.665367126465,
  position_y: 1600.0,
  title: "Tactics",
  notes: ""
)

node_map[103033] = create_organizer!(
  bot: rogue_dump,
  position_x: 3308.5714285714275,
  position_y: 260.0,
  title: "Queen Strategy",
  notes: ""
)

node_map[103034] = create_organizer!(
  bot: rogue_dump,
  position_x: 532.0,
  position_y: 3328.0,
  title: "King Pressure",
  notes: ""
)

node_map[103035] = create_organizer!(
  bot: rogue_dump,
  position_x: 5206.857142857143,
  position_y: 1547.4285714285716,
  title: "Endgame",
  notes: ""
)

node_map[103036] = create_organizer!(
  bot: rogue_dump,
  position_x: 3030.285714285712,
  position_y: 3342.8571428571427,
  title: "Fallback",
  notes: ""
)

node_map[103037] = create_condition!(
  bot: rogue_dump,
  position_x: -1020.0,
  position_y: -167.3330078125,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"enemy",
   "targetFilter"=>"king",
   "targetFilterMode"=>"include"}
)

node_map[103038] = create_condition!(
  bot: rogue_dump,
  position_x: -960.0,
  position_y: -17.3330078125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103039] = create_score!(
  bot: rogue_dump,
  position_x: -1020.0,
  position_y: 132.6669921875,
  action_type: "return",
  value: 100
)

node_map[103040] = create_condition!(
  bot: rogue_dump,
  position_x: -800.0,
  position_y: -167.3330078125,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103041] = create_condition!(
  bot: rogue_dump,
  position_x: -740.0,
  position_y: -17.3330078125,
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

node_map[103042] = create_score!(
  bot: rogue_dump,
  position_x: -800.0,
  position_y: 132.6669921875,
  action_type: "return",
  value: -100
)

node_map[103043] = create_condition!(
  bot: rogue_dump,
  position_x: 7135.238115583148,
  position_y: 315.4285714285714,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103044] = create_condition!(
  bot: rogue_dump,
  position_x: 7215.238115583148,
  position_y: 465.4285714285714,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103045] = create_condition!(
  bot: rogue_dump,
  position_x: 7135.238115583148,
  position_y: 615.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103046] = create_condition!(
  bot: rogue_dump,
  position_x: 7215.238115583148,
  position_y: 765.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103047] = create_condition!(
  bot: rogue_dump,
  position_x: 7135.238115583148,
  position_y: 915.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103048] = create_condition!(
  bot: rogue_dump,
  position_x: 7215.238115583148,
  position_y: 1065.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[103049] = create_condition!(
  bot: rogue_dump,
  position_x: 7135.238115583148,
  position_y: 1215.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103050] = create_condition!(
  bot: rogue_dump,
  position_x: 7215.238115583148,
  position_y: 1365.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103051] = create_condition!(
  bot: rogue_dump,
  position_x: 7135.238115583148,
  position_y: 1515.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103052] = create_condition!(
  bot: rogue_dump,
  position_x: 7215.238115583148,
  position_y: 1665.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103053] = create_condition!(
  bot: rogue_dump,
  position_x: 7135.238115583148,
  position_y: 1815.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>2}
)

node_map[103054] = create_condition!(
  bot: rogue_dump,
  position_x: 7215.238115583148,
  position_y: 1965.4285714285713,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>8}
)

node_map[103055] = create_condition!(
  bot: rogue_dump,
  position_x: 7135.238115583148,
  position_y: 2115.4285714285716,
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

node_map[103056] = create_condition!(
  bot: rogue_dump,
  position_x: 7215.238115583148,
  position_y: 2265.4285714285716,
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

node_map[103057] = create_condition!(
  bot: rogue_dump,
  position_x: 6706.666687011721,
  position_y: 2409.714285714286,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103058] = create_condition!(
  bot: rogue_dump,
  position_x: 6786.666687011721,
  position_y: 2559.714285714286,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103059] = create_condition!(
  bot: rogue_dump,
  position_x: 6706.666687011721,
  position_y: 2709.714285714286,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103060] = create_condition!(
  bot: rogue_dump,
  position_x: 6595.238115583148,
  position_y: 2859.714285714286,
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

node_map[103061] = create_score!(
  bot: rogue_dump,
  position_x: 6592.380972726005,
  position_y: 3061.1428571428573,
  action_type: "add",
  value: 12
)

node_map[103062] = create_condition!(
  bot: rogue_dump,
  position_x: 6815.238115583148,
  position_y: 2856.8571428571427,
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

node_map[103063] = create_score!(
  bot: rogue_dump,
  position_x: 6812.380972726005,
  position_y: 3058.285714285714,
  action_type: "add",
  value: 12
)

node_map[103064] = create_condition!(
  bot: rogue_dump,
  position_x: 7206.666687011721,
  position_y: 2489.7142857142853,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103065] = create_condition!(
  bot: rogue_dump,
  position_x: 7286.666687011721,
  position_y: 2639.7142857142853,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103066] = create_condition!(
  bot: rogue_dump,
  position_x: 7206.666687011721,
  position_y: 2789.7142857142853,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103067] = create_condition!(
  bot: rogue_dump,
  position_x: 7080.952401297434,
  position_y: 2933.9999999999995,
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

node_map[103068] = create_score!(
  bot: rogue_dump,
  position_x: 7078.095258440291,
  position_y: 3135.428571428571,
  action_type: "add",
  value: 11
)

node_map[103069] = create_condition!(
  bot: rogue_dump,
  position_x: 7352.380972726007,
  position_y: 2939.7142857142853,
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

node_map[103070] = create_score!(
  bot: rogue_dump,
  position_x: 7349.523829868864,
  position_y: 3141.142857142857,
  action_type: "add",
  value: 11
)

node_map[103071] = create_condition!(
  bot: rogue_dump,
  position_x: 7832.380972726006,
  position_y: 2398.2857142857147,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103072] = create_condition!(
  bot: rogue_dump,
  position_x: 7672.380972726006,
  position_y: 2542.571428571429,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103073] = create_condition!(
  bot: rogue_dump,
  position_x: 7538.095258440292,
  position_y: 2684.0000000000005,
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

node_map[103074] = create_score!(
  bot: rogue_dump,
  position_x: 7535.238115583148,
  position_y: 2874.0000000000005,
  action_type: "add",
  value: 8
)

node_map[103075] = create_condition!(
  bot: rogue_dump,
  position_x: 7780.952401297432,
  position_y: 2689.7142857142862,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103076] = create_score!(
  bot: rogue_dump,
  position_x: 7778.0952584402885,
  position_y: 2879.7142857142862,
  action_type: "add",
  value: 8
)

node_map[103077] = create_condition!(
  bot: rogue_dump,
  position_x: 8120.9524012974325,
  position_y: 2545.428571428572,
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

node_map[103078] = create_condition!(
  bot: rogue_dump,
  position_x: 7998.0952584402885,
  position_y: 2692.571428571429,
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

node_map[103079] = create_score!(
  bot: rogue_dump,
  position_x: 7995.238115583145,
  position_y: 2882.571428571429,
  action_type: "add",
  value: 8
)

node_map[103080] = create_condition!(
  bot: rogue_dump,
  position_x: 8263.809544154574,
  position_y: 2681.142857142858,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103081] = create_score!(
  bot: rogue_dump,
  position_x: 8260.952401297433,
  position_y: 2871.142857142858,
  action_type: "add",
  value: 8
)

node_map[103082] = create_condition!(
  bot: rogue_dump,
  position_x: -5301.327842712402,
  position_y: 1356.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[103083] = create_condition!(
  bot: rogue_dump,
  position_x: -5497.327842712402,
  position_y: 1506.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103084] = create_score!(
  bot: rogue_dump,
  position_x: -5497.327842712402,
  position_y: 1708.0,
  action_type: "return",
  value: 110
)

node_map[103085] = create_score!(
  bot: rogue_dump,
  position_x: -5157.327842712402,
  position_y: 1510.0,
  action_type: "return",
  value: 100
)

node_map[103086] = create_condition!(
  bot: rogue_dump,
  position_x: -3742.665367126465,
  position_y: 3176.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103087] = create_condition!(
  bot: rogue_dump,
  position_x: -3682.665367126465,
  position_y: 3326.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103088] = create_score!(
  bot: rogue_dump,
  position_x: -3688.379652840751,
  position_y: 3516.0,
  action_type: "return",
  value: 92
)

node_map[103089] = create_condition!(
  bot: rogue_dump,
  position_x: -3462.665367126465,
  position_y: 3040.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103090] = create_condition!(
  bot: rogue_dump,
  position_x: -3402.665367126465,
  position_y: 3190.0,
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

node_map[103091] = create_condition!(
  bot: rogue_dump,
  position_x: -3462.665367126465,
  position_y: 3340.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103092] = create_score!(
  bot: rogue_dump,
  position_x: -3462.6653671264653,
  position_y: 3530.0,
  action_type: "return",
  value: 55
)

node_map[103093] = create_condition!(
  bot: rogue_dump,
  position_x: -3222.665367126465,
  position_y: 3340.0,
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

node_map[103094] = create_score!(
  bot: rogue_dump,
  position_x: -3222.6653671264653,
  position_y: 3530.0,
  action_type: "return",
  value: 55
)

node_map[103095] = create_condition!(
  bot: rogue_dump,
  position_x: -2954.665367126465,
  position_y: 3188.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103096] = create_condition!(
  bot: rogue_dump,
  position_x: -2894.665367126465,
  position_y: 3338.0,
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

node_map[103097] = create_condition!(
  bot: rogue_dump,
  position_x: -2954.665367126465,
  position_y: 3488.0,
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

node_map[103098] = create_condition!(
  bot: rogue_dump,
  position_x: -2894.665367126465,
  position_y: 3638.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103099] = create_score!(
  bot: rogue_dump,
  position_x: -2900.3796528407506,
  position_y: 3845.142857142857,
  action_type: "return",
  value: 46
)

node_map[103100] = create_condition!(
  bot: rogue_dump,
  position_x: -2201.2108216719193,
  position_y: 3874.909090909091,
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

node_map[103101] = create_condition!(
  bot: rogue_dump,
  position_x: -2725.2108216719193,
  position_y: 4096.909090909091,
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

node_map[103102] = create_score!(
  bot: rogue_dump,
  position_x: -2785.2108216719193,
  position_y: 4246.909090909091,
  action_type: "return",
  value: 48
)

node_map[103103] = create_condition!(
  bot: rogue_dump,
  position_x: -2465.2108216719193,
  position_y: 4096.909090909091,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103104] = create_condition!(
  bot: rogue_dump,
  position_x: -2525.2108216719193,
  position_y: 4246.909090909091,
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

node_map[103105] = create_condition!(
  bot: rogue_dump,
  position_x: -2473.2108216719193,
  position_y: 4392.909090909091,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103106] = create_score!(
  bot: rogue_dump,
  position_x: -2473.2108216719193,
  position_y: 4590.909090909091,
  action_type: "return",
  value: 48
)

node_map[103107] = create_condition!(
  bot: rogue_dump,
  position_x: -2205.2108216719193,
  position_y: 4096.909090909091,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103108] = create_score!(
  bot: rogue_dump,
  position_x: -2213.2108216719193,
  position_y: 4310.909090909091,
  action_type: "return",
  value: 48
)

node_map[103109] = create_condition!(
  bot: rogue_dump,
  position_x: -1945.2108216719193,
  position_y: 4096.909090909091,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103110] = create_condition!(
  bot: rogue_dump,
  position_x: -2005.2108216719193,
  position_y: 4246.909090909091,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103111] = create_score!(
  bot: rogue_dump,
  position_x: -2021.2108216719193,
  position_y: 4440.909090909091,
  action_type: "return",
  value: 48
)

node_map[103112] = create_condition!(
  bot: rogue_dump,
  position_x: -1685.2108216719193,
  position_y: 4096.909090909091,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103113] = create_condition!(
  bot: rogue_dump,
  position_x: -1745.2108216719193,
  position_y: 4246.909090909091,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103114] = create_score!(
  bot: rogue_dump,
  position_x: -1761.2108216719193,
  position_y: 4440.909090909091,
  action_type: "return",
  value: 48
)

node_map[103115] = create_condition!(
  bot: rogue_dump,
  position_x: -1425.2108216719193,
  position_y: 4096.909090909091,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103116] = create_condition!(
  bot: rogue_dump,
  position_x: -1485.2108216719193,
  position_y: 4246.909090909091,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103117] = create_score!(
  bot: rogue_dump,
  position_x: -1501.2108216719193,
  position_y: 4440.909090909091,
  action_type: "return",
  value: 48
)

node_map[103118] = create_condition!(
  bot: rogue_dump,
  position_x: -1165.2108216719193,
  position_y: 4096.909090909091,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103119] = create_condition!(
  bot: rogue_dump,
  position_x: -1225.2108216719193,
  position_y: 4246.909090909091,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103120] = create_score!(
  bot: rogue_dump,
  position_x: -1241.2108216719193,
  position_y: 4440.909090909091,
  action_type: "return",
  value: 48
)

node_map[103121] = create_condition!(
  bot: rogue_dump,
  position_x: -1593.9380943991923,
  position_y: 2876.3636363636365,
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

node_map[103122] = create_condition!(
  bot: rogue_dump,
  position_x: -2385.9380943991923,
  position_y: 3134.3636363636365,
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

node_map[103123] = create_score!(
  bot: rogue_dump,
  position_x: -2389.9380943991923,
  position_y: 3344.3636363636365,
  action_type: "return",
  value: 40
)

node_map[103124] = create_condition!(
  bot: rogue_dump,
  position_x: -2125.9380943991923,
  position_y: 3134.3636363636365,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103125] = create_condition!(
  bot: rogue_dump,
  position_x: -2185.9380943991923,
  position_y: 3284.3636363636365,
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

node_map[103126] = create_condition!(
  bot: rogue_dump,
  position_x: -2125.9380943991923,
  position_y: 3434.3636363636365,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103127] = create_score!(
  bot: rogue_dump,
  position_x: -2133.9380943991923,
  position_y: 3628.3636363636365,
  action_type: "return",
  value: 40
)

node_map[103128] = create_condition!(
  bot: rogue_dump,
  position_x: -1865.9380943991923,
  position_y: 3134.3636363636365,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103129] = create_score!(
  bot: rogue_dump,
  position_x: -1865.9380943991923,
  position_y: 3324.3636363636365,
  action_type: "return",
  value: 40
)

node_map[103130] = create_condition!(
  bot: rogue_dump,
  position_x: -1605.9380943991923,
  position_y: 3134.3636363636365,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103131] = create_condition!(
  bot: rogue_dump,
  position_x: -1665.9380943991923,
  position_y: 3284.3636363636365,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103132] = create_score!(
  bot: rogue_dump,
  position_x: -1669.9380943991923,
  position_y: 3482.3636363636365,
  action_type: "return",
  value: 40
)

node_map[103133] = create_condition!(
  bot: rogue_dump,
  position_x: -1345.9380943991923,
  position_y: 3134.3636363636365,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103134] = create_condition!(
  bot: rogue_dump,
  position_x: -1405.9380943991923,
  position_y: 3284.3636363636365,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103135] = create_score!(
  bot: rogue_dump,
  position_x: -1409.9380943991923,
  position_y: 3482.3636363636365,
  action_type: "return",
  value: 40
)

node_map[103136] = create_condition!(
  bot: rogue_dump,
  position_x: -1085.9380943991923,
  position_y: 3134.3636363636365,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103137] = create_condition!(
  bot: rogue_dump,
  position_x: -1145.9380943991923,
  position_y: 3284.3636363636365,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103138] = create_score!(
  bot: rogue_dump,
  position_x: -1149.9380943991923,
  position_y: 3482.3636363636365,
  action_type: "return",
  value: 40
)

node_map[103139] = create_condition!(
  bot: rogue_dump,
  position_x: -825.9380943991923,
  position_y: 3134.3636363636365,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103140] = create_condition!(
  bot: rogue_dump,
  position_x: -885.9380943991923,
  position_y: 3284.3636363636365,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103141] = create_score!(
  bot: rogue_dump,
  position_x: -889.9380943991923,
  position_y: 3482.3636363636365,
  action_type: "return",
  value: 40
)

node_map[103142] = create_condition!(
  bot: rogue_dump,
  position_x: -929.5744580355558,
  position_y: 1968.727272727273,
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

node_map[103143] = create_condition!(
  bot: rogue_dump,
  position_x: -1713.5744580355558,
  position_y: 2137.636363636364,
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

node_map[103144] = create_condition!(
  bot: rogue_dump,
  position_x: -1413.5744580355558,
  position_y: 2198.727272727273,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103145] = create_condition!(
  bot: rogue_dump,
  position_x: -1473.5744580355558,
  position_y: 2348.727272727273,
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

node_map[103146] = create_condition!(
  bot: rogue_dump,
  position_x: -1413.5744580355558,
  position_y: 2498.727272727273,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103147] = create_score!(
  bot: rogue_dump,
  position_x: -1425.5744580355558,
  position_y: 2696.727272727273,
  action_type: "return",
  value: 34
)

node_map[103148] = create_condition!(
  bot: rogue_dump,
  position_x: -1153.5744580355558,
  position_y: 2198.727272727273,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103149] = create_score!(
  bot: rogue_dump,
  position_x: -1161.5744580355558,
  position_y: 2412.727272727273,
  action_type: "return",
  value: 34
)

node_map[103150] = create_condition!(
  bot: rogue_dump,
  position_x: -893.5744580355558,
  position_y: 2198.727272727273,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103151] = create_condition!(
  bot: rogue_dump,
  position_x: -953.5744580355558,
  position_y: 2348.727272727273,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103152] = create_score!(
  bot: rogue_dump,
  position_x: -949.5744580355558,
  position_y: 2546.727272727273,
  action_type: "return",
  value: 34
)

node_map[103153] = create_condition!(
  bot: rogue_dump,
  position_x: -633.5744580355558,
  position_y: 2198.727272727273,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103154] = create_condition!(
  bot: rogue_dump,
  position_x: -693.5744580355558,
  position_y: 2348.727272727273,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103155] = create_score!(
  bot: rogue_dump,
  position_x: -689.5744580355558,
  position_y: 2546.727272727273,
  action_type: "return",
  value: 34
)

node_map[103156] = create_condition!(
  bot: rogue_dump,
  position_x: -373.57445803555584,
  position_y: 2198.727272727273,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103157] = create_condition!(
  bot: rogue_dump,
  position_x: -433.57445803555584,
  position_y: 2348.727272727273,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103158] = create_score!(
  bot: rogue_dump,
  position_x: -429.57445803555584,
  position_y: 2546.727272727273,
  action_type: "return",
  value: 34
)

node_map[103159] = create_condition!(
  bot: rogue_dump,
  position_x: -113.57445803555584,
  position_y: 2198.727272727273,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103160] = create_condition!(
  bot: rogue_dump,
  position_x: -173.57445803555584,
  position_y: 2348.727272727273,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103161] = create_score!(
  bot: rogue_dump,
  position_x: -169.57445803555584,
  position_y: 2546.727272727273,
  action_type: "return",
  value: 34
)

node_map[103162] = create_condition!(
  bot: rogue_dump,
  position_x: -1458.6653671264648,
  position_y: 1040.0,
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

node_map[103163] = create_condition!(
  bot: rogue_dump,
  position_x: -2242.665367126465,
  position_y: 1298.0,
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

node_map[103164] = create_condition!(
  bot: rogue_dump,
  position_x: -1982.6653671264648,
  position_y: 1298.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103165] = create_condition!(
  bot: rogue_dump,
  position_x: -2042.6653671264648,
  position_y: 1448.0,
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

node_map[103166] = create_condition!(
  bot: rogue_dump,
  position_x: -1982.6653671264648,
  position_y: 1598.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103167] = create_score!(
  bot: rogue_dump,
  position_x: -1990.6653671264648,
  position_y: 1800.0,
  action_type: "return",
  value: 34
)

node_map[103168] = create_condition!(
  bot: rogue_dump,
  position_x: -1722.6653671264648,
  position_y: 1298.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103169] = create_score!(
  bot: rogue_dump,
  position_x: -1730.6653671264648,
  position_y: 1496.0,
  action_type: "return",
  value: 34
)

node_map[103170] = create_condition!(
  bot: rogue_dump,
  position_x: -1462.6653671264648,
  position_y: 1298.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103171] = create_condition!(
  bot: rogue_dump,
  position_x: -1522.6653671264648,
  position_y: 1448.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103172] = create_score!(
  bot: rogue_dump,
  position_x: -1526.6653671264648,
  position_y: 1638.0,
  action_type: "return",
  value: 34
)

node_map[103173] = create_condition!(
  bot: rogue_dump,
  position_x: -1202.6653671264648,
  position_y: 1298.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103174] = create_condition!(
  bot: rogue_dump,
  position_x: -1262.6653671264648,
  position_y: 1448.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103175] = create_score!(
  bot: rogue_dump,
  position_x: -1266.6653671264648,
  position_y: 1638.0,
  action_type: "return",
  value: 34
)

node_map[103176] = create_condition!(
  bot: rogue_dump,
  position_x: -942.6653671264648,
  position_y: 1298.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103177] = create_condition!(
  bot: rogue_dump,
  position_x: -1002.6653671264648,
  position_y: 1448.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103178] = create_score!(
  bot: rogue_dump,
  position_x: -1006.6653671264648,
  position_y: 1638.0,
  action_type: "return",
  value: 34
)

node_map[103179] = create_condition!(
  bot: rogue_dump,
  position_x: -682.6653671264648,
  position_y: 1298.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103180] = create_condition!(
  bot: rogue_dump,
  position_x: -742.6653671264648,
  position_y: 1448.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103181] = create_score!(
  bot: rogue_dump,
  position_x: -746.6653671264648,
  position_y: 1638.0,
  action_type: "return",
  value: 34
)

node_map[103182] = create_condition!(
  bot: rogue_dump,
  position_x: -5412.190705435611,
  position_y: 1940.8571428571431,
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

node_map[103183] = create_condition!(
  bot: rogue_dump,
  position_x: -6183.737205505356,
  position_y: 2245.1428571428573,
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

node_map[103184] = create_score!(
  bot: rogue_dump,
  position_x: -6191.737205505356,
  position_y: 2463.1428571428573,
  action_type: "return",
  value: 28
)

node_map[103185] = create_condition!(
  bot: rogue_dump,
  position_x: -5923.737205505356,
  position_y: 2245.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103186] = create_condition!(
  bot: rogue_dump,
  position_x: -5983.737205505356,
  position_y: 2395.1428571428573,
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

node_map[103187] = create_condition!(
  bot: rogue_dump,
  position_x: -5923.737205505356,
  position_y: 2545.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103188] = create_score!(
  bot: rogue_dump,
  position_x: -5926.594348362499,
  position_y: 2743.7142857142862,
  action_type: "return",
  value: 28
)

node_map[103189] = create_condition!(
  bot: rogue_dump,
  position_x: -5663.737205505356,
  position_y: 2245.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103190] = create_score!(
  bot: rogue_dump,
  position_x: -5667.737205505356,
  position_y: 2455.1428571428573,
  action_type: "return",
  value: 28
)

node_map[103191] = create_condition!(
  bot: rogue_dump,
  position_x: -5403.737205505356,
  position_y: 2245.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103192] = create_condition!(
  bot: rogue_dump,
  position_x: -5463.737205505356,
  position_y: 2395.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103193] = create_score!(
  bot: rogue_dump,
  position_x: -5469.451491219641,
  position_y: 2585.1428571428573,
  action_type: "return",
  value: 28
)

node_map[103194] = create_condition!(
  bot: rogue_dump,
  position_x: -5143.737205505356,
  position_y: 2245.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103195] = create_condition!(
  bot: rogue_dump,
  position_x: -5203.737205505356,
  position_y: 2395.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103196] = create_score!(
  bot: rogue_dump,
  position_x: -5209.451491219641,
  position_y: 2585.1428571428573,
  action_type: "return",
  value: 28
)

node_map[103197] = create_condition!(
  bot: rogue_dump,
  position_x: -4883.737205505356,
  position_y: 2245.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103198] = create_condition!(
  bot: rogue_dump,
  position_x: -4943.737205505356,
  position_y: 2395.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103199] = create_score!(
  bot: rogue_dump,
  position_x: -4949.451491219641,
  position_y: 2585.1428571428573,
  action_type: "return",
  value: 28
)

node_map[103200] = create_condition!(
  bot: rogue_dump,
  position_x: -4623.737205505356,
  position_y: 2245.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103201] = create_condition!(
  bot: rogue_dump,
  position_x: -4683.737205505356,
  position_y: 2395.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103202] = create_score!(
  bot: rogue_dump,
  position_x: -4689.451491219641,
  position_y: 2585.1428571428573,
  action_type: "return",
  value: 28
)

node_map[103203] = create_condition!(
  bot: rogue_dump,
  position_x: -5261.333824157715,
  position_y: 2910.0,
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

node_map[103204] = create_condition!(
  bot: rogue_dump,
  position_x: -5989.905252729144,
  position_y: 3177.1428571428573,
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

node_map[103205] = create_score!(
  bot: rogue_dump,
  position_x: -5995.61953844343,
  position_y: 3384.285714285714,
  action_type: "return",
  value: 26
)

node_map[103206] = create_condition!(
  bot: rogue_dump,
  position_x: -5729.905252729144,
  position_y: 3177.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103207] = create_condition!(
  bot: rogue_dump,
  position_x: -5789.905252729144,
  position_y: 3327.1428571428573,
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

node_map[103208] = create_condition!(
  bot: rogue_dump,
  position_x: -5729.905252729144,
  position_y: 3477.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103209] = create_score!(
  bot: rogue_dump,
  position_x: -5735.61953844343,
  position_y: 3670.0,
  action_type: "return",
  value: 26
)

node_map[103210] = create_condition!(
  bot: rogue_dump,
  position_x: -5469.905252729143,
  position_y: 3177.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103211] = create_score!(
  bot: rogue_dump,
  position_x: -5475.6195384434295,
  position_y: 3370.0,
  action_type: "return",
  value: 26
)

node_map[103212] = create_condition!(
  bot: rogue_dump,
  position_x: -5209.905252729143,
  position_y: 3177.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103213] = create_condition!(
  bot: rogue_dump,
  position_x: -5269.905252729143,
  position_y: 3327.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103214] = create_score!(
  bot: rogue_dump,
  position_x: -5272.762395586286,
  position_y: 3511.428571428572,
  action_type: "return",
  value: 26
)

node_map[103215] = create_condition!(
  bot: rogue_dump,
  position_x: -4949.905252729143,
  position_y: 3177.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103216] = create_condition!(
  bot: rogue_dump,
  position_x: -5009.905252729143,
  position_y: 3327.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103217] = create_score!(
  bot: rogue_dump,
  position_x: -5012.762395586286,
  position_y: 3511.428571428572,
  action_type: "return",
  value: 26
)

node_map[103218] = create_condition!(
  bot: rogue_dump,
  position_x: -4689.905252729143,
  position_y: 3177.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103219] = create_condition!(
  bot: rogue_dump,
  position_x: -4749.905252729143,
  position_y: 3327.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103220] = create_score!(
  bot: rogue_dump,
  position_x: -4752.762395586286,
  position_y: 3511.428571428572,
  action_type: "return",
  value: 26
)

node_map[103221] = create_condition!(
  bot: rogue_dump,
  position_x: -4429.905252729143,
  position_y: 3177.1428571428573,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103222] = create_condition!(
  bot: rogue_dump,
  position_x: -4489.905252729143,
  position_y: 3327.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103223] = create_score!(
  bot: rogue_dump,
  position_x: -4498.093938555036,
  position_y: 3535.428571428572,
  action_type: "return",
  value: 26
)

node_map[103224] = create_condition!(
  bot: rogue_dump,
  position_x: -3946.0939385550355,
  position_y: 3559.7142857142853,
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

node_map[103225] = create_condition!(
  bot: rogue_dump,
  position_x: -4723.236795697892,
  position_y: 3841.142857142857,
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

node_map[103226] = create_score!(
  bot: rogue_dump,
  position_x: -4723.236795697892,
  position_y: 4045.4285714285706,
  action_type: "return",
  value: 26
)

node_map[103227] = create_condition!(
  bot: rogue_dump,
  position_x: -4463.236795697892,
  position_y: 3841.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103228] = create_condition!(
  bot: rogue_dump,
  position_x: -4523.236795697892,
  position_y: 3991.142857142857,
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

node_map[103229] = create_condition!(
  bot: rogue_dump,
  position_x: -4463.236795697892,
  position_y: 4141.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103230] = create_score!(
  bot: rogue_dump,
  position_x: -4471.808224269322,
  position_y: 4322.571428571428,
  action_type: "return",
  value: 26
)

node_map[103231] = create_condition!(
  bot: rogue_dump,
  position_x: -4203.236795697892,
  position_y: 3841.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103232] = create_score!(
  bot: rogue_dump,
  position_x: -4206.0939385550355,
  position_y: 4048.2857142857138,
  action_type: "return",
  value: 26
)

node_map[103233] = create_condition!(
  bot: rogue_dump,
  position_x: -3943.2367956978924,
  position_y: 3841.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103234] = create_condition!(
  bot: rogue_dump,
  position_x: -4003.2367956978924,
  position_y: 3991.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103235] = create_score!(
  bot: rogue_dump,
  position_x: -4008.9510814121786,
  position_y: 4175.428571428571,
  action_type: "return",
  value: 26
)

node_map[103236] = create_condition!(
  bot: rogue_dump,
  position_x: -3683.2367956978924,
  position_y: 3841.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103237] = create_condition!(
  bot: rogue_dump,
  position_x: -3743.2367956978924,
  position_y: 3991.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103238] = create_score!(
  bot: rogue_dump,
  position_x: -3748.9510814121786,
  position_y: 4175.428571428571,
  action_type: "return",
  value: 26
)

node_map[103239] = create_condition!(
  bot: rogue_dump,
  position_x: -3423.236795697893,
  position_y: 3841.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103240] = create_condition!(
  bot: rogue_dump,
  position_x: -3483.2367956978924,
  position_y: 3991.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103241] = create_score!(
  bot: rogue_dump,
  position_x: -3488.9510814121786,
  position_y: 4175.428571428571,
  action_type: "return",
  value: 26
)

node_map[103242] = create_condition!(
  bot: rogue_dump,
  position_x: -3163.236795697893,
  position_y: 3841.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103243] = create_condition!(
  bot: rogue_dump,
  position_x: -3223.236795697893,
  position_y: 3991.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103244] = create_score!(
  bot: rogue_dump,
  position_x: -3228.951081412178,
  position_y: 4175.428571428571,
  action_type: "return",
  value: 26
)

node_map[103245] = create_condition!(
  bot: rogue_dump,
  position_x: 3328.5714285714275,
  position_y: 468.57142857142856,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103246] = create_condition!(
  bot: rogue_dump,
  position_x: 3148.5714285714275,
  position_y: 607.1428571428572,
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

node_map[103247] = create_condition!(
  bot: rogue_dump,
  position_x: 3014.285714285713,
  position_y: 751.4285714285716,
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

node_map[103248] = create_score!(
  bot: rogue_dump,
  position_x: 3009.999999999999,
  position_y: 955.7142857142858,
  action_type: "return",
  value: 80
)

node_map[103249] = create_condition!(
  bot: rogue_dump,
  position_x: 3262.857142857142,
  position_y: 748.5714285714286,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103250] = create_score!(
  bot: rogue_dump,
  position_x: 3258.5714285714284,
  position_y: 952.8571428571428,
  action_type: "return",
  value: 80
)

node_map[103251] = create_condition!(
  bot: rogue_dump,
  position_x: 3339.999999999999,
  position_y: 1070.0,
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

node_map[103252] = create_condition!(
  bot: rogue_dump,
  position_x: 3409.999999999999,
  position_y: 1220.0,
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

node_map[103253] = create_condition!(
  bot: rogue_dump,
  position_x: 2891.4285714285706,
  position_y: 1450.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103254] = create_score!(
  bot: rogue_dump,
  position_x: 2895.7142857142844,
  position_y: 1645.7142857142858,
  action_type: "add",
  value: 14
)

node_map[103255] = create_condition!(
  bot: rogue_dump,
  position_x: 3151.4285714285706,
  position_y: 1450.0,
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

node_map[103256] = create_score!(
  bot: rogue_dump,
  position_x: 3155.7142857142844,
  position_y: 1645.7142857142858,
  action_type: "add",
  value: 14
)

node_map[103257] = create_condition!(
  bot: rogue_dump,
  position_x: 3411.4285714285706,
  position_y: 1450.0,
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

node_map[103258] = create_score!(
  bot: rogue_dump,
  position_x: 3415.7142857142844,
  position_y: 1645.7142857142858,
  action_type: "add",
  value: 8
)

node_map[103259] = create_condition!(
  bot: rogue_dump,
  position_x: 3671.4285714285706,
  position_y: 1450.0,
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

node_map[103260] = create_score!(
  bot: rogue_dump,
  position_x: 3675.7142857142844,
  position_y: 1645.7142857142858,
  action_type: "add",
  value: 8
)

node_map[103261] = create_condition!(
  bot: rogue_dump,
  position_x: 3931.4285714285706,
  position_y: 1450.0,
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

node_map[103262] = create_score!(
  bot: rogue_dump,
  position_x: 3935.7142857142844,
  position_y: 1645.7142857142858,
  action_type: "add",
  value: 8
)

node_map[103263] = create_condition!(
  bot: rogue_dump,
  position_x: 3480.000000000001,
  position_y: 815.7142857142858,
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

node_map[103264] = create_score!(
  bot: rogue_dump,
  position_x: 3475.714285714287,
  position_y: 1022.8571428571429,
  action_type: "return",
  value: -120
)

node_map[103265] = create_condition!(
  bot: rogue_dump,
  position_x: 3740.000000000001,
  position_y: 815.7142857142858,
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

node_map[103266] = create_condition!(
  bot: rogue_dump,
  position_x: 3810.000000000001,
  position_y: 965.7142857142858,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103267] = create_score!(
  bot: rogue_dump,
  position_x: 3805.714285714287,
  position_y: 1172.8571428571431,
  action_type: "return",
  value: -120
)

node_map[103268] = create_condition!(
  bot: rogue_dump,
  position_x: 4000.000000000001,
  position_y: 815.7142857142858,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103269] = create_condition!(
  bot: rogue_dump,
  position_x: 4070.000000000001,
  position_y: 965.7142857142858,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103270] = create_condition!(
  bot: rogue_dump,
  position_x: 4000.000000000001,
  position_y: 1115.7142857142858,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103271] = create_score!(
  bot: rogue_dump,
  position_x: 4001.4285714285716,
  position_y: 1300.0000000000005,
  action_type: "subtract",
  value: 12
)

node_map[103272] = create_condition!(
  bot: rogue_dump,
  position_x: -128.0,
  position_y: 3536.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103273] = create_condition!(
  bot: rogue_dump,
  position_x: -296.0,
  position_y: 3670.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103274] = create_condition!(
  bot: rogue_dump,
  position_x: -440.0,
  position_y: 3804.0,
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

node_map[103275] = create_score!(
  bot: rogue_dump,
  position_x: -446.0,
  position_y: 4006.0,
  action_type: "return",
  value: 34
)

node_map[103276] = create_score!(
  bot: rogue_dump,
  position_x: -168.0,
  position_y: 3816.0,
  action_type: "add",
  value: 12
)

node_map[103277] = create_condition!(
  bot: rogue_dump,
  position_x: 48.0,
  position_y: 3686.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103278] = create_score!(
  bot: rogue_dump,
  position_x: 30.0,
  position_y: 4004.0,
  action_type: "add",
  value: 16
)

node_map[103279] = create_condition!(
  bot: rogue_dump,
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

node_map[103280] = create_condition!(
  bot: rogue_dump,
  position_x: 1112.0,
  position_y: 3622.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103281] = create_condition!(
  bot: rogue_dump,
  position_x: 1112.0,
  position_y: 3836.0,
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

node_map[103282] = create_score!(
  bot: rogue_dump,
  position_x: 1106.0,
  position_y: 4050.0,
  action_type: "return",
  value: 34
)

node_map[103283] = create_score!(
  bot: rogue_dump,
  position_x: 1256.0,
  position_y: 3772.0,
  action_type: "add",
  value: 12
)

node_map[103284] = create_condition!(
  bot: rogue_dump,
  position_x: 1492.0,
  position_y: 3634.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103285] = create_score!(
  bot: rogue_dump,
  position_x: 1478.0,
  position_y: 3848.0,
  action_type: "add",
  value: 16
)

node_map[103286] = create_condition!(
  bot: rogue_dump,
  position_x: 528.0,
  position_y: 3876.0,
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

node_map[103287] = create_condition!(
  bot: rogue_dump,
  position_x: 0.9523809523798263,
  position_y: 4259.333333333332,
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

node_map[103288] = create_condition!(
  bot: rogue_dump,
  position_x: -457.80952380952476,
  position_y: 4423.2380952380945,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103289] = create_condition!(
  bot: rogue_dump,
  position_x: 808.0000000000009,
  position_y: 4164.571428571428,
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

node_map[103290] = create_condition!(
  bot: rogue_dump,
  position_x: 878.0000000000009,
  position_y: 4314.571428571428,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103291] = create_condition!(
  bot: rogue_dump,
  position_x: -907.8095238095252,
  position_y: 4566.190476190475,
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

node_map[103292] = create_score!(
  bot: rogue_dump,
  position_x: -910.0000000000018,
  position_y: 4748.190476190475,
  action_type: "return",
  value: 32
)

node_map[103293] = create_condition!(
  bot: rogue_dump,
  position_x: 510.85714285714494,
  position_y: 4461.714285714286,
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

node_map[103294] = create_score!(
  bot: rogue_dump,
  position_x: 495.1428571428578,
  position_y: 4648.857142857143,
  action_type: "return",
  value: 32
)

node_map[103295] = create_condition!(
  bot: rogue_dump,
  position_x: -924.5714285714303,
  position_y: 4909.619047619048,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103296] = create_condition!(
  bot: rogue_dump,
  position_x: -854.5714285714303,
  position_y: 5059.619047619048,
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

node_map[103297] = create_condition!(
  bot: rogue_dump,
  position_x: -924.5714285714303,
  position_y: 5209.619047619048,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103298] = create_score!(
  bot: rogue_dump,
  position_x: -934.5714285714303,
  position_y: 5408.190476190476,
  action_type: "return",
  value: 32
)

node_map[103299] = create_condition!(
  bot: rogue_dump,
  position_x: 656.5714285714303,
  position_y: 4656.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103300] = create_condition!(
  bot: rogue_dump,
  position_x: 726.5714285714303,
  position_y: 4806.0,
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

node_map[103301] = create_condition!(
  bot: rogue_dump,
  position_x: 656.5714285714303,
  position_y: 4956.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103302] = create_score!(
  bot: rogue_dump,
  position_x: 655.1428571428587,
  position_y: 5140.285714285714,
  action_type: "return",
  value: 32
)

node_map[103303] = create_condition!(
  bot: rogue_dump,
  position_x: -720.1904761904775,
  position_y: 4871.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103304] = create_score!(
  bot: rogue_dump,
  position_x: -724.4761904761917,
  position_y: 5072.5714285714275,
  action_type: "return",
  value: 32
)

node_map[103305] = create_condition!(
  bot: rogue_dump,
  position_x: 896.5714285714303,
  position_y: 4656.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103306] = create_score!(
  bot: rogue_dump,
  position_x: 895.1428571428587,
  position_y: 4846.0,
  action_type: "return",
  value: 32
)

node_map[103307] = create_condition!(
  bot: rogue_dump,
  position_x: -516.3809523809532,
  position_y: 4833.2380952380945,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103308] = create_condition!(
  bot: rogue_dump,
  position_x: -446.3809523809532,
  position_y: 4983.2380952380945,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103309] = create_score!(
  bot: rogue_dump,
  position_x: -442.09523809523944,
  position_y: 5178.95238095238,
  action_type: "return",
  value: 32
)

node_map[103310] = create_condition!(
  bot: rogue_dump,
  position_x: 1136.5714285714303,
  position_y: 4656.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103311] = create_condition!(
  bot: rogue_dump,
  position_x: 1206.5714285714303,
  position_y: 4806.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103312] = create_score!(
  bot: rogue_dump,
  position_x: 1196.5714285714303,
  position_y: 4998.857142857143,
  action_type: "return",
  value: 32
)

node_map[103313] = create_condition!(
  bot: rogue_dump,
  position_x: -284.95238095238165,
  position_y: 4773.238095238094,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103314] = create_condition!(
  bot: rogue_dump,
  position_x: -214.95238095238165,
  position_y: 4923.238095238094,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103315] = create_score!(
  bot: rogue_dump,
  position_x: -210.66666666666788,
  position_y: 5118.952380952379,
  action_type: "return",
  value: 32
)

node_map[103316] = create_condition!(
  bot: rogue_dump,
  position_x: 1376.5714285714303,
  position_y: 4656.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103317] = create_condition!(
  bot: rogue_dump,
  position_x: 1446.5714285714303,
  position_y: 4806.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103318] = create_score!(
  bot: rogue_dump,
  position_x: 1436.5714285714303,
  position_y: 4998.857142857143,
  action_type: "return",
  value: 32
)

node_map[103319] = create_condition!(
  bot: rogue_dump,
  position_x: -30.66666666666788,
  position_y: 4727.523809523808,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103320] = create_condition!(
  bot: rogue_dump,
  position_x: 39.33333333333212,
  position_y: 4877.523809523808,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103321] = create_score!(
  bot: rogue_dump,
  position_x: 43.61904761904589,
  position_y: 5073.238095238094,
  action_type: "return",
  value: 32
)

node_map[103322] = create_condition!(
  bot: rogue_dump,
  position_x: 1616.5714285714303,
  position_y: 4656.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103323] = create_condition!(
  bot: rogue_dump,
  position_x: 1686.5714285714303,
  position_y: 4806.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103324] = create_score!(
  bot: rogue_dump,
  position_x: 1676.5714285714303,
  position_y: 4998.857142857143,
  action_type: "return",
  value: 32
)

node_map[103325] = create_condition!(
  bot: rogue_dump,
  position_x: 215.04761904761745,
  position_y: 4584.666666666665,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103326] = create_condition!(
  bot: rogue_dump,
  position_x: 285.04761904761745,
  position_y: 4734.666666666665,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103327] = create_score!(
  bot: rogue_dump,
  position_x: 289.3333333333321,
  position_y: 4930.3809523809505,
  action_type: "return",
  value: 32
)

node_map[103328] = create_condition!(
  bot: rogue_dump,
  position_x: 1856.5714285714303,
  position_y: 4656.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103329] = create_condition!(
  bot: rogue_dump,
  position_x: 1926.5714285714303,
  position_y: 4806.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103330] = create_score!(
  bot: rogue_dump,
  position_x: 1916.5714285714303,
  position_y: 4998.857142857143,
  action_type: "return",
  value: 32
)

node_map[103331] = create_condition!(
  bot: rogue_dump,
  position_x: 5086.857142857143,
  position_y: 1707.4285714285716,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103332] = create_condition!(
  bot: rogue_dump,
  position_x: 5156.857142857143,
  position_y: 1857.4285714285716,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103333] = create_condition!(
  bot: rogue_dump,
  position_x: 4104.0,
  position_y: 2087.4285714285716,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103334] = create_condition!(
  bot: rogue_dump,
  position_x: 3989.7142857142862,
  position_y: 2243.1428571428573,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103335] = create_score!(
  bot: rogue_dump,
  position_x: 3985.4285714285706,
  position_y: 2433.1428571428573,
  action_type: "return",
  value: 88
)

node_map[103336] = create_condition!(
  bot: rogue_dump,
  position_x: 4249.714285714286,
  position_y: 2243.1428571428573,
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

node_map[103337] = create_score!(
  bot: rogue_dump,
  position_x: 4245.428571428571,
  position_y: 2433.1428571428573,
  action_type: "return",
  value: 88
)

node_map[103338] = create_condition!(
  bot: rogue_dump,
  position_x: 4624.0,
  position_y: 2087.4285714285716,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103339] = create_condition!(
  bot: rogue_dump,
  position_x: 4489.714285714286,
  position_y: 2231.714285714286,
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

node_map[103340] = create_score!(
  bot: rogue_dump,
  position_x: 4482.5714285714275,
  position_y: 2436.0,
  action_type: "return",
  value: 22
)

node_map[103341] = create_condition!(
  bot: rogue_dump,
  position_x: 4749.714285714286,
  position_y: 2231.714285714286,
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

node_map[103342] = create_score!(
  bot: rogue_dump,
  position_x: 4742.5714285714275,
  position_y: 2436.0,
  action_type: "return",
  value: 22
)

node_map[103343] = create_condition!(
  bot: rogue_dump,
  position_x: 5144.0,
  position_y: 2087.4285714285716,
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

node_map[103344] = create_condition!(
  bot: rogue_dump,
  position_x: 5009.714285714286,
  position_y: 2231.714285714286,
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

node_map[103345] = create_score!(
  bot: rogue_dump,
  position_x: 5002.5714285714275,
  position_y: 2436.0,
  action_type: "add",
  value: 14
)

node_map[103346] = create_condition!(
  bot: rogue_dump,
  position_x: 5269.714285714286,
  position_y: 2231.714285714286,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103347] = create_score!(
  bot: rogue_dump,
  position_x: 5262.5714285714275,
  position_y: 2436.0,
  action_type: "add",
  value: 14
)

node_map[103348] = create_condition!(
  bot: rogue_dump,
  position_x: 5569.714285714284,
  position_y: 2087.4285714285716,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103349] = create_condition!(
  bot: rogue_dump,
  position_x: 5639.714285714284,
  position_y: 2237.4285714285716,
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

node_map[103350] = create_condition!(
  bot: rogue_dump,
  position_x: 5501.142857142853,
  position_y: 2393.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103351] = create_score!(
  bot: rogue_dump,
  position_x: 5502.571428571426,
  position_y: 2580.285714285714,
  action_type: "return",
  value: 32
)

node_map[103352] = create_condition!(
  bot: rogue_dump,
  position_x: 5763.999999999998,
  position_y: 2384.571428571429,
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

node_map[103353] = create_score!(
  bot: rogue_dump,
  position_x: 5759.714285714283,
  position_y: 2606.0,
  action_type: "return",
  value: 32
)

node_map[103354] = create_condition!(
  bot: rogue_dump,
  position_x: 6015.428571428571,
  position_y: 2090.2857142857147,
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

node_map[103355] = create_condition!(
  bot: rogue_dump,
  position_x: 6085.428571428571,
  position_y: 2240.2857142857147,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103356] = create_condition!(
  bot: rogue_dump,
  position_x: 6015.428571428571,
  position_y: 2390.2857142857147,
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

node_map[103357] = create_score!(
  bot: rogue_dump,
  position_x: 6011.142857142857,
  position_y: 2571.7142857142853,
  action_type: "add",
  value: 8
)

node_map[103358] = create_condition!(
  bot: rogue_dump,
  position_x: 6275.428571428571,
  position_y: 2390.2857142857147,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103359] = create_score!(
  bot: rogue_dump,
  position_x: 6271.142857142857,
  position_y: 2571.7142857142853,
  action_type: "add",
  value: 8
)

node_map[103360] = create_condition!(
  bot: rogue_dump,
  position_x: 1901.7142857142835,
  position_y: 3448.5714285714284,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103361] = create_condition!(
  bot: rogue_dump,
  position_x: 1971.7142857142835,
  position_y: 3598.5714285714284,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103362] = create_condition!(
  bot: rogue_dump,
  position_x: 1901.7142857142835,
  position_y: 3748.5714285714284,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103363] = create_condition!(
  bot: rogue_dump,
  position_x: 1971.7142857142835,
  position_y: 3898.5714285714284,
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

node_map[103364] = create_condition!(
  bot: rogue_dump,
  position_x: 1790.285714285712,
  position_y: 4048.5714285714284,
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

node_map[103365] = create_score!(
  bot: rogue_dump,
  position_x: 1791.7142857142826,
  position_y: 4235.714285714286,
  action_type: "add",
  value: 7
)

node_map[103366] = create_condition!(
  bot: rogue_dump,
  position_x: 1973.1428571428542,
  position_y: 4182.857142857143,
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

node_map[103367] = create_score!(
  bot: rogue_dump,
  position_x: 1974.5714285714248,
  position_y: 4370.000000000002,
  action_type: "add",
  value: 7
)

node_map[103368] = create_condition!(
  bot: rogue_dump,
  position_x: 2118.8571428571404,
  position_y: 4057.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103369] = create_condition!(
  bot: rogue_dump,
  position_x: 2188.8571428571404,
  position_y: 4207.142857142857,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103370] = create_score!(
  bot: rogue_dump,
  position_x: 2187.428571428568,
  position_y: 4411.428571428571,
  action_type: "add",
  value: 7
)

node_map[103371] = create_condition!(
  bot: rogue_dump,
  position_x: 2293.142857142854,
  position_y: 3751.428571428571,
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

node_map[103372] = create_condition!(
  bot: rogue_dump,
  position_x: 2363.142857142854,
  position_y: 3901.428571428571,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103373] = create_score!(
  bot: rogue_dump,
  position_x: 2358.8571428571404,
  position_y: 4100.0,
  action_type: "add",
  value: 5
)

node_map[103374] = create_condition!(
  bot: rogue_dump,
  position_x: 2150.285714285712,
  position_y: 4608.571428571429,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103375] = create_condition!(
  bot: rogue_dump,
  position_x: 2220.285714285712,
  position_y: 4758.571428571429,
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

node_map[103376] = create_condition!(
  bot: rogue_dump,
  position_x: 2150.285714285712,
  position_y: 4908.571428571429,
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

node_map[103377] = create_condition!(
  bot: rogue_dump,
  position_x: 2220.285714285712,
  position_y: 5058.571428571429,
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

node_map[103378] = create_score!(
  bot: rogue_dump,
  position_x: 2224.5714285714257,
  position_y: 5265.714285714286,
  action_type: "return",
  value: 26
)

node_map[103379] = create_condition!(
  bot: rogue_dump,
  position_x: 2407.428571428569,
  position_y: 4525.714285714286,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103380] = create_condition!(
  bot: rogue_dump,
  position_x: 2407.428571428569,
  position_y: 4675.714285714286,
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

node_map[103381] = create_condition!(
  bot: rogue_dump,
  position_x: 2477.428571428569,
  position_y: 4825.714285714286,
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

node_map[103382] = create_condition!(
  bot: rogue_dump,
  position_x: 2407.428571428569,
  position_y: 4975.714285714286,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103383] = create_score!(
  bot: rogue_dump,
  position_x: 2397.428571428569,
  position_y: 5180.0,
  action_type: "return",
  value: 18
)

node_map[103384] = create_condition!(
  bot: rogue_dump,
  position_x: 2667.428571428569,
  position_y: 4675.714285714286,
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

node_map[103385] = create_condition!(
  bot: rogue_dump,
  position_x: 2737.428571428569,
  position_y: 4825.714285714286,
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

node_map[103386] = create_condition!(
  bot: rogue_dump,
  position_x: 2667.428571428569,
  position_y: 4975.714285714286,
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

node_map[103387] = create_score!(
  bot: rogue_dump,
  position_x: 2657.428571428569,
  position_y: 5180.0,
  action_type: "return",
  value: 18
)

node_map[103388] = create_condition!(
  bot: rogue_dump,
  position_x: 3027.428571428569,
  position_y: 3920.0,
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

node_map[103389] = create_condition!(
  bot: rogue_dump,
  position_x: 2764.5714285714257,
  position_y: 4070.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103390] = create_condition!(
  bot: rogue_dump,
  position_x: 2643.142857142855,
  position_y: 4220.0,
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

node_map[103391] = create_score!(
  bot: rogue_dump,
  position_x: 2647.428571428569,
  position_y: 4418.571428571428,
  action_type: "add",
  value: 8
)

node_map[103392] = create_condition!(
  bot: rogue_dump,
  position_x: 2903.142857142855,
  position_y: 4220.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103393] = create_score!(
  bot: rogue_dump,
  position_x: 2907.428571428569,
  position_y: 4418.571428571428,
  action_type: "add",
  value: 8
)

node_map[103394] = create_condition!(
  bot: rogue_dump,
  position_x: 3021.714285714281,
  position_y: 4614.285714285714,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103395] = create_condition!(
  bot: rogue_dump,
  position_x: 2891.714285714281,
  position_y: 4778.571428571429,
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

node_map[103396] = create_score!(
  bot: rogue_dump,
  position_x: 2884.571428571424,
  position_y: 4968.571428571429,
  action_type: "add",
  value: 8
)

node_map[103397] = create_condition!(
  bot: rogue_dump,
  position_x: 3151.714285714281,
  position_y: 4778.571428571429,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103398] = create_score!(
  bot: rogue_dump,
  position_x: 3144.571428571424,
  position_y: 4968.571428571429,
  action_type: "add",
  value: 8
)

node_map[103399] = create_condition!(
  bot: rogue_dump,
  position_x: 3650.285714285712,
  position_y: 4331.428571428572,
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

node_map[103400] = create_condition!(
  bot: rogue_dump,
  position_x: 3470.285714285712,
  position_y: 4478.571428571429,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103401] = create_condition!(
  bot: rogue_dump,
  position_x: 3348.8571428571413,
  position_y: 4628.571428571429,
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

node_map[103402] = create_score!(
  bot: rogue_dump,
  position_x: 3353.142857142855,
  position_y: 4827.142857142858,
  action_type: "add",
  value: 6
)

node_map[103403] = create_condition!(
  bot: rogue_dump,
  position_x: 3608.8571428571413,
  position_y: 4628.571428571429,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103404] = create_score!(
  bot: rogue_dump,
  position_x: 3613.142857142855,
  position_y: 4827.142857142858,
  action_type: "add",
  value: 6
)

node_map[103405] = create_condition!(
  bot: rogue_dump,
  position_x: 3747.428571428569,
  position_y: 5105.714285714286,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103406] = create_condition!(
  bot: rogue_dump,
  position_x: 3617.428571428569,
  position_y: 5270.000000000002,
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

node_map[103407] = create_score!(
  bot: rogue_dump,
  position_x: 3610.285714285712,
  position_y: 5460.000000000002,
  action_type: "add",
  value: 6
)

node_map[103408] = create_condition!(
  bot: rogue_dump,
  position_x: 3877.428571428569,
  position_y: 5270.000000000002,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103409] = create_score!(
  bot: rogue_dump,
  position_x: 3870.285714285712,
  position_y: 5460.000000000002,
  action_type: "add",
  value: 6
)

node_map[103410] = create_condition!(
  bot: rogue_dump,
  position_x: 4673.142857142855,
  position_y: 4200.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103411] = create_condition!(
  bot: rogue_dump,
  position_x: 4743.142857142855,
  position_y: 4350.0,
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

node_map[103412] = create_condition!(
  bot: rogue_dump,
  position_x: 4673.142857142855,
  position_y: 4500.0,
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

node_map[103413] = create_condition!(
  bot: rogue_dump,
  position_x: 4743.142857142855,
  position_y: 4650.0,
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

node_map[103414] = create_score!(
  bot: rogue_dump,
  position_x: 4733.142857142855,
  position_y: 4840.0,
  action_type: "subtract",
  value: 10
)

node_map[103415] = create_condition!(
  bot: rogue_dump,
  position_x: 4024.5714285714257,
  position_y: 4022.857142857142,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103416] = create_condition!(
  bot: rogue_dump,
  position_x: 4094.5714285714257,
  position_y: 4172.857142857142,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103417] = create_condition!(
  bot: rogue_dump,
  position_x: 4024.5714285714257,
  position_y: 4322.857142857142,
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

node_map[103418] = create_score!(
  bot: rogue_dump,
  position_x: 3848.8571428571395,
  position_y: 4467.142857142857,
  action_type: "subtract",
  value: 6
)

node_map[103419] = create_condition!(
  bot: rogue_dump,
  position_x: 4028.8571428571377,
  position_y: 4595.714285714284,
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

node_map[103420] = create_score!(
  bot: rogue_dump,
  position_x: 4018.8571428571377,
  position_y: 4785.714285714284,
  action_type: "subtract",
  value: 8
)

node_map[103421] = create_condition!(
  bot: rogue_dump,
  position_x: 4248.857142857138,
  position_y: 4452.857142857141,
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

node_map[103422] = create_score!(
  bot: rogue_dump,
  position_x: 4238.857142857138,
  position_y: 4642.857142857141,
  action_type: "subtract",
  value: 8
)

node_map[103423] = create_condition!(
  bot: rogue_dump,
  position_x: 5173.142857142855,
  position_y: 4097.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103424] = create_condition!(
  bot: rogue_dump,
  position_x: 5243.142857142855,
  position_y: 4247.142857142857,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103425] = create_condition!(
  bot: rogue_dump,
  position_x: 5173.142857142855,
  position_y: 4397.142857142857,
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

node_map[103426] = create_score!(
  bot: rogue_dump,
  position_x: 4948.857142857141,
  position_y: 4547.142857142858,
  action_type: "subtract",
  value: 6
)

node_map[103427] = create_condition!(
  bot: rogue_dump,
  position_x: 5165.999999999998,
  position_y: 4615.714285714286,
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

node_map[103428] = create_score!(
  bot: rogue_dump,
  position_x: 5155.999999999998,
  position_y: 4805.714285714286,
  action_type: "subtract",
  value: 8
)

node_map[103429] = create_condition!(
  bot: rogue_dump,
  position_x: 5414.571428571426,
  position_y: 4550.000000000001,
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

node_map[103430] = create_score!(
  bot: rogue_dump,
  position_x: 5404.571428571426,
  position_y: 4740.000000000001,
  action_type: "subtract",
  value: 8
)

node_map[103431] = create_condition!(
  bot: rogue_dump,
  position_x: 5447.428571428568,
  position_y: 4040.0,
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

node_map[103432] = create_score!(
  bot: rogue_dump,
  position_x: 5440.285714285711,
  position_y: 4230.0,
  action_type: "subtract",
  value: 18
)

node_map[103433] = create_condition!(
  bot: rogue_dump,
  position_x: 5707.428571428568,
  position_y: 4040.0,
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

node_map[103434] = create_score!(
  bot: rogue_dump,
  position_x: 5700.285714285711,
  position_y: 4230.0,
  action_type: "subtract",
  value: 14
)

node_map[103435] = create_condition!(
  bot: rogue_dump,
  position_x: 5967.428571428568,
  position_y: 4040.0,
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

node_map[103436] = create_score!(
  bot: rogue_dump,
  position_x: 5960.285714285711,
  position_y: 4230.0,
  action_type: "subtract",
  value: 10
)

node_map[103437] = create_condition!(
  bot: rogue_dump,
  position_x: 6227.428571428568,
  position_y: 4040.0,
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

node_map[103438] = create_score!(
  bot: rogue_dump,
  position_x: 6220.285714285711,
  position_y: 4230.0,
  action_type: "subtract",
  value: 12
)

node_map[103439] = create_condition!(
  bot: rogue_dump,
  position_x: 6487.428571428568,
  position_y: 4040.0,
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

node_map[103440] = create_score!(
  bot: rogue_dump,
  position_x: 6480.285714285711,
  position_y: 4230.0,
  action_type: "subtract",
  value: 12
)

node_map[103441] = create_condition!(
  bot: rogue_dump,
  position_x: 6747.428571428568,
  position_y: 4040.0,
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

node_map[103442] = create_score!(
  bot: rogue_dump,
  position_x: 6740.285714285711,
  position_y: 4230.0,
  action_type: "subtract",
  value: 8
)

node_map[103443] = create_condition!(
  bot: rogue_dump,
  position_x: 7007.428571428568,
  position_y: 4040.0,
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

node_map[103444] = create_score!(
  bot: rogue_dump,
  position_x: 7000.285714285711,
  position_y: 4230.0,
  action_type: "subtract",
  value: 8
)

node_map[103445] = create_score!(
  bot: rogue_dump,
  position_x: -2250.665367126465,
  position_y: 1516.0,
  action_type: "return",
  value: 34
)

node_map[103446] = create_score!(
  bot: rogue_dump,
  position_x: -1726.301730762828,
  position_y: 2373.0909090909095,
  action_type: "return",
  value: 34
)

connect!(node_map[103029], node_map[103030])
connect!(node_map[103029], node_map[103031])
connect!(node_map[103029], node_map[103032])
connect!(node_map[103029], node_map[103033])
connect!(node_map[103029], node_map[103034])
connect!(node_map[103029], node_map[103035])
connect!(node_map[103029], node_map[103036])
connect!(node_map[103030], node_map[103037])
connect!(node_map[103030], node_map[103040])
connect!(node_map[103031], node_map[103043])
connect!(node_map[103032], node_map[103082])
connect!(node_map[103032], node_map[103086])
connect!(node_map[103032], node_map[103089])
connect!(node_map[103032], node_map[103095])
connect!(node_map[103032], node_map[103100])
connect!(node_map[103032], node_map[103121])
connect!(node_map[103032], node_map[103142])
connect!(node_map[103032], node_map[103162])
connect!(node_map[103032], node_map[103182])
connect!(node_map[103032], node_map[103203])
connect!(node_map[103032], node_map[103224])
connect!(node_map[103033], node_map[103245])
connect!(node_map[103034], node_map[103279])
connect!(node_map[103034], node_map[103286])
connect!(node_map[103034], node_map[103272])
connect!(node_map[103035], node_map[103331])
connect!(node_map[103036], node_map[103360])
connect!(node_map[103036], node_map[103374])
connect!(node_map[103036], node_map[103379])
connect!(node_map[103036], node_map[103388])
connect!(node_map[103036], node_map[103399])
connect!(node_map[103036], node_map[103410])
connect!(node_map[103036], node_map[103415])
connect!(node_map[103036], node_map[103423])
connect!(node_map[103036], node_map[103431])
connect!(node_map[103036], node_map[103433])
connect!(node_map[103036], node_map[103435])
connect!(node_map[103036], node_map[103437])
connect!(node_map[103036], node_map[103439])
connect!(node_map[103036], node_map[103441])
connect!(node_map[103036], node_map[103443])
connect!(node_map[103037], node_map[103038])
connect!(node_map[103038], node_map[103039])
connect!(node_map[103040], node_map[103041])
connect!(node_map[103041], node_map[103042])
connect!(node_map[103043], node_map[103044])
connect!(node_map[103044], node_map[103045])
connect!(node_map[103045], node_map[103046])
connect!(node_map[103046], node_map[103047])
connect!(node_map[103047], node_map[103048])
connect!(node_map[103048], node_map[103049])
connect!(node_map[103049], node_map[103050])
connect!(node_map[103050], node_map[103051])
connect!(node_map[103051], node_map[103052])
connect!(node_map[103052], node_map[103053])
connect!(node_map[103053], node_map[103054])
connect!(node_map[103054], node_map[103055])
connect!(node_map[103055], node_map[103056])
connect!(node_map[103056], node_map[103057])
connect!(node_map[103056], node_map[103064])
connect!(node_map[103056], node_map[103071])
connect!(node_map[103057], node_map[103058])
connect!(node_map[103058], node_map[103059])
connect!(node_map[103059], node_map[103060])
connect!(node_map[103059], node_map[103062])
connect!(node_map[103060], node_map[103061])
connect!(node_map[103062], node_map[103063])
connect!(node_map[103064], node_map[103065])
connect!(node_map[103065], node_map[103066])
connect!(node_map[103066], node_map[103067])
connect!(node_map[103066], node_map[103069])
connect!(node_map[103067], node_map[103068])
connect!(node_map[103069], node_map[103070])
connect!(node_map[103071], node_map[103072])
connect!(node_map[103071], node_map[103077])
connect!(node_map[103072], node_map[103073])
connect!(node_map[103072], node_map[103075])
connect!(node_map[103073], node_map[103074])
connect!(node_map[103075], node_map[103076])
connect!(node_map[103077], node_map[103078])
connect!(node_map[103077], node_map[103080])
connect!(node_map[103078], node_map[103079])
connect!(node_map[103080], node_map[103081])
connect!(node_map[103082], node_map[103083])
connect!(node_map[103082], node_map[103085])
connect!(node_map[103083], node_map[103084])
connect!(node_map[103086], node_map[103087])
connect!(node_map[103087], node_map[103088])
connect!(node_map[103089], node_map[103090])
connect!(node_map[103090], node_map[103091])
connect!(node_map[103090], node_map[103093])
connect!(node_map[103091], node_map[103092])
connect!(node_map[103093], node_map[103094])
connect!(node_map[103095], node_map[103096])
connect!(node_map[103096], node_map[103097])
connect!(node_map[103097], node_map[103098])
connect!(node_map[103098], node_map[103099])
connect!(node_map[103100], node_map[103101])
connect!(node_map[103100], node_map[103103])
connect!(node_map[103100], node_map[103107])
connect!(node_map[103100], node_map[103109])
connect!(node_map[103100], node_map[103112])
connect!(node_map[103100], node_map[103115])
connect!(node_map[103100], node_map[103118])
connect!(node_map[103101], node_map[103102])
connect!(node_map[103103], node_map[103104])
connect!(node_map[103104], node_map[103105])
connect!(node_map[103105], node_map[103106])
connect!(node_map[103107], node_map[103108])
connect!(node_map[103109], node_map[103110])
connect!(node_map[103110], node_map[103111])
connect!(node_map[103112], node_map[103113])
connect!(node_map[103113], node_map[103114])
connect!(node_map[103115], node_map[103116])
connect!(node_map[103116], node_map[103117])
connect!(node_map[103118], node_map[103119])
connect!(node_map[103119], node_map[103120])
connect!(node_map[103121], node_map[103122])
connect!(node_map[103121], node_map[103124])
connect!(node_map[103121], node_map[103128])
connect!(node_map[103121], node_map[103130])
connect!(node_map[103121], node_map[103133])
connect!(node_map[103121], node_map[103136])
connect!(node_map[103121], node_map[103139])
connect!(node_map[103122], node_map[103123])
connect!(node_map[103124], node_map[103125])
connect!(node_map[103125], node_map[103126])
connect!(node_map[103126], node_map[103127])
connect!(node_map[103128], node_map[103129])
connect!(node_map[103130], node_map[103131])
connect!(node_map[103131], node_map[103132])
connect!(node_map[103133], node_map[103134])
connect!(node_map[103134], node_map[103135])
connect!(node_map[103136], node_map[103137])
connect!(node_map[103137], node_map[103138])
connect!(node_map[103139], node_map[103140])
connect!(node_map[103140], node_map[103141])
connect!(node_map[103142], node_map[103143])
connect!(node_map[103142], node_map[103144])
connect!(node_map[103142], node_map[103148])
connect!(node_map[103142], node_map[103150])
connect!(node_map[103142], node_map[103153])
connect!(node_map[103142], node_map[103156])
connect!(node_map[103142], node_map[103159])
connect!(node_map[103143], node_map[103446])
connect!(node_map[103144], node_map[103145])
connect!(node_map[103145], node_map[103146])
connect!(node_map[103146], node_map[103147])
connect!(node_map[103148], node_map[103149])
connect!(node_map[103150], node_map[103151])
connect!(node_map[103151], node_map[103152])
connect!(node_map[103153], node_map[103154])
connect!(node_map[103154], node_map[103155])
connect!(node_map[103156], node_map[103157])
connect!(node_map[103157], node_map[103158])
connect!(node_map[103159], node_map[103160])
connect!(node_map[103160], node_map[103161])
connect!(node_map[103162], node_map[103163])
connect!(node_map[103162], node_map[103164])
connect!(node_map[103162], node_map[103168])
connect!(node_map[103162], node_map[103170])
connect!(node_map[103162], node_map[103173])
connect!(node_map[103162], node_map[103176])
connect!(node_map[103162], node_map[103179])
connect!(node_map[103163], node_map[103445])
connect!(node_map[103164], node_map[103165])
connect!(node_map[103165], node_map[103166])
connect!(node_map[103166], node_map[103167])
connect!(node_map[103168], node_map[103169])
connect!(node_map[103170], node_map[103171])
connect!(node_map[103171], node_map[103172])
connect!(node_map[103173], node_map[103174])
connect!(node_map[103174], node_map[103175])
connect!(node_map[103176], node_map[103177])
connect!(node_map[103177], node_map[103178])
connect!(node_map[103179], node_map[103180])
connect!(node_map[103180], node_map[103181])
connect!(node_map[103182], node_map[103183])
connect!(node_map[103182], node_map[103185])
connect!(node_map[103182], node_map[103189])
connect!(node_map[103182], node_map[103191])
connect!(node_map[103182], node_map[103194])
connect!(node_map[103182], node_map[103197])
connect!(node_map[103182], node_map[103200])
connect!(node_map[103183], node_map[103184])
connect!(node_map[103185], node_map[103186])
connect!(node_map[103186], node_map[103187])
connect!(node_map[103187], node_map[103188])
connect!(node_map[103189], node_map[103190])
connect!(node_map[103191], node_map[103192])
connect!(node_map[103192], node_map[103193])
connect!(node_map[103194], node_map[103195])
connect!(node_map[103195], node_map[103196])
connect!(node_map[103197], node_map[103198])
connect!(node_map[103198], node_map[103199])
connect!(node_map[103200], node_map[103201])
connect!(node_map[103201], node_map[103202])
connect!(node_map[103203], node_map[103204])
connect!(node_map[103203], node_map[103206])
connect!(node_map[103203], node_map[103210])
connect!(node_map[103203], node_map[103212])
connect!(node_map[103203], node_map[103215])
connect!(node_map[103203], node_map[103218])
connect!(node_map[103203], node_map[103221])
connect!(node_map[103204], node_map[103205])
connect!(node_map[103206], node_map[103207])
connect!(node_map[103207], node_map[103208])
connect!(node_map[103208], node_map[103209])
connect!(node_map[103210], node_map[103211])
connect!(node_map[103212], node_map[103213])
connect!(node_map[103213], node_map[103214])
connect!(node_map[103215], node_map[103216])
connect!(node_map[103216], node_map[103217])
connect!(node_map[103218], node_map[103219])
connect!(node_map[103219], node_map[103220])
connect!(node_map[103221], node_map[103222])
connect!(node_map[103222], node_map[103223])
connect!(node_map[103224], node_map[103225])
connect!(node_map[103224], node_map[103227])
connect!(node_map[103224], node_map[103231])
connect!(node_map[103224], node_map[103233])
connect!(node_map[103224], node_map[103236])
connect!(node_map[103224], node_map[103239])
connect!(node_map[103224], node_map[103242])
connect!(node_map[103225], node_map[103226])
connect!(node_map[103227], node_map[103228])
connect!(node_map[103228], node_map[103229])
connect!(node_map[103229], node_map[103230])
connect!(node_map[103231], node_map[103232])
connect!(node_map[103233], node_map[103234])
connect!(node_map[103234], node_map[103235])
connect!(node_map[103236], node_map[103237])
connect!(node_map[103237], node_map[103238])
connect!(node_map[103239], node_map[103240])
connect!(node_map[103240], node_map[103241])
connect!(node_map[103242], node_map[103243])
connect!(node_map[103243], node_map[103244])
connect!(node_map[103245], node_map[103246])
connect!(node_map[103245], node_map[103251])
connect!(node_map[103245], node_map[103263])
connect!(node_map[103245], node_map[103265])
connect!(node_map[103245], node_map[103268])
connect!(node_map[103246], node_map[103247])
connect!(node_map[103246], node_map[103249])
connect!(node_map[103247], node_map[103248])
connect!(node_map[103249], node_map[103250])
connect!(node_map[103251], node_map[103252])
connect!(node_map[103252], node_map[103253])
connect!(node_map[103252], node_map[103255])
connect!(node_map[103252], node_map[103257])
connect!(node_map[103252], node_map[103259])
connect!(node_map[103252], node_map[103261])
connect!(node_map[103253], node_map[103254])
connect!(node_map[103255], node_map[103256])
connect!(node_map[103257], node_map[103258])
connect!(node_map[103259], node_map[103260])
connect!(node_map[103261], node_map[103262])
connect!(node_map[103263], node_map[103264])
connect!(node_map[103265], node_map[103266])
connect!(node_map[103266], node_map[103267])
connect!(node_map[103268], node_map[103269])
connect!(node_map[103269], node_map[103270])
connect!(node_map[103270], node_map[103271])
connect!(node_map[103272], node_map[103273])
connect!(node_map[103272], node_map[103277])
connect!(node_map[103273], node_map[103274])
connect!(node_map[103273], node_map[103276])
connect!(node_map[103274], node_map[103275])
connect!(node_map[103277], node_map[103278])
connect!(node_map[103279], node_map[103280])
connect!(node_map[103279], node_map[103284])
connect!(node_map[103280], node_map[103281])
connect!(node_map[103280], node_map[103283])
connect!(node_map[103281], node_map[103282])
connect!(node_map[103284], node_map[103285])
connect!(node_map[103286], node_map[103287])
connect!(node_map[103286], node_map[103289])
connect!(node_map[103287], node_map[103288])
connect!(node_map[103288], node_map[103291])
connect!(node_map[103288], node_map[103295])
connect!(node_map[103288], node_map[103303])
connect!(node_map[103288], node_map[103307])
connect!(node_map[103288], node_map[103313])
connect!(node_map[103288], node_map[103319])
connect!(node_map[103288], node_map[103325])
connect!(node_map[103289], node_map[103290])
connect!(node_map[103290], node_map[103293])
connect!(node_map[103290], node_map[103299])
connect!(node_map[103290], node_map[103305])
connect!(node_map[103290], node_map[103310])
connect!(node_map[103290], node_map[103316])
connect!(node_map[103290], node_map[103322])
connect!(node_map[103290], node_map[103328])
connect!(node_map[103291], node_map[103292])
connect!(node_map[103293], node_map[103294])
connect!(node_map[103295], node_map[103296])
connect!(node_map[103296], node_map[103297])
connect!(node_map[103297], node_map[103298])
connect!(node_map[103299], node_map[103300])
connect!(node_map[103300], node_map[103301])
connect!(node_map[103301], node_map[103302])
connect!(node_map[103303], node_map[103304])
connect!(node_map[103305], node_map[103306])
connect!(node_map[103307], node_map[103308])
connect!(node_map[103308], node_map[103309])
connect!(node_map[103310], node_map[103311])
connect!(node_map[103311], node_map[103312])
connect!(node_map[103313], node_map[103314])
connect!(node_map[103314], node_map[103315])
connect!(node_map[103316], node_map[103317])
connect!(node_map[103317], node_map[103318])
connect!(node_map[103319], node_map[103320])
connect!(node_map[103320], node_map[103321])
connect!(node_map[103322], node_map[103323])
connect!(node_map[103323], node_map[103324])
connect!(node_map[103325], node_map[103326])
connect!(node_map[103326], node_map[103327])
connect!(node_map[103328], node_map[103329])
connect!(node_map[103329], node_map[103330])
connect!(node_map[103331], node_map[103332])
connect!(node_map[103332], node_map[103333])
connect!(node_map[103332], node_map[103338])
connect!(node_map[103332], node_map[103343])
connect!(node_map[103332], node_map[103348])
connect!(node_map[103332], node_map[103354])
connect!(node_map[103333], node_map[103334])
connect!(node_map[103333], node_map[103336])
connect!(node_map[103334], node_map[103335])
connect!(node_map[103336], node_map[103337])
connect!(node_map[103338], node_map[103339])
connect!(node_map[103338], node_map[103341])
connect!(node_map[103339], node_map[103340])
connect!(node_map[103341], node_map[103342])
connect!(node_map[103343], node_map[103344])
connect!(node_map[103343], node_map[103346])
connect!(node_map[103344], node_map[103345])
connect!(node_map[103346], node_map[103347])
connect!(node_map[103348], node_map[103349])
connect!(node_map[103349], node_map[103350])
connect!(node_map[103349], node_map[103352])
connect!(node_map[103350], node_map[103351])
connect!(node_map[103352], node_map[103353])
connect!(node_map[103354], node_map[103355])
connect!(node_map[103355], node_map[103356])
connect!(node_map[103355], node_map[103358])
connect!(node_map[103356], node_map[103357])
connect!(node_map[103358], node_map[103359])
connect!(node_map[103360], node_map[103361])
connect!(node_map[103361], node_map[103362])
connect!(node_map[103361], node_map[103371])
connect!(node_map[103362], node_map[103363])
connect!(node_map[103363], node_map[103364])
connect!(node_map[103363], node_map[103366])
connect!(node_map[103363], node_map[103368])
connect!(node_map[103364], node_map[103365])
connect!(node_map[103366], node_map[103367])
connect!(node_map[103368], node_map[103369])
connect!(node_map[103369], node_map[103370])
connect!(node_map[103371], node_map[103372])
connect!(node_map[103372], node_map[103373])
connect!(node_map[103374], node_map[103375])
connect!(node_map[103375], node_map[103376])
connect!(node_map[103376], node_map[103377])
connect!(node_map[103377], node_map[103378])
connect!(node_map[103379], node_map[103380])
connect!(node_map[103379], node_map[103384])
connect!(node_map[103380], node_map[103381])
connect!(node_map[103381], node_map[103382])
connect!(node_map[103382], node_map[103383])
connect!(node_map[103384], node_map[103385])
connect!(node_map[103385], node_map[103386])
connect!(node_map[103386], node_map[103387])
connect!(node_map[103388], node_map[103389])
connect!(node_map[103388], node_map[103394])
connect!(node_map[103389], node_map[103390])
connect!(node_map[103389], node_map[103392])
connect!(node_map[103390], node_map[103391])
connect!(node_map[103392], node_map[103393])
connect!(node_map[103394], node_map[103395])
connect!(node_map[103394], node_map[103397])
connect!(node_map[103395], node_map[103396])
connect!(node_map[103397], node_map[103398])
connect!(node_map[103399], node_map[103400])
connect!(node_map[103399], node_map[103405])
connect!(node_map[103400], node_map[103401])
connect!(node_map[103400], node_map[103403])
connect!(node_map[103401], node_map[103402])
connect!(node_map[103403], node_map[103404])
connect!(node_map[103405], node_map[103406])
connect!(node_map[103405], node_map[103408])
connect!(node_map[103406], node_map[103407])
connect!(node_map[103408], node_map[103409])
connect!(node_map[103410], node_map[103411])
connect!(node_map[103411], node_map[103412])
connect!(node_map[103412], node_map[103413])
connect!(node_map[103413], node_map[103414])
connect!(node_map[103415], node_map[103416])
connect!(node_map[103416], node_map[103417])
connect!(node_map[103417], node_map[103418])
connect!(node_map[103417], node_map[103419])
connect!(node_map[103417], node_map[103421])
connect!(node_map[103419], node_map[103420])
connect!(node_map[103421], node_map[103422])
connect!(node_map[103423], node_map[103424])
connect!(node_map[103424], node_map[103425])
connect!(node_map[103425], node_map[103426])
connect!(node_map[103425], node_map[103427])
connect!(node_map[103425], node_map[103429])
connect!(node_map[103427], node_map[103428])
connect!(node_map[103429], node_map[103430])
connect!(node_map[103431], node_map[103432])
connect!(node_map[103433], node_map[103434])
connect!(node_map[103435], node_map[103436])
connect!(node_map[103437], node_map[103438])
connect!(node_map[103439], node_map[103440])
connect!(node_map[103441], node_map[103442])
connect!(node_map[103443], node_map[103444])

rogue_dump.compile_program!
