import { useEffect, useState } from "react";

// Tracks whether the viewport matches the given media query (e.g. "(max-width: 768px)").
// SSR-safe: returns `false` on the first render when window is undefined.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export const MOBILE = "(max-width: 768px)";
