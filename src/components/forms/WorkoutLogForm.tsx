import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addWorkoutLog } from '@/lib/queries';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

const workoutSchema = z.object({
  date: z.string(),
  workoutType: z.string().min(1, 'Select a workout type'),
  durationMinutes: z.coerce.number().min(1).max(600),
  note: z.string().max(500).optional(),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

const workoutTypes = ['Home', 'Gym', 'Run', 'Walk', 'Cycling', 'Swimming', 'Yoga', 'Other'];

interface WorkoutLogFormProps {
  onSuccess?: () => void;
}

export function WorkoutLogForm({ onSuccess }: WorkoutLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [intensity, setIntensity] = useState<number>(3);
  const [workoutType, setWorkoutType] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      durationMinutes: 30,
    },
  });

  const onSubmit = async (data: WorkoutFormData) => {
    if (!workoutType) {
      toast.error('Please select a workout type');
      return;
    }

    setLoading(true);
    try {
      await addWorkoutLog(
        data.date,
        workoutType,
        data.durationMinutes,
        intensity,
        data.note
      );
      toast.success('Workout logged!');
      reset({ date: format(new Date(), 'yyyy-MM-dd'), durationMinutes: 30 });
      setWorkoutType('');
      setIntensity(3);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  const intensityLabels = ['Light', 'Easy', 'Moderate', 'Hard', 'Intense'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-success/20">
          <Dumbbell className="w-5 h-5 text-success" />
        </div>
        <h3 className="text-lg font-semibold">Log Workout</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="workout-date">Date</Label>
          <Input
            id="workout-date"
            type="date"
            {...register('date')}
            className="bg-muted/50"
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Workout Type</Label>
          <Select value={workoutType} onValueChange={setWorkoutType}>
            <SelectTrigger className="bg-muted/50">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {workoutTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          {...register('durationMinutes')}
          className="bg-muted/50"
        />
        {errors.durationMinutes && <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Intensity</Label>
          <span className="text-sm text-muted-foreground">{intensityLabels[intensity - 1]}</span>
        </div>
        <Slider
          value={[intensity]}
          onValueChange={([v]) => setIntensity(v)}
          min={1}
          max={5}
          step={1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="workout-note">Note (optional)</Label>
        <Input
          id="workout-note"
          {...register('note')}
          placeholder="What did you do?"
          className="bg-muted/50"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-success to-emerald-400 text-primary-foreground"
      >
        {loading ? 'Saving...' : 'Log Workout'}
      </Button>
    </form>
  );
}
