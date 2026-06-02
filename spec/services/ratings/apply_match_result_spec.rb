# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Ratings::ApplyMatchResult do
  def compiled_bot
    create(:bot, :compiled)
  end

  def completed_match(white:, black:, result: :white_win, **overrides)
    create(
      :match,
      white_player: white,
      black_player: black,
      white_compiled_program_snapshot: white.compiled_program,
      black_compiled_program_snapshot: black.compiled_program,
      status: :completed,
      result: result,
      lay_out: ['ee'],
      movement_notation: ['1. e4'],
      **overrides
    )
  end

  describe '#call' do
    context 'an eligible bot-vs-bot match' do
      let(:white) { compiled_bot }
      let(:black) { compiled_bot }
      let(:match) { completed_match(white: white, black: black, result: :white_win) }

      it 'raises the winner and lowers the loser' do
        described_class.new(match).call
        expect(white.reload.rating).to be > 1000.0
        expect(black.reload.rating).to be < 1000.0
      end

      it 'records before and after ratings on the match' do
        described_class.new(match).call
        match.reload
        expect(match.white_rating_before).to eq(1000.0)
        expect(match.black_rating_before).to eq(1000.0)
        expect(match.white_rating_after).to eq(white.reload.rating)
        expect(match.black_rating_after).to eq(black.reload.rating)
      end

      it 'is idempotent' do
        described_class.new(match).call
        settled = white.reload.rating
        described_class.new(match).call
        expect(white.reload.rating).to eq(settled)
      end
    end

    context 'ineligible matches leave ratings untouched' do
      it 'skips a human-vs-bot match' do
        bot = compiled_bot
        human = create(:user)
        match = completed_match(white: bot, black: bot, result: :white_win,
                                black_player: human, black_compiled_program_snapshot: nil)
        expect { described_class.new(match).call }.not_to(change { bot.reload.rating })
        expect(match.reload.white_rating_after).to be_nil
      end

      it 'skips a no-contest result (capped)' do
        white = compiled_bot
        black = compiled_bot
        match = completed_match(white: white, black: black, result: :capped)
        described_class.new(match).call
        expect(white.reload.rating).to eq(1000.0)
        expect(black.reload.rating).to eq(1000.0)
      end

      it 'skips a bot playing itself' do
        bot = compiled_bot
        match = completed_match(white: bot, black: bot, result: :white_win)
        expect { described_class.new(match).call }.not_to(change { bot.reload.rating })
      end

      it 'skips when a bot was recompiled since the match was played' do
        white = compiled_bot
        black = compiled_bot
        match = completed_match(white: white, black: black, result: :white_win)
        white.update_columns(compiled_program: { 'root' => 'root', 'nodes' => { 'added' => 1 } })

        described_class.new(match).call
        expect(white.reload.rating).to eq(1000.0)
        expect(black.reload.rating).to eq(1000.0)
        expect(match.reload.white_rating_after).to be_nil
      end
    end
  end
end
