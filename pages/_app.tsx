import { FC } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import { SWRConfig } from 'swr';

import UserProvider from 'common/context/userContext';
import ConnectionsProvider from 'common/context/connectionsContext';
import { GlobalStyles } from 'common/styles/GlobalStyles';

import { Background } from 'common/components/Background';
import Circle from 'common/components/Shapes/AnimatedCircle';
import Navigation from 'modules/navigation/components/Navigation';
import Head from 'next/head';
import { MainContainer } from 'common/components/MainContainer';
import { Flex } from 'common/components/Flex';

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

  console.log(router.pathname);

  return (
    <UserProvider>
      <Head>
        <title>Chatio</title>
      </Head>
      <GlobalStyles />
      <ConnectionsProvider>
        <SWRConfig
          value={{
            onError: () => {},
          }}
        >
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
              <Background w="100vw" h="100vh" style={{ transition: 'none' }} />

              <AnimatePresence exitBeforeEnter>
                <m.div
                  key={router.route}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={animation.variants}
                  transition={animation.transition}
                >
                  <Flex style={{ height: '100vh' }}>
                    <MainContainer
                      id="container"
                      shadow={
                        router.pathname !== '/login' &&
                        router.pathname !== '/register'
                      }
                    >
                      <Navigation />
                      <div
                        style={{
                          padding: '2rem 0',
                          width: '100%',
                          height: '100%',
                        }}
                      >
                        <Component {...pageProps} />
                      </div>
                    </MainContainer>
                  </Flex>
                </m.div>
              </AnimatePresence>
            </LazyMotion>
          </div>
        </SWRConfig>
      </ConnectionsProvider>
    </UserProvider>
  );
};

export default MyApp;
