export type SessionType = 'pomodoro_work' | 'ultradian_work' | 'manual_work';

export interface Settings {
  id: number;
  start_weight_kg: number | null;
  goal_weight_kg: number | null;
  pomodoro_work_min: number;
  pomodoro_break_min: number;
  pomodoro_long_break_min: number;
  pomodoro_cycles_before_long: number;
  ultradian_work_min: number;
  ultradian_break_min: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface WorkSession {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  session_type: SessionType;
  category_id: string | null;
  note: string | null;
  created_at: string;
}

export interface SleepLog {
  id: string;
  date: string;
  hours: number;
  bedtime: string | null;
  wake_time: string | null;
  quality: number | null;
  note: string | null;
  created_at: string;
}

export interface WeightLog {
  id: string;
  date: string;
  weight_kg: number;
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workout_type: string;
  duration_minutes: number;
  intensity: number | null;
  note: string | null;
  created_at: string;
}

export interface DashboardStats {
  workHoursToday: number;
  sleepLastNight: number | null;
  weightToday: number | null;
  workoutToday: WorkoutLog | null;
  pomodoroMinutesToday: number;
  ultradianMinutesToday: number;
  loggingStreak: number;
}
