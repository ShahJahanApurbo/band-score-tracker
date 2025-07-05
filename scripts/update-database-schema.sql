-- Enable Row Level Security
ALTER TABLE IF EXISTS test_scores DISABLE ROW LEVEL SECURITY;
DROP TABLE IF EXISTS test_scores;
DROP TABLE IF EXISTS users;

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create part_scores table for individual part scores
CREATE TABLE IF NOT EXISTS part_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill VARCHAR(20) NOT NULL CHECK (skill IN ('reading', 'listening', 'speaking', 'writing')),
  part_number INTEGER NOT NULL CHECK (part_number >= 1 AND part_number <= 4),
  score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 9),
  test_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_part_scores_user_skill ON part_scores(user_id, skill);
CREATE INDEX IF NOT EXISTS idx_part_scores_skill_date ON part_scores(skill, test_date);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for part_scores
CREATE POLICY "Users can view their own scores" ON part_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" ON part_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores" ON part_scores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scores" ON part_scores
  FOR DELETE USING (auth.uid() = user_id);

-- Allow all users to view all profiles for leaderboard (but not modify)
CREATE POLICY "All users can view all profiles for leaderboard" ON profiles
  FOR SELECT USING (true);

-- Allow all users to view all scores for leaderboard (but not modify)
CREATE POLICY "All users can view all scores for leaderboard" ON part_scores
  FOR SELECT USING (true);
