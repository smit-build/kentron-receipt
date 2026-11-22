/**
 * Reusable OpenAI key input component.
 * Used in onboarding step 3.5 and Settings tab.
 * Stores only hasOpenAIKey + last 4 chars — never the raw key.
 */
import { useState } from "react"
import { Copy01Icon, Tick02Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"

interface OpenAIKeyInputProps {
  onSaved?: () => void
  compact?: boolean
}

type TestState = "idle" | "testing" | "valid" | "invalid"

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

export function OpenAIKeyInput({ onSaved, compact: _compact }: OpenAIKeyInputProps) {
  const { state, dispatch } = useStore()
  const [value, setValue] = useState("")
  const [visible, setVisible] = useState(false)
  const [testState, setTestState] = useState<TestState>("idle")

  const hasKey = state.hasOpenAIKey

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      setValue(text.trim())
    } catch {
      // clipboard permission denied — let user type manually
    }
  }

  async function handleTest() {
    if (!value.trim()) return
    setTestState("testing")
    await delay(900)
    if (value.trim().startsWith("sk-")) {
      setTestState("valid")
      dispatch({
        type: "SET_OPENAI_KEY",
        payload: { keyLast4: value.trim().slice(-4) },
      })
      onSaved?.()
    } else {
      setTestState("invalid")
    }
  }

  function handleRemove() {
    dispatch({ type: "REMOVE_OPENAI_KEY" })
    setValue("")
    setTestState("idle")
  }

  if (hasKey) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <span className="flex-1 text-[13px] text-muted-foreground">
            ••••••••••••{state.keyLast4}
          </span>
          <span className="rounded-sm bg-foreground/8 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
            Saved
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { dispatch({ type: "REMOVE_OPENAI_KEY" }); setValue("") }}
          >
            Replace key
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRemove} className="text-destructive hover:text-destructive">
            Remove
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={visible ? "text" : "password"}
            placeholder="sk-..."
            value={value}
            onChange={(e) => { setValue(e.target.value); setTestState("idle") }}
            onKeyDown={(e) => { if (e.key === "Enter") handleTest() }}
            className="pr-16"
            aria-label="OpenAI API key"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handlePaste}
              aria-label="Paste from clipboard"
              tabIndex={-1}
            >
              <Copy01Icon />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide key" : "Show key"}
              tabIndex={-1}
              className="text-[11px]"
            >
              {visible ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={!value.trim() || testState === "testing"}
          className="shrink-0"
        >
          {testState === "testing" ? "Testing…" : "Test key"}
        </Button>
      </div>

      {testState === "valid" && (
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
          <Tick02Icon className="size-4" />
          Key valid — saved.
        </div>
      )}
      {testState === "invalid" && (
        <p className="text-[13px] text-destructive">
          Invalid key. Keys start with <code className="font-mono">sk-</code>.
        </p>
      )}

      <p className="text-[12px] text-muted-foreground">
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          Where do I find this?
        </a>
        {"  ·  "}
        {/* [TODO founder: confirm storage/encryption copy] */}
        Your key is stored only in your browser and never sent to our servers.
      </p>
    </div>
  )
}
