module ApplicationHelper
  # Node dimensions lookup - must match the editor canvas dimensions.
  NODE_DIMENSIONS = {
    'condition' => { width: 100, height: 128 },
    'score' => { width: 108, height: 108 },
    'root' => { width: 120, height: 120 },
    'organizer' => { width: 140, height: 112 }
  }.freeze

end
