class AddCompiledProgramToBots < ActiveRecord::Migration[7.1]
  class MigrationBot < ApplicationRecord
    self.table_name = 'bots'
  end

  def up
    add_column :bots, :compiled_program, :json
    add_column :bots, :compiled_program_stale, :boolean, null: false, default: true

    MigrationBot.reset_column_information

    say_with_time 'Compiling existing bots into compiled_program' do
      MigrationBot.find_each do |bot|
        compiled_program = BotCompiler.new(Bot.find(bot.id)).compile
        bot.update_columns(compiled_program: compiled_program, compiled_program_stale: false)
      rescue StandardError => error
        raise "Failed to compile bot #{bot.id}: #{error.message}"
      end
    end
  end

  def down
    remove_column :bots, :compiled_program_stale
    remove_column :bots, :compiled_program
  end
end
