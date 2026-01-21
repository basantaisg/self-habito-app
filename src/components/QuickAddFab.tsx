import { useState } from 'react';
import { Plus, X, Moon, Scale, Dumbbell, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SleepLogForm } from './forms/SleepLogForm';
import { WeightLogForm } from './forms/WeightLogForm';
import { WorkoutLogForm } from './forms/WorkoutLogForm';
import { ManualWorkForm } from './forms/ManualWorkForm';

type FormType = 'sleep' | 'weight' | 'workout' | 'work' | null;

const quickActions = [
  { type: 'sleep' as const, icon: Moon, label: 'Sleep', color: 'from-info to-blue-400' },
  { type: 'weight' as const, icon: Scale, label: 'Weight', color: 'from-accent to-orange-400' },
  { type: 'workout' as const, icon: Dumbbell, label: 'Workout', color: 'from-success to-emerald-400' },
  { type: 'work' as const, icon: Clock, label: 'Work', color: 'from-primary to-cyan-400' },
];

export function QuickAddFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<FormType>(null);

  const handleActionClick = (type: FormType) => {
    setActiveForm(type);
    setIsOpen(false);
  };

  const handleFormSuccess = () => {
    setActiveForm(null);
  };

  return (
    <>
      {/* FAB and Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        {/* Quick action buttons */}
        <div className={cn(
          'absolute bottom-16 right-0 space-y-3 transition-all duration-200',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}>
          {quickActions.map((action, index) => (
            <button
              key={action.type}
              onClick={() => handleActionClick(action.type)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium shadow-lg animate-scale-in',
                `bg-gradient-to-r ${action.color} text-primary-foreground`
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </button>
          ))}
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'quick-action-fab',
            isOpen && 'rotate-45'
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-primary-foreground" />
          ) : (
            <Plus className="w-6 h-6 text-primary-foreground" />
          )}
        </button>
      </div>

      {/* Overlay when FAB is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Form Dialogs */}
      <Dialog open={activeForm === 'sleep'} onOpenChange={() => setActiveForm(null)}>
        <DialogContent className="sm:max-w-md">
          <SleepLogForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeForm === 'weight'} onOpenChange={() => setActiveForm(null)}>
        <DialogContent className="sm:max-w-md">
          <WeightLogForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeForm === 'workout'} onOpenChange={() => setActiveForm(null)}>
        <DialogContent className="sm:max-w-md">
          <WorkoutLogForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={activeForm === 'work'} onOpenChange={() => setActiveForm(null)}>
        <DialogContent className="sm:max-w-md">
          <ManualWorkForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
