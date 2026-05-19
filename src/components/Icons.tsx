// Stroke-based SVG icon set used by the sidebar (and reusable elsewhere).
// All icons share: 24×24 viewBox, currentColor, 1.75 stroke weight,
// round caps & joins. They inherit color from the parent so they pick up
// the active-state green and the muted inactive grey automatically.

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, rest: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...rest,
  };
}

/** Control Tower — radar / dashboard tiles with one accented cell */
export function OverviewIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <rect x="3.25" y="3.25" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.25" y="3.25" width="7.5" height="7.5" rx="1.5" fill="currentColor" opacity="0.18" stroke="currentColor" />
      <rect x="3.25" y="13.25" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.25" y="13.25" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

/** Corridor Map — folded map silhouette with route fold lines */
export function MapIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M9 3.5 3.5 5.5v15L9 18.5l6 2 5.5-2v-15l-5.5 2-6-2z" />
      <path d="M9 3.5v15" />
      <path d="M15 5.5v15" />
    </svg>
  );
}

/** Zone Detail — map pin focused at a point */
export function ZoneIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M12 21.5s-7-6.4-7-12a7 7 0 0 1 14 0c0 5.6-7 12-7 12Z" />
      <circle cx="12" cy="9.5" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Activities — clipboard with check rows */
export function ActivitiesIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <rect x="4.5" y="4.5" width="15" height="16" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="m8.5 12 1.5 1.5 3-3" />
      <path d="M8.5 16.5h7" />
    </svg>
  );
}

/** Reports — document with embedded bar chart */
export function ReportsIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M14 3.5H6.5a1.5 1.5 0 0 0-1.5 1.5v14a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V8.5L14 3.5Z" />
      <path d="M14 3.5V8a1 1 0 0 0 1 1h4" />
      <path d="M9 17v-3" />
      <path d="M12 17v-5" />
      <path d="M15 17v-4" />
    </svg>
  );
}

/** Knowledge Base — open book with center seam */
export function KnowledgeBaseIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M3.5 5.5a2 2 0 0 1 2-2H10a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H5.5a2 2 0 0 1-2-2v-11Z" />
      <path d="M20.5 5.5a2 2 0 0 0-2-2H14a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h4.5a2 2 0 0 0 2-2v-11Z" />
    </svg>
  );
}

/** Ask Control Tower Agent — chat bubble with sparkle */
export function ChatIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size, rest)}>
      <path d="M20.5 12a8.5 8.5 0 1 1-3.6-6.95L20.5 4l-1.05 3.6A8.46 8.46 0 0 1 20.5 12Z" />
      <path d="m12 8.5 .9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
