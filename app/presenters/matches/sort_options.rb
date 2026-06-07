class Matches::SortOptions
  Option = Struct.new(:label, :value, :active, :direction, keyword_init: true)

  FIELDS = [
    ['name', 'Name', 'asc'],
    ['elo', 'ELO', 'desc'],
    ['recently_updated', 'Recently updated', 'desc']
  ].freeze

  def initialize(current_sort)
    @field, _, @direction = (current_sort.presence || Bot::DEFAULT_SORT).rpartition('_')
  end

  def options
    FIELDS.map do |key, label, natural_direction|
      active = key == @field
      Option.new(
        label: label,
        value: "#{key}_#{active ? toggled_direction : natural_direction}",
        active: active,
        direction: active ? @direction : nil
      )
    end
  end

  private

  attr_reader :direction

  def toggled_direction
    direction == 'desc' ? 'asc' : 'desc'
  end
end
