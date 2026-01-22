// LocalStorage-based data persistence with cloud sync capability
import type { Settings, Category, WorkSession, SleepLog, WeightLog, WorkoutLog, SessionType } from '@/types/database';

const STORAGE_KEYS = {
  settings: 'habito_settings',
  categories: 'habito_categories',
  workSessions: 'habito_work_sessions',
  sleepLogs: 'habito_sleep_logs',
  weightLogs: 'habito_weight_logs',
  workoutLogs: 'habito_workout_logs',
  lastSync: 'habito_last_sync',
} as const;

// Helper to generate UUIDs
function generateId(): string {
  return crypto.randomUUID();
}

// Generic storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: generateId(), name: 'Physics', sort_order: 0, created_at: new Date().toISOString() },
  { id: generateId(), name: 'Chemistry', sort_order: 1, created_at: new Date().toISOString() },
  { id: generateId(), name: 'Math', sort_order: 2, created_at: new Date().toISOString() },
  { id: generateId(), name: 'English', sort_order: 3, created_at: new Date().toISOString() },
  { id: generateId(), name: 'Video Editing', sort_order: 4, created_at: new Date().toISOString() },
  { id: generateId(), name: 'Other', sort_order: 5, created_at: new Date().toISOString() },
];

// Default settings
const DEFAULT_SETTINGS: Settings = {
  id: 1,
  pomodoro_work_min: 25,
  pomodoro_break_min: 5,
  pomodoro_long_break_min: 15,
  pomodoro_cycles_before_long: 4,
  ultradian_work_min: 90,
  ultradian_break_min: 20,
  start_weight_kg: null,
  goal_weight_kg: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Settings
export function getLocalSettings(): Settings {
  return getFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function updateLocalSettings(updates: Partial<Settings>): Settings {
  const current = getLocalSettings();
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  saveToStorage(STORAGE_KEYS.settings, updated);
  return updated;
}

// Categories
export function getLocalCategories(): Category[] {
  const stored = getFromStorage<Category[]>(STORAGE_KEYS.categories, []);
  if (stored.length === 0) {
    // Initialize with defaults
    saveToStorage(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return stored;
}

export function addLocalCategory(name: string): Category {
  const categories = getLocalCategories();
  const maxOrder = Math.max(...categories.map(c => c.sort_order ?? 0), -1);
  const newCategory: Category = {
    id: generateId(),
    name,
    sort_order: maxOrder + 1,
    created_at: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.categories, [...categories, newCategory]);
  return newCategory;
}

export function deleteLocalCategory(id: string): void {
  const categories = getLocalCategories();
  saveToStorage(STORAGE_KEYS.categories, categories.filter(c => c.id !== id));
}

// Work Sessions
export function getLocalWorkSessions(): WorkSession[] {
  return getFromStorage<WorkSession[]>(STORAGE_KEYS.workSessions, []);
}

export function addLocalWorkSession(
  startTime: Date,
  endTime: Date,
  durationMinutes: number,
  sessionType: SessionType,
  categoryId?: string,
  note?: string
): WorkSession {
  const sessions = getLocalWorkSessions();
  const newSession: WorkSession = {
    id: generateId(),
    date: startTime.toISOString().split('T')[0],
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    duration_minutes: durationMinutes,
    session_type: sessionType,
    category_id: categoryId ?? null,
    note: note ?? null,
    created_at: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.workSessions, [...sessions, newSession]);
  return newSession;
}

export function deleteLocalWorkSession(id: string): void {
  const sessions = getLocalWorkSessions();
  saveToStorage(STORAGE_KEYS.workSessions, sessions.filter(s => s.id !== id));
}

// Sleep Logs
export function getLocalSleepLogs(): SleepLog[] {
  return getFromStorage<SleepLog[]>(STORAGE_KEYS.sleepLogs, []);
}

export function addLocalSleepLog(
  date: string,
  hours: number,
  bedtime?: string,
  wakeTime?: string,
  quality?: number,
  note?: string
): SleepLog {
  const logs = getLocalSleepLogs();
  const newLog: SleepLog = {
    id: generateId(),
    date,
    hours,
    bedtime: bedtime ?? null,
    wake_time: wakeTime ?? null,
    quality: quality ?? null,
    note: note ?? null,
    created_at: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.sleepLogs, [...logs, newLog]);
  return newLog;
}

export function deleteLocalSleepLog(id: string): void {
  const logs = getLocalSleepLogs();
  saveToStorage(STORAGE_KEYS.sleepLogs, logs.filter(l => l.id !== id));
}

// Weight Logs
export function getLocalWeightLogs(): WeightLog[] {
  return getFromStorage<WeightLog[]>(STORAGE_KEYS.weightLogs, []);
}

export function addLocalWeightLog(date: string, weightKg: number): WeightLog {
  const logs = getLocalWeightLogs();
  // Check if entry exists for this date
  const existingIndex = logs.findIndex(l => l.date === date);
  
  if (existingIndex >= 0) {
    logs[existingIndex].weight_kg = weightKg;
    saveToStorage(STORAGE_KEYS.weightLogs, logs);
    return logs[existingIndex];
  }
  
  const newLog: WeightLog = {
    id: generateId(),
    date,
    weight_kg: weightKg,
    created_at: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.weightLogs, [...logs, newLog]);
  return newLog;
}

export function deleteLocalWeightLog(id: string): void {
  const logs = getLocalWeightLogs();
  saveToStorage(STORAGE_KEYS.weightLogs, logs.filter(l => l.id !== id));
}

// Workout Logs
export function getLocalWorkoutLogs(): WorkoutLog[] {
  return getFromStorage<WorkoutLog[]>(STORAGE_KEYS.workoutLogs, []);
}

export function addLocalWorkoutLog(
  date: string,
  workoutType: string,
  durationMinutes: number,
  intensity?: number,
  note?: string
): WorkoutLog {
  const logs = getLocalWorkoutLogs();
  const newLog: WorkoutLog = {
    id: generateId(),
    date,
    workout_type: workoutType,
    duration_minutes: durationMinutes,
    intensity: intensity ?? null,
    note: note ?? null,
    created_at: new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.workoutLogs, [...logs, newLog]);
  return newLog;
}

export function deleteLocalWorkoutLog(id: string): void {
  const logs = getLocalWorkoutLogs();
  saveToStorage(STORAGE_KEYS.workoutLogs, logs.filter(l => l.id !== id));
}

// Export all data
export function exportLocalData() {
  return {
    settings: getLocalSettings(),
    categories: getLocalCategories(),
    work_sessions: getLocalWorkSessions(),
    sleep_logs: getLocalSleepLogs(),
    weight_logs: getLocalWeightLogs(),
    workout_logs: getLocalWorkoutLogs(),
    exported_at: new Date().toISOString(),
  };
}

// Import data
export function importLocalData(data: ReturnType<typeof exportLocalData>): void {
  if (data.settings) saveToStorage(STORAGE_KEYS.settings, data.settings);
  if (data.categories) saveToStorage(STORAGE_KEYS.categories, data.categories);
  if (data.work_sessions) saveToStorage(STORAGE_KEYS.workSessions, data.work_sessions);
  if (data.sleep_logs) saveToStorage(STORAGE_KEYS.sleepLogs, data.sleep_logs);
  if (data.weight_logs) saveToStorage(STORAGE_KEYS.weightLogs, data.weight_logs);
  if (data.workout_logs) saveToStorage(STORAGE_KEYS.workoutLogs, data.workout_logs);
}

// Clear all local data
export function clearLocalData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
