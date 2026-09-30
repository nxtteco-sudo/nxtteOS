// The sparkle from the nxtte logo, redrawn as a vector in the logo's own
// colour (sampled from the logo file, not recoloured) for small marks where
// the full wordmark would be unreadable. Always shown on a black ground.
export const STAR_PATH = "M40 0C43 38 50 47 80 50C50 53 43 62 40 100C37 62 30 53 0 50C30 47 37 38 40 0Z";

export function BrandMark({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size * 0.8} height={size} viewBox="0 0 80 100" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nxtte-star" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0b4ea" />
          <stop offset="1" stopColor="#c997d4" />
        </linearGradient>
      </defs>
      <path d={STAR_PATH} fill="url(#nxtte-star)" />
    </svg>
  );
}
