import { FC } from 'react';
import type { AppProps } from 'next/app';
import Link from 'next/link';

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <h1>
        <Link href="/chat">
          <a>Hello</a>
        </Link>
      </h1>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
