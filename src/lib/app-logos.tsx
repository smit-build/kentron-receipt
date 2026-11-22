import {
  Si1Password,
  SiAdp,
  SiAdyen,
  SiAirtable,
  SiAnthropic,
  SiApollographql,
  SiConfluence,
  SiCursor,
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
  SiOpenaigym,
  SiStripe,
  SiVercel,
  SiYoutube,
  SiZoom,
} from "react-icons/si"
import type { IconType } from "react-icons"

// ─── Custom brand SVG icons (not in this react-icons version) ─────────────────

/** Slack 4-colour pinwheel — official Slack brand colours */
function SlackSvgIcon({ className }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {/* Green arm */}
      <path fill="#2EB67D" d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52z"/>
      <path fill="#2EB67D" d="M6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313z"/>
      {/* Red arm */}
      <path fill="#E01E5A" d="M8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834z"/>
      <path fill="#E01E5A" d="M8.834 6.313a2.527 2.527 0 012.521 2.521 2.527 2.527 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312z"/>
      {/* Yellow arm */}
      <path fill="#ECB22E" d="M18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834z"/>
      <path fill="#ECB22E" d="M17.688 8.834a2.527 2.527 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.528 2.528 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312z"/>
      {/* Blue arm */}
      <path fill="#36C5F0" d="M15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52z"/>
      <path fill="#36C5F0" d="M15.165 17.688a2.527 2.527 0 01-2.52-2.523 2.527 2.527 0 012.52-2.52h6.313A2.528 2.528 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/>
    </svg>
  )
}

export interface AppLogoEntry {
  Icon: IconType | ((props: { className?: string; color?: string }) => React.ReactElement)
  /** Official brand color (from Simple Icons), e.g. "#181717" */
  hex: string
}

/**
 * Real brand marks for integrations. Slack uses an inline SVG (removed from
 * Simple Icons upstream). AWS, Azure, Outlook, Adobe remain initials-only.
 */
export const appLogos: Record<string, AppLogoEntry> = {
  GitHub: { Icon: SiGithub, hex: "#181717" },
  "GitHub (App OAuth)": { Icon: SiGithub, hex: "#181717" },
  "Github (Personal Access Token)": { Icon: SiGithub, hex: "#181717" },
  Notion: { Icon: SiNotion, hex: "#000000" },
  Slack: { Icon: SlackSvgIcon, hex: "#4A154B" },
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

/** Brand logos for MCP AI clients shown in ConnectClientDialog. */
export const clientLogos: Record<string, AppLogoEntry> = {
  "claude-ai":      { Icon: SiAnthropic, hex: "#D97757" },
  "claude-desktop": { Icon: SiAnthropic, hex: "#D97757" },
  "claude-code":    { Icon: SiAnthropic, hex: "#D97757" },
  "cursor":         { Icon: SiCursor,    hex: "#000000" },
  "codex":          { Icon: SiOpenaigym, hex: "#412991" },
}
