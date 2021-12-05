import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { generateAccess } from '../lib/generateTokens';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const access = req.cookies['ACCESS'];
  const refresh = req.cookies['REFRESH'];

  const user = await (await fetch('/api/auth/token')).json();

  console.log('user:', user);

  return jwt.verify(
    access,
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
      ) {
        return jwt.verify(
          refresh,
          process.env.REFRESH_TOKEN_SECRET as string,
          (refreshErr, refreshUser) => {
            console.log(refreshErr);
            if (refreshErr) {
              return NextResponse.redirect('/login');
            }

            const { fName, lName, email, _id } = refreshUser as UserType;
            const newAccess = generateAccess({ fName, lName, email, _id });

            return NextResponse.next().cookie('ACCESS', newAccess);
          }
        );
      }
    }
  );
};
