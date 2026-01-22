import { useState } from 'react';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimerDisplay } from './TimerDisplay';
import { useTimer } from '@/hooks/use-timer';
import { useData } from '@/lib/data-context';
import { toast } from 'sonner';
import { SessionCompleteDialog } from './SessionCompleteDialog';

export function UltradianTimer() {
  const { settings, addWorkSession } = useData();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completedSession, setCompletedSession] = useState<{ duration: number; startTime: Date; endTime: Date } | null>(null);

  const timerSettings = {
    workMinutes: settings.ultradian_work_min ?? 90,
    breakMinutes: settings.ultradian_break_min ?? 20,
  };

  const handleWorkComplete = (duration: number, startTime: Date, endTime: Date) => {
    setCompletedSession({ duration, startTime, endTime });
    setShowCompleteDialog(true);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Ultradian Sprint Complete!', {
        body: `90 minutes of deep work done! Take a 20-minute break.`,
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
        'ultradian_work',
        categoryId,
        note
      );
      toast.success('Ultradian session logged!');
    } catch (error) {
      toast.error('Failed to save session');
    }
    
    setShowCompleteDialog(false);
    setCompletedSession(null);
  };

  const timer = useTimer({
    workMinutes: settings.workMinutes,
    breakMinutes: settings.breakMinutes,
    onWorkComplete: handleWorkComplete,
    onBreakComplete: () => {
      toast.success('Break over! Ready for another sprint?');
    },
    storageKey: 'ultradian-timer',
  });

  return (
    <div className="card-elevated space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ultradian Sprint</h2>
          <p className="text-sm text-muted-foreground">
            {settings.workMinutes}/{settings.breakMinutes} min deep work cycle
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
            Start Sprint
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
        sessionType="Ultradian"
      />
    </div>
  );
}
