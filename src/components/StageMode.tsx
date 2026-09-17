import type { TimerState, StageSignal, StageSignalType } from '../types/timer';
import { Clock, TrendingDown, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Logo } from './Logo';

interface StageModeProps {
  state: TimerState;
  onExit: () => void;
  activeSignal?: StageSignal | null;
  isDark?: boolean;
  onNextSpeaker?: () => void;
  onPrevSpeaker?: () => void;
  onSendSignal?: (type: StageSignalType, messageText: string) => void;
}

export const StageMode: React.FC<StageModeProps> = ({
  state,
  onExit,
  isDark = true,
  onNextSpeaker,
  onPrevSpeaker,
}) => {
  const { totalDurationSeconds, elapsedSeconds, speakers, currentSpeakerIndex, penaltyConfig } = state;

  const handleExitClick = () => {
    if (window.confirm("Are you sure you want to exit Stage Mode?")) {
      onExit();
    }
  };

  const currentSpeaker = speakers[currentSpeakerIndex];
  const nextSpeaker = speakers[currentSpeakerIndex + 1];

  const isOvertime = elapsedSeconds > totalDurationSeconds;
  const remainingTotalSeconds = totalDurationSeconds - elapsedSeconds;

  const speakerAllocated = currentSpeaker ? currentSpeaker.allocatedSeconds : 1;
  const speakerElapsed = currentSpeaker ? currentSpeaker.elapsedSeconds : 0;
  const speakerRemaining = speakerAllocated - speakerElapsed;

  // Overtime Penalty Points
  const overtimeSeconds = isOvertime ? elapsedSeconds - totalDurationSeconds : 0;
  const penaltyPoints = penaltyConfig.enabled && isOvertime
    ? Math.floor(overtimeSeconds / penaltyConfig.intervalSeconds) * penaltyConfig.pointsPerInterval
    : 0;

  const formatTime = (secs: number) => {
    const absSecs = Math.abs(secs);
    const mins = Math.floor(absSecs / 60);
    const s = absSecs % 60;
    return `${secs < 0 ? '-' : ''}${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Theme-aware background gradients & typography colors
  let bgGradient = isDark
    ? 'from-[#0B152C] via-[#0F1C3F] to-[#0B152C]'
    : 'from-slate-50 via-gray-100 to-slate-200';
  
  let clockColor = isDark ? 'text-white' : 'text-[#0C1838]';

  if (isOvertime) {
    bgGradient = isDark
      ? 'from-red-950 via-[#0B152C] to-red-950 animate-pulse-ring'
      : 'from-red-100 via-rose-50 to-red-100 animate-pulse-ring';
    clockColor = isDark ? 'text-red-500 font-extrabold' : 'text-red-600 font-extrabold';
  } else if (remainingTotalSeconds <= 60 || (speakerRemaining <= 30 && speakerRemaining > 0)) {
    bgGradient = isDark
      ? 'from-red-950/80 via-[#0B152C] to-amber-950/80'
      : 'from-rose-100 via-slate-100 to-amber-100';
    clockColor = isDark ? 'text-rose-500' : 'text-rose-600';
  } else if (remainingTotalSeconds <= 180) {
    bgGradient = isDark
      ? 'from-amber-950/40 via-[#0B152C] to-amber-950/40'
      : 'from-amber-100/60 via-slate-50 to-amber-100/60';
    clockColor = isDark ? 'text-amber-300' : 'text-amber-600';
  }

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-b ${bgGradient} ${isDark ? 'text-white' : 'text-gray-900'} flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden transition-colors duration-300`}>
      
      {/* Top Bar: Logo, Room Code & Exit Button */}
      <div className="flex items-center justify-between z-10 gap-2 w-full">
        {/* Left: Logo & Room Code */}
        <div className="flex items-center gap-2 min-w-0">
          <Logo size="sm" isDark={isDark} />
          <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-0.5 shrink-0" />
          <span className="text-[10px] sm:text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 shrink-0">
            {state.roomCode}
          </span>
          <span className="hidden md:block text-xs font-extrabold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
            {state.roomName}
          </span>
        </div>

        {/* Right: Exit Stage Button */}
        <button
          onClick={handleExitClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-rose-50 dark:bg-gray-800 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80 text-xs font-extrabold transition-all shadow-sm active:scale-95 shrink-0"
          title="Exit Stage Mode"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="text-xs">Exit Stage</span>
        </button>
      </div>

      {/* Floating signal notification removed */}

      {/* Center: Massive Speaker Countdown Spotlight */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-2 sm:my-4 z-10">
        {currentSpeaker && (
          <div className="mb-2 sm:mb-4 flex flex-col items-center max-w-full px-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF5B00] bg-[#FF5B00]/10 px-3.5 py-1 rounded-full border border-[#FF5B00]/30 inline-flex items-center gap-1.5 mb-1.5 whitespace-nowrap shadow-xs">
              <span className="msym text-xs sm:text-sm">mic</span>
              SPEAKER {currentSpeakerIndex + 1} OF {speakers.length}
            </span>
            <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black text-[#0C1838] dark:text-white tracking-tight leading-tight drop-shadow-sm truncate max-w-full">
              {currentSpeaker.name}
            </h2>
            {currentSpeaker.topic && (
              <p className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-300 mt-1.5 max-w-2xl text-center whitespace-pre-line break-words leading-relaxed">
                {currentSpeaker.topic}
              </p>
            )}
          </div>
        )}

        {/* Huge Speaker Timer */}
        <div className="my-1 sm:my-3">
          <span className="text-[10px] sm:text-xs font-mono font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-1">
            INDIVIDUAL SPEAKER TIME REMAINING
          </span>
          <span className={`font-mono text-6xl xs:text-7xl sm:text-9xl font-black tracking-tight leading-none transition-transform ${
            state.status === 'running' ? 'animate-timer-tick' : ''
          } ${clockColor} drop-shadow-2xl`}>
            {formatTime(speakerRemaining)}
          </span>
        </div>

        {/* Teammate Slide Signal System Status Indicator */}
        <div className="my-2 sm:my-3 flex items-center justify-center gap-2 z-20">
          <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 bg-black/20 dark:bg-white/10 px-3 py-1 rounded-full border border-gray-300/30 dark:border-gray-700/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Teammates notify Host on slide changes silently
          </span>
        </div>

        {/* Master Defense Total Clock */}
        <div className="mt-2 sm:mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-mono">
          <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/90 dark:bg-gray-900/90 border border-gray-300 dark:border-gray-800 shadow-sm flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF5B00]" />
            <span className="text-gray-600 dark:text-gray-400 font-bold">TOTAL REMAINING:</span>
            <strong className={isOvertime ? 'text-red-600 dark:text-red-500 font-extrabold' : 'text-[#0C1838] dark:text-white font-extrabold'}>
              {formatTime(remainingTotalSeconds)}
            </strong>
          </div>

          {penaltyConfig.enabled && isOvertime && (
            <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-red-100 dark:bg-red-950/90 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-bold flex items-center gap-2 animate-pulse shadow-sm">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
              <span>SCORE PENALTY: -{penaltyPoints} PTS</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Up Next Speaker Banner */}
      <div className="z-10 bg-white/90 dark:bg-gray-900/90 border border-gray-300 dark:border-gray-800 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md">
        {nextSpeaker ? (
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#FF5B00]/15 border border-[#FF5B00]/40 text-[#FF5B00] font-black text-[11px] sm:text-xs flex items-center justify-center shrink-0">
              NEXT
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
                UP NEXT IN QUEUE
              </span>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#0C1838] dark:text-amber-300 truncate">
                {nextSpeaker.name} <span className="text-gray-500 dark:text-gray-400 font-bold">({Math.round(nextSpeaker.allocatedSeconds / 60)} mins)</span>
              </h4>
            </div>
          </div>
        ) : (
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="msym text-base">flag</span>
            FINAL PRESENTER ON STAGE!
          </div>
        )}

        {/* Slide Remote Buttons in Stage Mode */}
        {onNextSpeaker && onPrevSpeaker && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onPrevSpeaker}
              className="flex items-center gap-1 py-1.5 px-2.5 sm:px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs border border-indigo-400/40 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Previous Slide / Presenter"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">PREV</span>
            </button>
            <button
              onClick={onNextSpeaker}
              className="flex items-center gap-1 py-1.5 px-2.5 sm:px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs border border-purple-400/40 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Next Slide / Presenter"
            >
              <span className="hidden sm:inline">NEXT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <span className="text-[10px] sm:text-xs font-mono font-black text-[#FF5B00] bg-[#FF5B00]/10 px-2.5 py-1 rounded-lg border border-[#FF5B00]/30 shrink-0">
          {state.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
