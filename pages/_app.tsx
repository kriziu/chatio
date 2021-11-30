import { FC } from 'react';
import type { AppProps } from 'next/app';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GlobalStyles } from '../styles/GlobalStyles';
import { Background } from '../components/Background/Background';
import { Circle } from '../components/Shapes/Circle';

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <GlobalStyles />
      <ToastContainer
        position="top-center"
        toastStyle={{
          backgroundColor: 'var(--color-black)',
          color: 'var(--color-white)',
        }}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        closeButton={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div>
        <Circle radius={9} position={{ x: 40, y: 20 }} />
        <Circle radius={16} position={{ x: 75, y: 58 }} />
        <Circle radius={10} secondary position={{ x: 80, y: 35 }} />
        <Circle radius={5} secondary position={{ x: 55, y: 75 }} />
        <Circle radius={7} secondary position={{ x: 25, y: 35 }} />
        <Circle radius={3} secondary position={{ x: 95, y: 45 }} />
      </div>
      <Background w="100vw" h="100vh" />
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
