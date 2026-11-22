/**
 * AppConnectFlow — manages the connection flow for a single app.
 * - OAuth apps: consent dialog → dispatch CONNECT_APP → done.
 * - API key apps: api-form dialog → dispatch CONNECT_APP → done.
 * No ChooseToolsSheet. Settings gear on the connected tile handles tool management.
 */
import { useState, useEffect } from "react"
import { Tick02Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLogo } from "@/components/app-logo"
import { integrations } from "@/lib/integrations"
import { defaultTools, mockOAuthConnect, mockApiKeyConnect } from "@/lib/services/integrations-svc"
import { useStore } from "@/lib/store"

function getInitials(name: string): string {
  const found = integrations.find((i) => i.name === name)
  return found?.initials ?? name.slice(0, 2).toUpperCase()
}

type FlowStep = "consent" | "slack-picker" | "api-form" | "connecting"

interface AppConnectFlowProps {
  appId: string
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected: () => void
}

const MOCK_SLACK_WORKSPACES = ["Acme Corp", "My Org", "Side Project"]

export function AppConnectFlow({
  appId,
  workspaceId,
  open,
  onOpenChange,
  onConnected,
}: AppConnectFlowProps) {
  const { dispatch } = useStore()

  const integration = integrations.find((i) => i.name === appId)
  const isApiKey = integration?.method === "API key / token"
  const isSlack = appId === "Slack"

  const [step, setStep] = useState<FlowStep>(isApiKey ? "api-form" : "consent")
  const [apiKey, setApiKey] = useState("")
  const [slackWorkspace, setSlackWorkspace] = useState(MOCK_SLACK_WORKSPACES[0])

  useEffect(() => {
    if (open) {
      setStep(isApiKey ? "api-form" : "consent")
      setApiKey("")
    }
  }, [open, isApiKey])

  async function handleAllow() {
    setStep("connecting")
    const result = await mockOAuthConnect(appId)
    dispatch({ type: "CONNECT_APP", payload: { workspaceId, app: { appId, enabledTools: result.enabledTools } } })
    onOpenChange(false)
    onConnected()
  }

  async function handleApiKeySave() {
    if (!apiKey.trim()) return
    setStep("connecting")
    const result = await mockApiKeyConnect(appId, apiKey)
    dispatch({ type: "CONNECT_APP", payload: { workspaceId, app: { appId, enabledTools: result.enabledTools } } })
    onOpenChange(false)
    onConnected()
  }

  function handleSlackContinue() {
    setStep("connecting")
    setTimeout(() => {
      dispatch({ type: "CONNECT_APP", payload: { workspaceId, app: { appId, enabledTools: defaultTools(appId) } } })
      onOpenChange(false)
      onConnected()
    }, 700)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false) }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2.5">
            <AppLogo name={appId} initials={getInitials(appId)} className="size-8 rounded-[5px]" />
            <DialogTitle className="text-base">{appId}</DialogTitle>
          </div>

          {step === "consent" && (
            <DialogDescription className="text-[13px]">
              {appId} is requesting permission to connect to your Receipt workspace. This allows
              your agents to use the tools you approve.
            </DialogDescription>
          )}
          {step === "slack-picker" && (
            <DialogDescription className="text-[13px]">
              Choose the Slack workspace to connect.
            </DialogDescription>
          )}
          {step === "api-form" && (
            <DialogDescription className="text-[13px]">
              Enter your {appId} API key or token to connect.
            </DialogDescription>
          )}
          {step === "connecting" && (
            <DialogDescription className="text-[13px]">Connecting…</DialogDescription>
          )}
        </DialogHeader>

        {step === "consent" && !isSlack && (
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-border bg-muted/40 p-3">
              <p className="mb-1 text-[12px] font-semibold text-foreground">Receipt is requesting access to:</p>
              <ul className="flex flex-col gap-1">
                {defaultTools(appId).slice(0, 4).map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    <Tick02Icon className="size-3 shrink-0 text-foreground" />
                    {t.replace(/_/g, " ")}
                  </li>
                ))}
                {defaultTools(appId).length > 4 && (
                  <li className="text-[12px] text-muted-foreground">
                    +{defaultTools(appId).length - 4} more (read-only)
                  </li>
                )}
              </ul>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleAllow}>Allow access</Button>
            </DialogFooter>
          </div>
        )}

        {step === "consent" && isSlack && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
              <span className="text-[13px]">Slack</span>
              <span className="text-[13px] font-medium">Sign in to Slack</span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Choose your Slack workspace to continue.
            </p>
            <Select value={slackWorkspace} onValueChange={setSlackWorkspace}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_SLACK_WORKSPACES.map((ws) => (
                  <SelectItem key={ws} value={ws}>{ws}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSlackContinue}>Allow access</Button>
            </DialogFooter>
          </div>
        )}

        {step === "api-form" && (
          <div className="flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor="api-key-input">API key or token</FieldLabel>
              <Input
                id="api-key-input"
                type="password"
                placeholder="Paste your key here"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleApiKeySave() }}
                autoFocus
                autoComplete="off"
              />
            </Field>
            <a
              href="#"
              className="text-[12px] underline underline-offset-2 text-muted-foreground"
              onClick={(e) => e.preventDefault()}
            >
              Where do I find this?
            </a>
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button disabled={!apiKey.trim()} onClick={handleApiKeySave}>
                Connect
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "connecting" && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="inline-block size-2 animate-pulse rounded-full bg-foreground" />
              Connecting to {appId}…
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
