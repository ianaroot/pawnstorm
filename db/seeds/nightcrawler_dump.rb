# Standalone seed file for Nightcrawler Dump.

require_relative 'helpers'

user = seed_user!

nightcrawler_dump = user.bots.find_or_initialize_by(name: "Nightcrawler Dump")
nightcrawler_dump.description = "A behavior-preserving refactor target for Nightcrawler using shared graph trunks instead of repeated flat seed paths. Migrated from Nightcrawler v2 by bots:migrate_to_v2_grammar_clone."
nightcrawler_dump.save!

reset_bot_graph!(nightcrawler_dump)

node_map = { 102209 => nightcrawler_dump.root_node }

node_map[102210] = create_organizer!(
  bot: nightcrawler_dump,
  position_x: 120.0,
  position_y: 120.0,
  title: "Terminal",
  notes: ""
)

node_map[102211] = create_organizer!(
  bot: nightcrawler_dump,
  position_x: 860.0,
  position_y: 120.0,
  title: "Opening",
  notes: ""
)

node_map[102212] = create_organizer!(
  bot: nightcrawler_dump,
  position_x: 1780.0,
  position_y: 120.0,
  title: "Punish",
  notes: ""
)

node_map[102213] = create_organizer!(
  bot: nightcrawler_dump,
  position_x: 3240.0,
  position_y: 120.0,
  title: "Pressure",
  notes: ""
)

node_map[102214] = create_organizer!(
  bot: nightcrawler_dump,
  position_x: 4720.0,
  position_y: 120.0,
  title: "Fallback",
  notes: ""
)

node_map[102215] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102216] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102217] = create_score!(
  bot: nightcrawler_dump,
  position_x: 80.0,
  position_y: 580.0,
  action_type: "return",
  value: 100
)

node_map[102218] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102219] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102220] = create_score!(
  bot: nightcrawler_dump,
  position_x: 340.0,
  position_y: 580.0,
  action_type: "return",
  value: -100
)

node_map[102221] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102222] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102223] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102224] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102225] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102226] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102227] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102228] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102229] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102230] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102231] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102232] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102233] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102234] = create_condition!(
  bot: nightcrawler_dump,
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

node_map[102235] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 760.0,
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

node_map[102236] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 830.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102237] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 760.0,
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

node_map[102238] = create_score!(
  bot: nightcrawler_dump,
  position_x: 830.0,
  position_y: 2830.0,
  action_type: "return",
  value: 14
)

node_map[102239] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1020.0,
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

node_map[102240] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1090.0,
  position_y: 2530.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102241] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1020.0,
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

node_map[102242] = create_score!(
  bot: nightcrawler_dump,
  position_x: 1090.0,
  position_y: 2830.0,
  action_type: "return",
  value: 13
)

node_map[102243] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1280.0,
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

node_map[102244] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1350.0,
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

node_map[102245] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1280.0,
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

node_map[102246] = create_score!(
  bot: nightcrawler_dump,
  position_x: 1350.0,
  position_y: 2830.0,
  action_type: "add",
  value: 8
)

node_map[102247] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1680.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"value",
   "comparator"=>"greater_than",
   "comparisonValue"=>"moved_piece_value"}
)

node_map[102248] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 1740.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102249] = create_score!(
  bot: nightcrawler_dump,
  position_x: 1680.0,
  position_y: 580.0,
  action_type: "return",
  value: 112
)

node_map[102250] = create_score!(
  bot: nightcrawler_dump,
  position_x: 2000.0,
  position_y: 430.0,
  action_type: "return",
  value: 102
)

node_map[102251] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2200.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102252] = create_score!(
  bot: nightcrawler_dump,
  position_x: 2260.0,
  position_y: 430.0,
  action_type: "return",
  value: 96
)

node_map[102253] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2460.0,
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

node_map[102254] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2520.0,
  position_y: 430.0,
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

node_map[102255] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2460.0,
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

node_map[102256] = create_score!(
  bot: nightcrawler_dump,
  position_x: 2520.0,
  position_y: 730.0,
  action_type: "return",
  value: 60
)

node_map[102257] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2720.0,
  position_y: 280.0,
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

node_map[102258] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2780.0,
  position_y: 430.0,
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

node_map[102259] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2720.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"captured_piece",
   "subjectFilter"=>"any",
   "operator"=>"count",
   "comparator"=>"equal_to",
   "comparisonValue"=>0}
)

node_map[102260] = create_score!(
  bot: nightcrawler_dump,
  position_x: 2780.0,
  position_y: 730.0,
  action_type: "add",
  value: 12
)

node_map[102261] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2980.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"enemy",
   "targetFilter"=>"any",
   "subjectComparisonMetric"=>"count",
   "subjectComparator"=>"less_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102262] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3040.0,
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

node_map[102263] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 2980.0,
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

node_map[102264] = create_score!(
  bot: nightcrawler_dump,
  position_x: 3040.0,
  position_y: 730.0,
  action_type: "add",
  value: 10
)

node_map[102265] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3240.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"queen",
   "subjectFilterMode"=>"include",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102266] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3300.0,
  position_y: 430.0,
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

node_map[102267] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3240.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102268] = create_score!(
  bot: nightcrawler_dump,
  position_x: 3300.0,
  position_y: 730.0,
  action_type: "return",
  value: 50
)

node_map[102269] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3140.0,
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

node_map[102270] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3210.0,
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
   "subjectComparator"=>"greater_than",
   "subjectComparisonValue"=>"prior_board_state"}
)

node_map[102271] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3140.0,
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

node_map[102272] = create_score!(
  bot: nightcrawler_dump,
  position_x: 3210.0,
  position_y: 730.0,
  action_type: "return",
  value: 30
)

node_map[102273] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 3460.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102274] = create_score!(
  bot: nightcrawler_dump,
  position_x: 3530.0,
  position_y: 730.0,
  action_type: "return",
  value: 30
)

node_map[102275] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4120.0,
  position_y: 280.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"equal_to",
   "comparisonValue"=>1}
)

node_map[102276] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4190.0,
  position_y: 430.0,
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

node_map[102277] = create_score!(
  bot: nightcrawler_dump,
  position_x: 4120.0,
  position_y: 580.0,
  action_type: "add",
  value: 14
)

node_map[102278] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4510.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102279] = create_score!(
  bot: nightcrawler_dump,
  position_x: 4440.0,
  position_y: 580.0,
  action_type: "add",
  value: 14
)

node_map[102280] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4620.0,
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

node_map[102281] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4690.0,
  position_y: 430.0,
  data: {"version"=>2,
   "kind"=>"unary",
   "subject"=>"moved_piece",
   "subjectFilter"=>"any",
   "operator"=>"mobility",
   "comparator"=>"greater_than",
   "comparisonValue"=>"prior_board_state"}
)

node_map[102282] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4620.0,
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

node_map[102283] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4690.0,
  position_y: 730.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"allied",
   "subjectFilter"=>"any",
   "operator"=>"defend",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102284] = create_score!(
  bot: nightcrawler_dump,
  position_x: 4620.0,
  position_y: 880.0,
  action_type: "add",
  value: 7
)

node_map[102285] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4880.0,
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

node_map[102286] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 4950.0,
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

node_map[102287] = create_score!(
  bot: nightcrawler_dump,
  position_x: 4880.0,
  position_y: 580.0,
  action_type: "return",
  value: -120
)

node_map[102288] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 5210.0,
  position_y: 430.0,
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

node_map[102289] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 5140.0,
  position_y: 580.0,
  data: {"version"=>2,
   "kind"=>"relational",
   "subject"=>"enemy",
   "subjectFilter"=>"any",
   "operator"=>"attack",
   "target"=>"moved_piece",
   "targetFilter"=>"any"}
)

node_map[102290] = create_score!(
  bot: nightcrawler_dump,
  position_x: 5210.0,
  position_y: 730.0,
  action_type: "return",
  value: -120
)

node_map[102291] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 5400.0,
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

node_map[102292] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 5470.0,
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

node_map[102293] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 5400.0,
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

node_map[102294] = create_condition!(
  bot: nightcrawler_dump,
  position_x: 5470.0,
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

node_map[102295] = create_score!(
  bot: nightcrawler_dump,
  position_x: 5400.0,
  position_y: 880.0,
  action_type: "return",
  value: 24
)

connect!(node_map[102209], node_map[102210])
connect!(node_map[102209], node_map[102211])
connect!(node_map[102209], node_map[102212])
connect!(node_map[102209], node_map[102213])
connect!(node_map[102209], node_map[102214])
connect!(node_map[102210], node_map[102215])
connect!(node_map[102210], node_map[102218])
connect!(node_map[102211], node_map[102221])
connect!(node_map[102212], node_map[102247])
connect!(node_map[102212], node_map[102251])
connect!(node_map[102212], node_map[102253])
connect!(node_map[102212], node_map[102257])
connect!(node_map[102212], node_map[102261])
connect!(node_map[102212], node_map[102265])
connect!(node_map[102213], node_map[102269])
connect!(node_map[102213], node_map[102275])
connect!(node_map[102214], node_map[102280])
connect!(node_map[102214], node_map[102285])
connect!(node_map[102214], node_map[102291])
connect!(node_map[102215], node_map[102216])
connect!(node_map[102216], node_map[102217])
connect!(node_map[102218], node_map[102219])
connect!(node_map[102219], node_map[102220])
connect!(node_map[102221], node_map[102222])
connect!(node_map[102222], node_map[102223])
connect!(node_map[102223], node_map[102224])
connect!(node_map[102224], node_map[102225])
connect!(node_map[102225], node_map[102226])
connect!(node_map[102226], node_map[102227])
connect!(node_map[102227], node_map[102228])
connect!(node_map[102228], node_map[102229])
connect!(node_map[102229], node_map[102230])
connect!(node_map[102230], node_map[102231])
connect!(node_map[102231], node_map[102232])
connect!(node_map[102232], node_map[102233])
connect!(node_map[102233], node_map[102234])
connect!(node_map[102234], node_map[102235])
connect!(node_map[102234], node_map[102239])
connect!(node_map[102234], node_map[102243])
connect!(node_map[102235], node_map[102236])
connect!(node_map[102236], node_map[102237])
connect!(node_map[102237], node_map[102238])
connect!(node_map[102239], node_map[102240])
connect!(node_map[102240], node_map[102241])
connect!(node_map[102241], node_map[102242])
connect!(node_map[102243], node_map[102244])
connect!(node_map[102244], node_map[102245])
connect!(node_map[102245], node_map[102246])
connect!(node_map[102247], node_map[102248])
connect!(node_map[102247], node_map[102250])
connect!(node_map[102248], node_map[102249])
connect!(node_map[102251], node_map[102252])
connect!(node_map[102253], node_map[102254])
connect!(node_map[102254], node_map[102255])
connect!(node_map[102255], node_map[102256])
connect!(node_map[102257], node_map[102258])
connect!(node_map[102258], node_map[102259])
connect!(node_map[102259], node_map[102260])
connect!(node_map[102261], node_map[102262])
connect!(node_map[102262], node_map[102263])
connect!(node_map[102263], node_map[102264])
connect!(node_map[102265], node_map[102266])
connect!(node_map[102266], node_map[102267])
connect!(node_map[102267], node_map[102268])
connect!(node_map[102269], node_map[102270])
connect!(node_map[102270], node_map[102271])
connect!(node_map[102270], node_map[102273])
connect!(node_map[102271], node_map[102272])
connect!(node_map[102273], node_map[102274])
connect!(node_map[102275], node_map[102276])
connect!(node_map[102275], node_map[102278])
connect!(node_map[102276], node_map[102277])
connect!(node_map[102278], node_map[102279])
connect!(node_map[102280], node_map[102281])
connect!(node_map[102281], node_map[102282])
connect!(node_map[102282], node_map[102283])
connect!(node_map[102283], node_map[102284])
connect!(node_map[102285], node_map[102286])
connect!(node_map[102285], node_map[102288])
connect!(node_map[102286], node_map[102287])
connect!(node_map[102288], node_map[102289])
connect!(node_map[102289], node_map[102290])
connect!(node_map[102291], node_map[102292])
connect!(node_map[102292], node_map[102293])
connect!(node_map[102293], node_map[102294])
connect!(node_map[102294], node_map[102295])

nightcrawler_dump.compile_program!
