import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext } from 'react';

import axios from 'axios';
import { BsTelephoneFill } from 'react-icons/bs';
import useSWR from 'swr';
import { ClipLoader } from 'react-spinners';

import { Button } from '../../components/Simple/Button';
import { Header4 } from '../../components/Simple/Headers';
import { defaultUser, userContext } from '../../context/userContext';
import ChatContainer from '../../components/Chat/ChatContainer';
import { AvatarSmall } from '../../components/Simple/Avatars';
import { Flex } from '../../components/Simple/Flex';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Home: NextPage = () => {
  const {
    user: { email },
    setUser,
  } = useContext(userContext);

  const router = useRouter();

  const friendId = router.query.friendId as string;

  const { data, error } = useSWR<UserType>(
    friendId && `/api/user/${friendId}`,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data)
    return (
      <Flex style={{ height: '100%' }}>
        <ClipLoader color="white" loading={true} size={100} />
      </Flex>
    );

  const { fName, lName } = data;
  console.log(data);

  return (
    <>
      <Flex
        style={{
          width: '100%',
          justifyContent: 'space-between',
          padding: '0 3rem',
        }}
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
            {fName} {lName}
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
