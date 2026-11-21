export type IntegrationStatus = "connected" | "available" | "coming-soon"

export type IntegrationCategory =
  | "Development"
  | "Google"
  | "Microsoft"
  | "Project Management"
  | "Cloud & Data"
  | "Communication"

export type AuthMethod = "API key / token" | "OAuth"

export interface Integration {
  name: string
  initials: string
  status: IntegrationStatus
  category: IntegrationCategory
  method: AuthMethod
}

export const integrations: Integration[] = [
  { name: "GitHub", initials: "GI", status: "connected", category: "Development", method: "OAuth" },
  { name: "Notion", initials: "NO", status: "connected", category: "Project Management", method: "OAuth" },
  { name: "Slack", initials: "SL", status: "connected", category: "Communication", method: "OAuth" },
  { name: "Airtable", initials: "AI", status: "available", category: "Project Management", method: "API key / token" },
  { name: "Apollo", initials: "AP", status: "available", category: "Communication", method: "API key / token" },
  { name: "AWS", initials: "AW", status: "available", category: "Cloud & Data", method: "API key / token" },
  { name: "Azure", initials: "AZ", status: "available", category: "Cloud & Data", method: "OAuth" },
  { name: "Confluence", initials: "CO", status: "available", category: "Project Management", method: "OAuth" },
  { name: "Confluence (Basic Auth)", initials: "CA", status: "available", category: "Project Management", method: "API key / token" },
  { name: "Datadog", initials: "DA", status: "available", category: "Cloud & Data", method: "API key / token" },
  { name: "GitHub (App OAuth)", initials: "GO", status: "available", category: "Development", method: "OAuth" },
  { name: "Github (Personal Access Token)", initials: "GT", status: "available", category: "Development", method: "API key / token" },
  { name: "Gmail", initials: "GM", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Ads", initials: "GA", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Analytics", initials: "GA", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Calendar", initials: "GC", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Calendar (MCP)", initials: "GM", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Chat", initials: "GC", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Cloud", initials: "GC", status: "available", category: "Cloud & Data", method: "OAuth" },
  { name: "Google Docs", initials: "GD", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Drive", initials: "GD", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Sheet", initials: "GS", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Slides", initials: "GS", status: "available", category: "Google", method: "OAuth" },
  { name: "Google Tasks", initials: "GT", status: "available", category: "Google", method: "OAuth" },
  { name: "HubSpot", initials: "HU", status: "available", category: "Communication", method: "OAuth" },
  { name: "Jira", initials: "JI", status: "available", category: "Project Management", method: "OAuth" },
  { name: "Jira (Basic Auth)", initials: "JA", status: "available", category: "Project Management", method: "API key / token" },
  { name: "Linear", initials: "LI", status: "available", category: "Project Management", method: "OAuth" },
  { name: "Linear (MCP)", initials: "LM", status: "available", category: "Project Management", method: "OAuth" },
  { name: "OpenAI", initials: "OP", status: "available", category: "Cloud & Data", method: "API key / token" },
  { name: "Outlook", initials: "OU", status: "available", category: "Microsoft", method: "OAuth" },
  { name: "Stripe App", initials: "SA", status: "available", category: "Cloud & Data", method: "API key / token" },
  { name: "Vercel", initials: "VE", status: "available", category: "Cloud & Data", method: "API key / token" },
  { name: "YouTube", initials: "YO", status: "available", category: "Google", method: "OAuth" },
  { name: "Zoom", initials: "ZO", status: "available", category: "Communication", method: "OAuth" },
  { name: "1Password (Events API)", initials: "1A", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "1Password (SCIM)", initials: "1S", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "1Password (Users API)", initials: "1A", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "3CX", initials: "3C", status: "coming-soon", category: "Communication", method: "API key / token" },
  { name: "8x8", initials: "8X", status: "coming-soon", category: "Communication", method: "API key / token" },
  { name: "A-Leads", initials: "A-", status: "coming-soon", category: "Communication", method: "API key / token" },
  { name: "Absorb LMS", initials: "AL", status: "coming-soon", category: "Project Management", method: "API key / token" },
  { name: "Accelo", initials: "AC", status: "coming-soon", category: "Project Management", method: "API key / token" },
  { name: "ActiveCampaign", initials: "AC", status: "coming-soon", category: "Communication", method: "API key / token" },
  { name: "Acuity Scheduling", initials: "AS", status: "coming-soon", category: "Project Management", method: "API key / token" },
  { name: "Acumatica", initials: "AC", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "Addepar (Basic Auth)", initials: "AA", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "Addepar (OAuth)", initials: "AO", status: "coming-soon", category: "Cloud & Data", method: "OAuth" },
  { name: "Adobe", initials: "AD", status: "coming-soon", category: "Cloud & Data", method: "OAuth" },
  { name: "Adobe Commerce", initials: "AC", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "Adobe Workfront", initials: "AW", status: "coming-soon", category: "Project Management", method: "OAuth" },
  { name: "ADP", initials: "AD", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "ADP Lyric", initials: "AL", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "ADP Workforce Now", initials: "AN", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "ADP Workforce Now Next Generation", initials: "AG", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "Adyen", initials: "AD", status: "coming-soon", category: "Cloud & Data", method: "API key / token" },
  { name: "Adyntel", initials: "AD", status: "coming-soon", category: "Communication", method: "API key / token" },
  { name: "Affinity (v1)", initials: "AV", status: "coming-soon", category: "Project Management", method: "API key / token" },
  { name: "Affinity (v2)", initials: "AV", status: "coming-soon", category: "Project Management", method: "OAuth" },
  { name: "Agiloft", initials: "AG", status: "coming-soon", category: "Project Management", method: "API key / token" },
]

export const categoryFilters: Array<IntegrationCategory | "All"> = [
  "All",
  "Google",
  "Microsoft",
  "Project Management",
  "Cloud & Data",
  "Communication",
]

export const methodFilters: Array<AuthMethod | "All methods"> = [
  "All methods",
  "API key / token",
  "OAuth",
]
