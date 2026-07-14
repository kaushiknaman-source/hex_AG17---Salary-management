"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfferSummary({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — no-op, user can still select the text manually
    }
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy for offer approval"}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 font-sans text-sm leading-relaxed text-foreground/90">
        {text}
      </pre>
    </div>
  );
}
