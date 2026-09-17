import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, StageSignalType } from '../types/timer';
import { MessageSquare, Send, X, Zap, Volume2, FastForward, Clock, Edit2, Check, Brain } from 'lucide-react';

interface GroupChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  userName: string;
  onUpdateUserName?: (name: string) => void;
  onSendMessage: (text: string) => void;
  onSendSignal?: (type: StageSignalType, messageText: string) => void;
}

export const GroupChatDrawer: React.FC<GroupChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  userName,
  onUpdateUserName,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll inside chat box only, avoiding shifting outer screen
  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, isOpen]);

  useEffect(() => {
    setTempName(userName);
  }, [userName]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleSaveName = () => {
    if (tempName.trim() && onUpdateUserName) {
      onUpdateUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  // Helper for rendering signal message badges
  const getSignalBadgeStyle = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('mental') || lower.includes('stuck') || lower.includes('block')) {
      return {
        bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-800 dark:text-amber-200 border-amber-400 dark:border-amber-600 font-extrabold',
        icon: <Brain className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />,
      };
    }
    if (lower.includes('louder') || lower.includes('speak')) {
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800/80',
        icon: <Volume2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />,
      };
    }
    if (lower.includes('slide') || lower.includes('next')) {
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/80',
        icon: <FastForward className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />,
      };
    }
    if (lower.includes('1 min') || lower.includes('minute') || lower.includes('remaining')) {
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/80',
        icon: <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />,
      };
    }
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/80',
      icon: <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />,
    };
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-[#0B132B] border-l border-gray-200 dark:border-indigo-900/60 flex flex-col justify-between shadow-2xl shadow-indigo-950/20 dark:shadow-black/70 transition-colors duration-200 animate-drawer-slide">
        
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#111C38] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-wide flex items-center gap-1.5">
                Team Live Chat
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-ring-glow" />
              </h3>
              
              {/* User Name Badge & Editor */}
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Posting as:</span>
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      autoFocus
                      className="w-24 bg-gray-100 dark:bg-gray-800 text-[11px] px-1.5 py-0.5 rounded border border-indigo-500 text-gray-900 dark:text-white font-extrabold focus:outline-none"
                    />
                    <button onClick={handleSaveName} className="p-0.5 text-emerald-500 hover:text-emerald-400">
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    title="Click to edit your chat display name"
                    className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>{userName}</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-70" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-white dark:bg-[#0B132B]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="w-8 h-8 text-indigo-400/40 mb-2" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No messages yet.</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-1">
                Send a chat to your team or tap a Stage Signal above!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderName === userName;

              if (msg.isSignal) {
                const signalStyle = getSignalBadgeStyle(msg.text);
                const cleanedText = msg.text.replace(/^SIGNAL SENT:\s*/i, '');
                return (
                  <div key={msg.id} className="w-full my-2 flex flex-col items-center animate-message-pop">
                    <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-xs max-w-[92%] text-center transition-all ${signalStyle.bg}`}>
                      {signalStyle.icon}
                      <span>{cleanedText}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono mt-1">
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
                    className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] break-words font-medium leading-relaxed shadow-xs ${
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

        {/* Input */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111C38] flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message to team..."
            className="flex-1 bg-slate-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 font-medium transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md shadow-indigo-600/20 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};

