import { useState, useCallback, useRef } from "react";
import { conversationFlow, type AgentMessage } from "../data/mockData";

export type AgentPhase = "idle" | "running" | "waiting" | "complete";

export interface AgentState {
  phase: AgentPhase;
  visibleMessages: AgentMessage[];
  isThinking: boolean;
  currentMessageIndex: number;
  pendingChoice: AgentMessage | null;
}

export function useAgentSimulation() {
  const [state, setState] = useState<AgentState>({
    phase: "idle",
    visibleMessages: [],
    isThinking: false,
    currentMessageIndex: -1,
    pendingChoice: null,
  });

  const timerRef = useRef<number | null>(null);

  const showNextMessage = useCallback((index: number) => {
    if (index >= conversationFlow.length) {
      setState((prev) => ({ ...prev, phase: "complete", isThinking: false }));
      return;
    }

    const msg = conversationFlow[index];

    // Interactive choice — pause and wait for the user
    if (msg.type === "user-choice") {
      setState((prev) => ({
        ...prev,
        phase: "waiting",
        isThinking: false,
        currentMessageIndex: index,
        pendingChoice: msg,
      }));
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
      let nextIndex = -1;
      setState((prev) => {
        if (prev.phase !== "waiting" || !prev.pendingChoice) return prev;
        nextIndex = prev.currentMessageIndex + 1;
        const picked: AgentMessage = {
          id: prev.pendingChoice.id * 10 + 1,
          type: "user-prompt",
          textEn: choiceLabelEn,
          textAr: choiceLabelAr,
          delay: 0,
        };
        return {
          ...prev,
          phase: "running",
          pendingChoice: null,
          visibleMessages: [...prev.visibleMessages, picked],
        };
      });
      if (nextIndex >= 0) {
        timerRef.current = window.setTimeout(() => showNextMessage(nextIndex), 800);
      }
    },
    [showNextMessage]
  );

  const startSimulation = useCallback(() => {
    setState({
      phase: "running",
      visibleMessages: [],
      isThinking: false,
      currentMessageIndex: -1,
      pendingChoice: null,
    });
    timerRef.current = window.setTimeout(() => showNextMessage(0), 600);
  }, [showNextMessage]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({
      phase: "idle",
      visibleMessages: [],
      isThinking: false,
      currentMessageIndex: -1,
      pendingChoice: null,
    });
  }, []);

  return { state, startSimulation, submitChoice, reset };
}
