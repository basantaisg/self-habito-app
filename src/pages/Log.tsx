import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SleepLogForm } from '@/components/forms/SleepLogForm';
import { WeightLogForm } from '@/components/forms/WeightLogForm';
import { WorkoutLogForm } from '@/components/forms/WorkoutLogForm';
import { ManualWorkForm } from '@/components/forms/ManualWorkForm';
import { Moon, Scale, Dumbbell, Clock } from 'lucide-react';

export default function Log() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Quick Log</h1>
        <p className="text-muted-foreground">Add entries to your daily log</p>
      </div>

      <Tabs defaultValue="sleep" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="sleep" className="flex items-center gap-2 py-3">
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">Sleep</span>
          </TabsTrigger>
          <TabsTrigger value="weight" className="flex items-center gap-2 py-3">
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Weight</span>
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center gap-2 py-3">
            <Dumbbell className="w-4 h-4" />
            <span className="hidden sm:inline">Workout</span>
          </TabsTrigger>
          <TabsTrigger value="work" className="flex items-center gap-2 py-3">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Work</span>
          </TabsTrigger>
        </TabsList>

        <div className="max-w-md mx-auto">
          <TabsContent value="sleep">
            <div className="card-elevated">
              <SleepLogForm />
            </div>
          </TabsContent>

          <TabsContent value="weight">
            <div className="card-elevated">
              <WeightLogForm />
            </div>
          </TabsContent>

          <TabsContent value="workout">
            <div className="card-elevated">
              <WorkoutLogForm />
            </div>
          </TabsContent>

          <TabsContent value="work">
            <div className="card-elevated">
              <ManualWorkForm />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
