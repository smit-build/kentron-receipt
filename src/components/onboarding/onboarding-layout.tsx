/**
 * Onboarding layout wrapper. No sidebar, centered column ~560px.
 * Logo top-left, "Skip setup" top-right. Back icon left of progress dots.
 */
import type { ReactNode } from "react"
import { ArrowLeft01Icon } from "hugeicons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import receiptLogo from "@/assets/receipt-logo.png"

interface OnboardingLayoutProps {
  step?: number
  totalSteps?: number
  onSkipAll?: () => void
  onBack?: () => void
  onSkip?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  hideProgress?: boolean
  hideFooter?: boolean
  children: ReactNode
}

export function OnboardingLayout({
  step,
  totalSteps = 5,
  onSkipAll,
  onBack,
  onSkip,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
  hideProgress = false,
  hideFooter = false,
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <img src={receiptLogo} alt="Receipt" className="size-6 rounded-[4px] object-cover" />
          <span className="text-[13px] font-semibold tracking-tight">Receipt</span>
        </div>
        {onSkipAll && (
          <button
            type="button"
            onClick={onSkipAll}
            className="text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Skip setup
          </button>
        )}
      </header>

      {/* Progress dots row with back icon on left */}
      {!hideProgress && step !== undefined && (
        <div className="relative flex items-center justify-center px-6 pt-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="absolute left-6 flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft01Icon className="size-4" />
            </button>
          )}
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i + 1 < step
                    ? "bg-foreground"
                    : i + 1 === step
                      ? "bg-foreground scale-125"
                      : "bg-border"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col items-center px-6 py-8">
        <div className="w-full max-w-[560px]">
          {children}
        </div>
      </div>

      {/* Footer */}
      {!hideFooter && (
        <footer className="flex h-16 shrink-0 items-center justify-between border-t border-border px-6">
          <div>
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSkip && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip
              </Button>
            )}
            {onNext && (
              <Button size="sm" onClick={onNext} disabled={nextDisabled}>
                {nextLabel}
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
