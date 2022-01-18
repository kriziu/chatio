import { Dispatch, FC, SetStateAction } from 'react';

import axios from 'axios';
import { useSWRConfig } from 'swr';
import styled from '@emotion/styled';
import { MdDelete } from 'react-icons/md';
import { BsCheck } from 'react-icons/bs';

import { Flex } from 'components/Simple/Flex';
import { Header3, Header5 } from 'components/Simple/Headers';
import { Button } from 'components/Simple/Button';
import { scrollY } from 'styles/scroll';

const List = styled.ul`
  list-style: none;
  height: 17vh;
  ${scrollY}
`;

interface Props {
  accept?: boolean;
  invites: UserInvited[];
  setInvites: Dispatch<SetStateAction<UserInvited[]>>;
}

const InvitesList: FC<Props> = ({ accept, invites, setInvites }) => {
  const { mutate } = useSWRConfig();

  if (!invites.length)
    return <Header5 style={{ height: '17vh' }}>No invites...</Header5>;

  return (
    <List>
      {invites.map(invite => {
        return (
          <Flex style={{ marginTop: '1rem' }} key={invite.inviteId} as="li">
            <Header3 style={{ marginRight: '1rem' }}>
              {invite.fName} {invite.lName}
            </Header3>
            <Button
              icon
              onClick={() =>
                accept
                  ? axios
                      .patch<CConnectionType>('/api/invite', {
                        inviteId: invite.inviteId,
                      })
                      .then(res => {
                        setInvites(prev =>
                          prev.filter(pre => pre.inviteId !== invite.inviteId)
                        );
                        console.log(res.data);
                        mutate('/api/connection');
                      })
                  : axios
                      .delete('/api/invite', {
                        data: { inviteId: invite.inviteId },
                      })
                      .then(() => {
                        setInvites(prev =>
                          prev.filter(pre => pre.inviteId !== invite.inviteId)
                        );
                        mutate('/api/connection');
                      })
              }
            >
              {accept ? <BsCheck /> : <MdDelete />}
            </Button>
          </Flex>
        );
      })}
    </List>
  );
};

export default InvitesList;
