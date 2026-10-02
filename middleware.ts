import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/api')
  const isProtectedPage = ['/driver', '/passenger', '/admin'].some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  // For now, allow all pages to load (auth will be enforced client-side)
  // In production, you would check the session/token here
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
