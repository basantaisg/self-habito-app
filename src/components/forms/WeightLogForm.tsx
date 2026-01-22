import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/lib/data-context';
import { toast } from 'sonner';
import { Scale } from 'lucide-react';

const weightSchema = z.object({
  date: z.string(),
  weightKg: z.coerce.number().min(20).max(300),
});

type WeightFormData = z.infer<typeof weightSchema>;

interface WeightLogFormProps {
  onSuccess?: () => void;
}

export function WeightLogForm({ onSuccess }: WeightLogFormProps) {
  const { addWeightLog } = useData();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WeightFormData>({
    resolver: zodResolver(weightSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = async (data: WeightFormData) => {
    setLoading(true);
    try {
      await addWeightLog(data.date, data.weightKg);
      toast.success('Weight logged!');
      reset({ date: format(new Date(), 'yyyy-MM-dd') });
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to log weight');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Scale className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-lg font-semibold">Log Weight</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weight-date">Date</Label>
          <Input
            id="weight-date"
            type="date"
            {...register('date')}
            className="bg-muted/50"
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            {...register('weightKg')}
            placeholder="70.0"
            className="bg-muted/50"
          />
          {errors.weightKg && <p className="text-sm text-destructive">{errors.weightKg.message}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-accent to-orange-400 text-accent-foreground"
      >
        {loading ? 'Saving...' : 'Log Weight'}
      </Button>
    </form>
  );
}