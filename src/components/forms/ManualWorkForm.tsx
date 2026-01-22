import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/lib/data-context';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';

const workSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  note: z.string().max(500).optional(),
});

type WorkFormData = z.infer<typeof workSchema>;

interface ManualWorkFormProps {
  onSuccess?: () => void;
}

export function ManualWorkForm({ onSuccess }: ManualWorkFormProps) {
  const { addWorkSession, categories } = useData();
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkFormData>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = async (data: WorkFormData) => {
    setLoading(true);
    try {
      const startTime = new Date(`${data.date}T${data.startTime}`);
      const endTime = new Date(`${data.date}T${data.endTime}`);
      
      if (endTime <= startTime) {
        toast.error('End time must be after start time');
        setLoading(false);
        return;
      }

      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

      await addWorkSession(
        startTime,
        endTime,
        durationMinutes,
        'manual_work',
        categoryId || undefined,
        data.note
      );
      toast.success('Work session logged!');
      reset({ date: format(new Date(), 'yyyy-MM-dd') });
      setCategoryId('');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to log work session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Log Work Session</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="work-date">Date</Label>
        <Input
          id="work-date"
          type="date"
          {...register('date')}
          className="bg-muted/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            {...register('startTime')}
            className="bg-muted/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            {...register('endTime')}
            className="bg-muted/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="bg-muted/50">
            <SelectValue placeholder="Select category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="work-note">Note (optional)</Label>
        <Input
          id="work-note"
          {...register('note')}
          placeholder="What did you work on?"
          className="bg-muted/50"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
      >
        {loading ? 'Saving...' : 'Log Session'}
      </Button>
    </form>
  );
}