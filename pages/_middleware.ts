import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const auth = req.cookies['jwt'];

  console.log(auth);

  if (req.nextUrl.pathname !== '/' && !auth) return NextResponse.redirect('/');
  return NextResponse.next();
};
