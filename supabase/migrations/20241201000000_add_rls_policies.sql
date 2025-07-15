-- Migration: Add RLS Policies for NutrientSync
-- Date: 2024-12-01
-- Description: Ensures all tables have proper Row Level Security policies

-- 1. Ensure profiles table has RLS enabled and proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id);

-- 2. Ensure inventory table has RLS enabled and proper policies
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON inventory;

-- Create policies for inventory table
CREATE POLICY "Users can view own inventory" ON inventory 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory" ON inventory 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON inventory 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory" ON inventory 
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Enable RLS on daily_log table
ALTER TABLE public.daily_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own daily log" ON daily_log;
DROP POLICY IF EXISTS "Users can insert own daily log" ON daily_log;
DROP POLICY IF EXISTS "Users can update own daily log" ON daily_log;
DROP POLICY IF EXISTS "Users can delete own daily log" ON daily_log;
DROP POLICY IF EXISTS "Users can view their own logs" ON daily_log;

-- Policy for users to view their own logs
CREATE POLICY "Users can view their own logs" 
ON public.daily_log
FOR SELECT
TO authenticated
USING ((user_id = (select auth.uid())));

-- Add other policies as needed
CREATE POLICY "Users can insert own daily log" ON daily_log 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily log" ON daily_log 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily log" ON daily_log 
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create or replace the trigger function for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Drop and re-create the trigger to ensure it's attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Set up storage access policies for avatars
INSERT INTO storage.buckets (id, name)
  VALUES ('avatars', 'avatars')
  ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;

-- Create storage policies
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- 7. Add any missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diet TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight_lbs DECIMAL(5,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_feet INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height_inches INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bmi DECIMAL(4,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sport TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS season TEXT;

-- 8. Add constraints to ensure data integrity
DO $$
BEGIN
  -- Add gender constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_gender_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_gender_check 
    CHECK (gender IN ('Woman', 'Man', 'Prefer Not to Say'));
  END IF;
  
  -- Add sport constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_sport_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_sport_check 
    CHECK (sport IN ('None', 'Basketball', 'Soccer', 'Swimming', 'Running', 'Tennis', 'Football', 'Baseball', 'Volleyball', 'Track & Field', 'Cross Country', 'Wrestling', 'Golf', 'Lacrosse', 'Hockey'));
  END IF;
  
  -- Add activity_level constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_activity_level_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_activity_level_check 
    CHECK (activity_level IN ('Sedentary', 'Lightly Active', 'Active'));
  END IF;
  
  -- Add goal constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_goal_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_goal_check 
    CHECK (goal IN ('Gain Weight', 'Lose Weight', 'Maintain Weight', 'Build Muscle', 'Improve Performance'));
  END IF;
  
  -- Add season constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_season_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_season_check 
    CHECK (season IN ('Offseason', 'Inseason', 'Pre-season', 'Post-season'));
  END IF;
END $$;

-- 9. Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_daily_log_user_id ON daily_log(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_log_date ON daily_log(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_log_consumed_at ON daily_log(consumed_at);

-- 10. Add helpful comments
COMMENT ON TABLE profiles IS 'User profiles with nutrition and fitness data';
COMMENT ON TABLE inventory IS 'User food inventory for tracking available foods';
COMMENT ON TABLE daily_log IS 'Daily food consumption log for tracking nutrition'; 