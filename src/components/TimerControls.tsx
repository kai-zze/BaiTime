import type { TimerStatus } from '../types/timer';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, PlusCircle, Lock } from 'lucide-react';

interface TimerControlsProps {
  status: TimerStatus;
  isHost: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onNextSpeaker: () => void;
  onPrevSpeaker: () => void;
  onAddBonusTime: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  isHost,
  onStart,
  onPause,
  onReset,
  onNextSpeaker,
  onPrevSpeaker,
  onAddBonusTime,
}) => {
  if (!isHost) {
    return (
      <div className="w-full flat-panel rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xl shadow-indigo-950/10 dark:shadow-black/40 border border-gray-200/80 dark:border-indigo-900/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200">
          <Lock className="w-4 h-4 text-[#FF5B00] animate-pulse shrink-0" />
          <span>Timer controls managed by <strong className="text-[#0C1838] dark:text-white">Host</strong>. Synced live.</span>
        </div>
        <span className="text-[10px] font-mono font-black bg-[#FF5B00]/10 text-[#FF5B00] px-2.5 py-1 rounded-full border border-[#FF5B00]/30 shrink-0">
          READ-ONLY
        </span>
      </div>
    );
  }

  const isRunning = status === 'running';

  return (
    <div className="w-full flat-panel rounded-2xl p-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 transition-colors shadow-xl shadow-indigo-950/10 dark:shadow-black/40 border border-gray-200/80 dark:border-indigo-900/60">

      {/* Primary: Start (Emerald Green) / Pause (Amber Gold) */}
      <div className="w-full sm:w-auto order-1 sm:order-2 flex justify-center">
        {isRunning ? (
          <button
            onClick={onPause}
            className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black uppercase tracking-wider border border-amber-600 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pause Timer</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black uppercase tracking-wider border border-emerald-600 transition-all active:scale-95 animate-pulse-ring shadow-sm cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Defense Timer</span>
          </button>
        )}
      </div>

      {/* Speaker Navigation (Indigo & Cyan) */}
      <div className="w-full sm:w-auto order-2 sm:order-1 flex items-center gap-2">
        <button
          onClick={onPrevSpeaker}
          className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800 transition-all active:scale-95 cursor-pointer"
        >
          <SkipBack className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Prev</span>
        </button>
        <button
          onClick={onNextSpeaker}
          className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-xs font-black border border-cyan-200 dark:border-cyan-800 transition-all active:scale-95 cursor-pointer"
        >
          <span>Next</span>
          <SkipForward className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        </button>
      </div>

      {/* Bonus (Purple) & Reset (Rose Red) */}
      <div className="w-full sm:w-auto order-3 flex items-center gap-2">
        <button
          onClick={onAddBonusTime}
          className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-200 dark:border-purple-800 transition-all active:scale-95 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>+1 Min</span>
        </button>
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-black border border-rose-200 dark:border-rose-800 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
