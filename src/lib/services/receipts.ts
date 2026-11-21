/**
 * Mock receipts service.
 * TODO: Replace with real API when backend exists.
 */
import type { Receipt, ReceiptStep } from "@/lib/store"

/** Build seeded sample receipts for the sample workspace. */
export function buildSampleReceipts(workspaceId: string): Receipt[] {
  const now = Date.now()
  const day = 86_400_000

  return [
    makeReceipt(workspaceId, now - 1 * day, [
      step("GitHub", "list_prs", "state=open", "success", 320),
    ], false),
    makeReceipt(workspaceId, now - 1 * day + 3600_000, [
      step("Slack", "get_messages", "channel=#general, date=today", "success", 520),
    ], false),
    makeReceipt(workspaceId, now - 2 * day, [
      step("Notion", "search_pages", "query=meeting notes", "success", 380),
      step("Slack", "post_message", "channel=#product, write action", "awaiting", 0),
    ], false),
    makeReceipt(workspaceId, now - 2 * day + 7200_000, [
      step("GitHub", "list_commits", "since=7d", "success", 410),
      step("Slack", "post_message", "channel=#eng — BLOCKED by guardrail", "blocked", 0),
    ], false),
    makeReceipt(workspaceId, now - 3 * day, [
      step("GitHub", "create_issue", "title=update onboarding — BLOCKED", "blocked", 0),
    ], false),
    makeReceipt(workspaceId, now - 3 * day + 1800_000, [
      step("Notion", "get_page", "page=product-roadmap", "success", 290),
    ], false),
    makeReceipt(workspaceId, now - 4 * day, [
      step("GitHub", "list_issues", "sprint=active", "success", 350),
      step("Notion", "search_pages", "query=meeting notes", "success", 380),
    ], false),
    makeReceipt(workspaceId, now - 5 * day, [
      step("Slack", "search_messages", "query=receipts demo", "success", 490),
    ], false),
    makeReceipt(workspaceId, now - 6 * day, [
      step("GitHub", "get_pr", "pr=142", "success", 300),
      step("Slack", "post_message", "channel=#eng, draft PR summary — AWAITING", "awaiting", 0),
    ], false),
    makeReceipt(workspaceId, now - 7 * day, [
      step("Notion", "list_databases", "", "success", 270),
    ], false),
  ]
}

function step(
  appId: string,
  toolName: string,
  inputSummary: string,
  status: ReceiptStep["status"],
  durationMs: number
): ReceiptStep {
  return {
    id: crypto.randomUUID(),
    appId,
    toolName,
    inputSummary,
    status,
    durationMs,
    hash: Math.random().toString(16).slice(2, 8),
  }
}

function makeReceipt(
  workspaceId: string,
  createdAt: number,
  steps: ReceiptStep[],
  isSample: boolean
): Receipt {
  return {
    id: `rcpt-${Math.random().toString(16).slice(2, 10)}`,
    workspaceId,
    createdAt,
    durationMs: steps.reduce((sum, s) => sum + s.durationMs, 0),
    steps,
    verified: true,
    isSample,
  }
}
