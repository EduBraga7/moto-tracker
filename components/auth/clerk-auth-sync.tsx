'use client'

import { useEffect, useRef } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { syncClerkUserAction, type AuthUser } from '@/app/actions'

interface ClerkAuthSyncProps {
  onUserSynced: (user: AuthUser) => void
  isLoggingOut?: boolean
  onLogoutDone?: () => void
}

export function ClerkAuthSync({
  onUserSynced,
  isLoggingOut,
  onLogoutDone
}: ClerkAuthSyncProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const syncedRef = useRef<string | null>(null)

  // Handle explicit logout: sign out of Clerk and notify completion
  useEffect(() => {
    if (isLoggingOut) {
      syncedRef.current = null
      if (isSignedIn) {
        signOut()
          .then(() => onLogoutDone?.())
          .catch(() => onLogoutDone?.())
      } else {
        onLogoutDone?.()
      }
    }
  }, [isLoggingOut, isSignedIn, signOut, onLogoutDone])

  // Sync Clerk user with Neon database only if not logging out
  useEffect(() => {
    if (isLoggingOut) return

    // Prevent auto-login if the user recently logged out
    if (typeof window !== 'undefined' && sessionStorage.getItem('moto_tracker_logged_out') === 'true') {
      return
    }

    if (!isLoaded || !isSignedIn || !user) return

    const email = user.primaryEmailAddress?.emailAddress
    if (!email || syncedRef.current === user.id) return

    syncedRef.current = user.id

    const primaryProvider = user.externalAccounts?.[0]?.provider?.replace(/^oauth_/, '') || 'google'

    syncClerkUserAction({
      clerkId: user.id,
      name: user.fullName || user.firstName || email.split('@')[0],
      email,
      avatarUrl: user.imageUrl || '',
      provider: primaryProvider
    })
      .then(res => {
        if (res.success && res.user) {
          onUserSynced(res.user)
        }
      })
      .catch(err => {
        console.error('Error syncing Clerk user to Neon:', err)
      })
  }, [isLoaded, isSignedIn, user, isLoggingOut, onUserSynced])

  return null
}
