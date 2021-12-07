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
import { Flex } from '../components/Flex/Flex';

const Home: NextPage = () => {
  const {
    user: { email },
    setUser,
  } = useContext(userContext);

  return <div>s</div>;
};

export default Home;
