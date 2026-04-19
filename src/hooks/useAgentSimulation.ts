import { useState, useCallback, useRef } from "react";
import { conversationFlow, type AgentMessage } from "../data/mockData";

export type AgentPhase = "idle" | "running" | "complete";

export interface AgentState {
  phase: AgentPhase;
  visibleMessages: AgentMessage[];
  isThinking: boolean;
  currentMessageIndex: number;
}

export function useAgentSimulation() {
  const [state, setState] = useState<AgentState>({
    phase: "idle",
    visibleMessages: [],
    isThinking: false,
    currentMessageIndex: -1,
  });

  const timerRef = useRef<number | null>(null);

  const showNextMessage = useCallback((index: number) => {
    if (index >= conversationFlow.length) {
      setState((prev) => ({ ...prev, phase: "complete", isThinking: false }));
      return;
    }

    const msg = conversationFlow[index];

    // If this message has a thinking phase, show thinking first
    if (msg.thinking) {
      setState((prev) => ({
        ...prev,
        isThinking: true,
        currentMessageIndex: index,
      }));

      // After a brief thinking delay, reveal the message
      timerRef.current = window.setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isThinking: false,
          visibleMessages: [...prev.visibleMessages, msg],
        }));

        // Schedule next message
        timerRef.current = window.setTimeout(() => showNextMessage(index + 1), msg.delay);
      }, 1500 + Math.random() * 800); // Thinking duration: 1.5-2.3s
    } else {
      // No thinking -- just show the message
      setState((prev) => ({
        ...prev,
        currentMessageIndex: index,
        visibleMessages: [...prev.visibleMessages, msg],
      }));

      timerRef.current = window.setTimeout(() => showNextMessage(index + 1), msg.delay);
    }
  }, []);

  const startSimulation = useCallback(() => {
    setState({
      phase: "running",
      visibleMessages: [],
      isThinking: false,
      currentMessageIndex: -1,
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
    });
  }, []);

  return { state, startSimulation, reset };
}
