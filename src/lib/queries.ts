import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import type { SessionType, DashboardStats, Settings, Category, WorkSession, SleepLog, WeightLog, WorkoutLog } from '@/types/database';

// Helper to get today's date string
const todayStr = () => format(new Date(), 'yyyy-MM-dd');

// Settings
export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  return data as Settings;
}

export async function updateSettings(updates: Partial<Settings>): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('id', 1)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
  return data as Settings;
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data as Category[];
}

export async function addCategory(name: string): Promise<Category | null> {
  const { data: existing } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  
  const maxOrder = existing?.[0]?.sort_order ?? 0;
  
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, sort_order: maxOrder + 1 })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding category:', error);
    throw error;
  }
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// Work Sessions
export async function addWorkSession(
  startTime: Date,
  endTime: Date,
  durationMinutes: number,
  sessionType: SessionType,
  categoryId?: string,
  note?: string
): Promise<WorkSession | null> {
  const { data, error } = await supabase
    .from('work_sessions')
    .insert({
      date: format(startTime, 'yyyy-MM-dd'),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      session_type: sessionType,
      category_id: categoryId || null,
      note: note || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding work session:', error);
    throw error;
  }
  return data as WorkSession;
}

export async function getWorkSessions(startDate: Date, endDate: Date): Promise<WorkSession[]> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select('*')
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('start_time', { ascending: false });
  
  if (error) {
    console.error('Error fetching work sessions:', error);
    return [];
  }
  return data as WorkSession[];
}

export async function deleteWorkSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('work_sessions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting work session:', error);
    throw error;
  }
}

// Sleep Logs
export async function addSleepLog(
  date: string,
  hours: number,
  bedtime?: string,
  wakeTime?: string,
  quality?: number,
  note?: string
): Promise<SleepLog | null> {
  const { data, error } = await supabase
    .from('sleep_logs')
    .insert({
      date,
      hours,
      bedtime: bedtime || null,
      wake_time: wakeTime || null,
      quality: quality || null,
      note: note || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding sleep log:', error);
    throw error;
  }
  return data as SleepLog;
}

export async function getSleepLogs(startDate: Date, endDate: Date): Promise<SleepLog[]> {
  const { data, error } = await supabase
    .from('sleep_logs')
    .select('*')
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching sleep logs:', error);
    return [];
  }
  return data as SleepLog[];
}

export async function deleteSleepLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('sleep_logs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting sleep log:', error);
    throw error;
  }
}

// Weight Logs
export async function addWeightLog(date: string, weightKg: number): Promise<WeightLog | null> {
  const { data, error } = await supabase
    .from('weight_logs')
    .upsert({ date, weight_kg: weightKg }, { onConflict: 'date' })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding weight log:', error);
    throw error;
  }
  return data as WeightLog;
}

export async function getWeightLogs(startDate: Date, endDate: Date): Promise<WeightLog[]> {
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching weight logs:', error);
    return [];
  }
  return data as WeightLog[];
}

export async function deleteWeightLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('weight_logs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting weight log:', error);
    throw error;
  }
}

// Workout Logs
export async function addWorkoutLog(
  date: string,
  workoutType: string,
  durationMinutes: number,
  intensity?: number,
  note?: string
): Promise<WorkoutLog | null> {
  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      date,
      workout_type: workoutType,
      duration_minutes: durationMinutes,
      intensity: intensity || null,
      note: note || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding workout log:', error);
    throw error;
  }
  return data as WorkoutLog;
}

export async function getWorkoutLogs(startDate: Date, endDate: Date): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching workout logs:', error);
    return [];
  }
  return data as WorkoutLog[];
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting workout log:', error);
    throw error;
  }
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  const todayString = todayStr();
  const yesterday = format(subDays(today, 1), 'yyyy-MM-dd');

  // Get today's work sessions
  const { data: workSessions } = await supabase
    .from('work_sessions')
    .select('duration_minutes, session_type')
    .eq('date', todayString);

  const workHoursToday = (workSessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0) / 60;
  const pomodoroMinutesToday = workSessions
    ?.filter(s => s.session_type === 'pomodoro_work')
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;
  const ultradianMinutesToday = workSessions
    ?.filter(s => s.session_type === 'ultradian_work')
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

  // Get last night's sleep (yesterday's entry)
  const { data: sleepData } = await supabase
    .from('sleep_logs')
    .select('hours')
    .eq('date', yesterday)
    .limit(1);

  const sleepLastNight = sleepData?.[0]?.hours ?? null;

  // Get today's weight
  const { data: weightData } = await supabase
    .from('weight_logs')
    .select('weight_kg')
    .eq('date', todayString)
    .limit(1);

  const weightToday = weightData?.[0]?.weight_kg ?? null;

  // Get today's workout
  const { data: workoutData } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('date', todayString)
    .limit(1);

  const workoutToday = (workoutData?.[0] as WorkoutLog) ?? null;

  // Calculate logging streak
  const loggingStreak = await calculateLoggingStreak();

  return {
    workHoursToday,
    sleepLastNight,
    weightToday,
    workoutToday,
    pomodoroMinutesToday,
    ultradianMinutesToday,
    loggingStreak,
  };
}

async function calculateLoggingStreak(): Promise<number> {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    
    const [work, sleep, weight, workout] = await Promise.all([
      supabase.from('work_sessions').select('id').eq('date', date).limit(1),
      supabase.from('sleep_logs').select('id').eq('date', date).limit(1),
      supabase.from('weight_logs').select('id').eq('date', date).limit(1),
      supabase.from('workout_logs').select('id').eq('date', date).limit(1),
    ]);

    const hasAnyLog = 
      (work.data?.length ?? 0) > 0 ||
      (sleep.data?.length ?? 0) > 0 ||
      (weight.data?.length ?? 0) > 0 ||
      (workout.data?.length ?? 0) > 0;

    if (hasAnyLog) {
      streak++;
    } else if (i > 0) {
      // Allow gaps for today (i=0) but break on other days
      break;
    }
  }

  return streak;
}

// Chart Data
export async function getChartData(days: number) {
  const today = new Date();
  const startDate = subDays(today, days - 1);

  const [workSessions, sleepLogs, weightLogs, workoutLogs] = await Promise.all([
    getWorkSessions(startDate, today),
    getSleepLogs(startDate, today),
    getWeightLogs(startDate, today),
    getWorkoutLogs(startDate, today),
  ]);

  // Group by date
  const dates = Array.from({ length: days }, (_, i) => format(subDays(today, days - 1 - i), 'yyyy-MM-dd'));

  const workByDate = new Map<string, number>();
  workSessions.forEach(s => {
    const current = workByDate.get(s.date) || 0;
    workByDate.set(s.date, current + (s.duration_minutes / 60));
  });

  const sleepByDate = new Map<string, number>();
  sleepLogs.forEach(s => {
    sleepByDate.set(s.date, s.hours);
  });

  const weightByDate = new Map<string, number>();
  weightLogs.forEach(w => {
    weightByDate.set(w.date, w.weight_kg);
  });

  const workoutByDate = new Map<string, boolean>();
  workoutLogs.forEach(w => {
    workoutByDate.set(w.date, true);
  });

  return dates.map(date => ({
    date,
    workHours: workByDate.get(date) || 0,
    sleepHours: sleepByDate.get(date) || null,
    weight: weightByDate.get(date) || null,
    workout: workoutByDate.has(date),
  }));
}

// Export Data
export async function exportData() {
  const [settings, categories, workSessions, sleepLogs, weightLogs, workoutLogs] = await Promise.all([
    getSettings(),
    getCategories(),
    supabase.from('work_sessions').select('*').order('date', { ascending: false }),
    supabase.from('sleep_logs').select('*').order('date', { ascending: false }),
    supabase.from('weight_logs').select('*').order('date', { ascending: false }),
    supabase.from('workout_logs').select('*').order('date', { ascending: false }),
  ]);

  return {
    settings,
    categories,
    work_sessions: workSessions.data,
    sleep_logs: sleepLogs.data,
    weight_logs: weightLogs.data,
    workout_logs: workoutLogs.data,
    exported_at: new Date().toISOString(),
  };
}
