/**
 * Sign-up screen (spec 3.1). Mock auth — always succeeds.
 * Calls onComplete with { firstName, email }.
 */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { mockSignUp, mockGoogleSignIn } from "@/lib/services/auth"
import receiptLogo from "@/assets/receipt-logo.png"

interface SignUpScreenProps {
  onComplete: (user: { firstName: string; email: string }) => void
}

type Mode = "signup" | "signin"

export function SignUpScreen({ onComplete }: SignUpScreenProps) {
  const [mode, setMode] = useState<Mode>("signup")
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleGoogle() {
    setLoading(true)
    setError("")
    try {
      const user = await mockGoogleSignIn()
      onComplete({ firstName: user.firstName, email: user.email })
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    if (mode === "signup" && !firstName.trim()) return
    setLoading(true)
    setError("")
    try {
      const user = mode === "signup"
        ? await mockSignUp({ firstName: firstName.trim(), email, password })
        : { firstName: "Alex", email, id: "" }
      onComplete({ firstName: user.firstName, email: user.email })
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <img src={receiptLogo} alt="Receipt" className="size-8 rounded-[5px] object-cover" />
          <span className="text-[16px] font-semibold tracking-tight">Receipt</span>
        </div>

        <h1 className="mb-1 text-center text-xl font-semibold tracking-tight">
          {mode === "signup" ? "Create your account" : "Sign in to Receipt"}
        </h1>
        <p className="mb-6 text-center text-[13px] text-muted-foreground">
          {mode === "signup"
            ? "Start your free workspace."
            : "Welcome back."}
        </p>

        {/* Google */}
        <Button
          variant="outline"
          className="mb-4 w-full"
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[11px] text-muted-foreground">
            or
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <Field>
              <FieldLabel htmlFor="first-name">First name</FieldLabel>
              <Input
                id="first-name"

                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
                autoComplete="given-name"
                required
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="email">Work email</FieldLabel>
            <Input
              id="email"
              type="email"

              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"

              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </Field>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <Button type="submit" className="mt-1 w-full" disabled={loading}>
            {loading ? "Loading…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError("") }}
            className="underline underline-offset-2 hover:text-foreground"
          >
            {mode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  )
}
