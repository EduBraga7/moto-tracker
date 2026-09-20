import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server'

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next()
  }
  return clerkMiddleware()(req, evt)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
