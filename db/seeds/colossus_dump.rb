# Standalone seed file for Colossus Dump.

require_relative 'helpers'

user = seed_user!

colossus_dump = user.bots.find_or_initialize_by(name: "Colossus Dump")
colossus_dump.description = "A behavior-preserving refactor target for Colossus built on the Cyclops v2 base with shared graph trunks for conversion and discipline logic. Migrated from Colossus v2 by bots:migrate_to_v2_grammar_clone."
colossus_dump.save!

reset_bot_graph!(colossus_dump)

node_map = { 103633 => colossus_dump.root_node }

node_map[103634] = create_organizer!(
  bot: colossus_dump,
  position_x: -120.0,
  position_y: -520.0,
  title: "Terminal",
  notes: ""
)

node_map[103635] = create_organizer!(
  bot: colossus_dump,
  position_x: -1280.0,
  position_y: 40.0,
  title: "Tactics",
  notes: ""
)

node_map[103636] = create_organizer!(
  bot: colossus_dump,
  position_x: -1040.0,
  position_y: 1140.0,
  title: "Pressure",
  notes: ""
)

node_map[103637] = create_organizer!(
  bot: colossus_dump,
  position_x: -520.0,
  position_y: 2140.0,
  title: "Fallback",
  notes: ""
)

node_map[103638] = create_organizer!(
  bot: colossus_dump,
  position_x: 1760.0,
  position_y: 1740.0,
  title: "Endgame",
  notes: ""
)

node_map[103639] = create_organizer!(
  bot: colossus_dump,
  position_x: 4060.0,
  position_y: 220.0,
  title: "Opening",
  notes: ""
)

node_map[103640] = create_condition!(
  bot: colossus_dump,
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

node_map[103641] = create_condition!(
  bot: colossus_dump,
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

node_map[103642] = create_score!(
  bot: colossus_dump,
  position_x: -180.0,
  position_y: -60.0,
  action_type: "return",
  value: 100
)

node_map[103643] = create_condition!(
  bot: colossus_dump,
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

node_map[103644] = create_condition!(
  bot: colossus_dump,
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

node_map[103645] = create_score!(
  bot: colossus_dump,
  position_x: 80.0,
  position_y: -60.0,
  action_type: "return",
  value: -100
)

node_map[103646] = create_condition!(
  bot: colossus_dump,
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

node_map[103647] = create_condition!(
  bot: colossus_dump,
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

node_map[103648] = create_condition!(
  bot: colossus_dump,
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

node_map[103649] = create_condition!(
  bot: colossus_dump,
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

node_map[103650] = create_condition!(
  bot: colossus_dump,
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

node_map[103651] = create_condition!(
  bot: colossus_dump,
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

node_map[103652] = create_condition!(
  bot: colossus_dump,
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

node_map[103653] = create_condition!(
  bot: colossus_dump,
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

node_map[103654] = create_condition!(
  bot: colossus_dump,
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

node_map[103655] = create_condition!(
  bot: colossus_dump,
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

node_map[103656] = create_condition!(
  bot: colossus_dump,
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

node_map[103657] = create_condition!(
  bot: colossus_dump,
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

node_map[103658] = create_condition!(
  bot: colossus_dump,
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

node_map[103659] = create_condition!(
  bot: colossus_dump,
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

node_map[103660] = create_condition!(
  bot: colossus_dump,
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

node_map[103661] = create_condition!(
  bot: colossus_dump,
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

node_map[103662] = create_condition!(
  bot: colossus_dump,
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

node_map[103663] = create_score!(
  bot: colossus_dump,
  position_x: 3670.0,
  position_y: 2520.0,
  action_type: "return",
  value: 14
)

node_map[103664] = create_condition!(
  bot: colossus_dump,
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

node_map[103665] = create_condition!(
  bot: colossus_dump,
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

node_map[103666] = create_condition!(
  bot: colossus_dump,
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

node_map[103667] = create_score!(
  bot: colossus_dump,
  position_x: 4310.0,
  position_y: 2520.0,
  action_type: "return",
  value: 13
)

node_map[103668] = create_condition!(
  bot: colossus_dump,
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

node_map[103669] = create_condition!(
  bot: colossus_dump,
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

node_map[103670] = create_condition!(
  bot: colossus_dump,
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

node_map[103671] = create_condition!(
  bot: colossus_dump,
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

node_map[103672] = create_condition!(
  bot: colossus_dump,
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

node_map[103673] = create_condition!(
  bot: colossus_dump,
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

node_map[103674] = create_condition!(
  bot: colossus_dump,
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

node_map[103675] = create_condition!(
  bot: colossus_dump,
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

node_map[103676] = create_condition!(
  bot: colossus_dump,
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

node_map[103677] = create_condition!(
  bot: colossus_dump,
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

node_map[103678] = create_condition!(
  bot: colossus_dump,
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

node_map[103679] = create_condition!(
  bot: colossus_dump,
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

node_map[103680] = create_condition!(
  bot: colossus_dump,
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

node_map[103681] = create_condition!(
  bot: colossus_dump,
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

node_map[103682] = create_condition!(
  bot: colossus_dump,
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

node_map[103683] = create_condition!(
  bot: colossus_dump,
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

node_map[103684] = create_condition!(
  bot: colossus_dump,
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

node_map[103685] = create_score!(
  bot: colossus_dump,
  position_x: 4560.0,
  position_y: 2670.0,
  action_type: "add",
  value: 9
)

node_map[103686] = create_condition!(
  bot: colossus_dump,
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

node_map[103687] = create_condition!(
  bot: colossus_dump,
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

node_map[103688] = create_score!(
  bot: colossus_dump,
  position_x: 4840.0,
  position_y: 2670.0,
  action_type: "add",
  value: 8
)

node_map[103689] = create_condition!(
  bot: colossus_dump,
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

node_map[103690] = create_condition!(
  bot: colossus_dump,
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

node_map[103691] = create_score!(
  bot: colossus_dump,
  position_x: -1740.0,
  position_y: 330.0,
  action_type: "return",
  value: 110
)

node_map[103692] = create_score!(
  bot: colossus_dump,
  position_x: -1200.0,
  position_y: 180.0,
  action_type: "return",
  value: 100
)

node_map[103693] = create_condition!(
  bot: colossus_dump,
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

node_map[103694] = create_condition!(
  bot: colossus_dump,
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

node_map[103695] = create_score!(
  bot: colossus_dump,
  position_x: -920.0,
  position_y: 340.0,
  action_type: "return",
  value: 90
)

node_map[103696] = create_condition!(
  bot: colossus_dump,
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

node_map[103697] = create_condition!(
  bot: colossus_dump,
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

node_map[103698] = create_condition!(
  bot: colossus_dump,
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

node_map[103699] = create_score!(
  bot: colossus_dump,
  position_x: -700.0,
  position_y: 910.0,
  action_type: "return",
  value: 58
)

node_map[103700] = create_condition!(
  bot: colossus_dump,
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

node_map[103701] = create_condition!(
  bot: colossus_dump,
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

node_map[103702] = create_condition!(
  bot: colossus_dump,
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

node_map[103703] = create_condition!(
  bot: colossus_dump,
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

node_map[103704] = create_score!(
  bot: colossus_dump,
  position_x: -180.0,
  position_y: 640.0,
  action_type: "return",
  value: 48
)

node_map[103705] = create_condition!(
  bot: colossus_dump,
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

node_map[103706] = create_condition!(
  bot: colossus_dump,
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

node_map[103707] = create_score!(
  bot: colossus_dump,
  position_x: 140.0,
  position_y: 720.0,
  action_type: "return",
  value: 44
)

node_map[103708] = create_condition!(
  bot: colossus_dump,
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

node_map[103709] = create_condition!(
  bot: colossus_dump,
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

node_map[103710] = create_condition!(
  bot: colossus_dump,
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

node_map[103711] = create_score!(
  bot: colossus_dump,
  position_x: -1800.0,
  position_y: 1240.0,
  action_type: "return",
  value: 34
)

node_map[103712] = create_condition!(
  bot: colossus_dump,
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

node_map[103713] = create_condition!(
  bot: colossus_dump,
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

node_map[103714] = create_condition!(
  bot: colossus_dump,
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

node_map[103715] = create_score!(
  bot: colossus_dump,
  position_x: -1730.0,
  position_y: 1910.0,
  action_type: "return",
  value: 24
)

node_map[103716] = create_condition!(
  bot: colossus_dump,
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

node_map[103717] = create_condition!(
  bot: colossus_dump,
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

node_map[103718] = create_condition!(
  bot: colossus_dump,
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

node_map[103719] = create_score!(
  bot: colossus_dump,
  position_x: -1010.0,
  position_y: 1390.0,
  action_type: "return",
  value: 22
)

node_map[103720] = create_condition!(
  bot: colossus_dump,
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

node_map[103721] = create_score!(
  bot: colossus_dump,
  position_x: -1010.0,
  position_y: 1610.0,
  action_type: "add",
  value: 16
)

node_map[103722] = create_condition!(
  bot: colossus_dump,
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

node_map[103723] = create_condition!(
  bot: colossus_dump,
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

node_map[103724] = create_condition!(
  bot: colossus_dump,
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

node_map[103725] = create_score!(
  bot: colossus_dump,
  position_x: -600.0,
  position_y: 1520.0,
  action_type: "return",
  value: 34
)

node_map[103726] = create_condition!(
  bot: colossus_dump,
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

node_map[103727] = create_condition!(
  bot: colossus_dump,
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

node_map[103728] = create_condition!(
  bot: colossus_dump,
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

node_map[103729] = create_score!(
  bot: colossus_dump,
  position_x: -530.0,
  position_y: 2190.0,
  action_type: "return",
  value: 24
)

node_map[103730] = create_condition!(
  bot: colossus_dump,
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

node_map[103731] = create_condition!(
  bot: colossus_dump,
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

node_map[103732] = create_condition!(
  bot: colossus_dump,
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

node_map[103733] = create_score!(
  bot: colossus_dump,
  position_x: 190.0,
  position_y: 1670.0,
  action_type: "return",
  value: 22
)

node_map[103734] = create_condition!(
  bot: colossus_dump,
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

node_map[103735] = create_score!(
  bot: colossus_dump,
  position_x: 190.0,
  position_y: 1890.0,
  action_type: "add",
  value: 16
)

node_map[103736] = create_condition!(
  bot: colossus_dump,
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

node_map[103737] = create_condition!(
  bot: colossus_dump,
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

node_map[103738] = create_condition!(
  bot: colossus_dump,
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

node_map[103739] = create_condition!(
  bot: colossus_dump,
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

node_map[103740] = create_score!(
  bot: colossus_dump,
  position_x: 570.0,
  position_y: 1570.0,
  action_type: "subtract",
  value: 14
)

node_map[103741] = create_condition!(
  bot: colossus_dump,
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

node_map[103742] = create_score!(
  bot: colossus_dump,
  position_x: 1090.0,
  position_y: 1570.0,
  action_type: "subtract",
  value: 14
)

node_map[103743] = create_condition!(
  bot: colossus_dump,
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

node_map[103744] = create_condition!(
  bot: colossus_dump,
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

node_map[103745] = create_condition!(
  bot: colossus_dump,
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

node_map[103746] = create_condition!(
  bot: colossus_dump,
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

node_map[103747] = create_score!(
  bot: colossus_dump,
  position_x: 1460.0,
  position_y: 2500.0,
  action_type: "return",
  value: 88
)

node_map[103748] = create_condition!(
  bot: colossus_dump,
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

node_map[103749] = create_condition!(
  bot: colossus_dump,
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

node_map[103750] = create_score!(
  bot: colossus_dump,
  position_x: 1820.0,
  position_y: 2500.0,
  action_type: "return",
  value: 24
)

node_map[103751] = create_condition!(
  bot: colossus_dump,
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

node_map[103752] = create_condition!(
  bot: colossus_dump,
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

node_map[103753] = create_condition!(
  bot: colossus_dump,
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

node_map[103754] = create_score!(
  bot: colossus_dump,
  position_x: 2120.0,
  position_y: 2440.0,
  action_type: "return",
  value: 34
)

node_map[103755] = create_condition!(
  bot: colossus_dump,
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

node_map[103756] = create_condition!(
  bot: colossus_dump,
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

node_map[103757] = create_condition!(
  bot: colossus_dump,
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

node_map[103758] = create_score!(
  bot: colossus_dump,
  position_x: 2870.0,
  position_y: 2590.0,
  action_type: "return",
  value: 36
)

node_map[103759] = create_condition!(
  bot: colossus_dump,
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

node_map[103760] = create_condition!(
  bot: colossus_dump,
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

node_map[103761] = create_condition!(
  bot: colossus_dump,
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

node_map[103762] = create_score!(
  bot: colossus_dump,
  position_x: 3100.0,
  position_y: 2740.0,
  action_type: "return",
  value: 34
)

node_map[103763] = create_condition!(
  bot: colossus_dump,
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

node_map[103764] = create_condition!(
  bot: colossus_dump,
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

node_map[103765] = create_condition!(
  bot: colossus_dump,
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

node_map[103766] = create_score!(
  bot: colossus_dump,
  position_x: 3850.0,
  position_y: 2890.0,
  action_type: "return",
  value: 36
)

node_map[103767] = create_condition!(
  bot: colossus_dump,
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

node_map[103768] = create_condition!(
  bot: colossus_dump,
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

node_map[103769] = create_condition!(
  bot: colossus_dump,
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

node_map[103770] = create_condition!(
  bot: colossus_dump,
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

node_map[103771] = create_score!(
  bot: colossus_dump,
  position_x: -1190.0,
  position_y: 2730.0,
  action_type: "add",
  value: 7
)

node_map[103772] = create_condition!(
  bot: colossus_dump,
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

node_map[103773] = create_score!(
  bot: colossus_dump,
  position_x: -910.0,
  position_y: 2950.0,
  action_type: "add",
  value: 7
)

node_map[103774] = create_condition!(
  bot: colossus_dump,
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

node_map[103775] = create_score!(
  bot: colossus_dump,
  position_x: -630.0,
  position_y: 2730.0,
  action_type: "add",
  value: 7
)

node_map[103776] = create_condition!(
  bot: colossus_dump,
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

node_map[103777] = create_condition!(
  bot: colossus_dump,
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

node_map[103778] = create_condition!(
  bot: colossus_dump,
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

node_map[103779] = create_condition!(
  bot: colossus_dump,
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

node_map[103780] = create_score!(
  bot: colossus_dump,
  position_x: -60.0,
  position_y: 2740.0,
  action_type: "return",
  value: 26
)

node_map[103781] = create_condition!(
  bot: colossus_dump,
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

node_map[103782] = create_condition!(
  bot: colossus_dump,
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

node_map[103783] = create_condition!(
  bot: colossus_dump,
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

node_map[103784] = create_condition!(
  bot: colossus_dump,
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

node_map[103785] = create_score!(
  bot: colossus_dump,
  position_x: 300.0,
  position_y: 3060.0,
  action_type: "return",
  value: 18
)

node_map[103786] = create_condition!(
  bot: colossus_dump,
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

node_map[103787] = create_condition!(
  bot: colossus_dump,
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

node_map[103788] = create_score!(
  bot: colossus_dump,
  position_x: 710.0,
  position_y: 2330.0,
  action_type: "return",
  value: -120
)

node_map[103789] = create_condition!(
  bot: colossus_dump,
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

node_map[103790] = create_condition!(
  bot: colossus_dump,
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

node_map[103791] = create_score!(
  bot: colossus_dump,
  position_x: 1160.0,
  position_y: 2480.0,
  action_type: "return",
  value: -120
)

node_map[103792] = create_condition!(
  bot: colossus_dump,
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

node_map[103793] = create_condition!(
  bot: colossus_dump,
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

node_map[103794] = create_condition!(
  bot: colossus_dump,
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

node_map[103795] = create_condition!(
  bot: colossus_dump,
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

node_map[103796] = create_score!(
  bot: colossus_dump,
  position_x: 1170.0,
  position_y: 2970.0,
  action_type: "subtract",
  value: 8
)

node_map[103797] = create_condition!(
  bot: colossus_dump,
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

node_map[103798] = create_score!(
  bot: colossus_dump,
  position_x: 1690.0,
  position_y: 2970.0,
  action_type: "subtract",
  value: 8
)

node_map[103799] = create_condition!(
  bot: colossus_dump,
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

node_map[103800] = create_condition!(
  bot: colossus_dump,
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

node_map[103801] = create_condition!(
  bot: colossus_dump,
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

node_map[103802] = create_condition!(
  bot: colossus_dump,
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

node_map[103803] = create_condition!(
  bot: colossus_dump,
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

node_map[103804] = create_score!(
  bot: colossus_dump,
  position_x: 1950.0,
  position_y: 2990.0,
  action_type: "subtract",
  value: 10
)

node_map[103805] = create_organizer!(
  bot: colossus_dump,
  position_x: 11040.0,
  position_y: 4040.0,
  title: "Colossus Conversion",
  notes: ""
)

node_map[103806] = create_organizer!(
  bot: colossus_dump,
  position_x: 11620.0,
  position_y: 4040.0,
  title: "Colossus Discipline",
  notes: ""
)

node_map[103807] = create_condition!(
  bot: colossus_dump,
  position_x: 10920.0,
  position_y: 4200.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103808] = create_condition!(
  bot: colossus_dump,
  position_x: 10990.0,
  position_y: 4350.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103809] = create_condition!(
  bot: colossus_dump,
  position_x: 10920.0,
  position_y: 4500.0,
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

node_map[103810] = create_condition!(
  bot: colossus_dump,
  position_x: 10990.0,
  position_y: 4650.0,
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

node_map[103811] = create_score!(
  bot: colossus_dump,
  position_x: 10920.0,
  position_y: 4800.0,
  action_type: "return",
  value: 26
)

node_map[103812] = create_condition!(
  bot: colossus_dump,
  position_x: 11310.0,
  position_y: 4650.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103813] = create_score!(
  bot: colossus_dump,
  position_x: 11240.0,
  position_y: 4800.0,
  action_type: "return",
  value: 26
)

node_map[103814] = create_condition!(
  bot: colossus_dump,
  position_x: 11580.0,
  position_y: 4500.0,
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

node_map[103815] = create_condition!(
  bot: colossus_dump,
  position_x: 11650.0,
  position_y: 4650.0,
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

node_map[103816] = create_score!(
  bot: colossus_dump,
  position_x: 11580.0,
  position_y: 4800.0,
  action_type: "return",
  value: 26
)

node_map[103817] = create_condition!(
  bot: colossus_dump,
  position_x: 11970.0,
  position_y: 4650.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103818] = create_score!(
  bot: colossus_dump,
  position_x: 11900.0,
  position_y: 4800.0,
  action_type: "return",
  value: 26
)

node_map[103819] = create_condition!(
  bot: colossus_dump,
  position_x: 12240.0,
  position_y: 4200.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103820] = create_condition!(
  bot: colossus_dump,
  position_x: 12310.0,
  position_y: 4350.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103821] = create_condition!(
  bot: colossus_dump,
  position_x: 12240.0,
  position_y: 4500.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103822] = create_condition!(
  bot: colossus_dump,
  position_x: 12310.0,
  position_y: 4650.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103823] = create_condition!(
  bot: colossus_dump,
  position_x: 12240.0,
  position_y: 4800.0,
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

node_map[103824] = create_condition!(
  bot: colossus_dump,
  position_x: 12240.0,
  position_y: 4950.0,
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

node_map[103825] = create_score!(
  bot: colossus_dump,
  position_x: 12310.0,
  position_y: 5100.0,
  action_type: "return",
  value: 40
)

node_map[103826] = create_condition!(
  bot: colossus_dump,
  position_x: 12560.0,
  position_y: 4950.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103827] = create_score!(
  bot: colossus_dump,
  position_x: 12630.0,
  position_y: 5100.0,
  action_type: "return",
  value: 40
)

node_map[103828] = create_condition!(
  bot: colossus_dump,
  position_x: 11500.0,
  position_y: 4200.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103829] = create_condition!(
  bot: colossus_dump,
  position_x: 11570.0,
  position_y: 4350.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103830] = create_condition!(
  bot: colossus_dump,
  position_x: 11500.0,
  position_y: 4500.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103831] = create_condition!(
  bot: colossus_dump,
  position_x: 11570.0,
  position_y: 4650.0,
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

node_map[103832] = create_condition!(
  bot: colossus_dump,
  position_x: 11500.0,
  position_y: 4800.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103833] = create_score!(
  bot: colossus_dump,
  position_x: 11570.0,
  position_y: 4950.0,
  action_type: "subtract",
  value: 16
)

node_map[103834] = create_condition!(
  bot: colossus_dump,
  position_x: 11760.0,
  position_y: 4800.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103835] = create_score!(
  bot: colossus_dump,
  position_x: 11830.0,
  position_y: 4950.0,
  action_type: "subtract",
  value: 14
)

node_map[103836] = create_condition!(
  bot: colossus_dump,
  position_x: 12020.0,
  position_y: 4800.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103837] = create_score!(
  bot: colossus_dump,
  position_x: 12090.0,
  position_y: 4950.0,
  action_type: "subtract",
  value: 14
)

node_map[103838] = create_condition!(
  bot: colossus_dump,
  position_x: 12280.0,
  position_y: 4200.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103839] = create_condition!(
  bot: colossus_dump,
  position_x: 12350.0,
  position_y: 4350.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103840] = create_condition!(
  bot: colossus_dump,
  position_x: 12280.0,
  position_y: 4500.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103841] = create_condition!(
  bot: colossus_dump,
  position_x: 12350.0,
  position_y: 4650.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103842] = create_score!(
  bot: colossus_dump,
  position_x: 12280.0,
  position_y: 4800.0,
  action_type: "subtract",
  value: 10
)

node_map[103843] = create_condition!(
  bot: colossus_dump,
  position_x: 12540.0,
  position_y: 4500.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103844] = create_condition!(
  bot: colossus_dump,
  position_x: 12610.0,
  position_y: 4650.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103845] = create_score!(
  bot: colossus_dump,
  position_x: 12540.0,
  position_y: 4800.0,
  action_type: "subtract",
  value: 10
)

node_map[103846] = create_condition!(
  bot: colossus_dump,
  position_x: 12800.0,
  position_y: 4200.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103847] = create_condition!(
  bot: colossus_dump,
  position_x: 12870.0,
  position_y: 4350.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103848] = create_condition!(
  bot: colossus_dump,
  position_x: 12800.0,
  position_y: 4500.0,
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

node_map[103849] = create_condition!(
  bot: colossus_dump,
  position_x: 12870.0,
  position_y: 4650.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103850] = create_condition!(
  bot: colossus_dump,
  position_x: 12800.0,
  position_y: 4800.0,
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

node_map[103851] = create_score!(
  bot: colossus_dump,
  position_x: 12870.0,
  position_y: 4950.0,
  action_type: "subtract",
  value: 12
)

connect!(node_map[103633], node_map[103634])
connect!(node_map[103633], node_map[103635])
connect!(node_map[103633], node_map[103636])
connect!(node_map[103633], node_map[103637])
connect!(node_map[103633], node_map[103638])
connect!(node_map[103633], node_map[103639])
connect!(node_map[103633], node_map[103805])
connect!(node_map[103633], node_map[103806])
connect!(node_map[103634], node_map[103640])
connect!(node_map[103634], node_map[103643])
connect!(node_map[103635], node_map[103689])
connect!(node_map[103635], node_map[103693])
connect!(node_map[103635], node_map[103696])
connect!(node_map[103635], node_map[103700])
connect!(node_map[103635], node_map[103705])
connect!(node_map[103636], node_map[103708])
connect!(node_map[103636], node_map[103722])
connect!(node_map[103636], node_map[103736])
connect!(node_map[103637], node_map[103767])
connect!(node_map[103637], node_map[103776])
connect!(node_map[103637], node_map[103781])
connect!(node_map[103637], node_map[103786])
connect!(node_map[103637], node_map[103792])
connect!(node_map[103637], node_map[103799])
connect!(node_map[103638], node_map[103743])
connect!(node_map[103639], node_map[103646])
connect!(node_map[103639], node_map[103668])
connect!(node_map[103640], node_map[103641])
connect!(node_map[103641], node_map[103642])
connect!(node_map[103643], node_map[103644])
connect!(node_map[103644], node_map[103645])
connect!(node_map[103646], node_map[103647])
connect!(node_map[103647], node_map[103648])
connect!(node_map[103648], node_map[103649])
connect!(node_map[103649], node_map[103650])
connect!(node_map[103650], node_map[103651])
connect!(node_map[103651], node_map[103652])
connect!(node_map[103652], node_map[103653])
connect!(node_map[103653], node_map[103654])
connect!(node_map[103654], node_map[103655])
connect!(node_map[103655], node_map[103656])
connect!(node_map[103656], node_map[103657])
connect!(node_map[103657], node_map[103658])
connect!(node_map[103658], node_map[103659])
connect!(node_map[103659], node_map[103660])
connect!(node_map[103659], node_map[103664])
connect!(node_map[103660], node_map[103661])
connect!(node_map[103661], node_map[103662])
connect!(node_map[103662], node_map[103663])
connect!(node_map[103664], node_map[103665])
connect!(node_map[103665], node_map[103666])
connect!(node_map[103666], node_map[103667])
connect!(node_map[103668], node_map[103669])
connect!(node_map[103669], node_map[103670])
connect!(node_map[103670], node_map[103671])
connect!(node_map[103671], node_map[103672])
connect!(node_map[103672], node_map[103673])
connect!(node_map[103673], node_map[103674])
connect!(node_map[103674], node_map[103675])
connect!(node_map[103675], node_map[103676])
connect!(node_map[103676], node_map[103677])
connect!(node_map[103677], node_map[103678])
connect!(node_map[103678], node_map[103679])
connect!(node_map[103679], node_map[103680])
connect!(node_map[103680], node_map[103681])
connect!(node_map[103681], node_map[103682])
connect!(node_map[103682], node_map[103683])
connect!(node_map[103682], node_map[103686])
connect!(node_map[103683], node_map[103684])
connect!(node_map[103684], node_map[103685])
connect!(node_map[103686], node_map[103687])
connect!(node_map[103687], node_map[103688])
connect!(node_map[103689], node_map[103690])
connect!(node_map[103689], node_map[103692])
connect!(node_map[103690], node_map[103691])
connect!(node_map[103693], node_map[103694])
connect!(node_map[103694], node_map[103695])
connect!(node_map[103696], node_map[103697])
connect!(node_map[103697], node_map[103698])
connect!(node_map[103698], node_map[103699])
connect!(node_map[103700], node_map[103701])
connect!(node_map[103701], node_map[103702])
connect!(node_map[103702], node_map[103703])
connect!(node_map[103703], node_map[103704])
connect!(node_map[103705], node_map[103706])
connect!(node_map[103706], node_map[103707])
connect!(node_map[103708], node_map[103709])
connect!(node_map[103708], node_map[103712])
connect!(node_map[103708], node_map[103716])
connect!(node_map[103708], node_map[103720])
connect!(node_map[103709], node_map[103710])
connect!(node_map[103710], node_map[103711])
connect!(node_map[103712], node_map[103713])
connect!(node_map[103713], node_map[103714])
connect!(node_map[103714], node_map[103715])
connect!(node_map[103716], node_map[103717])
connect!(node_map[103717], node_map[103718])
connect!(node_map[103718], node_map[103719])
connect!(node_map[103720], node_map[103721])
connect!(node_map[103722], node_map[103723])
connect!(node_map[103722], node_map[103726])
connect!(node_map[103722], node_map[103730])
connect!(node_map[103722], node_map[103734])
connect!(node_map[103723], node_map[103724])
connect!(node_map[103724], node_map[103725])
connect!(node_map[103726], node_map[103727])
connect!(node_map[103727], node_map[103728])
connect!(node_map[103728], node_map[103729])
connect!(node_map[103730], node_map[103731])
connect!(node_map[103731], node_map[103732])
connect!(node_map[103732], node_map[103733])
connect!(node_map[103734], node_map[103735])
connect!(node_map[103736], node_map[103737])
connect!(node_map[103737], node_map[103738])
connect!(node_map[103738], node_map[103739])
connect!(node_map[103738], node_map[103741])
connect!(node_map[103739], node_map[103740])
connect!(node_map[103741], node_map[103742])
connect!(node_map[103743], node_map[103744])
connect!(node_map[103744], node_map[103745])
connect!(node_map[103744], node_map[103748])
connect!(node_map[103744], node_map[103751])
connect!(node_map[103744], node_map[103759])
connect!(node_map[103745], node_map[103746])
connect!(node_map[103746], node_map[103747])
connect!(node_map[103748], node_map[103749])
connect!(node_map[103749], node_map[103750])
connect!(node_map[103751], node_map[103752])
connect!(node_map[103751], node_map[103755])
connect!(node_map[103752], node_map[103753])
connect!(node_map[103753], node_map[103754])
connect!(node_map[103755], node_map[103756])
connect!(node_map[103756], node_map[103757])
connect!(node_map[103757], node_map[103758])
connect!(node_map[103759], node_map[103760])
connect!(node_map[103759], node_map[103763])
connect!(node_map[103760], node_map[103761])
connect!(node_map[103761], node_map[103762])
connect!(node_map[103763], node_map[103764])
connect!(node_map[103764], node_map[103765])
connect!(node_map[103765], node_map[103766])
connect!(node_map[103767], node_map[103768])
connect!(node_map[103768], node_map[103769])
connect!(node_map[103769], node_map[103770])
connect!(node_map[103769], node_map[103772])
connect!(node_map[103769], node_map[103774])
connect!(node_map[103770], node_map[103771])
connect!(node_map[103772], node_map[103773])
connect!(node_map[103774], node_map[103775])
connect!(node_map[103776], node_map[103777])
connect!(node_map[103777], node_map[103778])
connect!(node_map[103778], node_map[103779])
connect!(node_map[103779], node_map[103780])
connect!(node_map[103781], node_map[103782])
connect!(node_map[103782], node_map[103783])
connect!(node_map[103783], node_map[103784])
connect!(node_map[103784], node_map[103785])
connect!(node_map[103786], node_map[103787])
connect!(node_map[103786], node_map[103789])
connect!(node_map[103787], node_map[103788])
connect!(node_map[103789], node_map[103790])
connect!(node_map[103790], node_map[103791])
connect!(node_map[103792], node_map[103793])
connect!(node_map[103793], node_map[103794])
connect!(node_map[103794], node_map[103795])
connect!(node_map[103794], node_map[103797])
connect!(node_map[103795], node_map[103796])
connect!(node_map[103797], node_map[103798])
connect!(node_map[103799], node_map[103800])
connect!(node_map[103800], node_map[103801])
connect!(node_map[103801], node_map[103802])
connect!(node_map[103802], node_map[103803])
connect!(node_map[103803], node_map[103804])
connect!(node_map[103805], node_map[103807])
connect!(node_map[103805], node_map[103819])
connect!(node_map[103806], node_map[103828])
connect!(node_map[103806], node_map[103838])
connect!(node_map[103806], node_map[103846])
connect!(node_map[103807], node_map[103808])
connect!(node_map[103808], node_map[103809])
connect!(node_map[103808], node_map[103814])
connect!(node_map[103809], node_map[103810])
connect!(node_map[103809], node_map[103812])
connect!(node_map[103810], node_map[103811])
connect!(node_map[103812], node_map[103813])
connect!(node_map[103814], node_map[103815])
connect!(node_map[103814], node_map[103817])
connect!(node_map[103815], node_map[103816])
connect!(node_map[103817], node_map[103818])
connect!(node_map[103819], node_map[103820])
connect!(node_map[103820], node_map[103821])
connect!(node_map[103821], node_map[103822])
connect!(node_map[103822], node_map[103823])
connect!(node_map[103823], node_map[103824])
connect!(node_map[103823], node_map[103826])
connect!(node_map[103824], node_map[103825])
connect!(node_map[103826], node_map[103827])
connect!(node_map[103828], node_map[103829])
connect!(node_map[103829], node_map[103830])
connect!(node_map[103830], node_map[103831])
connect!(node_map[103831], node_map[103832])
connect!(node_map[103831], node_map[103834])
connect!(node_map[103831], node_map[103836])
connect!(node_map[103832], node_map[103833])
connect!(node_map[103834], node_map[103835])
connect!(node_map[103836], node_map[103837])
connect!(node_map[103838], node_map[103839])
connect!(node_map[103839], node_map[103840])
connect!(node_map[103839], node_map[103843])
connect!(node_map[103840], node_map[103841])
connect!(node_map[103841], node_map[103842])
connect!(node_map[103843], node_map[103844])
connect!(node_map[103844], node_map[103845])
connect!(node_map[103846], node_map[103847])
connect!(node_map[103847], node_map[103848])
connect!(node_map[103848], node_map[103849])
connect!(node_map[103849], node_map[103850])
connect!(node_map[103850], node_map[103851])

colossus_dump.compile_program!
