-- Practice Tables for Duolingo-style features
-- Run this in Supabase SQL Editor

-- User Stats Table
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  total_lessons_completed INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  last_practice_date DATE,
  daily_goal INTEGER DEFAULT 15,
  today_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Progress Table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level_id INTEGER NOT NULL,
  lesson_type TEXT NOT NULL,
  lesson_index INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT TRUE,
  stars INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Activity Table (for streak tracking)
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  practice_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements/Badges Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own lesson progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own daily activity" ON daily_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily activity" ON daily_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);