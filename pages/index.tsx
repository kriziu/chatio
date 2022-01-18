import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import useSWR from 'swr';

import { defaultUser, userContext } from 'context/userContext';
import { connectionsContext } from 'context/connectionsContext';

import Image from 'next/image';
import InvitesList from 'components/Profile/InvitesList';
import { Header1, Header2 } from 'components/Simple/Headers';
import { Flex } from 'components/Simple/Flex';
import { Avatar } from 'components/Simple/Avatars';
import { Button } from 'components/Simple/Button';
import AvatarPicker from 'components/Profile/AvatarPicker';

// TODO:
// 6. LIMIT ZAPROSZEN NA STRONE I WIADOMOSCI (PRZYCISK ZEBY WYSWIETLIC WIECEJ)
// 3. react_devtools_backend.js:2540 Warning: Can't perform a React state update on an unmounted component. This is a no-op.

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Profile: NextPage = () => {
  const { setUser, user } = useContext(userContext);
  const { setConnections } = useContext(connectionsContext);

  const router = useRouter();

  const [invites, setInvites] = useState<UserInvited[]>([]);
  const [yourInvites, setYourInvites] = useState<UserInvited[]>([]);

  const { data } = useSWR<InviteType[]>(`/api/invite`, fetcher, {
    refreshInterval: 2000,
  });
  const yours = useSWR<InviteType[]>(`/api/invite?your=true`, fetcher, {
    refreshInterval: 2000,
  });

  useEffect(() => {
    setInvites([]);

    data?.forEach(invite => {
      axios.get<UserType>('/api/user/' + invite.from).then(res => {
        setInvites(prev => [
          ...prev,
          { ...res.data, inviteDate: invite.date, inviteId: invite._id },
        ]);
      });
    });
  }, [data]);

  useEffect(() => {
    setYourInvites([]);

    yours.data?.forEach(invite => {
      axios.get<UserType>('/api/user/' + invite.to).then(res => {
        setYourInvites(prev => [
          ...prev,
          { ...res.data, inviteDate: invite.date, inviteId: invite._id },
        ]);
      });
    });
  }, [yours.data]);

  return (
    <>
      <Flex style={{ padding: '3rem 1rem 1rem 1rem' }}>
        <Avatar imageURL={user.imageURL} />
      </Flex>
      <Header1>{user.fName + ' ' + user.lName}</Header1>
      <AvatarPicker />
      <Flex style={{ flexDirection: 'column' }}>
        <div>
          <Header2>Your Invites</Header2>
          <InvitesList invites={yourInvites} setInvites={setYourInvites} />
        </div>
        <div>
          <Header2>Invites</Header2>
          <InvitesList invites={invites} setInvites={setInvites} accept />
        </div>
      </Flex>
      <Flex
        style={{
          position: 'fixed',
          bottom: '2rem',
          marginLeft: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Button
          inputSize
          onClick={() => {
            setUser(defaultUser);
            setConnections([]);
            axios.post('/api/auth/logout').then(res => router.push('/login'));
          }}
        >
          Log out
        </Button>
      </Flex>
    </>
  );
};

export default Profile;
