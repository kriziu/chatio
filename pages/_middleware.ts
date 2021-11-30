import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const auth = req.cookies['jwt'];

  return NextResponse.next();
};
