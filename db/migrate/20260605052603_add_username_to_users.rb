class AddUsernameToUsers < ActiveRecord::Migration[7.1]
  def up
    add_column :users, :username, :string

    User.reset_column_information
    User.find_each do |user|
      base = User.username_base_from_email(user.email)
      user.update!(username: free_username(base))
    end

    add_index :users, 'lower(username)', unique: true, name: 'index_users_on_lower_username'
    change_column_null :users, :username, false
  end

  def down
    remove_index :users, name: 'index_users_on_lower_username'
    remove_column :users, :username
  end

  private

  def free_username(base)
    candidate = base
    suffix = 1
    while User.where('lower(username) = ?', candidate.downcase).exists?
      suffix += 1
      trimmed = base[0, User::USERNAME_MAX_LENGTH - suffix.to_s.length]
      candidate = "#{trimmed}#{suffix}"
    end
    candidate
  end
end
