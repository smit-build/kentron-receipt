/**
 * Mock clients service.
 * TODO: Replace with real API when backend exists.
 */
import type { ConnectedClient } from "@/lib/store"

export type ClientType = ConnectedClient["clientType"]

export const CLIENT_LABELS: Record<ClientType, string> = {
  "claude-ai": "Claude.ai",
  "claude-desktop": "Claude Desktop",
  "claude-code": "Claude Code",
  cursor: "Cursor",
  codex: "Codex",
  other: "Other MCP client",
}

/**
 * Mock "wait for first call" — simulates a client connecting.
 * Dev panel "Simulate client call" resolves this immediately.
 * TODO: Replace with real webhook / server-sent event.
 */
export function waitForClientCall(
  _workspaceId: string,
  onSuccess: () => void,
  timeoutMs = 120_000
): () => void {
  // Returns a cancel function
  const timer = setTimeout(() => {
    // Timeout — caller shows troubleshooting UI
  }, timeoutMs)

  // Expose a manual trigger via a custom event (used by dev panel)
  const handler = () => {
    clearTimeout(timer)
    onSuccess()
    window.removeEventListener("receipt:simulate-client-call", handler)
  }
  window.addEventListener("receipt:simulate-client-call", handler)

  return () => {
    clearTimeout(timer)
    window.removeEventListener("receipt:simulate-client-call", handler)
  }
}

/** Dev panel: fire the simulate event. */
export function simulateClientCall() {
  window.dispatchEvent(new Event("receipt:simulate-client-call"))
}
