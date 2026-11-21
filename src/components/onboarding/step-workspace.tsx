import { useState } from "react"
import { useStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  SiClaude,
  SiAnthropic,
  SiGooglegemini,
  SiCursor,
  SiGithubcopilot,
  SiNotion,
  SiGithub,
  SiHubspot,
  SiLinear,
  SiGoogledrive,
  SiFigma,
} from "react-icons/si"
import receiptLogo from "@/assets/receipt-logo.png"
import { cn } from "@/lib/utils"

interface StepWorkspaceProps {
  onNext: (name: string) => void
  onBack: () => void
  onSkip: () => void
}

function Logo({
  children,
  style,
  size = 32,
  faded = false,
  className,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  size?: number
  faded?: boolean
  className?: string
}) {
  return (
    <div
      style={{ width: size, height: size, ...style }}
      className={cn(
        "absolute flex shrink-0 items-center justify-center rounded-[7px] border border-border bg-background shadow-sm transition-opacity",
        faded && "opacity-20",
        className
      )}
    >
      {children}
    </div>
  )
}

// Left curly bracket SVG
function BracketLeft({ h }: { h: number }) {
  return (
    <svg width="18" height={h} viewBox={`0 0 18 ${h}`} fill="none" className="shrink-0">
      <path
        d={`M14,2 Q6,2 6,${h * 0.18} L6,${h * 0.42} Q6,${h / 2} 2,${h / 2} Q6,${h / 2} 6,${h * 0.58} L6,${h * 0.82} Q6,${h - 2} 14,${h - 2}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-border"
      />
    </svg>
  )
}

function BracketRight({ h }: { h: number }) {
  return (
    <svg width="18" height={h} viewBox={`0 0 18 ${h}`} fill="none" className="shrink-0">
      <path
        d={`M4,2 Q12,2 12,${h * 0.18} L12,${h * 0.42} Q12,${h / 2} 16,${h / 2} Q12,${h / 2} 12,${h * 0.58} L12,${h * 0.82} Q12,${h - 2} 4,${h - 2}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-border"
      />
    </svg>
  )
}

function Arrow() {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" fill="none" className="shrink-0">
      <path d="M1,6 L23,6 M18,2 L23,6 L18,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-border" />
    </svg>
  )
}

function WorkspaceDiagram({ name }: { name: string }) {
  const H = 160

  return (
    <div className="flex items-center justify-center gap-0 select-none py-2">
      {/* Left cluster — AI Agents */}
      <div className="flex flex-col items-center gap-2">
        <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-medium text-foreground/70">
          AI Agents
        </span>
        <div className="relative shrink-0" style={{ width: 120, height: H }}>
          {/* OpenAI */}
          <Logo style={{ top: 6, right: 10 }} size={30}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.372L15.113 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.4-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>
          </Logo>
          {/* Claude */}
          <Logo style={{ top: 28, left: 8 }} size={28}><SiClaude size={14} color="#D97757" /></Logo>
          {/* Gemini */}
          <Logo style={{ top: 60, right: 6 }} size={28}><SiGooglegemini size={14} color="#4285F4" /></Logo>
          {/* Anthropic */}
          <Logo style={{ top: 72, left: 20 }} size={30}><SiAnthropic size={15} color="#D97757" /></Logo>
          {/* Cursor */}
          <Logo style={{ top: 108, left: 6 }} size={26}><SiCursor size={13} color="#000" /></Logo>
          {/* Copilot faded */}
          <Logo style={{ top: 112, right: 14 }} size={24} faded><SiGithubcopilot size={12} color="#000" /></Logo>
          {/* Faded squares */}
          <Logo style={{ top: 2, left: 2 }} size={18} faded><span /></Logo>
          <Logo style={{ bottom: 4, right: 4 }} size={16} faded><span /></Logo>
        </div>
      </div>

      {/* Bracket + arrow left */}
      <div className="flex items-center gap-0.5">
        <BracketLeft h={H} />
        <Arrow />
      </div>

      {/* Center — Workspace */}
      <div className="flex flex-col items-center rounded-xl border border-border bg-background px-4 py-3 shadow-sm" style={{ minWidth: 110 }}>
        <img src={receiptLogo} alt="" className="size-8 rounded-[6px] object-cover" />
        <span className="mt-1.5 text-center text-[12px] font-semibold leading-tight">{name}</span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">MCP Gateway</span>
      </div>

      {/* Arrow + bracket right */}
      <div className="flex items-center gap-0.5">
        <Arrow />
        <BracketRight h={H} />
      </div>

      {/* Right cluster — Clients & Tools */}
      <div className="flex flex-col items-center gap-2">
        <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-medium text-foreground/70">
          Clients &amp; Tools
        </span>
        <div className="relative shrink-0" style={{ width: 120, height: H }}>
          {/* Notion */}
          <Logo style={{ top: 6, left: 14 }} size={30}><SiNotion size={15} color="#000" /></Logo>
          {/* GitHub */}
          <Logo style={{ top: 8, right: 8 }} size={28}><SiGithub size={14} color="#181717" /></Logo>
          {/* HubSpot */}
          <Logo style={{ top: 54, left: 4 }} size={28}><SiHubspot size={14} color="#FF7A59" /></Logo>
          {/* Figma */}
          <Logo style={{ top: 52, right: 10 }} size={28}><SiFigma size={14} color="#F24E1E" /></Logo>
          {/* Google Drive */}
          <Logo style={{ top: 100, right: 6 }} size={28}><SiGoogledrive size={14} color="#4285F4" /></Logo>
          {/* Slack */}
          <Logo style={{ top: 102, left: 14 }} size={28}><span className="text-[9px] font-bold" style={{ color: "#4A154B" }}>SL</span></Logo>
          {/* Linear faded */}
          <Logo style={{ bottom: 2, right: 20 }} size={22} faded><SiLinear size={11} color="#5E6AD2" /></Logo>
          {/* Faded squares */}
          <Logo style={{ top: 2, right: 2 }} size={16} faded><span /></Logo>
          <Logo style={{ bottom: 6, left: 2 }} size={14} faded><span /></Logo>
        </div>
      </div>
    </div>
  )
}

export function StepWorkspace({ onNext, onBack: _onBack, onSkip }: StepWorkspaceProps) {
  const { state } = useStore()
  const defaultName = `${state.user?.firstName ?? "My"}'s workspace`
  const [name, setName] = useState(defaultName)

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Name your first workspace</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Agents connected here can only use apps and tools you allow in this workspace.
      </p>

      <div className="mt-6">
        <Field>
          <FieldLabel htmlFor="ws-name">Workspace name</FieldLabel>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onNext(name.trim()) }}
            autoFocus
          />
        </Field>
      </div>

      <div className="mt-6 overflow-hidden">
        <WorkspaceDiagram name={name || defaultName} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onSkip()}
          className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={() => name.trim() && onNext(name.trim())}
          disabled={!name.trim()}
          className={cn(
            "rounded-md bg-foreground px-4 py-1.5 text-[13px] font-medium text-background",
            "hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
