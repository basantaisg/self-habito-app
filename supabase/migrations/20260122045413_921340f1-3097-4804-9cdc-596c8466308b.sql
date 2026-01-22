-- Add user_id column to all tables for proper user isolation
-- This fixes the security issue where any authenticated user can access all data

-- 1. Add user_id to categories
ALTER TABLE public.categories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user_id to work_sessions  
ALTER TABLE public.work_sessions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add user_id to sleep_logs
ALTER TABLE public.sleep_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Add user_id to weight_logs
ALTER TABLE public.weight_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Add user_id to workout_logs
ALTER TABLE public.workout_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Add user_id to settings (change from fixed id=1 to user-specific settings)
ALTER TABLE public.settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- Remove the fixed id constraint and make user_id the unique identifier
ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE public.settings ADD PRIMARY KEY (id);
ALTER TABLE public.settings ADD CONSTRAINT settings_user_id_unique UNIQUE (user_id);

-- Drop all existing RLS policies and recreate with user isolation

-- Categories policies
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;

CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Work sessions policies
DROP POLICY IF EXISTS "Authenticated users can view work_sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert work_sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Authenticated users can update work_sessions" ON public.work_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete work_sessions" ON public.work_sessions;

CREATE POLICY "Users can view own work_sessions" ON public.work_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own work_sessions" ON public.work_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own work_sessions" ON public.work_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own work_sessions" ON public.work_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Sleep logs policies
DROP POLICY IF EXISTS "Authenticated users can view sleep_logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Authenticated users can insert sleep_logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Authenticated users can update sleep_logs" ON public.sleep_logs;
DROP POLICY IF EXISTS "Authenticated users can delete sleep_logs" ON public.sleep_logs;

CREATE POLICY "Users can view own sleep_logs" ON public.sleep_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep_logs" ON public.sleep_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep_logs" ON public.sleep_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep_logs" ON public.sleep_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Weight logs policies
DROP POLICY IF EXISTS "Authenticated users can view weight_logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Authenticated users can insert weight_logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Authenticated users can update weight_logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Authenticated users can delete weight_logs" ON public.weight_logs;

CREATE POLICY "Users can view own weight_logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight_logs" ON public.weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weight_logs" ON public.weight_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weight_logs" ON public.weight_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Workout logs policies
DROP POLICY IF EXISTS "Authenticated users can view workout_logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Authenticated users can insert workout_logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Authenticated users can update workout_logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Authenticated users can delete workout_logs" ON public.workout_logs;

CREATE POLICY "Users can view own workout_logs" ON public.workout_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout_logs" ON public.workout_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout_logs" ON public.workout_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout_logs" ON public.workout_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Settings policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.settings;

CREATE POLICY "Users can view own settings" ON public.settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.settings
  FOR UPDATE USING (auth.uid() = user_id);