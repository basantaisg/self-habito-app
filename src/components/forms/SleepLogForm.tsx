import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useData } from '@/lib/data-context';
import { toast } from 'sonner';
import { Moon } from 'lucide-react';

const sleepSchema = z.object({
  date: z.string(),
  hours: z.coerce.number().min(0).max(24),
  bedtime: z.string().optional(),
  wakeTime: z.string().optional(),
  quality: z.coerce.number().min(1).max(5).optional(),
  note: z.string().max(500).optional(),
});

type SleepFormData = z.infer<typeof sleepSchema>;

interface SleepLogFormProps {
  onSuccess?: () => void;
}

export function SleepLogForm({ onSuccess }: SleepLogFormProps) {
  const { addSleepLog } = useData();
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState<number>(3);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SleepFormData>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      hours: 7,
    },
  });

  const onSubmit = async (data: SleepFormData) => {
    setLoading(true);
    try {
      await addSleepLog(
        data.date,
        data.hours,
        data.bedtime,
        data.wakeTime,
        quality,
        data.note
      );
      toast.success('Sleep logged!');
      reset();
      setQuality(3);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to log sleep');
    } finally {
      setLoading(false);
    }
  };

  const qualityLabels = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-info/20">
          <Moon className="w-5 h-5 text-info" />
        </div>
        <h3 className="text-lg font-semibold">Log Sleep</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sleep-date">Night of</Label>
          <Input
            id="sleep-date"
            type="date"
            {...register('date')}
            className="bg-muted/50"
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hours">Hours Slept</Label>
          <Input
            id="hours"
            type="number"
            step="0.5"
            {...register('hours')}
            className="bg-muted/50"
          />
          {errors.hours && <p className="text-sm text-destructive">{errors.hours.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedtime">Bedtime (optional)</Label>
          <Input
            id="bedtime"
            type="time"
            {...register('bedtime')}
            className="bg-muted/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wake-time">Wake Time (optional)</Label>
          <Input
            id="wake-time"
            type="time"
            {...register('wakeTime')}
            className="bg-muted/50"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Sleep Quality</Label>
          <span className="text-sm text-muted-foreground">{qualityLabels[quality - 1]}</span>
        </div>
        <Slider
          value={[quality]}
          onValueChange={([v]) => setQuality(v)}
          min={1}
          max={5}
          step={1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sleep-note">Note (optional)</Label>
        <Input
          id="sleep-note"
          {...register('note')}
          placeholder="How did you sleep?"
          className="bg-muted/50"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-info to-blue-400 text-primary-foreground"
      >
        {loading ? 'Saving...' : 'Log Sleep'}
      </Button>
    </form>
  );
}