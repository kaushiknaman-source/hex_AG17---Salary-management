import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-sky/30 bg-sky/10 text-sky",
        land: "border-sky/30 bg-sky/10 text-sky",
        sea: "border-sky/20 bg-sky/[0.06] text-sky/80",
        neutral: "border-white/15 bg-white/5 text-neutral-400",
        warn: "border-white/15 bg-white/5 text-neutral-400",
        danger: "border-danger/30 bg-danger/10 text-danger",
        outline: "border-white/15 text-foreground",
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
