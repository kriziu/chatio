import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import jwt from '@tsndr/cloudflare-worker-jwt';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const { ACCESS } = req.cookies;
  const connId = req.url.slice(6);

  const userDecoded = jwt.decode(ACCESS) as UserType;

  let connection = await fetch(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : '' + `/api/connection?id=${connId}`,
    {
      headers: {
        Cookie: 'ACCESS=' + ACCESS,
      },
    }
  );

  const JSONEDconnection = (await connection.json()) as CConnectionType;

  let redirect = true;

  JSONEDconnection.users.forEach(user => {
    if (user._id === userDecoded._id) redirect = false;
  });

  return redirect ? NextResponse.redirect('/') : NextResponse.next();
};
