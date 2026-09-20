'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { syncClerkUserAction, type AuthUser } from '@/app/actions'

interface ClerkAuthSyncProps {
  onUserSynced: (user: AuthUser) => void
}

export function ClerkAuthSync({ onUserSynced }: ClerkAuthSyncProps) {
  const { user, isLoaded, isSignedIn } = useUser()
  const syncedRef = useRef<string | null>(null)

  useEffect(() => {
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
  }, [isLoaded, isSignedIn, user, onUserSynced])

  return null
}
