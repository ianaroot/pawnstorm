class Matches::IndexQuery
  def initialize(user:, params:)
    @user = user
    @params = params
  end

  def matches
    scoped = Match.where(id: white_ids).or(Match.where(id: black_ids))
    scoped = filter_tournament(scoped)
    scoped = filter_creator(scoped)
    scoped.order(created_at: sort_direction)
  end

  private

  def white_ids
    return [] if @params[:color] == 'black'

    side(Match.playing_white(@user), mine: :white, opponent: :black, win: 'white_win', loss: 'black_win').ids
  end

  def black_ids
    return [] if @params[:color] == 'white'

    side(Match.playing_black(@user), mine: :black, opponent: :white, win: 'black_win', loss: 'white_win').ids
  end

  def side(scope, mine:, opponent:, win:, loss:)
    scope = restrict_own_bot(scope, mine)
    scope = restrict_opponent(scope, opponent)
    restrict_outcome(scope, win, loss)
  end

  def restrict_own_bot(scope, side)
    return scope if own_bot_name.blank?

    scope.where("#{side}_player_type" => 'Bot', "#{side}_player_id" => @user.bots.with_name(own_bot_name).select(:id))
  end

  def restrict_opponent(scope, side)
    return scope if opponent_name.blank? && opponent_owner.blank?

    scope.where("#{side}_player_type" => 'Bot', "#{side}_player_id" => opponent_bot_ids)
  end

  def opponent_bot_ids
    Bot.with_name(opponent_name).with_owner_username(opponent_owner).select(:id)
  end

  def restrict_outcome(scope, win, loss)
    case @params[:outcome]
    when 'win' then scope.where(result: win)
    when 'loss' then scope.where(result: loss)
    when 'draw' then scope.where(result: Match::DRAW_RESULTS)
    else scope
    end
  end

  def filter_tournament(scope)
    case @params[:tournament]
    when 'non_tournament' then scope.without_tournament
    when 'tournament' then scope.only_tournament
    else scope
    end
  end

  def filter_creator(scope)
    case @params[:creator]
    when 'me' then scope.created_by(@user)
    when 'others' then scope.not_created_by(@user)
    else scope
    end
  end

  def sort_direction
    @params[:sort] == 'oldest' ? :asc : :desc
  end

  def own_bot_name
    @params[:bot_name]
  end

  def opponent_name
    @params[:opponent_name]
  end

  def opponent_owner
    @params[:opponent_owner]
  end
end
