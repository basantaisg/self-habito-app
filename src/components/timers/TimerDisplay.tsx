import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  hours?: number;
  minutes: number;
  seconds: number;
  isBreak?: boolean;
  isPaused?: boolean;
  progress?: number;
}

export function TimerDisplay({ 
  hours, 
  minutes, 
  seconds, 
  isBreak = false, 
  isPaused = false,
  progress = 0 
}: TimerDisplayProps) {
  const formatNumber = (n: number) => n.toString().padStart(2, '0');
  
  const radius = 140;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Progress Ring */}
      <svg
        height={radius * 2}
        width={radius * 2}
        className="progress-ring"
      >
        {/* Background circle */}
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          className="progress-ring-circle"
          stroke={isPaused ? 'hsl(var(--timer-paused))' : isBreak ? 'hsl(var(--timer-break))' : 'hsl(var(--timer-work))'}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      {/* Timer Text */}
      <div className="absolute flex flex-col items-center">
        <span 
          className={cn(
            hours !== undefined ? 'text-5xl' : 'text-7xl',
            'font-mono font-bold tracking-tighter',
            isPaused && 'animate-timer-tick'
          )}
          style={{
            textShadow: isPaused 
              ? '0 0 30px hsl(var(--timer-paused) / 0.4)'
              : isBreak 
                ? '0 0 30px hsl(var(--timer-break) / 0.4)'
                : '0 0 30px hsl(var(--timer-work) / 0.4)'
          }}
        >
          {hours !== undefined && `${formatNumber(hours)}:`}
          {formatNumber(minutes)}:{formatNumber(seconds)}
        </span>
        {isBreak && (
          <span className="text-sm text-success font-medium mt-2">Break Time</span>
        )}
        {isPaused && !isBreak && (
          <span className="text-sm text-warning font-medium mt-2">Paused</span>
        )}
      </div>
    </div>
  );
}
