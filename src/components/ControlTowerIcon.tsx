interface ControlTowerIconProps {
  size?: number;
  /** "tile" = green brand tile with white icon (logo on dark headers, avatars, login)
   *  "mono" = inherits parent text color (no background) — use on any backdrop */
  variant?: "tile" | "mono";
  cornerRadius?: number;
  className?: string;
  title?: string;
}

export default function ControlTowerIcon({
  size = 40,
  variant = "tile",
  cornerRadius = 10,
  className,
  title = "MBS Road Control Tower",
}: ControlTowerIconProps) {
  const isTile = variant === "tile";
  const stroke = isTile ? "#0AEBD7" : "currentColor";
  const fill = isTile ? "#ffffff" : "currentColor";
  const accent = isTile ? "#0AEBD7" : "currentColor";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      {isTile && <rect width="64" height="64" rx={cornerRadius} fill="#066058" />}

      {/* Signal arcs */}
      <path d="M9 22 Q14 16 19 20" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity={isTile ? 1 : 0.7}/>
      <path d="M45 20 Q50 16 55 22" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity={isTile ? 1 : 0.7}/>

      {/* Antenna */}
      <circle cx="32" cy="7" r="2.2" fill={accent}/>
      <rect x="30.8" y="9" width="2.4" height="6.5" fill={fill}/>

      {/* Cabin */}
      <path d="M16 15 H48 V29 H16 Z M20 18.5 H44 V25.5 H20 Z" fill={fill} fillRule="evenodd"/>

      {/* Tower trunk */}
      <path d="M27 29 L23 51 L41 51 L37 29 Z" fill={fill}/>

      {/* Road / ground */}
      <rect x="7" y="52" width="50" height="4" rx="2" fill={accent}/>
    </svg>
  );
}
