import { useState, useEffect } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { Calendar, Clock, Moon, Scale, Dumbbell, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getWorkSessions,
  getSleepLogs,
  getWeightLogs,
  getWorkoutLogs,
  getCategories,
  deleteWorkSession,
  deleteSleepLog,
  deleteWeightLog,
  deleteWorkoutLog,
} from '@/lib/queries';
import type { WorkSession, SleepLog, WeightLog, WorkoutLog, Category } from '@/types/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type LogType = 'all' | 'work' | 'sleep' | 'weight' | 'workout';

interface HistoryEntry {
  id: string;
  type: LogType;
  date: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onDelete: () => Promise<void>;
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<LogType>('all');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = async () => {
    setLoading(true);
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const [workData, sleepData, weightData, workoutData, catData] = await Promise.all([
      getWorkSessions(start, end),
      getSleepLogs(start, end),
      getWeightLogs(start, end),
      getWorkoutLogs(start, end),
      getCategories(),
    ]);

    setCategories(catData);

    const allEntries: HistoryEntry[] = [];

    // Map work sessions
    workData.forEach((w) => {
      const cat = catData.find(c => c.id === w.category_id);
      allEntries.push({
        id: w.id,
        type: 'work',
        date: w.date,
        title: `${w.duration_minutes} min ${w.session_type.replace('_', ' ')}`,
        subtitle: cat ? cat.name : (w.note || 'No category'),
        icon: <Clock className="w-4 h-4 text-primary" />,
        onDelete: async () => {
          await deleteWorkSession(w.id);
          toast.success('Work session deleted');
        },
      });
    });

    // Map sleep logs
    sleepData.forEach((s) => {
      allEntries.push({
        id: s.id,
        type: 'sleep',
        date: s.date,
        title: `${s.hours}h sleep`,
        subtitle: s.quality ? `Quality: ${s.quality}/5` : (s.note || 'No details'),
        icon: <Moon className="w-4 h-4 text-info" />,
        onDelete: async () => {
          await deleteSleepLog(s.id);
          toast.success('Sleep log deleted');
        },
      });
    });

    // Map weight logs
    weightData.forEach((w) => {
      allEntries.push({
        id: w.id,
        type: 'weight',
        date: w.date,
        title: `${w.weight_kg} kg`,
        subtitle: 'Morning weight',
        icon: <Scale className="w-4 h-4 text-accent" />,
        onDelete: async () => {
          await deleteWeightLog(w.id);
          toast.success('Weight log deleted');
        },
      });
    });

    // Map workout logs
    workoutData.forEach((w) => {
      allEntries.push({
        id: w.id,
        type: 'workout',
        date: w.date,
        title: `${w.workout_type} • ${w.duration_minutes} min`,
        subtitle: w.intensity ? `Intensity: ${w.intensity}/5` : (w.note || 'No details'),
        icon: <Dumbbell className="w-4 h-4 text-success" />,
        onDelete: async () => {
          await deleteWorkoutLog(w.id);
          toast.success('Workout log deleted');
        },
      });
    });

    // Sort by date descending
    allEntries.sort((a, b) => b.date.localeCompare(a.date));

    setEntries(allEntries);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const filteredEntries = filterType === 'all' 
    ? entries 
    : entries.filter(e => e.type === filterType);

  const handleDelete = async (entry: HistoryEntry) => {
    try {
      await entry.onDelete();
      loadData();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  // Group entries by date
  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, HistoryEntry[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">History</h1>
          <p className="text-muted-foreground">View and manage your log entries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as LogType)}>
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="work">Work Sessions</SelectItem>
                <SelectItem value="sleep">Sleep Logs</SelectItem>
                <SelectItem value="weight">Weight Logs</SelectItem>
                <SelectItem value="workout">Workout Logs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-muted/50"
            />
          </div>
        </div>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-elevated animate-pulse">
              <div className="h-16 bg-muted/30 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No entries found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or add some log entries.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {dateEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="card-glass flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted/50">
                        {entry.icon}
                      </div>
                      <div>
                        <p className="font-medium">{entry.title}</p>
                        <p className="text-sm text-muted-foreground">{entry.subtitle}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(entry)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
