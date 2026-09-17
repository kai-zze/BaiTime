import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useTimerSync, generateRoomCode } from './hooks/useTimerSync';
import { Header } from './components/Header';
import { MasterTimer } from './components/MasterTimer';
import { SpeakerQueue } from './components/SpeakerQueue';
import { TimerControls } from './components/TimerControls';
import { GroupChatDrawer } from './components/GroupChatDrawer';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { ShareModal } from './components/ShareModal';
import { StageMode } from './components/StageMode';
import { MemberScreen } from './components/MemberScreen';
import { WelcomeModal } from './components/WelcomeModal';
import { Info } from 'lucide-react';

const STORAGE_KEY_THEME = 'baitime_theme_mode';

export function App() {
  // Theme state: dark mode vs light mode (default: light mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Check URL query param for ?room=XYZ
  const [hasRoomParam] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return !!params.get('room');
    }
    return false;
  });

  const [initialRoom] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room) return room.toUpperCase();
    }
    return generateRoomCode();
  });

  const {
    state,
    isHost,
    userName,
    updateUserName,
    chatMessages,
    activeSignal,
    startTimer,
    pauseTimer,
    resetTimer,
    nextSpeaker,
    prevSpeaker,
    selectSpeaker,
    addBonusTime,
    updateRoomConfiguration,
    reenterRoomAsHost,
    joinExistingRoom,
    sendChatMessage,
    sendStageSignal,
  } = useTimerSync(initialRoom);

  // Modals state
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(!hasRoomParam);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStageMode, setIsStageMode] = useState(false);
  const [isMemberScreen, setIsMemberScreen] = useState(hasRoomParam);
  const [unreadCount, setUnreadCount] = useState(0);

  // Track unread chat messages when drawer is closed
  useEffect(() => {
    if (!isChatOpen && chatMessages.length > 0) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [chatMessages.length, isChatOpen]);

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) setUnreadCount(0);
  };

  // Celebrate with confetti when presentation finishes
  useEffect(() => {
    if (state.status === 'finished') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [state.status]);

  // Keyboard Shortcuts for Host Stage Remote (Space = Start/Pause, Right = Next, Left = Prev, + = Bonus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        isCreateOpen ||
        isJoinOpen ||
        isWelcomeOpen
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isHost) {
          if (state.status === 'running') pauseTimer();
          else startTimer();
        }
      } else if (e.code === 'ArrowRight' || e.code === 'PageDown') {
        if (isHost) {
          e.preventDefault();
          nextSpeaker();
        }
      } else if (e.code === 'ArrowLeft' || e.code === 'PageUp') {
        if (isHost) {
          e.preventDefault();
          prevSpeaker();
        }
      } else if (e.key === '+' || e.key === '=') {
        if (isHost) {
          e.preventDefault();
          addBonusTime(60);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHost, state.status, startTimer, pauseTimer, nextSpeaker, prevSpeaker, addBonusTime, isCreateOpen, isJoinOpen, isWelcomeOpen]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B132B] text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-[#FF5B00] selection:text-white pb-12 transition-colors duration-200">
      {/* Top Header */}
      <Header
        roomCode={state.roomCode}
        roomName={state.roomName}
        isHost={isHost}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenJoinModal={() => setIsJoinOpen(true)}
        onOpenShareModal={() => setIsShareOpen(true)}
        onToggleChat={handleToggleChat}
        unreadChatCount={unreadCount}
        onToggleStageMode={() => setIsStageMode(true)}
        onOpenWelcome={() => setIsWelcomeOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Banner Alert for Viewers */}
        {!isHost && (
          <div className="bg-[#FF5B00]/10 border border-[#FF5B00]/30 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-900 dark:text-gray-200 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#FF5B00] shrink-0" />
              <span>
                You are in <strong className="text-[#0C1838] dark:text-white">Viewer Mode</strong> synced to Room <strong className="text-[#FF5B00]">{state.roomCode}</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-3.5 py-1.5 rounded-lg flat-btn-primary text-xs shrink-0"
              >
                Create My Own Group
              </button>
            </div>
          </div>
        )}

        {/* Master Countdown HUD */}
        <MasterTimer state={state} activeSignal={activeSignal} />

        {/* Host Control Toolbar */}
        <TimerControls
          status={state.status}
          isHost={isHost}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onNextSpeaker={nextSpeaker}
          onPrevSpeaker={prevSpeaker}
          onAddBonusTime={addBonusTime}
        />

        {/* Presentation Speaker Queue */}
        <SpeakerQueue
          speakers={state.speakers}
          currentIndex={state.currentSpeakerIndex}
          isHost={isHost}
          onSelectSpeaker={(idx) => {
            if (isHost && idx !== state.currentSpeakerIndex) {
              selectSpeaker(idx);
            }
          }}
        />
      </main>

      {/* Stage Presenter Fullscreen Mode */}
      {isStageMode && (
        <StageMode
          state={state}
          onExit={() => setIsStageMode(false)}
          activeSignal={activeSignal}
          isDark={isDark}
          onNextSpeaker={nextSpeaker}
          onPrevSpeaker={prevSpeaker}
          onSendSignal={sendStageSignal}
        />
      )}

      {/* Teammate Dedicated Member Control Screen */}
      {isMemberScreen && (
        <MemberScreen
          state={state}
          onExit={() => {
            setIsMemberScreen(false);
            setIsJoinOpen(false);
            setIsCreateOpen(false);
            setIsWelcomeOpen(true);
          }}
          messages={chatMessages}
          userName={userName}
          onSendMessage={sendChatMessage}
          onSendSignal={sendStageSignal}
          onNextSpeaker={nextSpeaker}
          onPrevSpeaker={prevSpeaker}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />
      )}

      {/* Group Chat Drawer */}
      <GroupChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        userName={userName}
        onUpdateUserName={updateUserName}
        onSendMessage={sendChatMessage}
        onSendSignal={sendStageSignal}
      />

      {/* Modals */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onSelectHost={() => {
          setIsWelcomeOpen(false);
          setIsCreateOpen(true);
        }}
        onSelectMember={() => {
          setIsWelcomeOpen(false);
          setIsJoinOpen(true);
        }}
      />

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsWelcomeOpen(true);
        }}
        onBackToWelcome={() => {
          setIsCreateOpen(false);
          setIsWelcomeOpen(true);
        }}
        onCreateRoom={(rName, tMins, members, hName, rCode) => {
          updateRoomConfiguration(rName, tMins, members, rCode);
          if (hName) updateUserName(hName);
          setIsWelcomeOpen(false);
          setIsCreateOpen(false);
          setIsMemberScreen(false);
        }}
        onReenterRoom={(code, hName) => {
          reenterRoomAsHost(code);
          if (hName) updateUserName(hName);
          setIsWelcomeOpen(false);
          setIsCreateOpen(false);
          setIsMemberScreen(false);
        }}
        currentRoomCode={state.roomCode}
        currentHostName={userName}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => {
          setIsJoinOpen(false);
          setIsWelcomeOpen(true);
        }}
        onBackToWelcome={() => {
          setIsJoinOpen(false);
          setIsWelcomeOpen(true);
        }}
        onJoinRoom={(code, uName) => {
          joinExistingRoom(code);
          updateUserName(uName);
          setIsWelcomeOpen(false);
          setIsJoinOpen(false);
          setIsMemberScreen(true);
        }}
        currentUserName={userName}
        currentRoomCode={state.roomCode}
        availableSpeakers={state.speakers.map((s) => s.name)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        roomCode={state.roomCode}
        roomName={state.roomName}
      />
    </div>
  );
}

export default App;
