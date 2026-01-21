-- Create settings table (single row)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  start_weight_kg DECIMAL(5,2),
  goal_weight_kg DECIMAL(5,2),
  pomodoro_work_min INTEGER DEFAULT 25,
  pomodoro_break_min INTEGER DEFAULT 5,
  pomodoro_long_break_min INTEGER DEFAULT 15,
  pomodoro_cycles_before_long INTEGER DEFAULT 4,
  ultradian_work_min INTEGER DEFAULT 90,
  ultradian_break_min INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings row
INSERT INTO public.settings (id) VALUES (1);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed default categories
INSERT INTO public.categories (name, sort_order) VALUES 
  ('Physics', 1),
  ('Chemistry', 2),
  ('Math', 3),
  ('English', 4),
  ('Video Editing', 5),
  ('Other', 100);

-- Create session_type enum
CREATE TYPE public.session_type AS ENUM ('pomodoro_work', 'ultradian_work', 'manual_work');

-- Create work_sessions table
CREATE TABLE public.work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_type public.session_type NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sleep_logs table
CREATE TABLE public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  bedtime TIME,
  wake_time TIME,
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weight_logs table
CREATE TABLE public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  weight_kg DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workout_logs table
CREATE TABLE public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users only
-- Settings: read/write for authenticated users
CREATE POLICY "Authenticated users can view settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update settings" ON public.settings FOR UPDATE TO authenticated USING (true);

-- Categories: read for all, write for authenticated
CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

-- Work sessions: authenticated only
CREATE POLICY "Authenticated users can view work_sessions" ON public.work_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert work_sessions" ON public.work_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update work_sessions" ON public.work_sessions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete work_sessions" ON public.work_sessions FOR DELETE TO authenticated USING (true);

-- Sleep logs: authenticated only
CREATE POLICY "Authenticated users can view sleep_logs" ON public.sleep_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sleep_logs" ON public.sleep_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update sleep_logs" ON public.sleep_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete sleep_logs" ON public.sleep_logs FOR DELETE TO authenticated USING (true);

-- Weight logs: authenticated only
CREATE POLICY "Authenticated users can view weight_logs" ON public.weight_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert weight_logs" ON public.weight_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update weight_logs" ON public.weight_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete weight_logs" ON public.weight_logs FOR DELETE TO authenticated USING (true);

-- Workout logs: authenticated only
CREATE POLICY "Authenticated users can view workout_logs" ON public.workout_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert workout_logs" ON public.workout_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update workout_logs" ON public.workout_logs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete workout_logs" ON public.workout_logs FOR DELETE TO authenticated USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for settings
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_work_sessions_date ON public.work_sessions(date);
CREATE INDEX idx_sleep_logs_date ON public.sleep_logs(date);
CREATE INDEX idx_weight_logs_date ON public.weight_logs(date);
CREATE INDEX idx_workout_logs_date ON public.workout_logs(date);