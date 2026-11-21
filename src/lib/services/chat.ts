/**
 * Mock chat service.
 * TODO: Replace with real OpenAI / LLM gateway API calls.
 */
import type { Receipt, ReceiptStep } from "@/lib/store"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  receiptId?: string
  createdAt: number
}

export interface ChatResponse {
  message: ChatMessage
  receipt?: Receipt
}

/** Scripted responses for suggested prompts */
const SCRIPTED: Record<string, { content: string; steps: Partial<ReceiptStep>[] }> = {
  "List my open pull requests": {
    content: "You have **4 open pull requests** on kentron-receipt.\n\n**#142 — feat: add receipt replay** · `feat/receipt-replay`\nAwaiting review · 3 commits · all CI checks passing · updated 2h ago\n\n**#140 — fix: sidebar collapse on mobile** · `fix/sidebar-collapse`\n1 review requested (Sarah) · 2 inline comments · CI passing · updated 6h ago\n\n**#139 — chore: update dependencies** · `chore/update-deps`\nReady to merge · Dependabot PR · all checks green · updated 1d ago\n\n**#137 — feat: chat composer redesign** · `feat/chat-composer` *(draft)*\n8 commits · work in progress · updated 3h ago\n\nMost urgent is #140 — Sarah's review has been pending ~6 hours. Worth a nudge or a quick pass before EOD.",
    steps: [
      { appId: "GitHub", toolName: "pulls_list", inputSummary: "owner=smitux, state=open, sort=updated, per_page=20", status: "success", durationMs: 312 },
      { appId: "GitHub", toolName: "pulls_get", inputSummary: "pull_number=142", status: "success", durationMs: 198 },
      { appId: "GitHub", toolName: "pulls_get", inputSummary: "pull_number=140", status: "success", durationMs: 203 },
    ],
  },
  "What changed in my repos this week?": {
    content: "Here's the activity across your repos in the last 7 days.\n\n**kentron-receipt** (most active)\n12 commits to `main` · 3 PRs opened, 1 merged · 4 issues closed · 2 new contributors\n\n**kentron-website**\n4 commits · 1 content PR merged · no new issues\n\n**mcp-gateway** *(private)*\n2 commits · dependency bump via Dependabot\n\nNotably: PR #140 has been sitting without a full review for 3 days, and there's a Dependabot PR on `mcp-gateway` that's been open since Monday — both are low-risk merges.",
    steps: [
      { appId: "GitHub", toolName: "repos_list", inputSummary: "affiliation=owner, sort=pushed", status: "success", durationMs: 287 },
      { appId: "GitHub", toolName: "commits_list", inputSummary: "repo=kentron-receipt, since=7d_ago", status: "success", durationMs: 410 },
      { appId: "GitHub", toolName: "commits_list", inputSummary: "repo=kentron-website, since=7d_ago", status: "success", durationMs: 324 },
      { appId: "GitHub", toolName: "issues_list", inputSummary: "state=closed, since=7d_ago, all repos", status: "success", durationMs: 391 },
    ],
  },
  "Summarise today's messages in #general": {
    content: "Here's what happened in #general today (27 messages, 11 participants).\n\n**Morning**\nTeam standup at 9:05 AM — everyone unblocked. Marcus mentioned the design review is moved to Thursday.\n\n**Midday**\nSarah posted the updated onboarding flow screens and asked for async feedback by 3 PM. Got 6 reactions and 2 threaded replies (both positive).\n\n**Afternoon**\nArjun shared a short Loom of the new Receipt demo — 4 people watched it. Brief discussion about the replay animation timing.\n\nNo action items were explicitly called out. The design feedback deadline (3 PM) has already passed — Sarah may still be waiting.",
    steps: [
      { appId: "Slack", toolName: "conversations_history", inputSummary: "channel=C04GENERAL, oldest=today_00:00, limit=200", status: "success", durationMs: 521 },
      { appId: "Slack", toolName: "users_list", inputSummary: "limit=100", status: "success", durationMs: 198 },
    ],
  },
  "Find our latest meeting notes": {
    content: "Found 3 recent meeting notes in Notion.\n\n**Product sync — Nov 1** · updated 2 days ago\nAttendees: Sarah, Marcus, Arjun, Priya. Topics: onboarding flow v2, chat states, Q4 roadmap. 4 action items captured.\n\n**Engineering standup — Oct 31**\nAttendees: full eng team. Blockers: none. Shipped: receipt card UI. Up next: streaming + replay.\n\n**Design review — Oct 28**\nAttendees: Sarah, Priya. Focus: chat screen, composer redesign. Notes include Figma links and open questions.\n\nThe product sync from Nov 1 has 4 action items — want me to pull those out and check if they're done?",
    steps: [
      { appId: "Notion", toolName: "search", inputSummary: "query=meeting notes, filter=page, sort=last_edited_time desc", status: "success", durationMs: 382 },
      { appId: "Notion", toolName: "pages_retrieve", inputSummary: "page_id=nov-1-product-sync", status: "success", durationMs: 247 },
    ],
  },
  "Show issues assigned to me": {
    content: "You have **6 issues** assigned across Linear.\n\n**In Progress**\n· **LIN-241** Onboarding spec review — no updates in 2 days\n· **LIN-238** Chat state machine — PR open (#142)\n\n**To Do**\n· **LIN-244** Receipt card empty state\n· **LIN-243** Sidebar keyboard navigation\n\n**Done (this week)**\n· **LIN-233** Receipt card UI — merged Nov 3\n· **LIN-229** Composer redesign — merged Nov 4\n\nLIN-241 hasn't moved in 2 days — you might want to leave a comment or unassign it if it's blocked.",
    steps: [
      { appId: "Linear", toolName: "issues_list", inputSummary: "assignee=me, state!=cancelled, orderBy=updatedAt", status: "success", durationMs: 291 },
    ],
  },
  "List my open tickets in this sprint": {
    content: "You have **5 open tickets** in the current sprint (Sprint 14, ending Nov 8).\n\n**RCPT-18** Chat states — *In Progress* · due today\n**RCPT-17** Onboarding flow — *In Progress* · 2 sub-tasks open\n**RCPT-16** Dev panel toggle — *To Do* · unstarted\n**RCPT-15** Sample workspace seed — *To Do* · blocked on RCPT-18\n**RCPT-14** Sidebar progressive disclosure — *To Do* · low priority\n\nSprint ends in 3 days. RCPT-18 and RCPT-17 are the critical path — RCPT-15 is blocked until RCPT-18 is done.",
    steps: [
      { appId: "Jira", toolName: "issues_search", inputSummary: "jql=sprint=active AND assignee=currentUser() AND status!=Done ORDER BY priority", status: "success", durationMs: 364 },
      { appId: "Jira", toolName: "sprint_get", inputSummary: "boardId=42, state=active", status: "success", durationMs: 211 },
    ],
  },
  "Summarise my unread emails from today": {
    content: "You have **3 unread emails** from today.\n\n**GitHub** · 8:14 AM\n'Your PR #139 was merged' — chore/update-deps went in, all checks passed. No action needed.\n\n**Loom** · 11:32 AM\n'Arjun shared a recording with you' — titled 'Receipt replay demo v2'. 2m 14s long.\n\n**Stripe** · 2:07 PM\n'New payout processed: $1,240.00' — to your bank account ending 4821. Expected arrival: 2 business days.\n\nNothing urgent. The Loom is probably worth watching — it's the replay demo Arjun mentioned in #general.",
    steps: [
      { appId: "Gmail", toolName: "messages_list", inputSummary: "q=is:unread after:today, maxResults=20", status: "success", durationMs: 441 },
      { appId: "Gmail", toolName: "messages_get", inputSummary: "ids=[msg_gh, msg_loom, msg_stripe], format=metadata", status: "success", durationMs: 318 },
    ],
  },
  "What's on my calendar tomorrow?": {
    content: "You have **3 events** tomorrow, Wednesday Nov 6.\n\n**9:00 — 9:30 AM · Daily standup**\nVideo call · Google Meet · Recurring · 8 attendees\n\n**11:00 AM — 12:00 PM · Product review: onboarding flow**\nWith Sarah, Marcus, Priya · Notion doc linked in invite · Sarah is the organiser\n*Prep: Sarah shared updated screens in #general today — worth reviewing beforehand.*\n\n**2:00 — 2:30 PM · 1:1 with Marcus**\nVideo call · no agenda set yet\n\nYou have a 90-minute gap between standup and the product review — good time for focused work. Want me to block it?",
    steps: [
      { appId: "Google Calendar", toolName: "events_list", inputSummary: "calendarId=primary, timeMin=tomorrow_00:00, timeMax=tomorrow_23:59, singleEvents=true", status: "success", durationMs: 309 },
    ],
  },
  "Find the most recent doc shared with me": {
    content: "The most recent document shared with you is **Receipt Onboarding Spec v2** — a Google Doc shared by Sarah 3 hours ago.\n\nIt's a 12-page spec covering the new onboarding flow: welcome screen, intent selector, app connection, and first-run chat. Sarah left a comment asking for your feedback on the 'connect apps' step by EOD tomorrow.\n\nTwo other recently shared files:\n- **Q4 Roadmap Draft** (Slides) — shared by Marcus yesterday\n- **Sprint 14 retro notes** (Doc) — shared by Priya 2 days ago",
    steps: [
      { appId: "Google Drive", toolName: "files_list", inputSummary: "q=sharedWithMe=true, orderBy=sharedWithMeTime desc, pageSize=5", status: "success", durationMs: 352 },
      { appId: "Google Drive", toolName: "files_get", inputSummary: "fileId=onboarding-spec-v2, fields=name,owners,modifiedTime,webViewLink", status: "success", durationMs: 219 },
    ],
  },
  "Show deals closing this month": {
    content: "You have **4 deals** closing this month with a combined value of $50k.\n\n**Acme Corp** · $24,000 · 90% — Enterprise plan, 3-year contract. Last activity: call with their CTO on Oct 31. Next step: legal review of MSA.\n\n**Globex** · $12,000 · 70% — Mid-market, annual. Demo went well last week. Waiting on procurement approval.\n\n**Initech** · $8,000 · 60% — SMB, monthly-to-annual upgrade. POC in progress, ends Nov 10.\n\n**Umbrella** · $6,000 · 45% — Inbound trial. No recent engagement — might need a follow-up.\n\nAcme and Globex together are $36k — focus there. Umbrella has gone cold; a quick check-in email might be worth sending.",
    steps: [
      { appId: "HubSpot", toolName: "deals_search", inputSummary: "closedate__lte=this_month_end, pipeline=default, dealstage!=closedlost, properties=[amount,probability,dealstage]", status: "success", durationMs: 423 },
      { appId: "HubSpot", toolName: "engagements_get_recent", inputSummary: "objectType=DEAL, limit=4", status: "success", durationMs: 311 },
    ],
  },
  "How many new subscriptions this week?": {
    content: "**23 new subscriptions** this week — up 18% from last week's 19.\n\nBreakdown by plan:\n· Pro (monthly) — 11 subs · $440 MRR\n· Pro (annual) — 6 subs · $720 MRR\n· Starter — 6 subs · $180 MRR\n\n**Total MRR impact: +$1,340** (recurring)\n\nOne outlier: a single annual Pro signup from a company email (acorp.io) — worth checking if it's related to the Acme Corp deal in progress. Conversion rate from trial this week is 31%, up from 24% last week.",
    steps: [
      { appId: "Stripe App", toolName: "subscriptions_list", inputSummary: "created[gte]=7d_ago, status=active, expand=[data.plan]", status: "success", durationMs: 394 },
    ],
  },
  "Top 5 pages by traffic last week": {
    content: "Here are your top 5 pages by sessions last week (Oct 28 – Nov 3).\n\n1. **/pricing** · 4,210 sessions · avg 2m 18s · 34% conversion to signup\n2. **/** (homepage) · 3,890 sessions · avg 48s · main entry point from search\n3. **/docs** · 2,100 sessions · avg 4m 02s · high engagement, low bounce\n4. **/blog/mcp-gateway** · 1,430 sessions · 92% from organic search\n5. **/signup** · 980 sessions · 68% completion rate\n\n`/docs` has the highest session depth (4+ pages avg) — users who land there are your most engaged. The blog post on MCP gateway drove nearly all its traffic from one HN thread on Oct 29.",
    steps: [
      { appId: "Google Analytics", toolName: "runReport", inputSummary: "metrics=[sessions,avgSessionDuration,bounceRate], dimensions=[pagePath], dateRange=last7days, orderBy=sessions desc, limit=10", status: "success", durationMs: 483 },
    ],
  },
  "Are any alerts firing right now?": {
    content: "**1 alert is currently firing** (P2).\n\n**High error rate — receipt-api** · firing for 14 min\nService: `receipt-api` · Environment: production\nError rate: 4.2% (threshold: 1%) · P99 latency: 1.8s (threshold: 800ms)\nAffected endpoints: `POST /receipts`, `GET /receipts/:id`\n\nLast deploy was 22 minutes ago (commit `a3f72c` by Marcus — 'fix: receipt step serialisation'). The timing lines up — this is likely related.\n\n2 other monitors in OK state: `auth-service`, `mcp-gateway`. No downstream impact detected yet.",
    steps: [
      { appId: "Datadog", toolName: "monitors_search", inputSummary: "query=status:alert scope:env:production", status: "success", durationMs: 334 },
      { appId: "Datadog", toolName: "monitors_get_all_groups", inputSummary: "monitor_id=12847, group_states=[Alert,Warn]", status: "success", durationMs: 218 },
    ],
  },
  // Cross-app
  "Summarise my open PRs and draft a Slack update": {
    content: "I pulled your 4 open PRs and drafted a message for #eng.\n\n---\n\n> *PR update (Nov 5):*\n> • `feat/receipt-replay` (#142) — waiting on review, CI green\n> • `fix/sidebar-collapse` (#140) — 2 comments, Sarah's review still pending\n> • `chore/update-deps` (#139) — ready to merge now\n> • `feat/chat-composer` (#137) — still in draft\n\n---\n\nThe message is queued in Slack as a draft — tap **Approve** to post it, or **Decline** to discard. It'll come from your connected bot account, not your personal user.",
    steps: [
      { appId: "GitHub", toolName: "pulls_list", inputSummary: "owner=smitux, state=open, sort=updated, per_page=20", status: "success", durationMs: 312 },
      { appId: "GitHub", toolName: "pulls_get", inputSummary: "pull_number=142", status: "success", durationMs: 198 },
      { appId: "GitHub", toolName: "pulls_get", inputSummary: "pull_number=140", status: "success", durationMs: 203 },
      { appId: "Slack", toolName: "conversations_list", inputSummary: "types=public_channel, exclude_archived=true, limit=100", status: "success", durationMs: 445 },
      { appId: "Slack", toolName: "chat_postMessage", inputSummary: "channel=#eng, as_user=false, draft=true", status: "awaiting", durationMs: 0 },
    ],
  },
  "Find recent emails from people I'm meeting tomorrow": {
    content: "Found emails from both of your meeting attendees for tomorrow.\n\n**Sarah** (11 AM — Product review)\nSent 'Receipt Onboarding Spec v2' yesterday via Google Drive share. Also forwarded a Figma comment thread 3 days ago. No unanswered threads.\n\n**Marcus** (2 PM — 1:1)\nSent 'Q4 goals — thoughts?' 3 days ago with a 300-word note. No reply from you yet — might be worth reading before the 1:1.\n\nYou're in good shape for the product review. The Marcus email is the one to read before 2 PM.",
    steps: [
      { appId: "Google Calendar", toolName: "events_list", inputSummary: "calendarId=primary, timeMin=tomorrow_00:00, timeMax=tomorrow_23:59, singleEvents=true", status: "success", durationMs: 309 },
      { appId: "Gmail", toolName: "messages_list", inputSummary: "q=from:sarah@kentron.io newer_than:7d, maxResults=5", status: "success", durationMs: 391 },
      { appId: "Gmail", toolName: "messages_list", inputSummary: "q=from:marcus@kentron.io newer_than:7d, maxResults=5", status: "success", durationMs: 384 },
    ],
  },
  "Find last week's meeting notes and draft the action items for Slack": {
    content: "Found the Product sync notes from Oct 28. Here are the 4 action items I extracted, drafted as a Slack message for #product.\n\n---\n\n> *Action items from Product sync (Oct 28):*\n> • @sarah — finalise onboarding spec by Nov 5 ✓ *(done — spec shared today)*\n> • @marcus — review receipt card design by Nov 3 *(no update found)*\n> • @arjun — record replay demo for stakeholders ✓ *(Loom posted Nov 2)*\n> • @all — demo prep for Thursday Nov 7\n\n---\n\nSarah's item is done. Arjun's is done. Marcus's review is overdue — the message flags it. Posting to #product requires your approval.",
    steps: [
      { appId: "Notion", toolName: "search", inputSummary: "query=product sync meeting notes, filter=page, sort=last_edited_time desc", status: "success", durationMs: 382 },
      { appId: "Notion", toolName: "blocks_children_list", inputSummary: "block_id=oct-28-product-sync, page_size=100", status: "success", durationMs: 291 },
      { appId: "Slack", toolName: "users_list", inputSummary: "limit=100", status: "success", durationMs: 198 },
      { appId: "Slack", toolName: "chat_postMessage", inputSummary: "channel=#product, as_user=false, draft=true", status: "awaiting", durationMs: 0 },
    ],
  },
  "Post blocked issues to #eng": {
    content: "Found **2 blocked issues** in Linear.\n\n**LIN-245** — Sidebar keyboard nav · blocked on design sign-off (Sarah)\n**LIN-241** — Onboarding spec review · blocked on external stakeholder feedback\n\nPosting a summary to #eng is a write action — I need your approval before sending. The draft message names both issues and tags the relevant blockers.",
    steps: [
      { appId: "Linear", toolName: "issues_list", inputSummary: "filter={labels:{name:{eq:blocked}}, state:{type:{neq:cancelled}}}", status: "success", durationMs: 293 },
      { appId: "Slack", toolName: "conversations_list", inputSummary: "types=public_channel, exclude_archived=true, limit=100", status: "success", durationMs: 441 },
      { appId: "Slack", toolName: "chat_postMessage", inputSummary: "channel=#eng, as_user=false, draft=true", status: "awaiting", durationMs: 0 },
    ],
  },
  "What can Receipt do?": {
    content: "Receipt is Kentron's MCP gateway — a secure, auditable bridge between your AI clients and your business tools.\n\n**What it does**\nEvery time an AI agent (Claude, Cursor, GPT) calls a tool through Receipt, the action is checked against your guardrails, executed if allowed, and recorded as a tamper-evident receipt.\n\n**Receipts**\nEach receipt is a cryptographically chained log of steps — like a blockchain, but for agent actions. You can replay any receipt to see exactly what happened, verify nothing was altered, and audit it later.\n\n**Guardrails**\nSet policies on what agents can and can't do: read-only access to billing data, require approval before posting to Slack, block access outside business hours.\n\nGet started by connecting an app — GitHub and Slack are good first picks.",
    steps: [],
  },
  "How do receipts work?": {
    content: "Every agent action through Receipt produces a **receipt** — a time-ordered, append-only log of steps.\n\n**How the chain works**\nEach step gets a hash. That hash is computed from the step's content *plus* the previous step's hash — so you can't alter step 2 without breaking step 3's hash, and every step after it. It's the same principle as a blockchain, applied to agent audit logs.\n\n**What's in a step**\n· The tool that was called (`github.pulls_list`)\n· The exact input it received (`state=open, author=me`)\n· The result status (success / awaiting / blocked)\n· How long it took\n· Its hash\n\n**Verification**\nThe Verify chain button in the replay panel recomputes every hash from scratch. If any step was altered after the fact, verification fails and flags the broken link.\n\nThis makes receipts suitable for compliance, security audits, and incident post-mortems.",
    steps: [],
  },
}

/** Generic fallback response when prompt isn't scripted */
function genericResponse(connectedAppIds: string[]): { content: string; steps: Partial<ReceiptStep>[] } {
  const appId = connectedAppIds[0] ?? "GitHub"
  return {
    content: `I ran a quick check using **${appId}**. Everything looks good — no issues found.`,
    steps: [
      { appId, toolName: "get", inputSummary: "query from user message", status: "success", durationMs: 350 },
    ],
  }
}

function buildReceipt(
  workspaceId: string,
  steps: Partial<ReceiptStep>[]
): Receipt | undefined {
  if (steps.length === 0) return undefined
  const receiptSteps: ReceiptStep[] = steps.map((s, i) => ({
    id: `step-${i}`,
    appId: s.appId ?? "unknown",
    toolName: s.toolName ?? "unknown",
    inputSummary: s.inputSummary ?? "",
    status: s.status ?? "success",
    durationMs: s.durationMs ?? 300,
    hash: randomHash(),
  }))
  return {
    id: `rcpt-${randomHash()}`,
    workspaceId,
    createdAt: Date.now(),
    durationMs: receiptSteps.reduce((sum, s) => sum + s.durationMs, 0),
    steps: receiptSteps,
    verified: true,
    isSample: false,
  }
}

/** Send a message and get a scripted or generic response. */
export async function mockSendMessage(params: {
  workspaceId: string
  content: string
  connectedAppIds: string[]
}): Promise<ChatResponse> {
  // TODO: POST /chat/messages with real OpenAI key
  await delay(800 + Math.random() * 400)

  const scripted = SCRIPTED[params.content]
  const { content, steps } = scripted ?? genericResponse(params.connectedAppIds)
  const receipt = buildReceipt(params.workspaceId, steps)

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    receiptId: receipt?.id,
    createdAt: Date.now(),
  }

  return { message, receipt }
}

function randomHash(): string {
  return Math.random().toString(16).slice(2, 8)
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
