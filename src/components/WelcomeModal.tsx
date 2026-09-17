import React from 'react';
import { Logo } from './Logo';
import { Shield, Users, ArrowRight, Key, CheckCircle2 } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onSelectHost: () => void;
  onSelectMember: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onSelectHost,
  onSelectMember,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full bg-slate-50 dark:bg-[#0B132B] text-gray-900 dark:text-white flex flex-col justify-between p-4 sm:p-8 overflow-y-auto">
      {/* Background ambient lighting/glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF5B00]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center items-center py-6 text-center">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center mb-6 pt-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-4 shadow-sm">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Select Your Role
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md font-medium leading-relaxed">
            Are you leading the presentation or joining as a teammate?
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full my-4">
          
          {/* Card 1: HOST / LEADER */}
          <button
            onClick={onSelectHost}
            className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#FF5B00]/15 via-amber-500/5 to-transparent border-2 border-[#FF5B00]/40 hover:border-[#FF5B00] text-left transition-all hover:-translate-y-1 active:translate-y-0 cursor-pointer group shadow-xl hover:shadow-[#FF5B00]/10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FF5B00] text-white flex items-center justify-center shadow-lg shadow-[#FF5B00]/30 group-hover:scale-105 transition-transform">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono font-black text-white bg-[#FF5B00] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  FULL CONTROL
                </span>
              </div>

              <span className="text-[10px] font-mono font-black text-[#FF5B00] uppercase tracking-wider block mb-1">
                DEFENSE LEADER
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-[#FF5B00] transition-colors">
                I am the Host
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed font-medium">
                Create a new room or re-enter an existing room number to resume master host control.
              </p>

              <div className="mt-4 space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Start, Pause, Reset Master Clock</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Re-enter using Room Code / Number</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#FF5B00]/20 flex items-center justify-between text-xs font-black text-[#FF5B00]">
              <span>Create or Re-enter Room</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>

          {/* Card 2: MEMBER / TEAMMATE */}
          <button
            onClick={onSelectMember}
            className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-indigo-600/15 via-purple-500/5 to-transparent border-2 border-indigo-500/40 hover:border-indigo-500 text-left transition-all hover:-translate-y-1 active:translate-y-0 cursor-pointer group shadow-xl hover:shadow-indigo-500/10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono font-black text-white bg-indigo-600 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  SLIDE REMOTE
                </span>
              </div>

              <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-wider block mb-1">
                PRESENTATION TEAMMATE
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                I am a Member
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed font-medium">
                Join an existing defense session to control slides and view live timers on your device.
              </p>

              <div className="mt-4 space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>1-Tap Silent Slide Change Remote</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Real-Time Team Live Sync & Chat</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-indigo-500/20 flex items-center justify-between text-xs font-black text-indigo-500 dark:text-indigo-400">
              <span>Join with Room Code</span>
              <Key className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-6 font-medium flex items-center justify-center gap-1.5">
          <span>No registration required • Real-time live synchronization</span>
        </p>
      </div>
    </div>
  );
};
