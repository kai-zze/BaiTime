import { useState, useEffect, useRef, useCallback } from "react";
import type {
  TimerState,
  Speaker,
  ChatMessage,
  StageSignal,
  StageSignalType,
} from "../types/timer";
import { RoomSyncService } from "../lib/supabase";
import { soundFx } from "../lib/audio";

const STORAGE_KEY_HOST_ID = "baitime_host_secret_id";
const STORAGE_KEY_USER_NAME = "baitime_user_name";

// Helper to generate random 6-char room code
export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude ambiguous 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper to generate UUID
export const generateId = (): string =>
  Math.random().toString(36).substring(2, 9);

const DEFAULT_SPEAKERS: Speaker[] = [
  {
    id: "sp-1",
    name: "Member 1",
    allocatedSeconds: 180,
    elapsedSeconds: 0,
    status: "active",
  },
  {
    id: "sp-2",
    name: "Member 2",
    allocatedSeconds: 180,
    elapsedSeconds: 0,
    status: "waiting",
  },
  {
    id: "sp-3",
    name: "Member 3",
    allocatedSeconds: 180,
    elapsedSeconds: 0,
    status: "waiting",
  },
  {
    id: "sp-4",
    name: "Member 4",
    allocatedSeconds: 180,
    elapsedSeconds: 0,
    status: "waiting",
  },
];

export function useTimerSync(initialRoomCode: string = "DEF15M") {
  // Get or create unique Tab Session ID (unique per browser tab)
  const [tabId] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let tId = sessionStorage.getItem('baitime_tab_session_id');
      if (!tId) {
        tId = 'tab_' + generateId();
        sessionStorage.setItem('baitime_tab_session_id', tId);
      }
      return tId;
    }
    return 'tab_' + generateId();
  });

  // Get or create persistent User ID & Name
  const [userId] = useState<string>(() => {
    let id = localStorage.getItem(STORAGE_KEY_HOST_ID);
    if (!id) {
      id = "user_" + generateId();
      localStorage.setItem(STORAGE_KEY_HOST_ID, id);
    }
    return id;
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_USER_NAME) || "Defense Teammate";
  });

  const updateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem(STORAGE_KEY_USER_NAME, name);
  };

  // Master Timer State
  const [state, setState] = useState<TimerState>({
    roomCode: initialRoomCode,
    roomName: "Capstone Mock Defense",
    totalDurationSeconds: 900, // 15 mins
    elapsedSeconds: 0,
    status: "idle",
    currentSpeakerIndex: 0,
    speakers: DEFAULT_SPEAKERS,
    penaltyConfig: { enabled: true, pointsPerInterval: 1, intervalSeconds: 30 },
    lastUpdated: Date.now(),
    hostId: tabId, // Default creator is this tab session
  });

  // Keep stateRef in sync for handlers and async callbacks
  const stateRef = useRef<TimerState>(state);
  useEffect(() => {
    stateRef.current = state;
    if (typeof window !== 'undefined' && state.roomCode) {
      try {
        localStorage.setItem(`baitime_room_state_${state.roomCode}`, JSON.stringify(state));
      } catch {
        // Storage limit protection
      }
    }
  }, [state]);

  // Chat & Signal State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`baitime_chat_${initialRoomCode}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return [];
  });
  const [activeSignal, setActiveSignal] = useState<StageSignal | null>(null);

  // Sync Service Ref
  const syncServiceRef = useRef<RoomSyncService | null>(null);

  // Is current browser tab session the master host?
  const isHost = state.hostId === tabId;

  // Persist recent room chat history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && state.roomCode) {
      localStorage.setItem(`baitime_chat_${state.roomCode}`, JSON.stringify(chatMessages.slice(-50)));
    }
  }, [chatMessages, state.roomCode]);

  // Broadcast state changes whenever state changes (if Host)
  const broadcastState = useCallback((newState: TimerState) => {
    if (syncServiceRef.current) {
      syncServiceRef.current.broadcastState(newState);
    }
    if (typeof window !== 'undefined' && newState.roomCode) {
      try {
        localStorage.setItem(`baitime_room_state_${newState.roomCode}`, JSON.stringify(newState));
      } catch {
        // Storage fallback
      }
    }
  }, []);

  // Initialize Room Sync
  useEffect(() => {
    const syncService = new RoomSyncService(state.roomCode);
    syncServiceRef.current = syncService;

    syncService.subscribe(
      (incomingState: TimerState) => {
        // ONLY apply remote host updates if THIS tab is NOT the master host tab!
        if (stateRef.current.hostId !== tabId) {
          setState({ ...incomingState });
        }
      },
      (incomingMsg: ChatMessage) => {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });
      },
      (incomingSignal: StageSignal) => {
        setActiveSignal(incomingSignal);
        soundFx.playSignalBeep();

        // Also add stage signal into receiver's live chat stream
        const signalMsg: ChatMessage = {
          id: incomingSignal.id || generateId(),
          senderName: incomingSignal.senderName,
          text: `SIGNAL SENT: ${incomingSignal.message}`,
          timestamp: incomingSignal.timestamp || Date.now(),
          isSignal: true,
          signalType: incomingSignal.type,
        };
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === signalMsg.id)) return prev;
          return [...prev, signalMsg];
        });

        // Auto clear signal notification after 4s
        setTimeout(() => {
          setActiveSignal((current) =>
            current?.id === incomingSignal.id ? null : current,
          );
        }, 4000);
      },
      () => {
        // Response when a viewer requests state update
        if (stateRef.current.hostId === tabId) {
          syncService.broadcastState(stateRef.current);
        }
      }
    );

    // If viewer, request latest state immediately upon channel connection
    if (state.hostId !== tabId) {
      syncService.broadcastRequestState();
    }

    return () => {
      syncService.unsubscribe();
    };
  }, [state.roomCode, tabId, state.hostId]);

  // Timer Tick Interval (ONLY Host tab executes master tick logic)
  useEffect(() => {
    if (state.status !== "running" || state.hostId !== tabId) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.status !== "running" || prev.hostId !== tabId) return prev;

        const newElapsed = prev.elapsedSeconds + 1;
        const currentIdx = prev.currentSpeakerIndex;
        // Deep clone speaker objects to ensure React detects state changes reliably
        const updatedSpeakers = prev.speakers.map((s) => ({ ...s }));
        const currentSpeaker = updatedSpeakers[currentIdx];

        if (currentSpeaker) {
          const newSpeakerElapsed = currentSpeaker.elapsedSeconds + 1;
          currentSpeaker.elapsedSeconds = newSpeakerElapsed;

          // Sound triggers for speaker 30s warning
          if (currentSpeaker.allocatedSeconds - newSpeakerElapsed === 30) {
            soundFx.play30sWarning();
          }

          // Auto-advance when speaker reaches or exceeds allocated time limit
          if (newSpeakerElapsed >= currentSpeaker.allocatedSeconds) {
            currentSpeaker.status = "completed";

            // Advance to next speaker if available
            if (currentIdx + 1 < updatedSpeakers.length) {
              const nextIdx = currentIdx + 1;
              updatedSpeakers[nextIdx].status = "active";
              // Ensure next speaker starts clean with 0 elapsed if not started
              if (updatedSpeakers[nextIdx].elapsedSeconds === undefined) {
                updatedSpeakers[nextIdx].elapsedSeconds = 0;
              }
              soundFx.playSpeakerSwapChime();

              const nextState: TimerState = {
                ...prev,
                elapsedSeconds: newElapsed,
                currentSpeakerIndex: nextIdx,
                speakers: updatedSpeakers,
                lastUpdated: Date.now(),
              };
              broadcastState(nextState);
              return nextState;
            } else {
              // All speakers done!
              soundFx.playOvertimeAlarm();
            }
          }
        }

        // Check overall total time warning/overtime sound
        if (prev.totalDurationSeconds - newElapsed === 30) {
          soundFx.play30sWarning();
        } else if (newElapsed === prev.totalDurationSeconds) {
          soundFx.playOvertimeAlarm();
        }

        const nextState: TimerState = {
          ...prev,
          elapsedSeconds: newElapsed,
          speakers: updatedSpeakers,
          lastUpdated: Date.now(),
        };

        broadcastState(nextState);
        return nextState;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.hostId, userId, broadcastState]);

  // Host Action Handlers
  const startTimer = () => {
    if (!isHost) return;
    setState((prev) => {
      const next = {
        ...prev,
        status: "running" as const,
        lastUpdated: Date.now(),
      };
      broadcastState(next);
      return next;
    });
  };

  const pauseTimer = () => {
    if (!isHost) return;
    setState((prev) => {
      const next = {
        ...prev,
        status: "paused" as const,
        lastUpdated: Date.now(),
      };
      broadcastState(next);
      return next;
    });
  };

  const resetTimer = () => {
    if (!isHost) return;
    setState((prev) => {
      const resetSpeakers = prev.speakers.map((sp, idx) => ({
        ...sp,
        elapsedSeconds: 0,
        status: (idx === 0 ? "active" : "waiting") as any,
      }));
      const next: TimerState = {
        ...prev,
        status: "idle",
        elapsedSeconds: 0,
        currentSpeakerIndex: 0,
        speakers: resetSpeakers,
        lastUpdated: Date.now(),
      };
      broadcastState(next);
      return next;
    });
  };

  const nextSpeaker = () => {
    if (!isHost) return;
    setState((prev) => {
      if (prev.currentSpeakerIndex >= prev.speakers.length - 1) return prev;
      const updatedSpeakers = prev.speakers.map((s) => ({ ...s }));
      updatedSpeakers[prev.currentSpeakerIndex].status = "completed";
      const nextIdx = prev.currentSpeakerIndex + 1;
      updatedSpeakers[nextIdx].status = "active";
      updatedSpeakers[nextIdx].elapsedSeconds = 0; // Always start next presenter at 0s!

      soundFx.playSpeakerSwapChime();

      const nextState: TimerState = {
        ...prev,
        currentSpeakerIndex: nextIdx,
        speakers: updatedSpeakers,
        lastUpdated: Date.now(),
      };
      broadcastState(nextState);
      return nextState;
    });
  };

  const prevSpeaker = () => {
    if (!isHost) return;
    setState((prev) => {
      if (prev.currentSpeakerIndex <= 0) return prev;
      const updatedSpeakers = prev.speakers.map((s) => ({ ...s }));
      updatedSpeakers[prev.currentSpeakerIndex].status = "waiting";
      const prevIdx = prev.currentSpeakerIndex - 1;
      updatedSpeakers[prevIdx].status = "active";
      updatedSpeakers[prevIdx].elapsedSeconds = 0; // Reset sub-timer to 0s!

      const nextState: TimerState = {
        ...prev,
        currentSpeakerIndex: prevIdx,
        speakers: updatedSpeakers,
        lastUpdated: Date.now(),
      };
      broadcastState(nextState);
      return nextState;
    });
  };

  const selectSpeaker = (targetIndex: number) => {
    if (!isHost) return;
    setState((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.speakers.length) return prev;
      const updatedSpeakers = prev.speakers.map((s, idx) => ({
        ...s,
        status: (idx < targetIndex ? "completed" : idx === targetIndex ? "active" : "waiting") as any,
        elapsedSeconds: idx === targetIndex ? 0 : s.elapsedSeconds,
      }));

      soundFx.playSpeakerSwapChime();

      const nextState: TimerState = {
        ...prev,
        currentSpeakerIndex: targetIndex,
        speakers: updatedSpeakers,
        lastUpdated: Date.now(),
      };
      broadcastState(nextState);
      return nextState;
    });
  };

  const addBonusTime = (seconds: number = 60) => {
    if (!isHost) return;
    setState((prev) => {
      const updatedSpeakers = prev.speakers.map((s) => ({ ...s }));
      const cur = updatedSpeakers[prev.currentSpeakerIndex];
      if (cur) {
        cur.allocatedSeconds += seconds;
      }
      const nextState: TimerState = {
        ...prev,
        totalDurationSeconds: prev.totalDurationSeconds + seconds,
        speakers: updatedSpeakers,
        lastUpdated: Date.now(),
      };
      broadcastState(nextState);
      return nextState;
    });
  };

  const updateRoomConfiguration = (
    roomName: string,
    totalMins: number,
    speakerConfigs: Array<{ name: string; minutes: number }>,
  ) => {
    const totalSecs = totalMins * 60;
    const newSpeakers: Speaker[] = speakerConfigs.map((cfg, idx) => ({
      id: `sp-${generateId()}`,
      name: cfg.name,
      allocatedSeconds: Math.round(cfg.minutes * 60),
      elapsedSeconds: 0,
      status: idx === 0 ? "active" : "waiting",
    }));

    setState((prev) => {
      const next: TimerState = {
        ...prev,
        roomName,
        totalDurationSeconds: totalSecs,
        elapsedSeconds: 0,
        status: "idle",
        currentSpeakerIndex: 0,
        speakers: newSpeakers,
        hostId: tabId, // Current tab is host
        lastUpdated: Date.now(),
      };
      localStorage.setItem("baitime_last_created_room", prev.roomCode);
      broadcastState(next);
      return next;
    });
  };

  const reenterRoomAsHost = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    localStorage.setItem("baitime_last_created_room", upperCode);
    setState((prev) => {
      const next: TimerState = {
        ...prev,
        roomCode: upperCode,
        hostId: tabId,
        lastUpdated: Date.now(),
      };
      broadcastState(next);
      return next;
    });
  };

  const joinExistingRoom = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    let cachedState: TimerState | null = null;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`baitime_room_state_${upperCode}`);
      if (saved) {
        try {
          cachedState = JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }

    setState((prev) => {
      if (cachedState) {
        return {
          ...cachedState,
          roomCode: upperCode,
          hostId: 'remote_host',
        };
      }
      return {
        ...prev,
        roomCode: upperCode,
        hostId: 'remote_host',
      };
    });

    if (syncServiceRef.current) {
      syncServiceRef.current.broadcastRequestState();
    }
  };

  // Chat & Signal actions
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: generateId(),
      senderName: userName,
      text: text.trim(),
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, msg]);
    if (syncServiceRef.current) {
      syncServiceRef.current.broadcastChatMessage(msg);
    }
  };

  const sendStageSignal = (type: StageSignalType, messageText: string) => {
    const signal: StageSignal = {
      id: generateId(),
      type,
      senderName: userName,
      message: messageText,
      timestamp: Date.now(),
    };
    setActiveSignal(signal);
    soundFx.playSignalBeep();

    if (syncServiceRef.current) {
      syncServiceRef.current.broadcastStageSignal(signal);
    }

    // Also add as chat record
    const chatMsg: ChatMessage = {
      id: generateId(),
      senderName: userName,
      text: `SIGNAL SENT: ${messageText}`,
      timestamp: Date.now(),
      isSignal: true,
      signalType: type,
    };
    setChatMessages((prev) => [...prev, chatMsg]);
  };

  return {
    state,
    isHost,
    userId,
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
  };
}
