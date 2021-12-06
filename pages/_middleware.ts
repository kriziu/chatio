import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { generateAccess } from '../lib/generateTokens';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const access = req.cookies['ACCESS'];
  const refresh = req.cookies['REFRESH'];

  return jwt.verify(
    access,
    process.env.ACCESS_TOKEN_SECRET as string,
    async (err, user) => {
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
      ) {
        return jwt.verify(
          refresh,
          process.env.REFRESH_TOKEN_SECRET as string,
          async (refreshErr, refreshUser) => {
            const redirect = NextResponse.redirect('/login')
              .clearCookie('REFRESH')
              .clearCookie('ACCESS');

            if (refreshErr) {
              return redirect;
            }

            const token = await fetch('/api/auth/token?refresh=' + refresh);
            if (token.status === 404) return redirect;

            const { fName, lName, email, _id } = refreshUser as UserType;
            const newAccess = generateAccess({ fName, lName, email, _id });

            return NextResponse.next().cookie('ACCESS', newAccess);
          }
        );
      }
    }
  );
};
