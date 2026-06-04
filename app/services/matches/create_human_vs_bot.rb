class Matches::CreateHumanVsBot
  include Matches::StaleBotConfirmation

  attr_reader :error_message, :match, :play_bots, :selected_bot_id, :selected_color

  def initialize(user:, params:)
    @user = user
    @params = params
    @selected_bot_id = params[:bot_id]
    @selected_color = params[:human_color].presence || 'white'
    load_play_bot_options
  end

  def call
    bot = selected_bot
    return fail_with('Please choose one of your bots.') if bot.blank?

    if bot.compiled_program_stale?
      return fail_with(stale_compile_message(bot)) unless compile_confirmation_requested?
      return false unless compile_bot(bot)
      bot.reload
    end

    human_team = resolve_human_team(selected_color)
    white_player = human_team == 'W' ? @user : bot
    black_player = human_team == 'B' ? @user : bot
    bot_snapshot = begin
      bot.get_fresh_program
    rescue StandardError => e
      return fail_with(e.message)
    end

    @match = Match.create!(
      creator: @user,
      white_player:,
      black_player:,
      white_compiled_program_snapshot: white_player == bot ? bot_snapshot : nil,
      black_compiled_program_snapshot: black_player == bot ? bot_snapshot : nil,
      status: :running
    )

    true
  end

  private

  def load_play_bot_options
    system_bot = Bot.system_bot
    if @user
      base = @user.bots
      base = base.or(Bot.where(id: system_bot.id)) if system_bot && system_bot.user_id != @user.id
      @play_bots = base.order(:name)
    else
      @play_bots = system_bot ? Bot.where(id: system_bot.id) : Bot.none
    end
  end

  def selected_bot
    return nil if selected_bot_id.blank?

    play_bots.find_by(id: selected_bot_id)
  end

  def compile_bot(bot)
    bot.compile_program!
    true
  rescue StandardError => error
    fail_with("Bot could not be compiled: #{error.message}")
  end

  def resolve_human_team(color)
    case color
    when 'black'
      'B'
    when 'random'
      %w[W B].sample
    else
      'W'
    end
  end

  def fail_with(message)
    @error_message = message
    false
  end
end
