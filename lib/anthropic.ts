import Anthropic from "@anthropic-ai/sdk";

// Server-side only. Never import this file from a client component.
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model for this application. Override via ANTHROPIC_MODEL env var.
// See https://docs.claude.com/en/docs/about-claude/models for current model IDs.
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
