-- Create part_score_details table for storing question type breakdown
CREATE TABLE IF NOT EXISTS part_score_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill VARCHAR(20) NOT NULL CHECK (skill IN ('reading', 'listening', 'speaking', 'writing')),
  part_number INTEGER NOT NULL CHECK (part_number >= 1 AND part_number <= 4),
  test_date DATE NOT NULL,
  question_types JSONB NOT NULL,
  final_score DECIMAL(3,1) NOT NULL CHECK (final_score >= 0 AND final_score <= 9),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill, part_number, test_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_part_score_details_user_skill ON part_score_details(user_id, skill);
CREATE INDEX IF NOT EXISTS idx_part_score_details_skill_date ON part_score_details(skill, test_date);
CREATE INDEX IF NOT EXISTS idx_part_score_details_question_types ON part_score_details USING GIN (question_types);

-- Enable Row Level Security
ALTER TABLE part_score_details ENABLE ROW LEVEL SECURITY;

-- Create policies for part_score_details
CREATE POLICY "Users can view their own score details" ON part_score_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own score details" ON part_score_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own score details" ON part_score_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own score details" ON part_score_details
  FOR DELETE USING (auth.uid() = user_id);

-- Allow all users to view all score details for leaderboard (but not modify)
CREATE POLICY "All users can view all score details for leaderboard" ON part_score_details
  FOR SELECT USING (true);
