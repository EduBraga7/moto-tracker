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
    console.error('GitHub OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/?oauth_error=github_cancelled`)
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const redirectUri = `${baseUrl}/api/auth/callback/github`

  if (!clientId || !clientSecret) {
    console.error('GitHub OAuth credentials missing')
    return NextResponse.redirect(`${baseUrl}/?oauth_error=github_missing_credentials`)
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      })
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData)
      return NextResponse.redirect(`${baseUrl}/?oauth_error=github_token_failed`)
    }

    // 2. Fetch user profile from GitHub API
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Moto-Tracker-App'
      }
    })
    const githubUser = await userRes.json()

    let email = githubUser.email
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Moto-Tracker-App'
        }
      })
      const emails = await emailRes.json()
      if (Array.isArray(emails)) {
        const primary = emails.find((e: any) => e.primary && e.verified) || emails[0]
        if (primary) email = primary.email
      }
    }

    if (!email) {
      email = `${githubUser.login}@users.noreply.github.com`
    }

    // 3. Persist user into Neon Postgres
    const loginResult = await socialLoginAction({
      provider: 'github',
      name: githubUser.name || githubUser.login,
      email,
      avatarUrl: githubUser.avatar_url || ''
    })

    if (!loginResult.success || !loginResult.user) {
      console.error('Failed to save GitHub user to Neon:', loginResult.error)
      return NextResponse.redirect(`${baseUrl}/?oauth_error=neon_save_failed`)
    }

    // 4. Redirect to dashboard with user session
    const userPayload = encodeURIComponent(JSON.stringify(loginResult.user))
    return NextResponse.redirect(`${baseUrl}/?auth_success=github&user=${userPayload}`)
  } catch (err) {
    console.error('GitHub OAuth exception:', err)
    return NextResponse.redirect(`${baseUrl}/?oauth_error=github_callback_exception`)
  }
}
