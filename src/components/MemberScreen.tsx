import React, { useState, useEffect, useRef } from 'react';
import type { TimerState, ChatMessage, StageSignalType } from '../types/timer';
import { Logo } from './Logo';
import { soundFx, subscribeMuteChange } from '../lib/audio';
import {
  Send,
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
  LogOut,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Lock,
  Brain,
  FastForward,
  ClipboardList,
} from 'lucide-react';

interface MemberScreenProps {
  state: TimerState;
  onExit: () => void;
  messages: ChatMessage[];
  userName: string;
  onSendMessage: (text: string) => void;
  onSendSignal: (type: StageSignalType, messageText: string) => void;
  onNextSpeaker?: () => void;
  onPrevSpeaker?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  onOpenStageMode?: () => void;
}

export const MemberScreen: React.FC<MemberScreenProps> = ({
  state,
  onExit,
  messages,
  userName,
  onSendMessage,
  onSendSignal,
  isDark = true,
  onToggleTheme,
}) => {
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll ONLY the chat box internally, never shifting the outer window/screen
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => soundFx.getIsMuted());

  useEffect(() => {
    return subscribeMuteChange((nextMuted) => {
      setIsMuted(nextMuted);
    });
  }, []);

  const { totalDurationSeconds, elapsedSeconds, speakers, currentSpeakerIndex } = state;

  const currentSpeaker = speakers[currentSpeakerIndex];
  const nextSpeaker = speakers[currentSpeakerIndex + 1];

  const isOvertime = elapsedSeconds > totalDurationSeconds;
  const remainingTotalSeconds = totalDurationSeconds - elapsedSeconds;

  const speakerAllocated = currentSpeaker ? currentSpeaker.allocatedSeconds : 1;
  const speakerElapsed = currentSpeaker ? currentSpeaker.elapsedSeconds : 0;
  const speakerRemaining = speakerAllocated - speakerElapsed;

  const toggleMute = () => {
    soundFx.toggleMute();
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(state.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const absSecs = Math.abs(secs);
    const mins = Math.floor(absSecs / 60);
    const s = absSecs % 60;
    return `${secs < 0 ? '-' : ''}${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    soundFx.playSignalBeep();
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    soundFx.playSignalBeep();
    setInputText('');
  };

  const isCurrentPresenter = currentSpeaker
    ? currentSpeaker.name.trim().toLowerCase() === userName.trim().toLowerCase()
    : false;

  // Sends PPT slide change signal to host WITHOUT advancing reporter timer
  const handleNextSlide = () => {
    if (!isCurrentPresenter) {
      triggerToast(`Locked: Only ${currentSpeaker?.name || 'Active Presenter'} can change slides`);
      return;
    }
    onSendSignal('next_slide', `${userName} requested Next Slide`);
    triggerToast(`Next Slide Signal Sent to Host!`);
  };

  const handlePrevSlide = () => {
    if (!isCurrentPresenter) {
      triggerToast(`Locked: Only ${currentSpeaker?.name || 'Active Presenter'} can change slides`);
      return;
    }
    onSendSignal('next_slide', `${userName} requested Previous Slide`);
    triggerToast(`Previous Slide Signal Sent to Host!`);
  };

  const handleMentalBlock = () => {
    const msg = isCurrentPresenter
      ? `MENTAL BLOCK ALERT: Presenter ${userName} hit a mental block — please proceed to Next Presenter`
      : `MENTAL BLOCK REMINDER: ${userName} requested to proceed to Next Presenter`;
    onSendSignal('mental_block', msg);
    triggerToast(`Mental Block alert sent to Host! Reminded to proceed to Next Presenter.`);
  };

  const handleExitClick = () => {
    if (window.confirm("Are you sure you want to exit Member View?")) {
      onExit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full bg-slate-50 text-gray-900 dark:bg-[#0B132B] dark:text-white flex flex-col justify-between p-3 sm:p-6 overflow-y-auto transition-colors">
      
      {/* Sleek Glassmorphic Floating Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 dark:bg-indigo-950/95 text-white px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 border border-indigo-500/50 backdrop-blur-md animate-message-pop whitespace-nowrap max-w-[90vw]">
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20 shrink-0" />
          <span className="tracking-wide text-white">{toastMessage}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" />
        </div>
      )}

      {/* ── Top Navigation Header ── */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-indigo-900/60 pb-3 gap-1.5 shrink-0 w-full min-w-0 max-w-full">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
          <Logo size="sm" isDark={isDark} />
          <div className="hidden xs:block h-4 w-[1px] bg-gray-300 dark:bg-indigo-900" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] sm:text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                ROOM: {state.roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyRoomCode}
                title="Copy Room Code"
                className="p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white transition-colors rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span className="hidden xs:inline-flex text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                TEAMMATE
              </span>
            </div>
            <span className="hidden sm:flex text-[10px] text-emerald-600 dark:text-emerald-400 font-medium items-center gap-1 mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Live Stage Monitoring & Slide Remote
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Audio Mute/Unmute Toggle Button */}
          <button
            onClick={toggleMute}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all active:scale-95 shrink-0 flex items-center gap-1 text-xs font-bold ${
              isMuted
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}
            title={isMuted ? 'Unmute Audio Notifications' : 'Mute Audio Notifications'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 shrink-0" />}
            <span className="hidden md:inline">{isMuted ? 'Muted' : 'Unmuted'}</span>
          </button>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 transition-all active:scale-95 shrink-0"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          )}

          {/* Exit Button */}
          <button
            onClick={handleExitClick}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 text-xs font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1"
            title="Exit Member View"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
            <span className="hidden md:inline">Exit Member View</span>
            <span className="hidden sm:inline md:hidden">Exit</span>
          </button>
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 py-4">
        
        {/* Left / Top Section: Live Stage Spotlight & Big Slide Remote Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Stage Spotlight Active Presenter Card */}
          <div className="bg-gradient-to-b from-white via-indigo-50/20 to-white dark:from-[#0F1C3F] dark:via-[#111C38] dark:to-[#0B152C] rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xl shadow-indigo-950/10 dark:shadow-black/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#FF5B00] bg-[#FF5B00]/10 px-3 py-1 rounded-full border border-[#FF5B00]/30 inline-flex items-center gap-1.5 shrink-0 shadow-xs">
                <Users className="w-3.5 h-3.5 text-[#FF5B00]" />
                <span>SPEAKER {currentSpeakerIndex + 1} OF {speakers.length} ON STAGE</span>
              </span>
              <span className="text-xs font-mono font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/80 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-800 shrink-0">
                {formatTime(elapsedSeconds)} / {formatTime(totalDurationSeconds)}
              </span>
            </div>

            {currentSpeaker && (
              <div className="my-3 text-center sm:text-left">
                <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none drop-shadow-sm">
                  {currentSpeaker.name}
                </h2>
                {currentSpeaker.topic && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs sm:text-sm font-extrabold shadow-xs">
                    <ClipboardList className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Reporting Topic: <strong>{currentSpeaker.topic}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Stage Countdown Spotlight Display */}
            <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-gray-800/80 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Speaker Time Remaining
              </span>
              
              {/* GIANT COUNTDOWN TIMER DISPLAY - CENTERED */}
              <div className="flex flex-col items-center justify-center text-center w-full my-1">
                <span className={`font-mono text-6xl sm:text-8xl font-black tracking-tight leading-none transition-all ${
                  isOvertime
                    ? 'text-red-500 font-black animate-pulse'
                    : speakerRemaining <= 30
                    ? 'text-amber-500 dark:text-amber-400 animate-pulse'
                    : 'text-gray-900 dark:text-white'
                } drop-shadow-md`}>
                  {formatTime(speakerRemaining)}
                </span>

                {/* TIME LEFT & UP NEXT SPEAKER - CENTERED BELOW TIMER */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5 w-full">
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold shadow-xs">
                    <span>Total Time Left:</span>
                    <span className="font-black text-sm">{formatTime(remainingTotalSeconds)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold shadow-xs">
                    <span>Up Next:</span>
                    <span className="font-black text-sm">{nextSpeaker ? nextSpeaker.name : 'Final Presenter'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleMentalBlock}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-xl border border-amber-400/40 text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer"
                    title="Remind host to proceed to next presenter due to mental block"
                  >
                    <Brain className="w-3.5 h-3.5 animate-bounce" />
                    <span>Mental Block — Proceed Next</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 1-Tap Silent Slide & Stage Remote Control Box */}
          <div className="bg-white dark:bg-[#111C38] rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-indigo-900/60 shadow-xl shadow-indigo-950/10 dark:shadow-black/40 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Silent Presenter & Slide Remote</span>
                </h3>
                {isCurrentPresenter ? (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active Presenter Control
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Locked (Not Presenting)</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 font-medium">
                {isCurrentPresenter
                  ? 'You are on stage! Tap buttons below to signal slide changes or mental block to the host:'
                  : `Only the active presenter (${currentSpeaker?.name || 'Presenter'}) can control slides.`}
              </p>
            </div>

            {/* Primary Big Touch Buttons for Slide Change */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePrevSlide}
                disabled={!isCurrentPresenter}
                className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm border transition-all ${
                  isCurrentPresenter
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 shadow-lg active:scale-95 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-800/60 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>PREV SLIDE</span>
              </button>

              <button
                onClick={handleNextSlide}
                disabled={!isCurrentPresenter}
                className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm border transition-all ${
                  isCurrentPresenter
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/40 shadow-xl active:scale-95 cursor-pointer animate-pulse-ring-glow'
                    : 'bg-gray-100 dark:bg-gray-800/60 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-50'
                }`}
              >
                <span>NEXT SLIDE</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mental Block / Pass to Next Presenter Dedicated Button */}
            <div className="pt-3 border-t border-gray-200 dark:border-indigo-900/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                  Stuck or hit a Mental Block?
                </span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 font-semibold">1-Tap Host Alert</span>
              </div>
              <button
                type="button"
                onClick={handleMentalBlock}
                className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white border border-amber-300/40 shadow-lg shadow-orange-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Press if stuck or mental block to remind host to proceed to next presenter"
              >
                <Brain className="w-4.5 h-4.5 shrink-0 animate-bounce" />
                <span>MENTAL BLOCK — REMIND HOST TO PROCEED NEXT</span>
                <FastForward className="w-4.5 h-4.5 shrink-0" />
              </button>
            </div>
          </div>

          {/* Presentation Topics & Speaker Roster Schedule */}
          <div className="bg-white dark:bg-[#111C38] rounded-2xl p-4 border border-gray-200/80 dark:border-indigo-900/60 shadow-xl shadow-indigo-950/10 dark:shadow-black/40">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#FF5B00] shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Presentation Topics & Speaker Schedule
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                {speakers.length} Topics
              </span>
            </div>

            <div className="space-y-2">
              {speakers.map((sp, idx) => {
                const isActive = idx === currentSpeakerIndex;
                const isDone = idx < currentSpeakerIndex;

                let badgeCls = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
                let cardStyle = 'bg-gray-50/50 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-800/60';
                let statusLabel = `SLOT ${idx + 1}`;

                if (isDone) {
                  badgeCls = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                  cardStyle = 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20';
                  statusLabel = 'COMPLETED';
                } else if (isActive) {
                  badgeCls = 'bg-indigo-600 text-white font-black animate-pulse';
                  cardStyle = 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400/40';
                  statusLabel = 'PRESENTING NOW';
                } else if (idx === currentSpeakerIndex + 1) {
                  badgeCls = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                  cardStyle = 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800';
                  statusLabel = 'UP NEXT';
                }

                return (
                  <div
                    key={sp.id || idx}
                    className={`p-2.5 rounded-xl border text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${cardStyle}`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border shrink-0 ${badgeCls}`}>
                        {statusLabel}
                      </span>
                      <div className="min-w-0">
                        <span className="font-extrabold text-gray-900 dark:text-white block truncate">
                          {sp.name}
                        </span>
                        {sp.topic && (
                          <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1 truncate mt-0.5">
                            <ClipboardList className="w-3 h-3 text-purple-500 shrink-0" />
                            <span>{sp.topic}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 shrink-0 self-end sm:self-center">
                      {Math.round(sp.allocatedSeconds / 60)} min
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section: Integrated Live Chat & Event Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111C38] rounded-2xl p-4 border border-gray-200/80 dark:border-indigo-900/60 shadow-xl shadow-indigo-950/10 dark:shadow-black/40 flex flex-col justify-between min-h-[350px]">
          
          <div className="pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Team Live Chat & Signal Log
              </h3>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">Live Sync</span>
          </div>

          {/* Messages Stream */}
          <div ref={chatContainerRef} className="flex-1 my-3 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
                <MessageSquare className="w-7 h-7 text-gray-400 dark:text-gray-600 mb-1" />
                <p className="text-xs font-bold">No chat messages yet.</p>
                <p className="text-[11px]">Tap Next Slide or Send a message below!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderName === userName;
                if (msg.isSignal) {
                  return (
                    <div key={msg.id} className="w-full my-1 flex flex-col items-center animate-message-pop">
                      <div className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                        <span>{msg.text.replace(/^SIGNAL SENT:\s*/i, '')}</span>
                      </div>
                      <span className="text-[9px] text-gray-500 font-mono mt-0.5">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex flex-col animate-message-pop ${isMe ? 'items-end' : 'items-start'}`}>
                    {isMe ? (
                      <div className="flex items-center gap-1.5 mb-1 px-1 justify-end">
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                          {msg.senderName || userName} (You)
                        </span>
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-[9px] shadow-xs shrink-0">
                          {(msg.senderName || userName).charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mb-1 px-1 justify-start">
                        <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-extrabold flex items-center justify-center text-[9px] shrink-0">
                          {msg.senderName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[10px] font-extrabold text-gray-700 dark:text-gray-300">{msg.senderName}</span>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-xs max-w-[85%] break-words font-medium leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs font-semibold shadow-indigo-500/10'
                          : 'bg-slate-100 dark:bg-gray-800/90 text-gray-900 dark:text-white rounded-tl-xs border border-gray-200/80 dark:border-gray-700/80'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Chat Input */}
          <form onSubmit={handleSendChat} className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message team..."
              className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full px-3.5 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full disabled:opacity-40 flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
