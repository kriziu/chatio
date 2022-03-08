import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import useSWR from 'swr';

import { defaultUser, userContext } from 'common/context/userContext';
import { connectionsContext } from 'common/context/connectionsContext';

import InvitesList from 'modules/profile/components/InvitesList';
import { Header1, Header2 } from 'common/components/Headers';
import { Avatar } from 'common/components/Avatars';
import { Button } from 'common/components/Button';
import AvatarPicker from 'common/components/AvatarPicker/AvatarPicker';
import {
  AvatarCenter,
  BottomButton,
  ColFlex,
} from 'modules/_pages/index.elements';

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
      <AvatarCenter>
        <Avatar imageURL={user.imageURL} />
      </AvatarCenter>
      <Header1>{user.fName + ' ' + user.lName}</Header1>
      <AvatarPicker />
      <ColFlex>
        <div>
          <Header2>Your Invites</Header2>
          <InvitesList invites={yourInvites} setInvites={setYourInvites} />
        </div>
        <div>
          <Header2>Invites</Header2>
          <InvitesList invites={invites} setInvites={setInvites} accept />
        </div>
      </ColFlex>
      <BottomButton>
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
      </BottomButton>
    </>
  );
};

export default Profile;
