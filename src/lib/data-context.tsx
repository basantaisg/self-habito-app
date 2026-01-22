import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import * as localStorage from '@/lib/local-storage';
import type { Settings, Category, WorkSession, SleepLog, WeightLog, WorkoutLog, SessionType, DashboardStats } from '@/types/database';
import { toast } from 'sonner';

interface DataContextType {
  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  
  // Categories
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Work Sessions
  addWorkSession: (startTime: Date, endTime: Date, durationMinutes: number, sessionType: SessionType, categoryId?: string, note?: string) => Promise<void>;
  getWorkSessions: (startDate: Date, endDate: Date) => WorkSession[];
  deleteWorkSession: (id: string) => Promise<void>;
  
  // Sleep Logs
  addSleepLog: (date: string, hours: number, bedtime?: string, wakeTime?: string, quality?: number, note?: string) => Promise<void>;
  getSleepLogs: (startDate: Date, endDate: Date) => SleepLog[];
  deleteSleepLog: (id: string) => Promise<void>;
  
  // Weight Logs
  addWeightLog: (date: string, weightKg: number) => Promise<void>;
  getWeightLogs: (startDate: Date, endDate: Date) => WeightLog[];
  deleteWeightLog: (id: string) => Promise<void>;
  
  // Workout Logs
  addWorkoutLog: (date: string, workoutType: string, durationMinutes: number, intensity?: number, note?: string) => Promise<void>;
  getWorkoutLogs: (startDate: Date, endDate: Date) => WorkoutLog[];
  deleteWorkoutLog: (id: string) => Promise<void>;
  
  // Dashboard
  getDashboardStats: () => DashboardStats;
  getChartData: (days: number) => { date: string; workHours: number; sleepHours: number | null; weight: number | null; workout: boolean }[];
  
  // Export/Import
  exportData: () => ReturnType<typeof localStorage.exportLocalData>;
  importData: (data: ReturnType<typeof localStorage.exportLocalData>) => void;
  
  // Sync
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  isSyncing: boolean;
  isOnline: boolean;
  
  // Refresh trigger
  refresh: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Settings
  const settings = localStorage.getLocalSettings();
  
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    localStorage.updateLocalSettings(updates);
    refresh();
  }, [refresh]);

  // Categories
  const categories = localStorage.getLocalCategories();
  
  const addCategory = useCallback(async (name: string) => {
    localStorage.addLocalCategory(name);
    refresh();
  }, [refresh]);
  
  const deleteCategory = useCallback(async (id: string) => {
    localStorage.deleteLocalCategory(id);
    refresh();
  }, [refresh]);

  // Work Sessions
  const addWorkSession = useCallback(async (
    startTime: Date,
    endTime: Date,
    durationMinutes: number,
    sessionType: SessionType,
    categoryId?: string,
    note?: string
  ) => {
    localStorage.addLocalWorkSession(startTime, endTime, durationMinutes, sessionType, categoryId, note);
    refresh();
  }, [refresh]);
  
  const getWorkSessions = useCallback((startDate: Date, endDate: Date): WorkSession[] => {
    const all = localStorage.getLocalWorkSessions();
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    return all.filter(s => s.date >= start && s.date <= end)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [refreshKey]);
  
  const deleteWorkSession = useCallback(async (id: string) => {
    localStorage.deleteLocalWorkSession(id);
    refresh();
  }, [refresh]);

  // Sleep Logs
  const addSleepLog = useCallback(async (
    date: string,
    hours: number,
    bedtime?: string,
    wakeTime?: string,
    quality?: number,
    note?: string
  ) => {
    localStorage.addLocalSleepLog(date, hours, bedtime, wakeTime, quality, note);
    refresh();
  }, [refresh]);
  
  const getSleepLogs = useCallback((startDate: Date, endDate: Date): SleepLog[] => {
    const all = localStorage.getLocalSleepLogs();
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    return all.filter(s => s.date >= start && s.date <= end)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [refreshKey]);
  
  const deleteSleepLog = useCallback(async (id: string) => {
    localStorage.deleteLocalSleepLog(id);
    refresh();
  }, [refresh]);

  // Weight Logs
  const addWeightLog = useCallback(async (date: string, weightKg: number) => {
    localStorage.addLocalWeightLog(date, weightKg);
    refresh();
  }, [refresh]);
  
  const getWeightLogs = useCallback((startDate: Date, endDate: Date): WeightLog[] => {
    const all = localStorage.getLocalWeightLogs();
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    return all.filter(w => w.date >= start && w.date <= end)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [refreshKey]);
  
  const deleteWeightLog = useCallback(async (id: string) => {
    localStorage.deleteLocalWeightLog(id);
    refresh();
  }, [refresh]);

  // Workout Logs
  const addWorkoutLog = useCallback(async (
    date: string,
    workoutType: string,
    durationMinutes: number,
    intensity?: number,
    note?: string
  ) => {
    localStorage.addLocalWorkoutLog(date, workoutType, durationMinutes, intensity, note);
    refresh();
  }, [refresh]);
  
  const getWorkoutLogs = useCallback((startDate: Date, endDate: Date): WorkoutLog[] => {
    const all = localStorage.getLocalWorkoutLogs();
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    return all.filter(w => w.date >= start && w.date <= end)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [refreshKey]);
  
  const deleteWorkoutLog = useCallback(async (id: string) => {
    localStorage.deleteLocalWorkoutLog(id);
    refresh();
  }, [refresh]);

  // Dashboard Stats
  const getDashboardStats = useCallback((): DashboardStats => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

    const workSessions = localStorage.getLocalWorkSessions().filter(s => s.date === todayStr);
    const workHoursToday = workSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
    const pomodoroMinutesToday = workSessions
      .filter(s => s.session_type === 'pomodoro_work')
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const ultradianMinutesToday = workSessions
      .filter(s => s.session_type === 'ultradian_work')
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

    const sleepLogs = localStorage.getLocalSleepLogs();
    const sleepLastNight = sleepLogs.find(s => s.date === yesterdayStr)?.hours ?? null;

    const weightLogs = localStorage.getLocalWeightLogs();
    const weightToday = weightLogs.find(w => w.date === todayStr)?.weight_kg ?? null;

    const workoutLogs = localStorage.getLocalWorkoutLogs();
    const workoutToday = workoutLogs.find(w => w.date === todayStr) ?? null;

    // Calculate streak
    let loggingStreak = 0;
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const hasAnyLog = 
        workSessions.some(s => s.date === date) ||
        sleepLogs.some(s => s.date === date) ||
        weightLogs.some(w => w.date === date) ||
        workoutLogs.some(w => w.date === date);
      
      if (hasAnyLog) {
        loggingStreak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      workHoursToday,
      sleepLastNight,
      weightToday,
      workoutToday,
      pomodoroMinutesToday,
      ultradianMinutesToday,
      loggingStreak,
    };
  }, [refreshKey]);

  // Chart Data
  const getChartData = useCallback((days: number) => {
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => 
      format(subDays(today, days - 1 - i), 'yyyy-MM-dd')
    );

    const workSessions = localStorage.getLocalWorkSessions();
    const sleepLogs = localStorage.getLocalSleepLogs();
    const weightLogs = localStorage.getLocalWeightLogs();
    const workoutLogs = localStorage.getLocalWorkoutLogs();

    const workByDate = new Map<string, number>();
    workSessions.forEach(s => {
      const current = workByDate.get(s.date) || 0;
      workByDate.set(s.date, current + (s.duration_minutes / 60));
    });

    const sleepByDate = new Map<string, number>();
    sleepLogs.forEach(s => sleepByDate.set(s.date, s.hours));

    const weightByDate = new Map<string, number>();
    weightLogs.forEach(w => weightByDate.set(w.date, w.weight_kg));

    const workoutByDate = new Set(workoutLogs.map(w => w.date));

    return dates.map(date => ({
      date,
      workHours: workByDate.get(date) || 0,
      sleepHours: sleepByDate.get(date) ?? null,
      weight: weightByDate.get(date) ?? null,
      workout: workoutByDate.has(date),
    }));
  }, [refreshKey]);

  // Export/Import
  const exportData = useCallback(() => {
    return localStorage.exportLocalData();
  }, []);

  const importData = useCallback((data: ReturnType<typeof localStorage.exportLocalData>) => {
    localStorage.importLocalData(data);
    refresh();
    toast.success('Data imported successfully');
  }, [refresh]);

  // Cloud Sync
  const syncToCloud = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to sync to cloud');
      return;
    }
    
    setIsSyncing(true);
    try {
      const data = localStorage.exportLocalData();
      
      // Sync each table to Supabase
      // Settings
      const { error: settingsError } = await supabase
        .from('settings')
        .upsert({ ...data.settings, user_id: user.id }, { onConflict: 'user_id' });
      if (settingsError) console.error('Settings sync error:', settingsError);

      // Categories - delete existing and insert new
      await supabase.from('categories').delete().eq('user_id', user.id);
      if (data.categories.length > 0) {
        const { error } = await supabase
          .from('categories')
          .insert(data.categories.map(c => ({ ...c, user_id: user.id })));
        if (error) console.error('Categories sync error:', error);
      }

      // Work Sessions
      await supabase.from('work_sessions').delete().eq('user_id', user.id);
      if (data.work_sessions.length > 0) {
        const { error } = await supabase
          .from('work_sessions')
          .insert(data.work_sessions.map(s => ({ ...s, user_id: user.id })));
        if (error) console.error('Work sessions sync error:', error);
      }

      // Sleep Logs
      await supabase.from('sleep_logs').delete().eq('user_id', user.id);
      if (data.sleep_logs.length > 0) {
        const { error } = await supabase
          .from('sleep_logs')
          .insert(data.sleep_logs.map(s => ({ ...s, user_id: user.id })));
        if (error) console.error('Sleep logs sync error:', error);
      }

      // Weight Logs
      await supabase.from('weight_logs').delete().eq('user_id', user.id);
      if (data.weight_logs.length > 0) {
        const { error } = await supabase
          .from('weight_logs')
          .insert(data.weight_logs.map(w => ({ ...w, user_id: user.id })));
        if (error) console.error('Weight logs sync error:', error);
      }

      // Workout Logs
      await supabase.from('workout_logs').delete().eq('user_id', user.id);
      if (data.workout_logs.length > 0) {
        const { error } = await supabase
          .from('workout_logs')
          .insert(data.workout_logs.map(w => ({ ...w, user_id: user.id })));
        if (error) console.error('Workout logs sync error:', error);
      }

      toast.success('Data synced to cloud');
    } catch (error) {
      console.error('Sync to cloud failed:', error);
      toast.error('Failed to sync to cloud');
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const syncFromCloud = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to sync from cloud');
      return;
    }
    
    setIsSyncing(true);
    try {
      // Fetch all data from Supabase
      const [settingsRes, categoriesRes, workRes, sleepRes, weightRes, workoutRes] = await Promise.all([
        supabase.from('settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('work_sessions').select('*').eq('user_id', user.id),
        supabase.from('sleep_logs').select('*').eq('user_id', user.id),
        supabase.from('weight_logs').select('*').eq('user_id', user.id),
        supabase.from('workout_logs').select('*').eq('user_id', user.id),
      ]);

      const data = {
        settings: settingsRes.data || localStorage.getLocalSettings(),
        categories: (categoriesRes.data || []) as Category[],
        work_sessions: (workRes.data || []) as WorkSession[],
        sleep_logs: (sleepRes.data || []) as SleepLog[],
        weight_logs: (weightRes.data || []) as WeightLog[],
        workout_logs: (workoutRes.data || []) as WorkoutLog[],
        exported_at: new Date().toISOString(),
      };

      localStorage.importLocalData(data);
      refresh();
      toast.success('Data synced from cloud');
    } catch (error) {
      console.error('Sync from cloud failed:', error);
      toast.error('Failed to sync from cloud');
    } finally {
      setIsSyncing(false);
    }
  }, [user, refresh]);

  const value: DataContextType = {
    settings,
    updateSettings,
    categories,
    addCategory,
    deleteCategory,
    addWorkSession,
    getWorkSessions,
    deleteWorkSession,
    addSleepLog,
    getSleepLogs,
    deleteSleepLog,
    addWeightLog,
    getWeightLogs,
    deleteWeightLog,
    addWorkoutLog,
    getWorkoutLogs,
    deleteWorkoutLog,
    getDashboardStats,
    getChartData,
    exportData,
    importData,
    syncToCloud,
    syncFromCloud,
    isSyncing,
    isOnline,
    refresh,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
