import { Dispatch, FC, SetStateAction } from 'react';

import axios from 'axios';
import { useSWRConfig } from 'swr';
import { MdDelete } from 'react-icons/md';
import { BsCheck } from 'react-icons/bs';

import { Flex } from 'common/components/Flex';
import { Header3, Header5 } from 'common/components/Headers';
import { Button } from 'common/components/Button';
import { List } from '../styles/InvitesList.elements';

interface Props {
  accept?: boolean;
  invites: UserInvited[];
  setInvites: Dispatch<SetStateAction<UserInvited[]>>;
}

const InvitesList: FC<Props> = ({ accept, invites, setInvites }) => {
  const { mutate } = useSWRConfig();

  if (!invites.length)
    return <Header5 style={{ height: '17%' }}>No invites...</Header5>;

  return (
    <List>
      {invites.map(invite => {
        return (
          <Flex key={invite.inviteId} as="li">
            <Header3>
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
