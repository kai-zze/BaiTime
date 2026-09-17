import type { Speaker } from '../types/timer';
import { CheckCircle2, Mic, Clock, ArrowRight, CheckCheck, ClipboardList } from 'lucide-react';

interface SpeakerQueueProps {
  speakers: Speaker[];
  currentIndex: number;
  isHost: boolean;
  onSelectSpeaker?: (index: number) => void;
  onFinishEarly?: () => void;
}

export const SpeakerQueue: React.FC<SpeakerQueueProps> = ({
  speakers,
  currentIndex,
  isHost,
  onSelectSpeaker,
  onFinishEarly,
}) => {
  const formatSecs = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m${s > 0 ? ` ${s}s` : ''}`;
  };

  return (
    <div className="w-full flat-panel rounded-2xl p-4 sm:p-6 transition-colors shadow-xl shadow-indigo-950/10 dark:shadow-black/40 border border-gray-200/80 dark:border-indigo-900/60">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h2 className="text-sm sm:text-base font-black text-[#0C1838] dark:text-white tracking-wide">
            Speaker Queue ({speakers.length} Members)
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          Sub-timer per slot
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {speakers.map((speaker, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isUpNext = index === currentIndex + 1;

          // Multi-color palette for all queue states
          let cardBg = 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800';
          let nameCls = 'text-gray-700 dark:text-gray-300';
          let clockIconColor = 'text-purple-500';
          let statusBadge = null;

          if (isCompleted) {
            // Completed: Emerald green tint
            cardBg = 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50';
            nameCls = 'text-gray-500 dark:text-gray-400 line-through';
            clockIconColor = 'text-emerald-500';
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> DONE ({formatSecs(speaker.elapsedSeconds)})
              </span>
            );
          } else if (isActive) {
            // Active: Indigo/Rose highlight
            cardBg = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 shadow-md ring-2 ring-indigo-400/40';
            nameCls = 'text-indigo-950 dark:text-white font-extrabold';
            clockIconColor = 'text-indigo-600 dark:text-indigo-400';
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-indigo-600 px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                <Mic className="w-3 h-3 text-rose-300" /> SPEAKING NOW
              </span>
            );
          } else if (isUpNext) {
            // Up Next: Amber Gold tint
            cardBg = 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800';
            nameCls = 'text-[#0C1838] dark:text-amber-200';
            clockIconColor = 'text-amber-600 dark:text-amber-400';
            statusBadge = (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                <ArrowRight className="w-3 h-3" /> UP NEXT
              </span>
            );
          } else {
            statusBadge = (
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                #{index + 1} QUEUED
              </span>
            );
          }

          return (
            <div
              key={speaker.id || index}
              onClick={() => isHost && onSelectSpeaker && onSelectSpeaker(index)}
              className={`relative rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${cardBg} ${
                isHost ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 active:scale-98' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">
                    SLOT {index + 1}
                  </span>
                  {statusBadge}
                </div>
                <h3 className={`font-black text-sm truncate mb-0.5 ${nameCls}`}>
                  {speaker.name}
                </h3>
                {speaker.topic && (
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-start gap-1.5 mt-1 bg-purple-500/10 dark:bg-purple-950/40 px-2.5 py-1.5 rounded-lg border border-purple-500/20 whitespace-pre-line break-words">
                    <ClipboardList className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line break-words leading-relaxed">{speaker.topic}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between text-xs">
                <span className="font-mono font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Clock className={`w-3.5 h-3.5 ${clockIconColor}`} />
                  {formatSecs(speaker.allocatedSeconds)}
                </span>
                {isActive && (
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                    {formatSecs(speaker.elapsedSeconds)} used
                  </span>
                )}
              </div>

              {/* Done Early button — only for host on active speaker */}
              {isActive && isHost && onFinishEarly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger card click (selectSpeaker)
                    onFinishEarly();
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer border border-emerald-500"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Done — Finish Presenting Early</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
