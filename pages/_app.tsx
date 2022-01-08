import { FC } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';

import UserProvider from 'context/userContext';
import ConnectionsProvider from 'context/connectionsContext';
import { GlobalStyles } from 'styles/GlobalStyles';

import { Background } from 'components/Simple/Background';
import Circle from 'components/Shapes/AnimatedCircle';
import Navigation from 'components/Navigation/Navigation';

const animation = {
  variants: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  },
  transition: {
    duration: 0.1,
  },
};

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  return (
    <UserProvider>
      <GlobalStyles />
      <ConnectionsProvider>
        <div style={{ overflow: 'hidden', width: '100vw' }}>
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
          <LazyMotion features={domAnimation}>
            <div>
              <Circle radius={9} position={{ x: 40, y: 20 }} />
              <Circle radius={16} position={{ x: 75, y: 58 }} />
              <Circle radius={10} secondary position={{ x: 80, y: 35 }} />
              <Circle radius={5} secondary position={{ x: 55, y: 75 }} />
              <Circle radius={7} secondary position={{ x: 25, y: 35 }} />
              <Circle radius={3} secondary position={{ x: 75, y: 45 }} />
            </div>
            <Background w="100vw" h="100vh" />

            <AnimatePresence exitBeforeEnter>
              <m.div
                key={router.route}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={animation.variants}
                transition={animation.transition}
              >
                <Navigation />
                <div
                  style={{
                    padding: '2rem 0',
                  }}
                >
                  <Component {...pageProps} />
                </div>
              </m.div>
            </AnimatePresence>
          </LazyMotion>
        </div>
      </ConnectionsProvider>
    </UserProvider>
  );
};

export default MyApp;
