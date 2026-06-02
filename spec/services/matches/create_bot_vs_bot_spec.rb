# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Matches::CreateBotVsBot do
  let(:user) { create(:user) }
  let(:other) { create(:user) }

  def rated_bot(rating, owner)
    bot = create(:bot, :compiled, user: owner)
    bot.update_columns(rating: rating)
    bot
  end

  def creation(params = {})
    described_class.new(user: user, params: params)
  end

  describe 'opponent ordering' do
    it 'orders opponents by rating, lowest first' do
      high = rated_bot(1300, other)
      low = rated_bot(700, other)
      mid = rated_bot(1000, other)

      expect(creation.all_opponent_bots.to_a).to eq([low, mid, high])
    end
  end

  describe '#opponent_offset' do
    it 'counts how many opponents rate below the selected own bot' do
      own = rated_bot(1000, user)
      rated_bot(700, other)
      rated_bot(800, other)
      rated_bot(1200, other)

      expect(creation(own_bot_id: own.id).opponent_offset).to eq(2)
    end

    it 'is nil when no own bot is selected' do
      rated_bot(700, other)

      expect(creation.opponent_offset).to be_nil
    end
  end

  describe '#opponent_page' do
    it 'returns the page, at the given size, that holds the own bot by rating' do
      own = rated_bot(2000, user)
      15.times { |i| rated_bot(1000 + (i * 10), other) }

      expect(creation(own_bot_id: own.id).opponent_page(per_page: 12)).to eq(2)
    end

    it 'is nil when no own bot is selected' do
      rated_bot(1000, other)

      expect(creation.opponent_page(per_page: 12)).to be_nil
    end
  end
end
