import { useState } from "react"
import { useStore } from "@/lib/store"
import { INTENT_LABELS } from "@/lib/data/intent-apps"
import { cn } from "@/lib/utils"

interface StepIntentProps {
  onNext: () => void
  onSkip: () => void
}

export function StepIntent({ onNext, onSkip: _onSkip }: StepIntentProps) {
  const { state, dispatch } = useStore()
  const [selected, setSelected] = useState<string[]>(state.intent)

  function toggle(label: string) {
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : prev.length < 3
          ? [...prev, label]
          : prev
    )
  }

  function handleNext() {
    dispatch({ type: "SET_INTENT", payload: selected })
    onNext()
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Welcome, {state.user?.firstName}. What should your agents help with?
      </h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Pick up to 3. We'll suggest apps to connect. You can change this anytime.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {INTENT_LABELS.map((label) => {
          const isSelected = selected.includes(label)
          const isDisabled = !isSelected && selected.length >= 3
          return (
            <button
              key={label}
              type="button"
              onClick={() => !isDisabled && toggle(label)}
              aria-pressed={isSelected}
              disabled={isDisabled}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/40",
                isDisabled && "cursor-not-allowed opacity-40"
              )}
              onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); !isDisabled && toggle(label) } }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="mt-4 text-[12px] text-muted-foreground">
          {selected.length} of 3 selected
        </p>
      )}

      {/* Footer actions passed up via parent — but we expose the action */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => { dispatch({ type: "SET_INTENT", payload: [] }); onNext() }}
          className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={selected.length === 0}
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
