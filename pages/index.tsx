import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext } from 'react';

import axios from 'axios';
import { BsTelephoneFill } from 'react-icons/bs';

import { Button } from '../components/Buttons/Button';
import { Header4 } from '../components/Headers/Headers';
import { defaultUser, userContext } from '../context/userContext';
import ChatContainer from '../components/Chat/ChatContainer';
import { AvatarSmall } from '../components/Avatar/Avatars';

const Home: NextPage = () => {
  const {
    user: { email },
    setUser,
  } = useContext(userContext);

  const router = useRouter();

  return (
    <div style={{ padding: '2rem 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          padding: '0 3rem',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginLeft: '4rem' }}
        >
          <AvatarSmall active />
          <Header4
            style={{
              width: 'min-content',
              textAlign: 'left',
              marginLeft: '1rem',
            }}
          >
            Bruno Dzięcielski
          </Header4>
        </div>
        <div>
          <BsTelephoneFill />
        </div>
      </div>

      <ChatContainer />
      <Button
        onClick={() => {
          setUser(defaultUser);
          axios.post('/api/auth/logout').then(res => router.push('/login'));
        }}
      >
        Log out
      </Button>
    </div>
  );
};

export default Home;
