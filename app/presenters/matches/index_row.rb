class Matches::IndexRow
  def initialize(match:, user:)
    @match = match
    @user = user
  end

  def playing_white?
    mine?(@match.white_player)
  end

  def playing_black?
    mine?(@match.black_player)
  end

  def self_match?
    playing_white? && playing_black?
  end

  def outcome
    return :pending unless @match.completed? && @match.result.present?
    return :drew if draw?
    return :neutral if self_match?

    won? ? :won : :lost
  end

  def outcome_label
    case outcome
    when :won then 'Won'
    when :lost then 'Lost'
    when :drew then 'Draw'
    when :neutral then "#{winning_side} won"
    else @match.status.humanize
    end
  end

  def outcome_tint
    { won: 'success', lost: 'danger', drew: 'muted', neutral: 'muted', pending: 'warning' }.fetch(outcome)
  end

  private

  def mine?(player)
    player == @user || (player.is_a?(Bot) && player.user_id == @user.id)
  end

  def draw?
    Match::DRAW_RESULTS.include?(@match.result)
  end

  def won?
    (playing_white? && @match.result == 'white_win') ||
      (playing_black? && @match.result == 'black_win')
  end

  def winning_side
    @match.result == 'white_win' ? 'White' : 'Black'
  end
end
