import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

import axios from 'axios';
import useSWR, { useSWRConfig } from 'swr';
import { BsCheck } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';

import { Header1, Header2, Header3 } from 'components/Simple/Headers';
import { Flex } from 'components/Simple/Flex';
import { Avatar } from 'components/Simple/Avatars';
import { Button } from 'components/Simple/Button';

// TODO:
// 1. DODAC TIMER DO ZAPOROSZEN DO REFRESHU (MOZNA KLIKNAC I ZROBI REFRESH)
// 2. MOZE RESFRESH DANYCH NA KAZDE OTWARCIE MENU
// 3. const JSONEDconnection = (await connection.json()) as CConnectionType; problem gdy nie ma czatu o danym id
// 4. react_devtools_backend.js:2540 Warning: Can't perform a React state update on an unmounted component. This is a no-op.
// 5. usunac console logi z consoli
// 6. 33:6  Warning: React Hook useEffect has missing dependencies: 'formData' and 'setFormData'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
// 41:6  Warning: React Hook useEffect has missing dependencies: 'formData' and 'setFormData'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

interface UserInvited extends UserType {
  inviteDate: Date;
  inviteId: string;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Home: NextPage = () => {
  const { mutate } = useSWRConfig();

  const { data, error } = useSWR<InviteType[]>(`/api/invite`, fetcher, {
    refreshInterval: 10000,
  });
  const yours = useSWR<InviteType[]>(`/api/invite?your=true`, fetcher, {
    refreshInterval: 10000,
  });

  const [invites, setInvites] = useState<UserInvited[]>([]);
  const [yourInvites, setYourInvites] = useState<UserInvited[]>([]);

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

  console.log(data);
  console.log(yours.data);

  const renderInvites = (): JSX.Element[] | string => {
    return invites
      ? invites.map(invite => {
          return (
            <Flex style={{ marginTop: '1rem' }} key={invite.inviteId}>
              <Header3 style={{ marginRight: '1rem' }}>
                {invite.fName} {invite.lName}
              </Header3>
              <Button
                icon
                onClick={() =>
                  axios
                    .patch('/api/invite', { inviteId: invite.inviteId })
                    .then(() => {
                      setInvites(prev =>
                        prev.filter(pre => pre.inviteId !== invite.inviteId)
                      );
                      mutate('/api/connection');
                    })
                }
              >
                <BsCheck />
              </Button>
            </Flex>
          );
        })
      : 'No invites...';
  };

  const renderYourInvites = (): JSX.Element[] | string => {
    return yourInvites
      ? yourInvites.map(invite => {
          return (
            <Flex style={{ marginTop: '1rem' }} key={invite.inviteId}>
              <Header3 style={{ marginRight: '1rem' }}>
                {invite.fName} {invite.lName}
              </Header3>
              <Button
                icon
                onClick={() =>
                  axios
                    .delete('/api/invite', {
                      data: { inviteId: invite.inviteId },
                    })
                    .then(() => {
                      setYourInvites(prev =>
                        prev.filter(pre => pre.inviteId !== invite.inviteId)
                      );
                      mutate('/api/connection');
                    })
                }
              >
                <MdDelete />
              </Button>
            </Flex>
          );
        })
      : '';
  };

  return (
    <>
      <Flex style={{ padding: '6rem 1rem 1rem 1rem' }}>
        <Avatar style={{ marginRight: '1rem' }} />
        <Header1>Your profile</Header1>
      </Flex>
      <div>
        <Header2>Your Invites</Header2>
        {renderYourInvites()}
      </div>
      <div>
        <Header2>Invites</Header2>
        {renderInvites()}
      </div>
    </>
  );
};

export default Home;