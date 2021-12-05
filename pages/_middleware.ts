import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const auth = req.cookies['jwt'];

  return jwt.verify(
    auth,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, user) => {
      console.log(err);

      if (!err) {
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
    }
  );
};
