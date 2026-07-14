"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CAPABILITIES = [
  "Explain this recommendation",
  "How can we reduce cost?",
  "How can we increase retention?",
  "Generate an offer explanation",
  "Generate a manager summary",
  "Generate an employee-facing explanation",
  "Suggest a negotiation strategy",
];

// A self-contained dark dock, independent of the light content theme, so its
// text colors are hardcoded. Reuses the same /api/chat streaming endpoint as
// before — only the presentation moved from a floating bubble to a docked panel.
export function AiSidePanel({ context, open, onClose }: { context: unknown; open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, context }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: assistantText }]);
      }
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "Something went wrong reaching the AI assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-0 top-0 z-40 flex h-screen w-[380px] flex-col border-l border-white/10 bg-[#0E1A2B] shadow-2xl"
        >
          <div className="flex h-14 items-center justify-between border-b border-white/10 bg-white/[0.03] px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-accent" />
              <p className="text-sm font-semibold text-white">AI Recommendation Assistant</p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-white/60">
                  Grounded in this candidate&rsquo;s specific comparison. Choose a capability or ask your own question.
                </p>
                <div className="space-y-1.5">
                  {CAPABILITIES.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs text-white/75 transition-colors hover:border-sky/40 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  m.role === "user" ? "ml-auto bg-sky-dark text-white" : "bg-white/[0.08] text-white"
                )}
              >
                {m.content || (loading && i === messages.length - 1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "")}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="h-9 flex-1 rounded-md border border-white/10 bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-sky/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-dark text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
