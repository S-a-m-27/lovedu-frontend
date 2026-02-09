import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createEdgeClient } from '@/lib/supabaseClient'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // For development, allow all routes to pass through
  // In production, you would implement proper session checking here
  console.log(`🔄 Middleware: ${pathname} - Allowing through for development`)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


