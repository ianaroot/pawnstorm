require 'rails_helper'

RSpec.describe Matches::SortOptions do
  it 'defaults to recently-updated descending when blank' do
    active = described_class.new(nil).options.find(&:active)

    expect(active.label).to eq('Recently updated')
    expect(active.direction).to eq('desc')
    expect(active.value).to eq('recently_updated_asc')
  end

  it 'marks the current field active with its direction and toggled value' do
    elo = described_class.new('elo_desc').options.find { |o| o.label == 'ELO' }

    expect(elo.active).to be(true)
    expect(elo.direction).to eq('desc')
    expect(elo.value).to eq('elo_asc')
  end

  it 'leaves inactive fields unfilled and at their natural direction' do
    name = described_class.new('elo_desc').options.find { |o| o.label == 'Name' }

    expect(name.active).to be(false)
    expect(name.direction).to be_nil
    expect(name.value).to eq('name_asc')
  end

  it 'flips to descending when the active field is ascending' do
    elo = described_class.new('elo_asc').options.find(&:active)

    expect(elo.direction).to eq('asc')
    expect(elo.value).to eq('elo_desc')
  end

  it 'falls back to a provided default when blank' do
    active = described_class.new(nil, default: 'elo_desc').options.find(&:active)

    expect(active.label).to eq('ELO')
    expect(active.direction).to eq('desc')
  end
end
