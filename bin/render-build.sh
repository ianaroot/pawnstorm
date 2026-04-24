#!/usr/bin/env bash
# exit on error
set -o errexit

bundle install
bundle exec rails assets:precompile
bundle exec rails assets:clean
# bundle exec rails db:seed
# bundle exec rake conditions:migrate_relational_comparison_sources
# bundle exec rake conditions:migrate_unary_comparison_targets
