class HelpController < ApplicationController
  def bots
    @guide_title = BotGuide.title
    @guide_intro = BotGuide.intro
    @guide_sections = BotGuide.sections
  end
end
