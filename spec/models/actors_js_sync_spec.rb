require 'rails_helper'

# Guards the Ruby ↔ JS mirror: NodeGrammarV2's singular-actor constants are the
# source of truth; app/javascript/bot_execution/actors.js must match them.
RSpec.describe 'actors.js singular-actor sets' do
  let(:source) { File.read(Rails.root.join('app/javascript/bot_execution/actors.js')) }

  def js_set(source, const_name)
    match = source.match(/export const #{const_name} = Object\.freeze\(new Set\(\[(.*?)\]\)\)/m)
    raise "could not find #{const_name} in actors.js" unless match

    match[1].scan(/'([^']+)'/).flatten
  end

  it 'mirrors NodeGrammarV2::SINGULAR_SUBJECTS' do
    expect(js_set(source, 'SINGULAR_ACTORS')).to match_array(NodeGrammarV2::SINGULAR_SUBJECTS)
  end

  it 'mirrors NodeGrammarV2::RELATIONAL_SINGULAR_SUBJECTS' do
    expect(js_set(source, 'RELATIONAL_SINGULAR_ACTORS')).to match_array(NodeGrammarV2::RELATIONAL_SINGULAR_SUBJECTS)
  end
end
