/**
 * Intent → suggested apps map.
 * Only apps that exist in src/lib/integrations.ts (status: available or connected).
 */

export type IntentKey =
  | "Engineering"
  | "Customer support"
  | "Sales"
  | "Marketing & growth"
  | "Finance & RevOps"
  | "IT & security"
  | "Data & analytics"
  | "Product"
  | "People & HR"
  | "Founders & leadership"
  | "Legal & compliance"

export const INTENT_LABELS: IntentKey[] = [
  "Engineering",
  "Customer support",
  "Sales",
  "Marketing & growth",
  "Finance & RevOps",
  "IT & security",
  "Data & analytics",
  "Product",
  "People & HR",
  "Founders & leadership",
  "Legal & compliance",
]

export const INTENT_TO_APPS: Record<IntentKey, string[]> = {
  Engineering: ["GitHub", "Linear", "Jira", "Slack", "Vercel", "Datadog"],
  "Customer support": ["Slack", "Gmail", "Notion", "HubSpot", "Zoom"],
  Sales: ["HubSpot", "Apollo", "Gmail", "Google Calendar", "Slack"],
  "Marketing & growth": ["Google Analytics", "Google Ads", "Notion", "Slack", "YouTube"],
  "Finance & RevOps": ["Stripe App", "Google Sheet", "Airtable", "Gmail"],
  "IT & security": ["AWS", "Azure", "Google Cloud", "Datadog", "Jira"],
  "Data & analytics": ["Google Sheet", "Airtable", "AWS", "Google Cloud"],
  Product: ["Linear", "Jira", "Notion", "Confluence", "Slack"],
  "People & HR": ["Gmail", "Google Calendar", "Slack", "Notion", "Zoom"],
  "Founders & leadership": ["Slack", "Gmail", "Google Calendar", "Notion"],
  "Legal & compliance": ["Google Docs", "Google Drive", "Gmail", "Confluence"],
}

/** Default apps when no intent is selected. */
export const DEFAULT_SUGGESTED_APPS = ["GitHub", "Slack", "Notion", "Gmail", "Google Calendar", "Linear"]

/**
 * Returns up to 8 deduplicated suggested apps for the given intents.
 * Falls back to DEFAULT_SUGGESTED_APPS if no intents selected.
 */
export function getSuggestedApps(intents: string[]): string[] {
  if (intents.length === 0) return DEFAULT_SUGGESTED_APPS

  const seen = new Set<string>()
  const result: string[] = []

  for (const intent of intents) {
    const apps = INTENT_TO_APPS[intent as IntentKey] ?? []
    for (const app of apps) {
      if (!seen.has(app)) {
        seen.add(app)
        result.push(app)
      }
      if (result.length >= 8) break
    }
    if (result.length >= 8) break
  }

  return result.slice(0, 8)
}
