import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import jwt from '@tsndr/cloudflare-worker-jwt';

// CLEAR ALL
const redirect = NextResponse.redirect('/login')
  .clearCookie('REFRESH')
  .clearCookie('ACCESS');

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const access = req.cookies['ACCESS'];
  const refresh = req.cookies['REFRESH'];

  const validAccess = access
    ? await jwt.verify(access, process.env.ACCESS_TOKEN_SECRET as string)
    : false;

  const { pathname } = req.nextUrl;

  if (validAccess) {
    if (pathname === '/login' || pathname === '/register')
      return NextResponse.redirect('/');
    return NextResponse.next();
  }

  if (
    pathname !== '/login' &&
    pathname !== '/register' &&
    !pathname.includes('auth')
  ) {
    const validRefresh = refresh
      ? await jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET as string)
      : false;

    if (!validRefresh) {
      return redirect;
    }

    // CAN'T STORE TOKENS IN MONGODB BECAUSE OF EDGE MIDDLEWARE 1500ms TIMEOUT
    // const token = await fetch(
    //   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') +
    //     `/api/auth/token?refresh=${refresh}`
    // );
    // if (token.status === 404) return redirect;

    const refreshUser = jwt.decode(refresh);
    const { fName, lName, email, _id, imageURL } = refreshUser as UserType;

    const newAccess = await jwt.sign(
      {
        fName,
        lName,
        email,
        _id,
        imageURL,
        exp: Math.round((new Date().getTime() + 15 * 60 * 1000) / 1000),
      },
      process.env.ACCESS_TOKEN_SECRET as string
    );

    return NextResponse.next().cookie('ACCESS', newAccess);
  }
};
