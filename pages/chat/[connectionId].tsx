import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';

import axios from 'axios';
import { BsTelephoneFill } from 'react-icons/bs';
import useSWR from 'swr';
import { ClipLoader } from 'react-spinners';
import styled from '@emotion/styled';
import { useSwipeable } from 'react-swipeable';

import { Button } from 'components/Simple/Button';
import { Header3, Header4 } from 'components/Simple/Headers';
import { defaultUser, userContext } from 'context/userContext';
import ChatContainer from 'components/Chat/ChatContainer';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { getUserFromIds } from 'lib/ids';
import { Background } from 'components/Simple/Background';

const Settings = styled(Background)<{ opened: boolean }>`
  margin-top: -2rem;
  z-index: 11;
  transition: transform 0.4s ease;
  transform: ${({ opened }) =>
    !opened ? 'translateY(-100%)' : 'translateY(0)'};
`;

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Home: NextPage = () => {
  const {
    user: { _id },
    setUser,
  } = useContext(userContext);

  const router = useRouter();
  const [settings, setSettings] = useState(false);

  const connectionId = router.query.connectionId as string;

  const { data, error } = useSWR<CConnectionType>(
    connectionId && `/api/connection?id=${connectionId}`,
    fetcher
  );

  const handlers = useSwipeable({
    onSwipedDown() {
      setSettings(true);
    },
  });

  const handlers1 = useSwipeable({
    onSwipedUp() {
      setSettings(false);
    },
  });

  if (error) return <div>failed to load</div>;
  if (!data)
    return (
      <Flex style={{ height: '100%' }}>
        <ClipLoader color="white" loading={true} size={100} />
      </Flex>
    );

  const user = getUserFromIds(data, _id);

  const deleteConnection = () => {
    axios.delete('/api/connection?id=' + connectionId).then(() => {
      router.push('/profile');
    });
  };

  return (
    <>
      <Settings w="100vw" h="100vh" opened={settings} {...handlers1}>
        <Flex style={{ marginTop: '2rem' }} onClick={() => setSettings(false)}>
          <AvatarSmall active />
          <Header3
            style={{
              textAlign: 'left',
              marginLeft: '1rem',
            }}
          >
            {user.fName} {user.lName}
          </Header3>
        </Flex>
        <Flex
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '4rem 6rem',
          }}
        >
          <Header3
            style={{ color: 'var(--color-red)', cursor: 'pointer' }}
            onClick={deleteConnection}
          >
            Delete
          </Header3>
        </Flex>
      </Settings>

      <Flex
        style={{
          width: '100%',
          justifyContent: 'space-between',
          padding: '0 3rem',
        }}
        onClick={() => setSettings(true)}
        {...handlers}
      >
        <Flex style={{ marginLeft: '4rem' }}>
          <AvatarSmall active />
          <Header4
            style={{
              width: 'min-content',
              textAlign: 'left',
              marginLeft: '1rem',
            }}
          >
            {user.fName} {user.lName}
          </Header4>
        </Flex>
        <div>
          <BsTelephoneFill />
        </div>
      </Flex>

      <ChatContainer />
      <Button
        onClick={() => {
          setUser(defaultUser);
          axios.post('/api/auth/logout').then(res => router.push('/login'));
        }}
      >
        Log out
      </Button>
    </>
  );
};

export default Home;
