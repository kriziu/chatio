import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import jwt from '@tsndr/cloudflare-worker-jwt';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const access = req.cookies['ACCESS'];
  const refresh = req.cookies['REFRESH'];

  console.log('access: ', access);

  const validAccess = access
    ? await jwt.verify(access, process.env.ACCESS_TOKEN_SECRET as string)
    : false;

  if (validAccess) {
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
  ) {
    const validRefresh = refresh
      ? await jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET as string)
      : false;

    const redirect = NextResponse.redirect('/login')
      .clearCookie('REFRESH')
      .clearCookie('ACCESS');

    if (!validRefresh) {
      return redirect;
    }

    const token = await fetch('/api/auth/token?refresh=' + refresh);
    if (token.status === 404) return redirect;

    const refreshUser = jwt.decode(refresh);
    const { fName, lName, email, _id } = refreshUser as UserType;

    const newAccess = await jwt.sign(
      { fName, lName, email, _id, exp: new Date().getTime() + 15 * 60 * 1000 },
      process.env.REFRESH_TOKEN_SECRET as string
    );

    return NextResponse.next().cookie('ACCESS', newAccess);
  }
};
