/**
 * Mock integrations service.
 * TODO: Replace with real API when backend exists.
 */

export interface ConnectAppResult {
  appId: string
  enabledTools: string[]
}

/**
 * Default tools for an app.
 * Read tools on, write tools off.
 * [TODO founder: confirm default tool selection per app]
 */
export function defaultTools(appId: string): string[] {
  const readToolsByApp: Record<string, string[]> = {
    GitHub: ["list_prs", "get_pr", "list_commits", "list_issues", "get_issue"],
    Slack: ["list_channels", "get_messages", "search_messages"],
    Notion: ["search_pages", "get_page", "list_databases"],
    Linear: ["list_issues", "get_issue", "list_projects"],
    Jira: ["list_issues", "get_issue", "list_sprints"],
    Gmail: ["list_emails", "get_email", "search_emails"],
    "Google Calendar": ["list_events", "get_event"],
    "Google Drive": ["list_files", "get_file", "search_files"],
    "Google Docs": ["get_document", "list_documents"],
    "Google Sheet": ["get_spreadsheet", "list_rows"],
    HubSpot: ["list_deals", "get_deal", "list_contacts"],
    "Stripe App": ["list_subscriptions", "get_subscription", "list_charges"],
    "Google Analytics": ["get_report", "list_metrics"],
    Datadog: ["list_monitors", "get_monitor", "query_metrics"],
    Confluence: ["search_pages", "get_page"],
    Airtable: ["list_records", "get_record", "list_tables"],
    Apollo: ["search_contacts", "get_contact"],
    Vercel: ["list_deployments", "get_deployment"],
    YouTube: ["list_videos", "get_video", "list_channels"],
    Zoom: ["list_meetings", "get_meeting"],
  }
  return readToolsByApp[appId] ?? ["list", "get", "search"]
}

/**
 * Mock OAuth connect flow.
 * TODO: Open real provider OAuth popup and exchange code.
 */
export async function mockOAuthConnect(appId: string): Promise<ConnectAppResult> {
  await delay(800)
  return { appId, enabledTools: defaultTools(appId) }
}

/**
 * Mock API key connect.
 * TODO: Validate key against provider's API.
 */
export async function mockApiKeyConnect(
  appId: string,
  _apiKey: string
): Promise<ConnectAppResult> {
  await delay(500)
  return { appId, enabledTools: defaultTools(appId) }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
