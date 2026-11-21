/**
 * Settings tab — General, AI model keys, Members, Clients.
 */
import { useState } from "react"
import { Add01Icon, Delete02Icon } from "hugeicons-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { InviteInput } from "@/components/invite-input"
import { OpenAIKeyInput } from "@/components/openai-key-input"
import { useStore } from "@/lib/store"
import { CLIENT_LABELS } from "@/lib/services/clients"
import { cn } from "@/lib/utils"

interface WorkspaceSettingsProps {
  onConnectClient?: () => void
}

type SettingsSection = "general" | "keys" | "members" | "clients"

export function WorkspaceSettings({ onConnectClient }: WorkspaceSettingsProps) {
  const { state, dispatch } = useStore()
  const [section, setSection] = useState<SettingsSection>("general")

  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId)
  const isSample = ws?.isSample ?? false

  const sections: { id: SettingsSection; label: string }[] = [
    { id: "general", label: "General" },
    { id: "keys", label: "AI model keys" },
    { id: "members", label: "Members" },
    { id: "clients", label: "Clients" },
  ]

  return (
    <div className="flex gap-8">
      {/* Sub-nav */}
      <nav className="flex w-36 shrink-0 flex-col gap-0.5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors hover:bg-muted",
              section === s.id ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1">
        {section === "general" && (
          <GeneralSection ws={ws} isSample={isSample} dispatch={dispatch} />
        )}
        {section === "keys" && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold">OpenAI API key</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Used by Chat to run prompts. Stored only in your browser.
              </p>
            </div>
            <OpenAIKeyInput />
          </div>
        )}
        {section === "members" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-semibold">Invite teammates</h2>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Everyone you invite can see all receipts in this workspace.
              </p>
            </div>
            <InviteInput />
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Members · 1
              </span>
              <div className="flex items-center gap-3 py-2">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="text-[10px] font-bold">
                    {(state.user?.firstName?.[0] ?? "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium leading-none">
                    {state.user?.firstName ?? "You"}
                    <span className="ml-1.5 text-[11px] font-normal text-muted-foreground">(you)</span>
                  </p>
                  {state.user?.email && (
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{state.user.email}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">just now</span>
              </div>
            </div>
          </div>
        )}
        {section === "clients" && (
          <ClientsSection
            ws={ws}
            isSample={isSample}
            onConnectClient={onConnectClient}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  )
}

function GeneralSection({
  ws,
  isSample,
  dispatch,
}: {
  ws: ReturnType<typeof useStore>["state"]["workspaces"][number] | undefined
  isSample: boolean
  dispatch: ReturnType<typeof useStore>["dispatch"]
}) {
  const [name, setName] = useState(ws?.name ?? "")
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!ws || !name.trim()) return
    dispatch({ type: "UPDATE_WORKSPACE", payload: { id: ws.id, updates: { name: name.trim() } } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Workspace name</h2>
        <Field>
          <FieldLabel htmlFor="ws-name">Name</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false) }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
              disabled={isSample}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSample || !name.trim() || name.trim() === ws?.name}
            >
              {saved ? "Saved" : "Save"}
            </Button>
          </div>
        </Field>
      </div>

      {!isSample && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
          <p className="text-[12.5px] text-muted-foreground">
            Deleting this workspace is permanent and cannot be undone.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-fit text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            onClick={() => {
              if (!ws) return
              if (!window.confirm(`Delete "${ws.name}"? This cannot be undone.`)) return
              dispatch({ type: "UPDATE_WORKSPACE", payload: { id: ws.id, updates: { name: "[Deleted]" } } })
            }}
          >
            <Delete02Icon data-icon="inline-start" />
            Delete workspace
          </Button>
        </div>
      )}
    </div>
  )
}

function ClientsSection({
  ws,
  isSample,
  onConnectClient,
  dispatch,
}: {
  ws: ReturnType<typeof useStore>["state"]["workspaces"][number] | undefined
  isSample: boolean
  onConnectClient?: () => void
  dispatch: ReturnType<typeof useStore>["dispatch"]
}) {
  const clients = ws?.connectedClients ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Connected AI clients</h2>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Clients routing through this workspace via MCP.
          </p>
        </div>
        {!isSample && onConnectClient && (
          <Button size="sm" onClick={onConnectClient}>
            <Add01Icon data-icon="inline-start" />
            Connect client
          </Button>
        )}
      </div>

      {clients.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No clients connected yet.{" "}
          {!isSample && onConnectClient && (
            <button
              type="button"
              onClick={onConnectClient}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Connect one
            </button>
          )}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center gap-3 py-2.5">
              <div className="flex-1">
                <p className="text-[13px] font-medium">{CLIENT_LABELS[c.clientType]}</p>
                <p className="text-[11px] text-muted-foreground">
                  Connected {new Date(c.connectedAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (!ws) return
                  dispatch({
                    type: "UPDATE_WORKSPACE",
                    payload: {
                      id: ws.id,
                      updates: { connectedClients: ws.connectedClients.filter((x) => x.id !== c.id) },
                    },
                  })
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
