import {
  Si1Password,
  SiAdp,
  SiAdyen,
  SiAirtable,
  SiApollographql,
  SiConfluence,
  SiDatadog,
  SiGithub,
  SiGmail,
  SiGoogleads,
  SiGoogleanalytics,
  SiGooglecalendar,
  SiGooglechat,
  SiGooglecloud,
  SiGoogledocs,
  SiGoogledrive,
  SiGooglesheets,
  SiGoogleslides,
  SiGoogletasks,
  SiHubspot,
  SiJira,
  SiLinear,
  SiNotion,
  SiStripe,
  SiVercel,
  SiYoutube,
  SiZoom,
} from "react-icons/si"
import type { IconType } from "react-icons"

export interface AppLogoEntry {
  Icon: IconType
  /** Official brand color (from Simple Icons), e.g. "#181717" */
  hex: string
}

/**
 * Real brand marks for the integrations that have one in the Simple Icons
 * set, rendered in their official brand color. A handful of major brands
 * (Slack, AWS, Azure, Outlook, Adobe, OpenAI) are not published in Simple
 * Icons (removed/withheld upstream) — those fall back to the initials badge
 * in <AppLogo>, same as any long-tail "coming soon" integration.
 */
export const appLogos: Record<string, AppLogoEntry> = {
  GitHub: { Icon: SiGithub, hex: "#181717" },
  "GitHub (App OAuth)": { Icon: SiGithub, hex: "#181717" },
  "Github (Personal Access Token)": { Icon: SiGithub, hex: "#181717" },
  Notion: { Icon: SiNotion, hex: "#000000" },
  Airtable: { Icon: SiAirtable, hex: "#18BFFF" },
  Apollo: { Icon: SiApollographql, hex: "#311C87" },
  Confluence: { Icon: SiConfluence, hex: "#172B4D" },
  "Confluence (Basic Auth)": { Icon: SiConfluence, hex: "#172B4D" },
  Datadog: { Icon: SiDatadog, hex: "#632CA6" },
  Gmail: { Icon: SiGmail, hex: "#EA4335" },
  "Google Ads": { Icon: SiGoogleads, hex: "#4285F4" },
  "Google Analytics": { Icon: SiGoogleanalytics, hex: "#E37400" },
  "Google Calendar": { Icon: SiGooglecalendar, hex: "#4285F4" },
  "Google Calendar (MCP)": { Icon: SiGooglecalendar, hex: "#4285F4" },
  "Google Chat": { Icon: SiGooglechat, hex: "#34A853" },
  "Google Cloud": { Icon: SiGooglecloud, hex: "#4285F4" },
  "Google Docs": { Icon: SiGoogledocs, hex: "#4285F4" },
  "Google Drive": { Icon: SiGoogledrive, hex: "#4285F4" },
  "Google Sheet": { Icon: SiGooglesheets, hex: "#34A853" },
  "Google Slides": { Icon: SiGoogleslides, hex: "#FBBC04" },
  "Google Tasks": { Icon: SiGoogletasks, hex: "#2684FC" },
  HubSpot: { Icon: SiHubspot, hex: "#FF7A59" },
  Jira: { Icon: SiJira, hex: "#0052CC" },
  "Jira (Basic Auth)": { Icon: SiJira, hex: "#0052CC" },
  Linear: { Icon: SiLinear, hex: "#5E6AD2" },
  "Linear (MCP)": { Icon: SiLinear, hex: "#5E6AD2" },
  "Stripe App": { Icon: SiStripe, hex: "#635BFF" },
  Vercel: { Icon: SiVercel, hex: "#000000" },
  YouTube: { Icon: SiYoutube, hex: "#FF0000" },
  Zoom: { Icon: SiZoom, hex: "#0B5CFF" },
  "1Password (Events API)": { Icon: Si1Password, hex: "#145FE4" },
  "1Password (SCIM)": { Icon: Si1Password, hex: "#145FE4" },
  "1Password (Users API)": { Icon: Si1Password, hex: "#145FE4" },
  Adyen: { Icon: SiAdyen, hex: "#0ABF53" },
  ADP: { Icon: SiAdp, hex: "#D0271D" },
}
