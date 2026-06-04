module Matches::StaleBotConfirmation
  CONFIRMATION_VALUE = 'compile'
  MESSAGE_TEMPLATE = '%{names} must be recompiled first. Compile and continue?'

  def self.message_for(bots)
    names = Array(bots).map(&:name).uniq.join(' and ')
    format(MESSAGE_TEMPLATE, names: names)
  end

  private

  def compile_confirmation_requested?
    @params[:stale_bot_confirmation] == CONFIRMATION_VALUE
  end

  def stale_compile_message(bots)
    Matches::StaleBotConfirmation.message_for(bots)
  end
end
