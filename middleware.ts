import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let token = null;
  try {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('next-auth.session-token');
    res.cookies.delete('__Secure-next-auth.session-token');
    return res;
  }

  const role = (token as any)?.role;

  if (pathname.startsWith('/graduate')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    if (role !== 'GRADUATE') return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/employer')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    if (role !== 'EMPLOYER') return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/graduate/:path*', '/employer/:path*'],
};
