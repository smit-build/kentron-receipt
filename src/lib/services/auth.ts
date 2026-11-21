/**
 * Mock auth service.
 * TODO: Replace with real auth API (OAuth, JWT, session) when backend exists.
 */

export interface SignUpPayload {
  firstName: string
  email: string
  password: string
}

export interface SignInPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  firstName: string
  email: string
}

/** Mock sign-up. Always succeeds. Returns a fake user. */
export async function mockSignUp(payload: SignUpPayload): Promise<AuthUser> {
  // TODO: POST /auth/signup
  await delay(400)
  return {
    id: crypto.randomUUID(),
    firstName: payload.firstName.trim(),
    email: payload.email.trim().toLowerCase(),
  }
}

/** Mock Google sign-in. Always succeeds with a default user. */
export async function mockGoogleSignIn(): Promise<AuthUser> {
  // TODO: initiate Google OAuth flow
  await delay(600)
  return {
    id: crypto.randomUUID(),
    firstName: "Alex",
    email: "alex@example.com",
  }
}

/** Mock sign-in. */
export async function mockSignIn(payload: SignInPayload): Promise<AuthUser> {
  // TODO: POST /auth/signin
  await delay(400)
  return {
    id: crypto.randomUUID(),
    firstName: "Alex",
    email: payload.email.trim().toLowerCase(),
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
