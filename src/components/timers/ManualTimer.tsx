import { useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimerDisplay } from './TimerDisplay';
import { useStopwatch } from '@/hooks/use-stopwatch';
import { useData } from '@/lib/data-context';
import { toast } from 'sonner';
import { SessionCompleteDialog } from './SessionCompleteDialog';

export function ManualTimer() {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completedSession, setCompletedSession] = useState<{ duration: number; startTime: Date; endTime: Date } | null>(null);

  const handleStop = (duration: number, startTime: Date, endTime: Date) => {
    setCompletedSession({ duration, startTime, endTime });
    setShowCompleteDialog(true);
  };

  const handleSaveSession = async (categoryId?: string, note?: string) => {
    if (!completedSession) return;
    
    try {
      await addWorkSession(
        completedSession.startTime,
        completedSession.endTime,
        completedSession.duration,
        'manual_work',
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

  const stopwatch = useStopwatch({
    onStop: handleStop,
    storageKey: 'manual-timer',
  });

  // Calculate progress (max at 4 hours for visual)
  const maxMinutes = 240;
  const elapsedMinutes = stopwatch.elapsed / 1000 / 60;
  const progress = Math.min((elapsedMinutes / maxMinutes) * 100, 100);

  return (
    <div className="card-elevated space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manual Timer</h2>
          <p className="text-sm text-muted-foreground">
            Track deep work sessions freely
          </p>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <TimerDisplay
          hours={stopwatch.hours}
          minutes={stopwatch.minutes}
          seconds={stopwatch.seconds}
          isPaused={stopwatch.status === 'paused'}
          progress={progress}
        />
      </div>

      <div className="flex justify-center gap-4">
        {stopwatch.status === 'idle' && (
          <Button
            size="lg"
            onClick={stopwatch.start}
            className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground px-8"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Working
          </Button>
        )}

        {stopwatch.status === 'running' && (
          <>
            <Button
              size="lg"
              variant="outline"
              onClick={stopwatch.pause}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={stopwatch.stop}
            >
              <Square className="w-5 h-5 mr-2" />
              Stop & Save
            </Button>
          </>
        )}

        {stopwatch.status === 'paused' && (
          <>
            <Button
              size="lg"
              onClick={stopwatch.resume}
              className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={stopwatch.stop}
            >
              <Square className="w-5 h-5 mr-2" />
              Stop & Save
            </Button>
          </>
        )}
      </div>

      <SessionCompleteDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onSave={handleSaveSession}
        duration={completedSession?.duration || 0}
        sessionType="Manual Work"
      />
    </div>
  );
}
