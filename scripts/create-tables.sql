-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_scores table
CREATE TABLE IF NOT EXISTS test_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR(20) NOT NULL CHECK (skill IN ('reading', 'listening', 'speaking', 'writing')),
  part_number INTEGER NOT NULL CHECK (part_number >= 1 AND part_number <= 4),
  score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 9),
  test_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill, part_number, test_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_scores_user_skill ON test_scores(user_id, skill);
CREATE INDEX IF NOT EXISTS idx_test_scores_skill_date ON test_scores(skill, test_date);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Insert some sample users (optional)
INSERT INTO users (username) VALUES 
  ('john_doe'),
  ('jane_smith'),
  ('mike_johnson'),
  ('sarah_wilson')
ON CONFLICT (username) DO NOTHING;
