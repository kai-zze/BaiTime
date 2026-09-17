import type { TimerState } from '../types/timer';
import { Clock, User, TrendingDown } from 'lucide-react';

interface MasterTimerProps {
  state: TimerState;
  activeSignal?: { senderName: string; message: string } | null;
}

export const MasterTimer: React.FC<MasterTimerProps> = ({ state, activeSignal }) => {
  const { totalDurationSeconds, elapsedSeconds, speakers, currentSpeakerIndex, penaltyConfig } = state;

  const currentSpeaker = speakers[currentSpeakerIndex];
  const isOvertime = elapsedSeconds > totalDurationSeconds;
  const remainingTotalSeconds = totalDurationSeconds - elapsedSeconds;

  // Calculate Overtime Deduction Points
  const overtimeSeconds = isOvertime ? elapsedSeconds - totalDurationSeconds : 0;
  const penaltyPoints = penaltyConfig.enabled && isOvertime
    ? Math.floor(overtimeSeconds / penaltyConfig.intervalSeconds) * penaltyConfig.pointsPerInterval
    : 0;

  // Format Seconds to MM:SS or -MM:SS
  const formatTime = (secs: number) => {
    const absSecs = Math.abs(secs);
    const mins = Math.floor(absSecs / 60);
    const s = absSecs % 60;
    const padMins = String(mins).padStart(2, '0');
    const padSecs = String(s).padStart(2, '0');
    return `${secs < 0 ? '-' : ''}${padMins}:${padSecs}`;
  };

  // Color calculation based on overall remaining percentage
  const totalPercent = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100));
  let statusBgClass = 'border-emerald-500/60 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10';
  let progressColor = 'stroke-emerald-500';
  let statusText = 'SAFE ZONE';

  if (isOvertime) {
    statusBgClass = 'border-red-600 text-red-700 dark:text-red-400 bg-red-600/10 animate-pulse-ring';
    progressColor = 'stroke-red-600';
    statusText = 'DEFENSE OVERTIME!';
  } else if (remainingTotalSeconds <= 60) {
    statusBgClass = 'border-rose-500 text-rose-700 dark:text-rose-400 bg-rose-500/10 animate-pulse';
    progressColor = 'stroke-rose-500';
    statusText = 'FINAL 1 MINUTE!';
  } else if (remainingTotalSeconds <= 180) {
    statusBgClass = 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-500/10 animate-pulse';
    progressColor = 'stroke-amber-500';
    statusText = 'WRAP UP NOW!';
  }

  // Active Speaker progress
  const speakerAllocated = currentSpeaker ? currentSpeaker.allocatedSeconds : 1;
  const speakerElapsed = currentSpeaker ? currentSpeaker.elapsedSeconds : 0;
  const speakerRemaining = speakerAllocated - speakerElapsed;
  const speakerPercent = Math.min(100, Math.max(0, (speakerElapsed / speakerAllocated) * 100));

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalPercent / 100) * circumference;

  return (
    <div className="relative w-full flat-panel rounded-2xl p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden transition-colors shadow-xl shadow-indigo-950/10 dark:shadow-black/40 border border-gray-200/80 dark:border-indigo-900/60">
      {/* Top Banner Status & Score Penalty */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-2 sm:mb-4 z-10">
        <div className={`px-3.5 py-1 rounded-full border text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center gap-2 ${statusBgClass}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          {statusText}
        </div>

        {/* Penalty Deduction Alert */}
        {penaltyConfig.enabled && isOvertime ? (
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600 text-white font-black animate-pulse">
            <TrendingDown className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs uppercase tracking-wider">
              SCORE PENALTY: <strong className="text-white text-xs sm:text-sm font-extrabold">-{penaltyPoints} PTS</strong> ({overtimeSeconds}s Over)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-[#0C1838] dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 text-[#FF5B00]" />
            <span>Master {Math.round(totalDurationSeconds / 60)}-Min Defense Clock</span>
          </div>
        )}
      </div>

      {/* Host Live Stage & Slide Signal Banner */}
      {activeSignal && (
        <div className="w-full my-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#FF5B00] via-purple-600 to-indigo-600 text-white flex items-center justify-between gap-3 shadow-xl animate-message-pop z-20 border-2 border-white/20">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black tracking-wide">
            <span className="msym text-xl text-amber-300 animate-bounce">bolt</span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200 block">
                MEMBER SLIDE / STAGE SIGNAL (From {activeSignal.senderName})
              </span>
              <span className="text-sm font-black text-white">
                {activeSignal.message}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Circular Clock (Flat UI SVG) */}
      <div className="relative flex items-center justify-center my-1 sm:my-3 z-10">
        <svg viewBox="0 0 300 300" className="w-60 h-60 xs:w-64 xs:h-64 sm:w-80 sm:h-80 transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className="stroke-gray-300 dark:stroke-gray-700 fill-none"
            strokeWidth="14"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className={`fill-none transition-[stroke-dashoffset] duration-1000 ease-linear ${progressColor}`}
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Clock Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#4B5675] dark:text-gray-400 uppercase mb-1">
            {isOvertime ? 'OVERTIME' : 'TIME REMAINING'}
          </span>
          <span
            className={`font-mono font-black tracking-tight leading-none text-5xl sm:text-7xl transition-transform ${
              state.status === 'running' ? 'animate-timer-tick' : ''
            } ${
              isOvertime
                ? 'text-red-600 dark:text-red-400 drop-shadow-sm'
                : remainingTotalSeconds <= 180
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-[#0C1838] dark:text-white'
            }`}
          >
            {formatTime(remainingTotalSeconds)}
          </span>
          <span className="text-[10px] sm:text-xs font-mono font-semibold text-[#4B5675] dark:text-gray-500 mt-2">
            {formatTime(elapsedSeconds)} elapsed / {formatTime(totalDurationSeconds)} total
          </span>
        </div>
      </div>

      {/* Active Speaker Spotlight Box */}
      {currentSpeaker && (
        <div className="w-full max-w-xl mt-4 sm:mt-6 z-10 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl p-4 sm:p-5 border border-indigo-200/80 dark:border-indigo-800/80 transition-colors flex flex-col items-center text-center space-y-3 shadow-md shadow-indigo-950/5 dark:shadow-black/30">
          
          {/* Header Row */}
          <div className="w-full flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              ACTIVE PRESENTER ({currentSpeakerIndex + 1}/{speakers.length})
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {Math.round(currentSpeaker.allocatedSeconds / 60)}m Allocated
            </span>
          </div>

          {/* Sub Timer Header: Active Presenter Name */}
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg sm:text-2xl font-black text-[#0C1838] dark:text-white tracking-wide truncate flex items-center justify-center gap-2">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{currentSpeaker.name}</span>
            </h3>
          </div>

          {/* Main Speaker Timer & Time Left Centered Below Sub Timer Header */}
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className={`font-mono text-4xl sm:text-5xl font-black tracking-tight leading-none ${
              speakerRemaining <= 0
                ? 'text-red-600 font-extrabold animate-pulse'
                : speakerRemaining <= 30
                ? 'text-amber-500 dark:text-amber-400 animate-pulse'
                : 'text-indigo-600 dark:text-indigo-300'
            }`}>
              {speakerRemaining <= 0 ? 'TIME UP!' : formatTime(speakerRemaining)}
            </span>
            <span className="text-[10px] sm:text-xs font-mono font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Speaker Time Remaining
            </span>
          </div>

          {/* Speaker Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-[width] duration-1000 ease-linear rounded-full ${
                speakerRemaining <= 0
                  ? 'bg-rose-500'
                  : speakerRemaining <= 30
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${speakerPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
