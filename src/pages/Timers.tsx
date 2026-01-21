import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PomodoroTimer } from '@/components/timers/PomodoroTimer';
import { UltradianTimer } from '@/components/timers/UltradianTimer';
import { ManualTimer } from '@/components/timers/ManualTimer';
import { Timer, Zap, Clock } from 'lucide-react';

export default function Timers() {
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Timers</h1>
        <p className="text-muted-foreground">Track your focused work sessions</p>
      </div>

      <Tabs defaultValue="pomodoro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
          <TabsTrigger value="pomodoro" className="flex items-center gap-2 py-3">
            <Timer className="w-4 h-4" />
            <span className="hidden sm:inline">Pomodoro</span>
          </TabsTrigger>
          <TabsTrigger value="ultradian" className="flex items-center gap-2 py-3">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Ultradian</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2 py-3">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Manual</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pomodoro">
          <PomodoroTimer />
        </TabsContent>

        <TabsContent value="ultradian">
          <UltradianTimer />
        </TabsContent>

        <TabsContent value="manual">
          <ManualTimer />
        </TabsContent>
      </Tabs>

      {/* Timer Tips */}
      <div className="card-glass">
        <h3 className="font-semibold mb-2">Timer Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Pomodoro</strong>: 25min work + 5min break, great for task switching</li>
          <li>• <strong>Ultradian</strong>: 90min deep work + 20min break, ideal for complex tasks</li>
          <li>• <strong>Manual</strong>: Flexible timer for any work session length</li>
          <li>• Timers persist across page refreshes and tab switches</li>
        </ul>
      </div>
    </div>
  );
}
