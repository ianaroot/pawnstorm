load Rails.root.join('db/seeds/cyclops_v2.rb')
puts "cyclops seeded"
load Rails.root.join('db/seeds/rogue_v2.rb')
puts "rogue seeded"
load Rails.root.join('db/seeds/phoenix_v2.rb') # after rogue_v2: clones Rogue v2
puts "phoenix seeded"
load Rails.root.join('db/seeds/professor_x_v2.rb') # after phoenix_v2: clones Phoenix v2
puts "professor x seeded"
load Rails.root.join('db/seeds/storm_v2.rb')
puts "storm seeded"
load Rails.root.join('db/seeds/nightcrawler_v2.rb')
puts "nightcrawler seeded"
load Rails.root.join('db/seeds/colossus_v2.rb') # after cyclops_v2: clones Cyclops v2
puts "colossus seeded"
load Rails.root.join('db/seeds/beast_v2.rb')
puts "beast seeded"
load Rails.root.join('db/seeds/bishop_v2.rb')
puts "bishop seeded"
load Rails.root.join('db/seeds/gambit_v2.rb')
puts "gambit seeded"
load Rails.root.join('db/seeds/wolverine_v2.rb')
puts "wolverine seeded"
load Rails.root.join('db/seeds/magneto.rb')
puts "magneto seeded"

# bin/rails runner db/seeds/wolverine_v2.rb
