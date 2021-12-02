import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const auth = req.cookies['jwt'];

  const decoded = jwt.decode(auth) as {
    fName: string;
    lName: string;
    email: string;
    iat: number;
    exp: number;
  };

  if (decoded?.exp > new Date().getTime() / 1000) {
    if (
      req.nextUrl.pathname === '/login' ||
      req.nextUrl.pathname === '/register'
    )
      return NextResponse.redirect('/');
    else return NextResponse.next();
  }

  if (
    req.nextUrl.pathname !== '/login' &&
    req.nextUrl.pathname !== '/register' &&
    !req.nextUrl.pathname.includes('auth')
  )
    return NextResponse.redirect('/login');
};
