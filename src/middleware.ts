import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas públicas — dejar pasar sin verificar
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/ref/') ||
    pathname.startsWith('/pago') ||
    pathname.startsWith('/api/webhooks')
  ) {
    return response
  }

  // Sin sesión → redirigir a login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin intenta entrar a ruta de aliado → redirigir a admin
  if (pathname.startsWith('/aliado') && user.email === process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Aliado intenta entrar a ruta de admin → redirigir a aliado
  if (pathname.startsWith('/admin') && user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.redirect(new URL('/aliado/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}