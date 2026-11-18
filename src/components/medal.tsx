/** Disc colors per place: fill, rim and number. Hex, so they hold inside an SVG in both themes. */
const metals = {
  1: { fill: "#facc15", rim: "#ca8a04", text: "#713f12" },
  2: { fill: "#e4e4e7", rim: "#a1a1aa", text: "#3f3f46" },
  3: { fill: "#fdba74", rim: "#c2410c", text: "#7c2d12" },
} as const;

/**
 * The podium's medal, drawn here so it looks the same on every device (an emoji depends on the
 * phone). Its ribbon carries the site's two colors, red (hong) and blue (chung), like the logo.
 * Decorative: the place is always written next to it.
 */
export function Medal({
  place,
  className = "h-10 w-8",
}: {
  place: 1 | 2 | 3;
  className?: string;
}) {
  const { fill, rim, text } = metals[place];
  return (
    <svg aria-hidden viewBox="0 0 32 40" className={`shrink-0 ${className}`}>
      {/* The ribbon: two straps crossing behind the disc. */}
      <path d="M7 0h7l6 17h-7Z" className="fill-hong" />
      <path d="M25 0h-7l-6 17h7Z" className="fill-chung" />
      <circle
        cx={16}
        cy={27}
        r={11.5}
        fill={fill}
        stroke={rim}
        strokeWidth={2}
      />
      <circle
        cx={16}
        cy={27}
        r={8}
        fill="none"
        stroke={rim}
        strokeWidth={0.75}
        opacity={0.6}
      />
      <text
        x={16}
        y={27}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill={text}
      >
        {place}
      </text>
    </svg>
  );
}
