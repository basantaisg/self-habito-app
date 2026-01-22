import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings2, Timer, Scale, Tag, Download, Upload, Plus, X, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const settingsSchema = z.object({
  startWeightKg: z.coerce.number().min(20).max(300).optional().nullable(),
  goalWeightKg: z.coerce.number().min(20).max(300).optional().nullable(),
  pomodoroWorkMin: z.coerce.number().min(1).max(120),
  pomodoroBreakMin: z.coerce.number().min(1).max(60),
  pomodoroLongBreakMin: z.coerce.number().min(1).max(60),
  pomodoroCyclesBeforeLong: z.coerce.number().min(1).max(10),
  ultradianWorkMin: z.coerce.number().min(1).max(180),
  ultradianBreakMin: z.coerce.number().min(1).max(60),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { 
    settings, 
    updateSettings, 
    categories, 
    addCategory: addCat, 
    deleteCategory: deleteCat,
    exportData,
    importData,
    syncToCloud,
    syncFromCloud,
    isSyncing,
    isOnline
  } = useData();
  
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      startWeightKg: settings.start_weight_kg,
      goalWeightKg: settings.goal_weight_kg,
      pomodoroWorkMin: settings.pomodoro_work_min ?? 25,
      pomodoroBreakMin: settings.pomodoro_break_min ?? 5,
      pomodoroLongBreakMin: settings.pomodoro_long_break_min ?? 15,
      pomodoroCyclesBeforeLong: settings.pomodoro_cycles_before_long ?? 4,
      ultradianWorkMin: settings.ultradian_work_min ?? 90,
      ultradianBreakMin: settings.ultradian_break_min ?? 20,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      await updateSettings({
        start_weight_kg: data.startWeightKg || null,
        goal_weight_kg: data.goalWeightKg || null,
        pomodoro_work_min: data.pomodoroWorkMin,
        pomodoro_break_min: data.pomodoroBreakMin,
        pomodoro_long_break_min: data.pomodoroLongBreakMin,
        pomodoro_cycles_before_long: data.pomodoroCyclesBeforeLong,
        ultradian_work_min: data.ultradianWorkMin,
        ultradian_break_min: data.ultradianBreakMin,
      });
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      await addCat(newCategory.trim());
      setNewCategory('');
      toast.success('Category added!');
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCat(id);
      toast.success('Category deleted');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importData(data);
      } catch (error) {
        toast.error('Failed to import data - invalid file format');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your tracker preferences</p>
      </div>

      {/* Storage Status */}
      <div className="card-elevated space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Cloud className="w-5 h-5 text-success" />
            ) : (
              <CloudOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <h2 className="text-lg font-semibold">Storage</h2>
              <p className="text-sm text-muted-foreground">
                Data stored locally • {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        {user ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncToCloud}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync to Cloud
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={syncFromCloud}
              disabled={isSyncing}
            >
              <Download className="w-4 h-4 mr-2" />
              Sync from Cloud
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sign in to enable cloud sync (optional)
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Weight Goals */}
        <div className="card-elevated space-y-4">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Weight Goals</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startWeight">Starting Weight (kg)</Label>
              <Input
                id="startWeight"
                type="number"
                step="0.1"
                {...register('startWeightKg')}
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalWeight">Goal Weight (kg)</Label>
              <Input
                id="goalWeight"
                type="number"
                step="0.1"
                {...register('goalWeightKg')}
                className="bg-muted/50"
              />
            </div>
          </div>
        </div>

        {/* Timer Presets */}
        <div className="card-elevated space-y-4">
          <div className="flex items-center gap-3">
            <Timer className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Timer Presets</h2>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pomodoro Timer</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Work (min)</Label>
                <Input
                  type="number"
                  {...register('pomodoroWorkMin')}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Break (min)</Label>
                <Input
                  type="number"
                  {...register('pomodoroBreakMin')}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Long Break (min)</Label>
                <Input
                  type="number"
                  {...register('pomodoroLongBreakMin')}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Cycles</Label>
                <Input
                  type="number"
                  {...register('pomodoroCyclesBeforeLong')}
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Ultradian Timer</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Work (min)</Label>
                <Input
                  type="number"
                  {...register('ultradianWorkMin')}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Break (min)</Label>
                <Input
                  type="number"
                  {...register('ultradianBreakMin')}
                  className="bg-muted/50"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Categories */}
      <div className="card-elevated space-y-4">
        <div className="flex items-center gap-3">
          <Tag className="w-5 h-5 text-info" />
          <h2 className="text-lg font-semibold">Work Categories</h2>
        </div>

        <div className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="bg-muted/50"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
          />
          <Button onClick={handleAddCategory} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-sm"
            >
              <span>{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card-elevated space-y-4">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Data Management</h2>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}