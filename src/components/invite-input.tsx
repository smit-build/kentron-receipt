/**
 * Reusable email chips input + inline Invite button + "Copy invite link".
 * Used in onboarding step 5 and Settings > Members.
 */
import { useState, useRef } from "react"
import type { KeyboardEvent } from "react"
import { Cancel01Icon, Copy01Icon, Tick02Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InviteInputProps {
  compact?: boolean
}

function isValidEmail(s: string) {
  return s.includes("@") && s.includes(".")
}

export function InviteInput({ compact: _compact }: InviteInputProps) {
  const [emails, setEmails] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addEmail(raw: string) {
    const trimmed = raw.trim().replace(/,$/, "")
    if (isValidEmail(trimmed) && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed])
    }
    setInput("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      if (input.trim()) addEmail(input)
    }
    if (e.key === "Backspace" && !input && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1))
    }
  }

  function removeEmail(email: string) {
    setEmails((prev) => prev.filter((e) => e !== email))
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText("https://app.receipt.ai/invite/mock-token-123")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Row: chip container + inline Invite button */}
      <div className="flex gap-2">
        <div
          className={cn(
            "flex flex-1 min-h-9 flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 cursor-text focus-within:ring-1 focus-within:ring-ring"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {emails.map((email) => (
            <span
              key={email}
              className="flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-[12px] font-medium"
            >
              {email}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeEmail(email) }}
                className="ml-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${email}`}
              >
                <Cancel01Icon className="size-3" />
              </button>
            </span>
          ))}
          <Input
            ref={inputRef}
            className="h-auto min-w-[180px] flex-1 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
            placeholder={emails.length === 0 ? "name@company.com" : "Add another…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input.trim()) addEmail(input) }}
            aria-label="Email address"
          />
        </div>
        <Button
          size="sm"
          disabled={emails.length === 0}
          className="shrink-0 self-start h-9"
        >
          Invite
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" size="sm" onClick={copyLink} className="w-fit">
        {copied ? <Tick02Icon data-icon="inline-start" /> : <Copy01Icon data-icon="inline-start" />}
        {copied ? "Copied!" : "Copy invite link"}
      </Button>

      <p className="text-[12px] text-muted-foreground">
        Anyone with the link can join your org. It expires in 7 days.
      </p>
    </div>
  )
}
