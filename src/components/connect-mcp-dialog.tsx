import { useState } from "react"
import { Copy01Icon, Plug01Icon, SourceCodeIcon, Tick01Icon } from "hugeicons-react"
import { SiClaude, SiClaudecode, SiCursor } from "react-icons/si"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const clients = [
  {
    value: "claude-code",
    label: "Claude Code",
    Icon: () => <SiClaudecode className="size-4" color="#D97757" />,
  },
  {
    value: "claude-desktop",
    label: "Claude Desktop",
    Icon: () => <SiClaude className="size-4" color="#D97757" />,
  },
  {
    value: "codex",
    label: "Codex",
    Icon: () => <SourceCodeIcon className="size-4" />,
  },
  {
    value: "cursor",
    label: "Cursor",
    Icon: () => <SiCursor className="size-4" color="#000000" />,
  },
  {
    value: "other",
    label: "Other MCP Client",
    Icon: () => <Plug01Icon className="size-4" />,
  },
]

const commands = [
  "receipt setup",
  "receipt workspace current",
  "receipt mcp config generic",
]

interface ConnectMcpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: () => void
  onSkip: () => void
}

export function ConnectMcpDialog({
  open,
  onOpenChange,
  onContinue,
  onSkip,
}: ConnectMcpDialogProps) {
  const [client, setClient] = useState(clients[0].value)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(commands.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect an MCP client</DialogTitle>
          <DialogDescription>
            Use this workspace&rsquo;s tools from Claude, Cursor, Codex, or
            another MCP client.
          </DialogDescription>
        </DialogHeader>

        <Select value={client} onValueChange={setClient}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {clients.map(({ value, label, Icon }) => (
              <SelectItem key={value} value={value}>
                <Icon />
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-col gap-2">
          <p className="text-[13px] text-muted-foreground">
            Run these commands in your terminal. To switch workspaces, run{" "}
            <code className="text-foreground">
              receipt workspace use &lt;workspace&gt;
            </code>
            , then restart the client connection.
          </p>
          <div className="relative rounded-lg border border-border bg-muted/50 px-3 py-2">
            <pre className="font-mono text-[13px] leading-5 text-foreground">
              {commands.join("\n")}
            </pre>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-1.5 right-1.5"
              aria-label="Copy commands"
              onClick={handleCopy}
            >
              {copied ? <Tick01Icon /> : <Copy01Icon />}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={onContinue}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
