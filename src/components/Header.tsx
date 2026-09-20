import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Volume2,
  VolumeX,
  Users,
  LogIn,
  Copy,
  Check,
  Sun,
  Moon,
  LogOut,
  Share2,
  Maximize2,
} from 'lucide-react';
import { Logo } from './Logo';
import { soundFx, subscribeMuteChange } from '../lib/audio';

interface HeaderProps {
  roomCode: string;
  roomName: string;
  isHost: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
  onOpenShareModal?: () => void;
  onToggleChat: () => void;
  unreadChatCount: number;
  onToggleStageMode?: () => void;
  onOpenWelcome?: () => void;
  onOpenEditMembers?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomCode,
  roomName,
  isHost,
  isDark,
  onToggleTheme,
  onOpenCreateModal,
  onOpenJoinModal,
  onOpenShareModal,
  onToggleChat,
  unreadChatCount,
  onToggleStageMode,
  onOpenWelcome,
  onOpenEditMembers,
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundFx.getIsMuted());

  useEffect(() => {
    return subscribeMuteChange((nextMuted) => {
      setIsMuted(nextMuted);
    });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSound = () => {
    soundFx.toggleMute();
  };

  const handleExitClick = () => {
    if (window.confirm("Are you sure you want to exit this room and return to role selection?")) {
      if (onOpenWelcome) onOpenWelcome();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full flat-panel border-b border-gray-200 dark:border-indigo-900/60 px-3 sm:px-6 py-2 transition-colors bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-md shadow-lg shadow-indigo-950/10 dark:shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        
        {/* Top Section on Mobile / Left Section on Desktop: Logo, Room Code, Host Badge */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo & Badges */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Logo size="md" isDark={isDark} />
            
            <div className="hidden sm:block h-4 w-[1px] bg-gray-300 dark:bg-gray-700" />

            {/* Room Code Badge */}
            <div className="flex items-center gap-1.5 bg-indigo-50/90 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/80 shadow-xs">
              <span className="text-[10px] font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">ROOM:</span>
              <span className="font-mono text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-300 tracking-widest">{roomCode}</span>
              <button
                onClick={handleCopyCode}
                title="Copy Room Code"
                className="p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white transition-colors rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Host / Viewer Badge */}
            <div className="flex items-center gap-1.5">
              {isHost ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  HOST
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  VIEWER
                </span>
              )}

              {/* Session Title */}
              <span className="hidden lg:block text-xs font-extrabold text-gray-700 dark:text-gray-300 max-w-[130px] truncate">
                {roomName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Action Toolbar Pill + Primary CTA Button Right Beside It */}
        <div className="flex items-center justify-between md:justify-end gap-1.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
          
          {/* Action Toolbar Pill */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100/90 dark:bg-gray-800/90 p-1 rounded-2xl border border-gray-200/80 dark:border-gray-700/70 shadow-xs">
            
            {/* Exit / Switch Role Button */}
            {onOpenWelcome && (
              <button
                onClick={handleExitClick}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all active:scale-95 shrink-0"
                title="Exit and Return to Role Selection"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Exit</span>
              </button>
            )}

            {/* Fullscreen Stage Mode Button */}
            {onToggleStageMode && (
              <button
                onClick={onToggleStageMode}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-indigo-700 dark:text-indigo-300 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 shrink-0"
                title="Fullscreen Stage Mode"
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Stage</span>
              </button>
            )}

            {/* Share Modal Button */}
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 shrink-0"
                title="Share Room Link & QR Code"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}

            {/* Chat Button */}
            <button
              onClick={onToggleChat}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-cyan-700 dark:text-cyan-300 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 shrink-0 relative"
              title="Group Chat"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Chat</span>
              {unreadChatCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-white text-[9px] font-black leading-tight flex items-center justify-center animate-bounce">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-0.5" />

            {/* Sound Mute Button */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors shrink-0"
              title={isMuted ? 'Unmute Alerts' : 'Mute Alerts'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              )}
            </button>

            {/* Theme Switcher Button */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all active:scale-95 shrink-0"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          </div>

          {/* Primary CTA Button Placed Right Beside Toolbar Pill */}
          {isHost ? (
            <button
              onClick={onOpenEditMembers || onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl text-xs font-black bg-[#FF5B00] hover:bg-[#E05000] text-white border border-[#FF5B00] transition-all active:scale-95 shadow-md whitespace-nowrap shrink-0 cursor-pointer"
              title="Edit Member Names, Topics & Allocations (Live Sync)"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Members</span>
              <span className="sm:hidden">Edit</span>
            </button>
          ) : (
            <button
              onClick={onOpenJoinModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 transition-all active:scale-95 shadow-md whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Join Room</span>
              <span className="sm:hidden">Join</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

