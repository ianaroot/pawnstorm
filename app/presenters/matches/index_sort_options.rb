class Matches::IndexSortOptions
  def initialize(current_sort)
    @ascending = current_sort.to_s == 'oldest'
  end

  def options
    [Matches::SortOptions::Option.new(
      label: 'Created',
      value: @ascending ? '' : 'oldest',
      active: true,
      direction: @ascending ? 'asc' : 'desc'
    )]
  end
end
