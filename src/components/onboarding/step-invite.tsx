import { InviteInput } from "@/components/invite-input"
import { cn } from "@/lib/utils"

interface StepInviteProps {
  onNext: () => void
  onBack: () => void
}

export function StepInvite({ onNext }: StepInviteProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">Invite your teammates</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        Everyone's agent actions land in one shared, verifiable record.
      </p>
      <div className="mt-6">
        <InviteInput />
      </div>
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onNext}
          className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Invite later
        </button>
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "rounded-md bg-foreground px-4 py-1.5 text-[13px] font-medium text-background",
            "hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          )}
        >
          Finish setup
        </button>
      </div>
    </div>
  )
}
