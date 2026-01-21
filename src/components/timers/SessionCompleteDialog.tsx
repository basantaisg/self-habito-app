import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategories } from '@/lib/queries';
import type { Category } from '@/types/database';
import { CheckCircle2 } from 'lucide-react';

interface SessionCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (categoryId?: string, note?: string) => void;
  duration: number;
  sessionType: string;
}

export function SessionCompleteDialog({
  open,
  onOpenChange,
  onSave,
  duration,
  sessionType,
}: SessionCompleteDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      getCategories().then(setCategories);
      setCategoryId('');
      setNote('');
    }
  }, [open]);

  const handleSave = () => {
    onSave(categoryId || undefined, note || undefined);
  };

  const handleSkip = () => {
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <DialogTitle>{sessionType} Complete!</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {duration} minutes of focused work
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you work on?"
              className="bg-muted/50"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground">
            Save Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
