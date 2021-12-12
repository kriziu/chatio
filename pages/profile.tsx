import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import useSWR, { useSWRConfig } from 'swr';
import { BsCheck } from 'react-icons/bs';

import { Header1, Header2, Header3 } from 'components/Simple/Headers';
import { userContext } from 'context/userContext';
import { Flex } from 'components/Simple/Flex';
import { Avatar } from 'components/Simple/Avatars';
import { Button } from 'components/Simple/Button';

interface UserInvited extends UserType {
  inviteDate: Date;
  inviteId: string;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Home: NextPage = () => {
  const {
    user: { email },
    setUser,
  } = useContext(userContext);

  const { mutate } = useSWRConfig();
  const { data, error } = useSWR<InviteType[]>(`/api/invite`, fetcher);

  const [invites, setInvites] = useState<UserInvited[]>([]);

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

  console.log(data);

  return (
    <>
      <Flex style={{ padding: '6rem 1rem 1rem 1rem' }}>
        <Avatar style={{ marginRight: '1rem' }} />
        <Header1>Your profile</Header1>
      </Flex>
      <div>
        <Header2>Invites</Header2>
        {invites
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
          : 'loading'}
      </div>
    </>
  );
};

export default Home;
