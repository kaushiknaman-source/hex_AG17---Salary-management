import { cn } from "@/lib/utils";

/**
 * Official Hexagon icon mark, supplied as a white PNG asset
 * (public/hexagon-icon-white.png). Rendered as an <img> so the true brand
 * geometry is used instead of a hand-drawn approximation.
 */
export function HexagonMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hexagon-icon-white.png"
      alt="Hexagon"
      className={cn("h-8 w-8 object-contain", className)}
    />
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
  if (wordmark) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/hexagon-logo-white.png"
        alt="Hexagon"
        className={cn("h-7 w-auto object-contain", className)}
      />
    );
  }
  return (
    <div className={cn("flex items-center gap-2.5 text-white", className)}>
      <HexagonMark className={cn("h-7 w-7", markClassName)} />
    </div>
  );
}
