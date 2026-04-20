import { useState, useCallback, useRef } from "react";
import { conversationFlow, type AgentMessage } from "../data/mockData";

export type AgentPhase = "idle" | "running" | "waiting" | "complete";

export interface AgentState {
  phase: AgentPhase;
  visibleMessages: AgentMessage[];
  isThinking: boolean;
  currentMessageIndex: number;
  pendingChoice: AgentMessage | null;
  choiceAutoPickAt: number | null;
}

const AUTO_PICK_MS = 3500;

export function useAgentSimulation() {
  const [state, setState] = useState<AgentState>({
    phase: "idle",
    visibleMessages: [],
    isThinking: false,
    currentMessageIndex: -1,
    pendingChoice: null,
    choiceAutoPickAt: null,
  });

  const timerRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const submitChoiceRef = useRef<(e: string, a: string) => void>(() => {});

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const showNextMessage = useCallback((index: number) => {
    if (index >= conversationFlow.length) {
      setState((prev) => ({ ...prev, phase: "complete", isThinking: false }));
      return;
    }

    const msg = conversationFlow[index];

    if (msg.type === "user-choice") {
      setState((prev) => ({
        ...prev,
        phase: "waiting",
        isThinking: false,
        currentMessageIndex: index,
        pendingChoice: msg,
        choiceAutoPickAt: Date.now() + AUTO_PICK_MS,
      }));
      const auto = msg.options?.find((o) => o.recommended) || msg.options?.[0];
      if (auto) {
        clearTimer();
        timerRef.current = window.setTimeout(() => {
          if (stateRef.current.pendingChoice?.id === msg.id) {
            submitChoiceRef.current(auto.labelEn, auto.labelAr);
          }
        }, AUTO_PICK_MS);
      }
      return;
    }

    if (msg.thinking) {
      setState((prev) => ({
        ...prev,
        isThinking: true,
        currentMessageIndex: index,
      }));
      timerRef.current = window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isThinking: false,
          visibleMessages: [...prev.visibleMessages, msg],
        }));
        timerRef.current = window.setTimeout(() => showNextMessage(index + 1), msg.delay);
      }, 1500 + Math.random() * 800);
    } else {
      setState((prev) => ({
        ...prev,
        currentMessageIndex: index,
        visibleMessages: [...prev.visibleMessages, msg],
      }));
      timerRef.current = window.setTimeout(() => showNextMessage(index + 1), msg.delay);
    }
  }, []);

  const submitChoice = useCallback(
    (choiceLabelEn: string, choiceLabelAr: string) => {
      const current = stateRef.current;
      if (current.phase !== "waiting" || !current.pendingChoice) return;
      clearTimer();
      const idx = current.currentMessageIndex;
      const picked: AgentMessage = {
        id: current.pendingChoice.id * 10 + 1,
        type: "user-prompt",
        textEn: choiceLabelEn,
        textAr: choiceLabelAr,
        delay: 0,
      };
      setState((prev) => ({
        ...prev,
        phase: "running",
        pendingChoice: null,
        choiceAutoPickAt: null,
        visibleMessages: [...prev.visibleMessages, picked],
      }));
      timerRef.current = window.setTimeout(() => showNextMessage(idx + 1), 700);
    },
    [showNextMessage]
  );
  submitChoiceRef.current = submitChoice;

  const startSimulation = useCallback(() => {
    clearTimer();
    setState({
      phase: "running",
      visibleMessages: [],
      isThinking: false,
      currentMessageIndex: -1,
      pendingChoice: null,
      choiceAutoPickAt: null,
    });
    timerRef.current = window.setTimeout(() => showNextMessage(0), 600);
  }, [showNextMessage]);

  const reset = useCallback(() => {
    clearTimer();
    setState({
      phase: "idle",
      visibleMessages: [],
      isThinking: false,
      currentMessageIndex: -1,
      pendingChoice: null,
      choiceAutoPickAt: null,
    });
  }, []);

  return { state, startSimulation, submitChoice, reset };
}
