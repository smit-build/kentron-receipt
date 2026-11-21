import { OpenAIKeyInput } from "@/components/openai-key-input"
import { cn } from "@/lib/utils"

interface StepKeyProps {
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export function StepKey({ onNext, onBack, onSkip }: StepKeyProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Add your OpenAI API key to use Chat</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Chat runs on your own OpenAI key. You can add it later in Settings.
      </p>

      <div className="mt-6">
        <OpenAIKeyInput onSaved={onNext} />
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onNext}
            className={cn(
              "rounded-md bg-foreground px-4 py-1.5 text-[13px] font-medium text-background",
              "hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
