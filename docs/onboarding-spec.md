# Receipt onboarding and learnability spec

## 0. Goal
- New user reaches their first verified receipt with no human help.
- Main metric: time to first receipt (first tool call recorded). Every step should serve this.
- Every step is skippable. Skipping never strands the user: defaults fill the gap, and the app explains the next step at the point where it's needed.
- Key insight: Chat is the landing screen, so the first receipt comes from Chat inside the app. No CLI is needed for first value. Connecting an external AI client (Claude, Cursor…) is a later, optional step.

## 1. Glossary (use these words consistently in all UI copy)
- Workspace: a boundary inside the org with its own connected apps, allowed tools and activity.
- App: an integration such as GitHub or Slack. Connected per workspace.
- Tool: one action inside an app. Agents can only use tools that are turned on.
- AI client: an external AI tool that uses a workspace (Claude.ai, Claude Desktop, Claude Code, Cursor, Codex, any MCP client).
- Chat: Receipt's built-in chat. Uses the current workspace's apps. Needs the user's OpenAI API key.
- Receipt: a tamper-evident record of every step an agent took, in order. Can be replayed and verified.
- Guardrail: a rule that blocks an action or requires approval.

## 2. Journey
Sign up → 1 Welcome (intent) → 2 Create workspace → 3 Connect apps → 4 Add OpenAI key → 5 Invite teammates → Chat.
- Steps 1–5 have Back, Skip and a "Step x of 5" indicator. A "Skip setup" link at the top exits straight to Chat from any step.
- Skip defaults:
  - Workspace skipped: auto-create "[First name]'s workspace".
  - Apps skipped: Chat opens in the no-apps state.
  - Key skipped: Chat opens in the no-key state.
  - Invite skipped: nothing happens; the checklist keeps an optional reminder.
- After onboarding, users always land on Chat in their workspace. Returning users land on their last visited screen.

## 3. Onboarding screens
Layout: centred single column (~560px), Receipt logo top-left, "Skip setup" top-right, progress dots, primary button bottom-right, Back bottom-left. No sidebar during onboarding.

3.1 Sign up (mock auth): "Continue with Google" button, or first name + work email + password. First name is used throughout the app.

3.2 Welcome / intent
- Title: "Welcome, [First name]. What should your agents help with?"
- Sub: "Pick up to 3. We'll suggest apps to connect. You can change this anytime."
- Chips: Engineering, Customer support, Sales, Marketing & growth, Finance & RevOps, IT & security, Data & analytics, Product, People & HR, Founders & leadership, Legal & compliance.

3.3 Create workspace
- Title: "Name your first workspace"
- Input prefilled: "[First name]'s workspace"
- Helper: "A workspace is a safe boundary. Anything connected here (Chat, Claude, Cursor) can only use the apps and tools you allow in this workspace."
- Compact static "How Receipt works" diagram (see 5.4).

3.4 Connect apps
- Title: "Connect the apps your agents should use"
- Sub: "Connect with one click. You choose exactly which actions agents can take."
- Suggested apps from the intent map shown first as larger tiles, then "Browse all apps" (searchable, uses the same grouping as section 8).
- OAuth apps: Connect opens a popup/new window with the provider's sign-in and consent screen (mock it). Slack's consent includes a Slack workspace picker. On return the tile shows a check.
- API key / token apps: Connect opens an inline form (token field, "Where do I find this?" link).
- After connecting, a "Choose tools" sheet opens. Use the app's existing default tool selection. If none exists: read tools on, write tools off, and mark this "[TODO founder: confirm default]". Copy: "Agents can only use the tools you turn on. Change this anytime."
- Connected tiles show "x of y tools on".

3.5 Add OpenAI key
- Title: "Add your OpenAI API key to use Chat"
- Sub: "Chat runs on your own OpenAI key. You can add it later in Settings."
- Masked input with paste button, a "Where do I find this?" link to https://platform.openai.com/api-keys, and a Test key action with states: testing, valid, invalid (mock: valid if it starts with "sk-").
- Storage note copy: "[TODO founder: confirm storage/encryption copy]". Prototype stores only hasOpenAIKey + last 4 characters.

3.6 Invite teammates
- Title: "Receipt works best with your team"
- Sub: "Everyone's agent actions land in one shared, verifiable record."
- Email chips input + "Copy invite link". Role selector only if roles already exist in the codebase.

3.7 Finish: route to Chat in the created workspace, with a one-time welcome line in Chat.

### Intent → suggested apps (use only currently available apps)
- Engineering: GitHub, Linear, Jira, Slack, Vercel, Datadog
- Customer support: Slack, Gmail, Notion, HubSpot, Zoom
- Sales: HubSpot, Apollo, Gmail, Google Calendar, Slack
- Marketing & growth: Google Analytics, Google Ads, Notion, Slack, YouTube
- Finance & RevOps: Stripe App, Google Sheet, Airtable, Gmail
- IT & security: AWS, Azure, Google Cloud, Datadog, Jira
- Data & analytics: Google Sheet, Airtable, AWS, Google Cloud
- Product: Linear, Jira, Notion, Confluence, Slack
- People & HR: Gmail, Google Calendar, Slack, Notion, Zoom
- Founders & leadership: Slack, Gmail, Google Calendar, Notion
- Legal & compliance: Google Docs, Google Drive, Gmail, Confluence
De-duplicate across selected intents and show at most 8 suggestions. No intent selected: GitHub, Slack, Notion, Gmail, Google Calendar, Linear.

## 4. Chat
Chat header: "Chatting in [workspace] ▾" switcher. Default is the current workspace. "All workspaces" is an explicit option, labelled "[TODO founder: confirm cross-workspace chat]".

States:
- A. No key: centred card "Add your OpenAI API key to start chatting" with inline key input + Test. Composer disabled, with placeholder "Add an API key to start". Suggested prompts are shown but disabled.
- B. Key, no apps: heading "Connect an app so Chat can work with your tools". Compact diagram. Suggested app tiles (from intent) with inline one-click Connect, using the same flow as 3.4. General prompts available: "What can Receipt do?", "How do receipts work?". Composer is enabled for general questions.
- C. Ready (key + ≥1 app): "Hi [First name], try one of these". 4–6 prompt cards, each showing the logos of the apps it uses. Include at least one cross-app prompt when possible. Read-only prompts come first.
- D. Conversation: messages + composer. Typing "@" opens a popover of connected apps (logo + name). Selecting one inserts an app chip. Mentions are optional.

Receipt card: under every assistant reply that used tools.
- Collapsed: receipt icon · "Receipt" · "3 steps" · green "Verified" badge · duration · "Replay".
- Expanded: ordered step rows (app logo, tool name, short input summary, status: success / blocked by guardrail / awaiting approval, duration).
- Replay: opens a right side panel that replays steps one by one (~600ms each). Each step shows a short hash and a "linked to previous" connector. A "Verify chain" button shows success. Under reduced motion, show all steps at once.
- First receipt ever: one-time coachmark on the card: "This is a receipt. Every action the agent took, in order, and it can't be edited. Replay it anytime." Mark it seen.
- Receipts created in Chat also appear in the workspace dashboard and in Activity.

Mock layer: scripted responses for every suggested prompt (each with 1–4 tool steps). Free text gets a generic answer with one tool call on a connected app. Write prompts that touch Slack posting or other write tools return an "Awaiting approval" step, to show guardrails in action.

### App → suggested prompts
- GitHub: "List my open pull requests" · "What changed in my repos this week?"
- Slack: "Summarise today's messages in #general"
- Notion: "Find our latest meeting notes"
- Linear: "Show issues assigned to me"
- Jira: "List my open tickets in this sprint"
- Gmail: "Summarise my unread emails from today"
- Google Calendar: "What's on my calendar tomorrow?"
- Google Drive: "Find the most recent doc shared with me"
- HubSpot: "Show deals closing this month"
- Stripe App: "How many new subscriptions this week?"
- Google Analytics: "Top 5 pages by traffic last week"
- Datadog: "Are any alerts firing right now?"
- Any other app: "What can you do with [App]?"
Cross-app (show when both apps are connected):
- GitHub + Slack: "Summarise my open PRs and draft a Slack update"
- Gmail + Google Calendar: "Find recent emails from people I'm meeting tomorrow"
- Notion + Slack: "Find last week's meeting notes and draft the action items for Slack"
- Linear or Jira + Slack: "Post blocked issues to #eng" (write action, returns "Awaiting approval")

## 5. Connect client dialog
Opened from: workspace header "Connect client", checklist optional step, Settings.
- 5.1 Top: full "How Receipt works" diagram (5.4).
- 5.2 Step 1, "Which AI client do you use?": grid of cards with logos: Claude.ai, Claude Desktop, Claude Code, Cursor, Codex, Other MCP client.
- 5.3 Step 2, per-client setup, easiest method first:
  - Claude.ai: copy remote MCP URL for this workspace + 3 short steps. "[TODO founder: confirm remote URL support]"
  - Cursor: "Add to Cursor" one-click button. "[TODO founder: confirm deeplink support]"
  - Claude Desktop, Claude Code, Codex, Other: numbered steps. 1) Run `receipt setup`. 2) Run `receipt workspace current` and check it shows this workspace (switch with `receipt workspace use <workspace>`). 3) Run `receipt mcp config generic` and paste the generated mcpServers JSON into the client's MCP settings. 4) Restart the client. Each command has its own copy button, and there's also a "Copy all" button.
  - Every client also has a collapsible "Advanced: CLI setup".
  - Step 3, waiting: "Waiting for the first call from [client]…" with a pulsing dot, and a test prompt to paste into that client (based on the workspace's connected apps), with a copy button.
  - Success: "Connected. First receipt recorded." with "View receipt" and "Done".
  - No call after 2 minutes: show a troubleshooting checklist: "Restarted the client?", "Right workspace selected? (`receipt workspace current`)", "JSON pasted in the client's MCP settings?", "App connected and the tool turned on?", plus a Docs link. A "Check again" button.
  - Dev panel "Simulate client call" triggers success.

5.4 "How Receipt works" diagram, one component with props size="full|compact" and animated (bool):
- Layout: 3 columns left to right, inside a bordered card. Stacks vertically below 560px.
  - Left, "Your AI client": small stacked logos (Receipt Chat, Claude, Cursor, Codex). Label: "Sends a request".
  - Middle, "[Workspace name]": a slightly larger card with three rows, each with an icon: "Checks your guardrails" (shield), "Uses only allowed tools" (sliders), "Writes a receipt" (receipt / file-check).
  - Right, "Your apps": logos of this workspace's connected apps. If none: GitHub, Slack, Notion faded, with "Connect apps" below.
  - Thin connector lines between columns.
- Animation (full size only): a dot travels from client to workspace. Rows 1→2→3 tick in sequence (~300ms each). The dot continues to the apps. A small chip slides out under the middle card: "Receipt #a3f9 · Verified". Loops every ~4s and pauses on hover.
- "See a blocked action" toggle (full size only): row 1 shows a red cross, the dot stops at the workspace, and the chip reads "Blocked · still recorded".
- Reduced motion or compact size: static, all three rows ticked, receipt chip visible.
- Caption (full): "Your AI client never talks to your apps directly. Every request goes through this workspace, gets checked against your guardrails, is limited to the tools you allowed, and is recorded as a receipt you can replay and verify."
- Caption (compact): "Every request is checked, limited and recorded."
- Used in: Connect client dialog (full), onboarding step 3.3 (compact), Chat state B (compact), dashboard no-apps empty state (compact).

## 6. Sidebar progressive disclosure
Stages are based on ORG state, not user state, so a teammate invited into an active org sees everything.
- Stage 1 (always): Chat, Workspaces list (+ Create new), Docs, account menu.
- Stage 2 (org has ≥1 connected app): + Activity.
- Stage 3 (org has ≥1 receipt): + Governance group (Guardrails, Policies, Skills), Org Brain, "Add to Slack".
- On reveal: the item fades in with a small "New" dot and a one-time tooltip with its description. The dot clears on first visit.
- Account menu: "Show all features" toggle (persisted) that reveals everything immediately, for power users and demos.
- Hidden items' routes stay reachable by URL.
- No permanent subtext under nav items. Instead: a hover tooltip on every nav item with its one-line description, and a one-line description under every page title.
- Labels and descriptions live in the nav config file:
  - Chat (was "AI Chat"): "Ask questions and run tasks across your connected apps."
  - Activity (was "User Activity"): "Every tool call across your workspaces, with its receipt."
  - Guardrails: "Rules that block risky actions or require approval."
  - Policies: "[TODO founder]"
  - Skills: "[TODO founder]"
  - Org Brain: "[TODO founder]"
  - Add to Slack (was "Invite Agent to Slack"): "Use Receipt from Slack. [TODO founder: confirm]"
  - Docs: "Guides and reference."

## 7. Sample workspace
- Every new org gets a "Sample workspace" with a "Sample" badge, listed after the user's own workspace. It is separate from "[First name]'s workspace".
- Prefilled: GitHub, Slack and Notion connected, 7 days of calls, ~10 receipts including 2 blocked by a guardrail and 1 awaiting approval, and sample Chat conversations with receipts.
- Persistent banner: "You're exploring sample data. Nothing here is real." + "Go to [First name]'s workspace".
- Real actions (Connect app, Invite, Connect client, Add key) are disabled here, with tooltip "Not available in the sample workspace".
- Its menu has "Hide sample workspace" (restorable from Settings).
- Sample receipts do NOT count toward the org's real nav stages or checklist.
- Real workspaces never show sample numbers. Remove the current "Sample data" label from real workspaces.

## 8. Integrations list
- Groups in this order, each sorted A–Z (case-insensitive) and each with a small header + count: Connected → Available → Coming soon.
- Search covers all groups. Add status pills: All / Available / Coming soon. The existing category and method filters stay.
- Coming soon cards: muted, "Coming soon" label, no Connect button, optional "Notify me" (mock).

## 9. Empty states (one line on what, one on why, one primary action)
- Dashboard, no apps: "No apps connected yet" / "Connect an app so agents in this workspace can use it. Every call is checked and recorded." / [Connect apps] + compact diagram.
- Dashboard, apps but no calls: "No activity yet" / "Run a prompt in Chat or connect an AI client. Calls and their receipts show up here." / [Open Chat] [Connect client]
- Activity, empty: "Nothing recorded yet" / "Every tool call made through Receipt appears here with its receipt." / [Try a prompt in Chat]
- Guardrails, empty: "No guardrails yet" / "Guardrails block risky actions or ask for approval before they run." / [Add guardrail]
- Integrations, connected-only with none: "No apps connected in this workspace" / [Show all apps]
- Integrations search, no results: "No apps match '[query]'" / "Try another name."

## 10. Setup checklist (workspace dashboard card)
- Required: Create workspace (auto-done) · Connect an app · Add OpenAI key · Run your first prompt in Chat (done = first receipt).
- Optional, shown under "Recommended": Invite a teammate · Connect an external AI client.
- Header: "Get to your first receipt" / "[x] of 4 done".
- Each undone row has its own action button. The card has a "Hide" option and disappears once all 4 required items are done (optional items then move to Settings).
- Replace the current copy "This card disappears after your first client call."

## 11. Settings tab (workspace)
- General: workspace name (editable), delete workspace (confirm dialog).
- AI model keys: OpenAI key (masked, last 4 characters, Replace, Remove, Test). Same component as onboarding 3.5.
- Members: invite (same component as onboarding 3.6), list of members.
- Clients: list of connected AI clients + "Connect client".

## 12. Open items for founder
Remote URL / deeplink support per client · default tool selection on connect · key storage copy · cross-workspace chat · roles for invites · descriptions for Policies, Skills, Org Brain, Add to Slack · whether blocked actions are recorded as receipts (assumed yes).
