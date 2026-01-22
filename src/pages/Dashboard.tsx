import { Clock, Moon, Scale, Dumbbell, Flame, Timer, Zap } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { useData } from '@/lib/data-context';

export default function Dashboard() {
  const { getDashboardStats, settings } = useData();
  const stats = getDashboardStats();

  const weightChange = settings?.start_weight_kg && stats?.weightToday
    ? (stats.weightToday - settings.start_weight_kg).toFixed(1)
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your progress at a glance</p>
        </div>
        {stats && stats.loggingStreak > 0 && (
          <div className="streak-badge">
            <Flame className="w-5 h-5" />
            <span>{stats.loggingStreak} day streak</span>
          </div>
        )}
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Work Today"
          value={`${stats?.workHoursToday.toFixed(1)}h`}
          subtitle="Total focused time"
          icon={<Clock className="w-6 h-6 text-primary" />}
        />
        
        <StatCard
          title="Sleep Last Night"
          value={stats?.sleepLastNight ? `${stats.sleepLastNight}h` : '—'}
          subtitle={stats?.sleepLastNight && stats.sleepLastNight >= 7 ? 'Well rested' : 'Log your sleep'}
          icon={<Moon className="w-6 h-6 text-info" />}
        />
        
        <StatCard
          title="Weight Today"
          value={stats?.weightToday ? `${stats.weightToday}kg` : '—'}
          subtitle={weightChange ? `${Number(weightChange) > 0 ? '+' : ''}${weightChange}kg from start` : 'Log your weight'}
          trend={weightChange ? (Number(weightChange) < 0 ? 'up' : Number(weightChange) > 0 ? 'down' : 'neutral') : undefined}
          icon={<Scale className="w-6 h-6 text-accent" />}
        />
        
        <StatCard
          title="Workout Today"
          value={stats?.workoutToday ? '✓' : '—'}
          subtitle={stats?.workoutToday ? `${stats.workoutToday.workout_type} • ${stats.workoutToday.duration_minutes}min` : 'No workout yet'}
          icon={<Dumbbell className="w-6 h-6 text-success" />}
        />
      </div>

      {/* Timer Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Pomodoro Minutes"
          value={stats?.pomodoroMinutesToday || 0}
          subtitle="Today's focused pomodoros"
          icon={<Timer className="w-6 h-6 text-primary" />}
        />
        
        <StatCard
          title="Ultradian Minutes"
          value={stats?.ultradianMinutesToday || 0}
          subtitle="Today's deep work sprints"
          icon={<Zap className="w-6 h-6 text-warning" />}
        />
      </div>

      {/* Charts */}
      <DashboardCharts />
    </div>
  );
}