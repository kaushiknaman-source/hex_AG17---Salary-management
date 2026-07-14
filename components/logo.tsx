import { cn } from "@/lib/utils";

/**
 * Reconstruction of the Hexagon folded-plane mark, rendered in white per
 * brand requirement for dark-surface / internal application usage.
 * Geometry: three triangular facets folding into a hexagonal silhouette,
 * matching the proportions of the official Hexagon icon.
 */
export function HexagonMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      <path
        d="M35 6 L11 32 L35 88 L35 46 L11 32"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M35 46 L79 26 L79 64 L35 88 L79 64"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HexagonLogo({
  className,
  wordmark = true,
  markClassName,
}: {
  className?: string;
  wordmark?: boolean;
  markClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5 text-white", className)}>
      <HexagonMark className={cn("h-7 w-7", markClassName)} />
      {wordmark && (
        <span className="text-lg font-bold tracking-tight">HEXAGON</span>
      )}
    </div>
  );
}
