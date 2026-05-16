-- EngFlow Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create vocabulary table with Spaced Repetition fields
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  example TEXT NOT NULL,
  category TEXT DEFAULT 'Basic',
  next_review TIMESTAMP DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  last_review TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own vocabulary
CREATE POLICY "Users can manage their own vocabulary" ON vocabulary
  FOR ALL
  USING (auth.uid() = user_id);

-- Create grammar_progress table
CREATE TABLE IF NOT EXISTS grammar_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE grammar_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own grammar progress" ON grammar_progress
  FOR ALL
  USING (auth.uid() = user_id);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own test results" ON test_results
  FOR ALL
  USING (auth.uid() = user_id);

-- Create user_stats table for tracking overall progress
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_streak INTEGER DEFAULT 0,
  words_learned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  tests_completed INTEGER DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own stats" ON user_stats
  FOR ALL
  USING (auth.uid() = user_id);

-- Create trigger to auto-create user_stats on registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, daily_streak, words_learned, time_spent_minutes, tests_completed)
  VALUES (NEW.id, 0, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();