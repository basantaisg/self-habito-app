import { useState, useEffect } from 'react';
import { Play, Pause, Square, SkipForward, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimerDisplay } from './TimerDisplay';
import { useTimer } from '@/hooks/use-timer';
import { addWorkSession } from '@/lib/queries';
import { getSettings } from '@/lib/queries';
import { toast } from 'sonner';
import { SessionCompleteDialog } from './SessionCompleteDialog';

export function PomodoroTimer() {
  const [settings, setSettings] = useState({
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
  });
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completedSession, setCompletedSession] = useState<{ duration: number; startTime: Date; endTime: Date } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const s = await getSettings();
      if (s) {
        setSettings({
          workMinutes: s.pomodoro_work_min,
          breakMinutes: s.pomodoro_break_min,
          longBreakMinutes: s.pomodoro_long_break_min,
          cyclesBeforeLongBreak: s.pomodoro_cycles_before_long,
        });
      }
    }
    loadSettings();
  }, []);

  const handleWorkComplete = (duration: number, startTime: Date, endTime: Date) => {
    setCompletedSession({ duration, startTime, endTime });
    setShowCompleteDialog(true);
    
    // Play notification sound if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: `Great work! Take a break.`,
        icon: '/favicon.ico',
      });
    }
  };

  const handleSaveSession = async (categoryId?: string, note?: string) => {
    if (!completedSession) return;
    
    try {
      await addWorkSession(
        completedSession.startTime,
        completedSession.endTime,
        completedSession.duration,
        'pomodoro_work',
        categoryId,
        note
      );
      toast.success('Work session logged!');
    } catch (error) {
      toast.error('Failed to save session');
    }
    
    setShowCompleteDialog(false);
    setCompletedSession(null);
  };

  const timer = useTimer({
    workMinutes: settings.workMinutes,
    breakMinutes: settings.breakMinutes,
    longBreakMinutes: settings.longBreakMinutes,
    cyclesBeforeLongBreak: settings.cyclesBeforeLongBreak,
    onWorkComplete: handleWorkComplete,
    onBreakComplete: () => {
      toast.success('Break over! Ready for another session?');
    },
    storageKey: 'pomodoro-timer',
  });

  return (
    <div className="card-elevated space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pomodoro Timer</h2>
          <p className="text-sm text-muted-foreground">
            {settings.workMinutes}/{settings.breakMinutes} min • Cycle {timer.cyclesCompleted + 1}
          </p>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <TimerDisplay
          minutes={timer.minutes}
          seconds={timer.seconds}
          isBreak={timer.isBreak}
          isPaused={timer.status === 'paused'}
          progress={timer.progress}
        />
      </div>

      <div className="flex justify-center gap-4">
        {timer.status === 'idle' && (
          <Button
            size="lg"
            onClick={timer.start}
            className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            Start
          </Button>
        )}

        {timer.status === 'running' && (
          <Button
            size="lg"
            variant="outline"
            onClick={timer.pause}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Pause className="w-5 h-5 mr-2" />
            Pause
          </Button>
        )}

        {timer.status === 'paused' && (
          <>
            <Button
              size="lg"
              onClick={timer.resume}
              className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={timer.stop}
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </>
        )}

        {timer.status === 'running' && timer.isBreak && (
          <Button
            size="lg"
            variant="outline"
            onClick={timer.skipBreak}
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Skip Break
          </Button>
        )}

        {timer.status === 'running' && !timer.isBreak && (
          <Button
            size="lg"
            variant="destructive"
            onClick={timer.stop}
          >
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>
        )}
      </div>

      <SessionCompleteDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onSave={handleSaveSession}
        duration={completedSession?.duration || 0}
        sessionType="Pomodoro"
      />
    </div>
  );
}
