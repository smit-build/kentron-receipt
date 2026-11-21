/**
 * Mock workspaces service.
 * TODO: Replace with real API when backend exists.
 */
import type { WorkspaceState } from "@/lib/store"

export interface CreateWorkspacePayload {
  name: string
  orgId: string
}

/** Mock create workspace. */
export async function mockCreateWorkspace(
  payload: CreateWorkspacePayload
): Promise<WorkspaceState> {
  // TODO: POST /orgs/:orgId/workspaces
  await delay(300)
  return {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    isSample: false,
    connectedApps: [],
    connectedClients: [],
  }
}

/** Returns a seeded "Sample workspace" with prefilled GitHub/Slack/Notion and sample receipts. */
export function buildSampleWorkspace(): WorkspaceState {
  return {
    id: "sample",
    name: "Sample workspace",
    isSample: true,
    connectedApps: [
      { appId: "GitHub", enabledTools: ["list_prs", "get_pr", "list_commits", "create_issue"] },
      { appId: "Slack", enabledTools: ["list_channels", "get_messages", "search_messages"] },
      { appId: "Notion", enabledTools: ["search_pages", "get_page", "list_databases"] },
    ],
    connectedClients: [],
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
