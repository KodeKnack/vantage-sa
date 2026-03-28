import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ cleared: true });
  res.cookies.delete('next-auth.session-token');
  res.cookies.delete('__Secure-next-auth.session-token');
  res.cookies.delete('next-auth.csrf-token');
  res.cookies.delete('next-auth.callback-url');
  return res;
}

export async function GET() {
  const res = NextResponse.redirect(
    new URL('/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
  );
  res.cookies.delete('next-auth.session-token');
  res.cookies.delete('__Secure-next-auth.session-token');
  res.cookies.delete('next-auth.csrf-token');
  res.cookies.delete('next-auth.callback-url');
  return res;
}

