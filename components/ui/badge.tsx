import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Tinted background at official brand hue + the bright brand tone for text,
// which clears WCAG AA against this app's dark card surface.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-sky/25 bg-sky/10 text-sky",
        land: "border-land/30 bg-land/10 text-land",
        sea: "border-sea/30 bg-sea/10 text-sea",
        neutral: "border-border bg-muted text-muted-foreground",
        warn: "border-warn/40 bg-warn/15 text-warn",
        danger: "border-danger/30 bg-danger/10 text-danger",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
