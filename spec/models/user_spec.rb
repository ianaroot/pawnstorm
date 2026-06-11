require 'rails_helper'

RSpec.describe User do
  describe '.username_base_from_email' do
    it 'uses the local part of the email' do
      expect(User.username_base_from_email('alice@example.com')).to eq('alice')
    end

    it 'strips characters outside the allowed set' do
      expect(User.username_base_from_email('a+b.c_d-e@example.com')).to eq('ab.c_d-e')
    end

    it 'truncates to the maximum length' do
      base = User.username_base_from_email("#{'a' * 50}@example.com")
      expect(base.length).to eq(30)
    end

    it 'pads a too-short local part to the minimum length' do
      expect(User.username_base_from_email('jo@example.com')).to eq('jo0')
    end
  end

  describe 'username defaulting and validation' do
    it 'derives a username from the email when none is given' do
      user = create(:user, email: 'alice@example.com')
      expect(user.username).to eq('alice')
    end

    it 'suffixes the derived username to avoid an existing one' do
      create(:user, email: 'alice@example.com')
      second = create(:user, email: 'alice@other.test')
      expect(second.username).to eq('alice2')
    end

    it 'keeps an explicitly provided username' do
      user = create(:user, email: 'bob@example.com', username: 'bobby')
      expect(user.username).to eq('bobby')
    end

    it 'rejects a duplicate username case-insensitively' do
      create(:user, username: 'Taken', email: 'a@example.test')
      expect(build(:user, username: 'taken', email: 'b@example.test')).not_to be_valid
    end

    it 'rejects a username with disallowed characters' do
      expect(build(:user, username: 'has space')).not_to be_valid
    end

    it 'rejects a too-short username' do
      expect(build(:user, username: 'ab')).not_to be_valid
    end
  end
end
