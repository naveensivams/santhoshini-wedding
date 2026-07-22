import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (process.env.MAINTENANCE_MODE === 'true') {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maintenance</title></head><body style="margin:0;min-height:100vh;background:linear-gradient(135deg,#064e3b,#065f46,#047857);display:flex;align-items:center;justify-content:center;font-family:sans-serif"><div style="background:white;border-radius:16px;padding:2rem;max-width:380px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3)"><div style="font-size:3rem;margin-bottom:1rem">💍</div><h1 style="font-weight:700;font-size:1.25rem;color:#111827;margin:0 0 0.5rem">Down for Maintenance</h1><p style="color:#6b7280;font-size:0.875rem;line-height:1.6;margin:0">Santhoshini's Wedding Planner is temporarily unavailable. We'll be back shortly!</p><p style="color:#9ca3af;font-size:0.75rem;margin-top:1.5rem">🌸 Something beautiful is being prepared</p></div></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    )
  }

  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/auth')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
