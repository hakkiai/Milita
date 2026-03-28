import React, { createContext, useMemo } from "react"
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-expo"
import { User, OnboardingStatus } from "@/types/user"

// ── Context types ─────────────────────────────────────────────────────────────
type AuthContextValue = {
  isLoaded: boolean
  isSignedIn: boolean
  user: User | null
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth()
  const { user: clerkUser } = useUser()

  // Map Clerk user to app User type
  const user: User | null = useMemo(() => {
    if (!clerkUser) return null
    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
      name:
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
        clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] ||
        'User',
      over18: (clerkUser.unsafeMetadata?.over18 as boolean) ?? false,
      createdAt: clerkUser.createdAt?.toISOString() ?? new Date().toISOString(),
      onboardingStatus:
        (clerkUser.unsafeMetadata?.onboardingStatus as OnboardingStatus) ??
        OnboardingStatus.NOT_STARTED,
      photoUrl: clerkUser.imageUrl ?? undefined,
      universityId: clerkUser.unsafeMetadata?.universityId as string | undefined,
      course: clerkUser.unsafeMetadata?.course as string | undefined,
      bio: clerkUser.unsafeMetadata?.bio as string | undefined,
    }
  }, [clerkUser])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error: any) {
      throw new Error(error?.message || 'Sign out failed')
    }
  }

  const value = useMemo(
    () => ({
      isLoaded,
      isSignedIn: isSignedIn ?? false,
      user,
      signOut: handleSignOut,
    }),
    [isLoaded, isSignedIn, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}