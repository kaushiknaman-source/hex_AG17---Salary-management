import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official Hexagon icon mark (white), supplied directly by Hexagon brand
 * assets — public/hexagon-icon-white.png. This replaces an earlier
 * hand-drawn approximation; use this component wherever the mark appears.
 * It's a fixed-white raster, so it should only be placed on dark or
 * sufficiently colorful surfaces (which is every surface it's used on here).
 */
export function HexagonMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block h-8 w-8", className)}>
      <Image
        src="/hexagon-icon-white.png"
        alt="Hexagon"
        fill
        sizes="32px"
        className="object-contain"
        priority
      />
    </span>
  );
}

/**
 * Official full Hexagon logo lockup (icon + wordmark, white) — supplied
 * directly by Hexagon brand assets, public/hexagon-logo-white.png.
 */
export function HexagonLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block h-8 w-[90px]", className)}>
      <Image
        src="/hexagon-logo-white.png"
        alt="Hexagon"
        fill
        sizes="200px"
        className="object-contain object-left"
        priority
      />
    </span>
  );
}
