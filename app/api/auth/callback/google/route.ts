import { NextRequest, NextResponse } from 'next/server'
import { socialLoginAction } from '@/app/actions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  if (error || !code) {
    console.error('Google OAuth error or code missing:', error)
    return NextResponse.redirect(`${baseUrl}/?oauth_error=google_cancelled`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${baseUrl}/api/auth/callback/google`

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not configured')
    return NextResponse.redirect(`${baseUrl}/?oauth_error=google_missing_credentials`)
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()
    if (!tokenData.access_token) {
      console.error('Failed to exchange Google token:', tokenData)
      return NextResponse.redirect(`${baseUrl}/?oauth_error=google_token_failed`)
    }

    // 2. Fetch authenticated user profile from Google API
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    const googleUser = await userInfoResponse.json()

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/?oauth_error=google_no_email`)
    }

    // 3. Register or authenticate user in Neon Postgres database
    const loginResult = await socialLoginAction({
      provider: 'google',
      name: googleUser.name || googleUser.email.split('@')[0],
      email: googleUser.email,
      avatarUrl: googleUser.picture || ''
    })

    if (!loginResult.success || !loginResult.user) {
      console.error('Failed to persist Google user in Neon Postgres:', loginResult.error)
      return NextResponse.redirect(`${baseUrl}/?oauth_error=neon_save_failed`)
    }

    // 4. Redirect to dashboard with user payload so the frontend immediately logs in
    const userPayload = encodeURIComponent(JSON.stringify(loginResult.user))
    return NextResponse.redirect(`${baseUrl}/?auth_success=google&user=${userPayload}`)
  } catch (err) {
    console.error('Exception during Google OAuth callback:', err)
    return NextResponse.redirect(`${baseUrl}/?oauth_error=google_callback_exception`)
  }
}
