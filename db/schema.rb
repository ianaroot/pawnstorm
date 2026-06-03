# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2026_06_02_120000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "bots", force: :cascade do |t|
    t.bigint "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.text "description"
    t.json "compiled_program"
    t.boolean "compiled_program_stale", default: true, null: false
    t.float "rating", default: 1000.0, null: false
    t.float "rating_deviation", default: 350.0, null: false
    t.float "rating_volatility", default: 0.06, null: false
    t.index ["name"], name: "index_bots_on_name", unique: true
    t.index ["user_id"], name: "index_bots_on_user_id"
  end

  create_table "connections", force: :cascade do |t|
    t.bigint "source_node_id", null: false
    t.bigint "target_node_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "LEAST(source_node_id, target_node_id), GREATEST(source_node_id, target_node_id)", name: "idx_no_bidirectional_connections", unique: true
    t.index ["source_node_id", "target_node_id"], name: "index_connections_on_source_node_id_and_target_node_id", unique: true
    t.index ["source_node_id"], name: "index_connections_on_source_node_id"
    t.index ["target_node_id"], name: "index_connections_on_target_node_id"
    t.check_constraint "source_node_id <> target_node_id", name: "no_self_loops"
  end

  create_table "good_job_batches", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "description"
    t.jsonb "serialized_properties"
    t.text "on_finish"
    t.text "on_success"
    t.text "on_discard"
    t.text "callback_queue_name"
    t.integer "callback_priority"
    t.datetime "enqueued_at"
    t.datetime "discarded_at"
    t.datetime "finished_at"
  end

  create_table "good_job_executions", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id", null: false
    t.text "job_class"
    t.text "queue_name"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.text "error"
    t.integer "error_event", limit: 2
    t.text "error_backtrace", array: true
    t.uuid "process_id"
    t.interval "duration"
    t.index ["active_job_id", "created_at"], name: "index_good_job_executions_on_active_job_id_and_created_at"
    t.index ["process_id", "created_at"], name: "index_good_job_executions_on_process_id_and_created_at"
  end

  create_table "good_job_processes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "state"
    t.integer "lock_type", limit: 2
  end

  create_table "good_job_settings", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "key"
    t.jsonb "value"
    t.index ["key"], name: "index_good_job_settings_on_key", unique: true
  end

  create_table "good_jobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "queue_name"
    t.integer "priority"
    t.jsonb "serialized_params"
    t.datetime "scheduled_at"
    t.datetime "performed_at"
    t.datetime "finished_at"
    t.text "error"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "active_job_id"
    t.text "concurrency_key"
    t.text "cron_key"
    t.uuid "retried_good_job_id"
    t.datetime "cron_at"
    t.uuid "batch_id"
    t.uuid "batch_callback_id"
    t.boolean "is_discrete"
    t.integer "executions_count"
    t.text "job_class"
    t.integer "error_event", limit: 2
    t.text "labels", array: true
    t.uuid "locked_by_id"
    t.datetime "locked_at"
    t.index ["active_job_id", "created_at"], name: "index_good_jobs_on_active_job_id_and_created_at"
    t.index ["batch_callback_id"], name: "index_good_jobs_on_batch_callback_id", where: "(batch_callback_id IS NOT NULL)"
    t.index ["batch_id"], name: "index_good_jobs_on_batch_id", where: "(batch_id IS NOT NULL)"
    t.index ["concurrency_key"], name: "index_good_jobs_on_concurrency_key_when_unfinished", where: "(finished_at IS NULL)"
    t.index ["cron_key", "created_at"], name: "index_good_jobs_on_cron_key_and_created_at_cond", where: "(cron_key IS NOT NULL)"
    t.index ["cron_key", "cron_at"], name: "index_good_jobs_on_cron_key_and_cron_at_cond", unique: true, where: "(cron_key IS NOT NULL)"
    t.index ["finished_at"], name: "index_good_jobs_jobs_on_finished_at", where: "((retried_good_job_id IS NULL) AND (finished_at IS NOT NULL))"
    t.index ["labels"], name: "index_good_jobs_on_labels", where: "(labels IS NOT NULL)", using: :gin
    t.index ["locked_by_id"], name: "index_good_jobs_on_locked_by_id", where: "(locked_by_id IS NOT NULL)"
    t.index ["priority", "created_at"], name: "index_good_job_jobs_for_candidate_lookup", where: "(finished_at IS NULL)"
    t.index ["priority", "created_at"], name: "index_good_jobs_jobs_on_priority_created_at_when_unfinished", order: { priority: "DESC NULLS LAST" }, where: "(finished_at IS NULL)"
    t.index ["priority", "scheduled_at"], name: "index_good_jobs_on_priority_scheduled_at_unfinished_unlocked", where: "((finished_at IS NULL) AND (locked_by_id IS NULL))"
    t.index ["queue_name", "scheduled_at"], name: "index_good_jobs_on_queue_name_and_scheduled_at", where: "(finished_at IS NULL)"
    t.index ["scheduled_at"], name: "index_good_jobs_on_scheduled_at", where: "(finished_at IS NULL)"
  end

  create_table "matches", force: :cascade do |t|
    t.json "lay_out"
    t.json "captured_pieces", default: []
    t.string "allowed_to_move", default: "W", null: false
    t.json "movement_notation", default: []
    t.json "previous_layouts", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "creator_id"
    t.string "white_player_type"
    t.bigint "white_player_id"
    t.string "black_player_type"
    t.bigint "black_player_id"
    t.integer "status", default: 0, null: false
    t.integer "result"
    t.text "error_message"
    t.json "white_compiled_program_snapshot"
    t.json "black_compiled_program_snapshot"
    t.bigint "tournament_id"
    t.json "profile_data"
    t.bigint "white_tournament_entry_id"
    t.bigint "black_tournament_entry_id"
    t.float "white_rating_before"
    t.float "white_rating_after"
    t.float "black_rating_before"
    t.float "black_rating_after"
    t.index ["black_player_type", "black_player_id"], name: "index_matches_on_black_player"
    t.index ["black_tournament_entry_id"], name: "index_matches_on_black_tournament_entry_id"
    t.index ["creator_id"], name: "index_matches_on_creator_id"
    t.index ["tournament_id"], name: "index_matches_on_tournament_id"
    t.index ["white_player_type", "white_player_id"], name: "index_matches_on_white_player"
    t.index ["white_tournament_entry_id"], name: "index_matches_on_white_tournament_entry_id"
  end

  create_table "nodes", force: :cascade do |t|
    t.bigint "bot_id", null: false
    t.string "node_type", null: false
    t.json "data", default: {}
    t.float "position_x", default: 0.0
    t.float "position_y", default: 0.0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bot_id"], name: "index_nodes_on_bot_id"
    t.index ["bot_id"], name: "index_nodes_on_bot_id_root_unique", unique: true, where: "((node_type)::text = 'root'::text)"
    t.check_constraint "node_type::text = ANY (ARRAY['condition'::character varying, 'score'::character varying, 'root'::character varying, 'organizer'::character varying]::text[])", name: "node_type_check"
  end

  create_table "tournament_entries", force: :cascade do |t|
    t.bigint "tournament_id", null: false
    t.bigint "bot_id"
    t.integer "seed_order", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "compiled_program_snapshot"
    t.string "display_name"
    t.bigint "bot_owner_id"
    t.index ["bot_id"], name: "index_tournament_entries_on_bot_id"
    t.index ["bot_owner_id"], name: "index_tournament_entries_on_bot_owner_id"
    t.index ["tournament_id", "bot_id"], name: "index_tournament_entries_on_tournament_id_and_bot_id", unique: true
    t.index ["tournament_id"], name: "index_tournament_entries_on_tournament_id"
  end

  create_table "tournaments", force: :cascade do |t|
    t.bigint "creator_id", null: false
    t.integer "games_per_pair", default: 10, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", default: "Tournament", null: false
    t.text "description"
    t.integer "status", default: 0, null: false
    t.integer "visibility", default: 1, null: false
    t.integer "entries_per_user", default: 0, null: false
    t.integer "max_entries"
    t.string "invite_token", null: false
    t.datetime "started_at"
    t.jsonb "constraints"
    t.index ["creator_id"], name: "index_tournaments_on_creator_id"
    t.index ["invite_token"], name: "index_tournaments_on_invite_token", unique: true
    t.index ["status"], name: "index_tournaments_on_status"
    t.index ["visibility"], name: "index_tournaments_on_visibility"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "guest", default: false, null: false
    t.datetime "last_active_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "connections", "nodes", column: "source_node_id"
  add_foreign_key "connections", "nodes", column: "target_node_id"
  add_foreign_key "matches", "tournament_entries", column: "black_tournament_entry_id"
  add_foreign_key "matches", "tournament_entries", column: "white_tournament_entry_id"
  add_foreign_key "matches", "tournaments"
  add_foreign_key "matches", "users", column: "creator_id"
  add_foreign_key "nodes", "bots"
  add_foreign_key "tournament_entries", "bots", on_delete: :nullify
  add_foreign_key "tournament_entries", "tournaments"
  add_foreign_key "tournament_entries", "users", column: "bot_owner_id"
  add_foreign_key "tournaments", "users", column: "creator_id"
end
