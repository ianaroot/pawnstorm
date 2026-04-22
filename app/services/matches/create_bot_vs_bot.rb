class Matches::CreateBotVsBot
  attr_reader :all_opponent_bots,
    :error_message,
    :match,
    :own_bots,
    :selected_opponent_bot_id,
    :selected_own_bot_id

  def initialize(user:, params:)
    @user = user
    @params = params
    @selected_own_bot_id = params[:own_bot_id]
    @selected_opponent_bot_id = params[:opponent_bot_id]
    load_bot_options
  end

  def call
    own_bot = selected_own_bot
    opponent_bot = selected_opponent_bot
    return fail_with('Please choose valid bots for both sides.') if own_bot.blank? || opponent_bot.blank?

    stale_bots = stale_selected_bots(own_bot, opponent_bot)
    if stale_bots.any?
      return fail_with(stale_compile_message(stale_bots)) unless compile_confirmation_requested?
      return false unless compile_selected_bots(stale_bots)

      own_bot.reload
      opponent_bot.reload
    end

    white_bot, black_bot = [own_bot, opponent_bot].shuffle
    begin
      white_snapshot = white_bot.get_fresh_program
      black_snapshot = black_bot.get_fresh_program
    rescue StandardError => e
      return fail_with(e.message)
    end

    @match = Match.create!(
      creator: @user,
      white_player: white_bot,
      black_player: black_bot,
      white_compiled_program_snapshot: white_snapshot,
      black_compiled_program_snapshot: black_snapshot
    )
    ComputeMatchJob.perform_later(@match.id)

    true
  end

  private

  def load_bot_options
    @own_bots = @user.bots.order(:name)
    @all_opponent_bots = Bot.where(user: @user)
                           .or(Bot.compiled.where.not(user: @user))
                           .order(:name)
  end

  def selected_own_bot
    return nil if selected_own_bot_id.blank?

    own_bots.find_by(id: selected_own_bot_id)
  end

  def selected_opponent_bot
    return nil if selected_opponent_bot_id.blank?

    all_opponent_bots.find_by(id: selected_opponent_bot_id)
  end

  def stale_selected_bots(*bots)
    bots.compact.select { |bot| bot.user_id == @user.id && bot.compiled_program_stale? }
  end

  def compile_confirmation_requested?
    @params[:stale_bot_confirmation] == 'compile'
  end

  def compile_selected_bots(bots)
    bots.each(&:compile_program!)
    true
  rescue StandardError => error
    fail_with("Selected stale bot#{'s' if bots.length != 1} could not be compiled: #{error.message}")
  end

  def stale_compile_message(bots)
    names = bots.map(&:name).uniq.join(', ')
    return "#{names} needs to be recompiled before match generation." if bots.length == 1

    "#{names} each need to be recompiled before match generation."
  end

  def fail_with(message)
    @error_message = message
    false
  end
end
