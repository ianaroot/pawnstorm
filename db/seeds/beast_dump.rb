# Standalone seed file for Beast Dump.

require_relative 'helpers'

user = seed_user!

beast_dump = user.bots.find_or_initialize_by(name: "Beast Dump")
beast_dump.description = "A behavior-preserving refactor target for Beast using shared graph trunks instead of repeated flat seed paths. Migrated from Beast v2 by bots:migrate_to_v2_grammar_clone."
beast_dump.save!

reset_bot_graph!(beast_dump)

node_map = { 103852 => beast_dump.root_node }

node_map[103853] = create_organizer!(
  bot: beast_dump,
  position_x: 120.0,
  position_y: 120.0,
  title: "Terminal",
  notes: ""
)

node_map[103854] = create_organizer!(
  bot: beast_dump,
  position_x: 860.0,
  position_y: 120.0,
  title: "Opening",
  notes: ""
)

node_map[103855] = create_organizer!(
  bot: beast_dump,
  position_x: 1900.0,
  position_y: 120.0,
  title: "Squeeze",
  notes: ""
)

node_map[103856] = create_organizer!(
  bot: beast_dump,
  position_x: 3520.0,
  position_y: 120.0,
  title: "Endgame",
  notes: ""
)

node_map[103857] = create_organizer!(
  bot: beast_dump,
  position_x: 5020.0,
  position_y: 120.0,
  title: "Fallback",
  notes: ""
)

node_map[103858] = create_condition!(
  bot: beast_dump,
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

node_map[103859] = create_condition!(
  bot: beast_dump,
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

node_map[103860] = create_action!(
  bot: beast_dump,
  position_x: 80.0,
  position_y: 580.0,
  action_type: "return",
  value: 100
)

node_map[103861] = create_condition!(
  bot: beast_dump,
  position_x: 340.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103862] = create_condition!(
  bot: beast_dump,
  position_x: 400.0,
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

node_map[103863] = create_action!(
  bot: beast_dump,
  position_x: 340.0,
  position_y: 580.0,
  action_type: "return",
  value: -100
)

node_map[103864] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103865] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103866] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103867] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103868] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103869] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103870] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103871] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103872] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103873] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103874] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103875] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103876] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103877] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103878] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
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

node_map[103879] = create_condition!(
  bot: beast_dump,
  position_x: 830.0,
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

node_map[103880] = create_condition!(
  bot: beast_dump,
  position_x: 760.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103881] = create_action!(
  bot: beast_dump,
  position_x: 830.0,
  position_y: 2830.0,
  action_type: "return",
  value: 12
)

node_map[103882] = create_condition!(
  bot: beast_dump,
  position_x: 1060.0,
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

node_map[103883] = create_condition!(
  bot: beast_dump,
  position_x: 1130.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103884] = create_condition!(
  bot: beast_dump,
  position_x: 1060.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103885] = create_action!(
  bot: beast_dump,
  position_x: 1130.0,
  position_y: 2830.0,
  action_type: "add",
  value: 10
)

node_map[103886] = create_condition!(
  bot: beast_dump,
  position_x: 1360.0,
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

node_map[103887] = create_condition!(
  bot: beast_dump,
  position_x: 1430.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103888] = create_condition!(
  bot: beast_dump,
  position_x: 1360.0,
  position_y: 2680.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103889] = create_action!(
  bot: beast_dump,
  position_x: 1430.0,
  position_y: 2830.0,
  action_type: "add",
  value: 10
)

node_map[103890] = create_condition!(
  bot: beast_dump,
  position_x: 1600.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103891] = create_condition!(
  bot: beast_dump,
  position_x: 1670.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103892] = create_condition!(
  bot: beast_dump,
  position_x: 1400.0,
  position_y: 580.0,
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

node_map[103893] = create_condition!(
  bot: beast_dump,
  position_x: 1470.0,
  position_y: 730.0,
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

node_map[103894] = create_action!(
  bot: beast_dump,
  position_x: 1400.0,
  position_y: 880.0,
  action_type: "return",
  value: 24
)

node_map[103895] = create_condition!(
  bot: beast_dump,
  position_x: 1750.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103896] = create_action!(
  bot: beast_dump,
  position_x: 1680.0,
  position_y: 880.0,
  action_type: "return",
  value: 24
)

node_map[103897] = create_condition!(
  bot: beast_dump,
  position_x: 2200.0,
  position_y: 580.0,
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

node_map[103898] = create_condition!(
  bot: beast_dump,
  position_x: 2270.0,
  position_y: 730.0,
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

node_map[103899] = create_action!(
  bot: beast_dump,
  position_x: 2200.0,
  position_y: 880.0,
  action_type: "add",
  value: 12
)

node_map[103900] = create_condition!(
  bot: beast_dump,
  position_x: 2550.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103901] = create_action!(
  bot: beast_dump,
  position_x: 2480.0,
  position_y: 880.0,
  action_type: "add",
  value: 12
)

node_map[103902] = create_condition!(
  bot: beast_dump,
  position_x: 3000.0,
  position_y: 580.0,
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

node_map[103903] = create_condition!(
  bot: beast_dump,
  position_x: 3070.0,
  position_y: 730.0,
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

node_map[103904] = create_action!(
  bot: beast_dump,
  position_x: 3000.0,
  position_y: 880.0,
  action_type: "add",
  value: 12
)

node_map[103905] = create_condition!(
  bot: beast_dump,
  position_x: 3350.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103906] = create_action!(
  bot: beast_dump,
  position_x: 3280.0,
  position_y: 880.0,
  action_type: "add",
  value: 12
)

node_map[103907] = create_condition!(
  bot: beast_dump,
  position_x: 3960.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[103908] = create_condition!(
  bot: beast_dump,
  position_x: 4030.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103909] = create_action!(
  bot: beast_dump,
  position_x: 3960.0,
  position_y: 580.0,
  action_type: "return",
  value: 106
)

node_map[103910] = create_condition!(
  bot: beast_dump,
  position_x: 4260.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103911] = create_condition!(
  bot: beast_dump,
  position_x: 4330.0,
  position_y: 430.0,
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

node_map[103912] = create_condition!(
  bot: beast_dump,
  position_x: 4260.0,
  position_y: 580.0,
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

node_map[103913] = create_action!(
  bot: beast_dump,
  position_x: 4330.0,
  position_y: 730.0,
  action_type: "add",
  value: 14
)

node_map[103914] = create_condition!(
  bot: beast_dump,
  position_x: 3420.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"allied",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103915] = create_condition!(
  bot: beast_dump,
  position_x: 3490.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"less_than",
   "comparisonValue"=>3}
)

node_map[103916] = create_condition!(
  bot: beast_dump,
  position_x: 3240.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[103917] = create_condition!(
  bot: beast_dump,
  position_x: 3310.0,
  position_y: 730.0,
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

node_map[103918] = create_action!(
  bot: beast_dump,
  position_x: 3240.0,
  position_y: 880.0,
  action_type: "return",
  value: 88
)

node_map[103919] = create_condition!(
  bot: beast_dump,
  position_x: 3540.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103920] = create_condition!(
  bot: beast_dump,
  position_x: 3610.0,
  position_y: 730.0,
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

node_map[103921] = create_action!(
  bot: beast_dump,
  position_x: 3540.0,
  position_y: 880.0,
  action_type: "return",
  value: 24
)

node_map[103922] = create_condition!(
  bot: beast_dump,
  position_x: 3860.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103923] = create_condition!(
  bot: beast_dump,
  position_x: 3930.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103924] = create_condition!(
  bot: beast_dump,
  position_x: 3860.0,
  position_y: 880.0,
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

node_map[103925] = create_condition!(
  bot: beast_dump,
  position_x: 3760.0,
  position_y: 1030.0,
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

node_map[103926] = create_action!(
  bot: beast_dump,
  position_x: 3830.0,
  position_y: 1180.0,
  action_type: "return",
  value: 30
)

node_map[103927] = create_condition!(
  bot: beast_dump,
  position_x: 4040.0,
  position_y: 1030.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103928] = create_action!(
  bot: beast_dump,
  position_x: 4110.0,
  position_y: 1180.0,
  action_type: "return",
  value: 30
)

node_map[103929] = create_condition!(
  bot: beast_dump,
  position_x: 4920.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"exclude",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103930] = create_condition!(
  bot: beast_dump,
  position_x: 4990.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103931] = create_condition!(
  bot: beast_dump,
  position_x: 4920.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103932] = create_condition!(
  bot: beast_dump,
  position_x: 4990.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103933] = create_action!(
  bot: beast_dump,
  position_x: 4920.0,
  position_y: 880.0,
  action_type: "add",
  value: 7
)

node_map[103934] = create_condition!(
  bot: beast_dump,
  position_x: 5220.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103935] = create_condition!(
  bot: beast_dump,
  position_x: 5290.0,
  position_y: 430.0,
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

node_map[103936] = create_condition!(
  bot: beast_dump,
  position_x: 5220.0,
  position_y: 580.0,
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

node_map[103937] = create_condition!(
  bot: beast_dump,
  position_x: 5290.0,
  position_y: 730.0,
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

node_map[103938] = create_action!(
  bot: beast_dump,
  position_x: 5220.0,
  position_y: 880.0,
  action_type: "return",
  value: 24
)

node_map[103939] = create_condition!(
  bot: beast_dump,
  position_x: 5520.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"pawn",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103940] = create_condition!(
  bot: beast_dump,
  position_x: 5590.0,
  position_y: 430.0,
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

node_map[103941] = create_condition!(
  bot: beast_dump,
  position_x: 5520.0,
  position_y: 580.0,
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

node_map[103942] = create_condition!(
  bot: beast_dump,
  position_x: 5590.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[103943] = create_action!(
  bot: beast_dump,
  position_x: 5520.0,
  position_y: 880.0,
  action_type: "return",
  value: 18
)

node_map[103944] = create_condition!(
  bot: beast_dump,
  position_x: 5820.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103945] = create_condition!(
  bot: beast_dump,
  position_x: 5890.0,
  position_y: 430.0,
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

node_map[103946] = create_action!(
  bot: beast_dump,
  position_x: 5820.0,
  position_y: 580.0,
  action_type: "return",
  value: -120
)

node_map[103947] = create_condition!(
  bot: beast_dump,
  position_x: 6120.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"knight",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103948] = create_condition!(
  bot: beast_dump,
  position_x: 6190.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103949] = create_condition!(
  bot: beast_dump,
  position_x: 6120.0,
  position_y: 580.0,
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

node_map[103950] = create_condition!(
  bot: beast_dump,
  position_x: 6190.0,
  position_y: 730.0,
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

node_map[103951] = create_action!(
  bot: beast_dump,
  position_x: 6120.0,
  position_y: 880.0,
  action_type: "subtract",
  value: 8
)

node_map[103952] = create_condition!(
  bot: beast_dump,
  position_x: 6420.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"bishop",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103953] = create_condition!(
  bot: beast_dump,
  position_x: 6340.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"less_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103954] = create_condition!(
  bot: beast_dump,
  position_x: 6410.0,
  position_y: 580.0,
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

node_map[103955] = create_condition!(
  bot: beast_dump,
  position_x: 6340.0,
  position_y: 730.0,
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

node_map[103956] = create_action!(
  bot: beast_dump,
  position_x: 6410.0,
  position_y: 880.0,
  action_type: "subtract",
  value: 8
)

node_map[103957] = create_condition!(
  bot: beast_dump,
  position_x: 6640.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103958] = create_condition!(
  bot: beast_dump,
  position_x: 6710.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103959] = create_condition!(
  bot: beast_dump,
  position_x: 6640.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103960] = create_condition!(
  bot: beast_dump,
  position_x: 6710.0,
  position_y: 880.0,
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

node_map[103961] = create_action!(
  bot: beast_dump,
  position_x: 6640.0,
  position_y: 1030.0,
  action_type: "subtract",
  value: 10
)

node_map[103962] = create_condition!(
  bot: beast_dump,
  position_x: 6940.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"rook",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"greater_than",
   "comparisonValue"=>0}
)

node_map[103963] = create_condition!(
  bot: beast_dump,
  position_x: 7010.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[103964] = create_condition!(
  bot: beast_dump,
  position_x: 6940.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103965] = create_condition!(
  bot: beast_dump,
  position_x: 7010.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"king",
   "subjectFilterMode"=>"include",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>"prior_board_state"}
)

node_map[103966] = create_condition!(
  bot: beast_dump,
  position_x: 6940.0,
  position_y: 880.0,
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

node_map[103967] = create_action!(
  bot: beast_dump,
  position_x: 7010.0,
  position_y: 1030.0,
  action_type: "subtract",
  value: 10
)

connect!(node_map[103852], node_map[103853])
connect!(node_map[103852], node_map[103854])
connect!(node_map[103852], node_map[103855])
connect!(node_map[103852], node_map[103856])
connect!(node_map[103852], node_map[103857])
connect!(node_map[103853], node_map[103858])
connect!(node_map[103853], node_map[103861])
connect!(node_map[103854], node_map[103864])
connect!(node_map[103855], node_map[103890])
connect!(node_map[103855], node_map[103907])
connect!(node_map[103855], node_map[103910])
connect!(node_map[103856], node_map[103914])
connect!(node_map[103857], node_map[103929])
connect!(node_map[103857], node_map[103934])
connect!(node_map[103857], node_map[103939])
connect!(node_map[103857], node_map[103944])
connect!(node_map[103857], node_map[103947])
connect!(node_map[103857], node_map[103952])
connect!(node_map[103857], node_map[103962])
connect!(node_map[103858], node_map[103859])
connect!(node_map[103859], node_map[103860])
connect!(node_map[103861], node_map[103862])
connect!(node_map[103862], node_map[103863])
connect!(node_map[103864], node_map[103865])
connect!(node_map[103865], node_map[103866])
connect!(node_map[103866], node_map[103867])
connect!(node_map[103867], node_map[103868])
connect!(node_map[103868], node_map[103869])
connect!(node_map[103869], node_map[103870])
connect!(node_map[103870], node_map[103871])
connect!(node_map[103871], node_map[103872])
connect!(node_map[103872], node_map[103873])
connect!(node_map[103873], node_map[103874])
connect!(node_map[103874], node_map[103875])
connect!(node_map[103875], node_map[103876])
connect!(node_map[103876], node_map[103877])
connect!(node_map[103877], node_map[103878])
connect!(node_map[103877], node_map[103882])
connect!(node_map[103877], node_map[103886])
connect!(node_map[103878], node_map[103879])
connect!(node_map[103879], node_map[103880])
connect!(node_map[103880], node_map[103881])
connect!(node_map[103882], node_map[103883])
connect!(node_map[103883], node_map[103884])
connect!(node_map[103884], node_map[103885])
connect!(node_map[103886], node_map[103887])
connect!(node_map[103887], node_map[103888])
connect!(node_map[103888], node_map[103889])
connect!(node_map[103890], node_map[103891])
connect!(node_map[103891], node_map[103892])
connect!(node_map[103891], node_map[103897])
connect!(node_map[103891], node_map[103902])
connect!(node_map[103892], node_map[103893])
connect!(node_map[103892], node_map[103895])
connect!(node_map[103893], node_map[103894])
connect!(node_map[103895], node_map[103896])
connect!(node_map[103897], node_map[103898])
connect!(node_map[103897], node_map[103900])
connect!(node_map[103898], node_map[103899])
connect!(node_map[103900], node_map[103901])
connect!(node_map[103902], node_map[103903])
connect!(node_map[103902], node_map[103905])
connect!(node_map[103903], node_map[103904])
connect!(node_map[103905], node_map[103906])
connect!(node_map[103907], node_map[103908])
connect!(node_map[103908], node_map[103909])
connect!(node_map[103910], node_map[103911])
connect!(node_map[103911], node_map[103912])
connect!(node_map[103912], node_map[103913])
connect!(node_map[103914], node_map[103915])
connect!(node_map[103915], node_map[103916])
connect!(node_map[103915], node_map[103919])
connect!(node_map[103915], node_map[103922])
connect!(node_map[103916], node_map[103917])
connect!(node_map[103917], node_map[103918])
connect!(node_map[103919], node_map[103920])
connect!(node_map[103920], node_map[103921])
connect!(node_map[103922], node_map[103923])
connect!(node_map[103923], node_map[103924])
connect!(node_map[103924], node_map[103925])
connect!(node_map[103924], node_map[103927])
connect!(node_map[103925], node_map[103926])
connect!(node_map[103927], node_map[103928])
connect!(node_map[103929], node_map[103930])
connect!(node_map[103930], node_map[103931])
connect!(node_map[103931], node_map[103932])
connect!(node_map[103932], node_map[103933])
connect!(node_map[103934], node_map[103935])
connect!(node_map[103935], node_map[103936])
connect!(node_map[103936], node_map[103937])
connect!(node_map[103937], node_map[103938])
connect!(node_map[103939], node_map[103940])
connect!(node_map[103940], node_map[103941])
connect!(node_map[103941], node_map[103942])
connect!(node_map[103942], node_map[103943])
connect!(node_map[103944], node_map[103945])
connect!(node_map[103945], node_map[103946])
connect!(node_map[103947], node_map[103948])
connect!(node_map[103948], node_map[103949])
connect!(node_map[103949], node_map[103950])
connect!(node_map[103950], node_map[103951])
connect!(node_map[103952], node_map[103953])
connect!(node_map[103952], node_map[103957])
connect!(node_map[103953], node_map[103954])
connect!(node_map[103954], node_map[103955])
connect!(node_map[103955], node_map[103956])
connect!(node_map[103957], node_map[103958])
connect!(node_map[103958], node_map[103959])
connect!(node_map[103959], node_map[103960])
connect!(node_map[103960], node_map[103961])
connect!(node_map[103962], node_map[103963])
connect!(node_map[103963], node_map[103964])
connect!(node_map[103964], node_map[103965])
connect!(node_map[103965], node_map[103966])
connect!(node_map[103966], node_map[103967])

beast_dump.compile_program!
