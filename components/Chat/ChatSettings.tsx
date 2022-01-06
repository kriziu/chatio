import React, { Dispatch, FC, SetStateAction } from 'react';

import styled from '@emotion/styled';

import { Background } from 'components/Simple/Background';
import { Flex } from 'components/Simple/Flex';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Header3 } from 'components/Simple/Headers';
import axios from 'axios';
import PinnedMessageList from './PinnedMessageList';
import { errToast } from 'lib/toasts';

const Settings = styled(Background)<{ opened: boolean }>`
  margin-top: -2rem;
  z-index: 15;
  transition: transform 0.4s ease;
  transform: ${({ opened }) =>
    !opened ? 'translateY(-100%)' : 'translateY(0)'};
`;

interface Props {
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
  secondUser: UserType;
  handlersToClose: any;
  connectionId: string;
  active: boolean;
  pinnedMessages: MessageType[];
  handlePinnedMessageClick: (messageId: string) => void;
}

const ChatSettings: FC<Props> = ({
  opened,
  secondUser,
  handlersToClose,
  setOpened,
  connectionId,
  active,
  pinnedMessages,
  handlePinnedMessageClick,
}) => {
  return (
    <Settings w="100vw" h="100vh" opened={opened} {...handlersToClose}>
      <Flex style={{ marginTop: '2rem' }} onClick={() => setOpened(false)}>
        <AvatarSmall active={active} />
        <Header3
          style={{
            textAlign: 'left',
            marginLeft: '1rem',
          }}
        >
          {secondUser.fName} {secondUser.lName}
        </Header3>
      </Flex>
      <PinnedMessageList
        messages={pinnedMessages}
        handlePinnedMessageClick={handlePinnedMessageClick}
      />
      <Flex
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '4rem 6rem',
        }}
      >
        <Header3
          style={{ color: 'var(--color-red)', cursor: 'pointer' }}
          onClick={() => {
            axios
              .post('/api/pusher/block?connectionId=' + connectionId)
              .catch(err => {
                if (err.response.status === 403)
                  errToast("You can't unblock conversation!");
              });
            setOpened(false);
          }}
        >
          Block
        </Header3>
        <Header3
          style={{ color: 'var(--color-red)', cursor: 'pointer' }}
          onClick={() =>
            axios.delete('/api/pusher/delete?connectionId=' + connectionId)
          }
        >
          Delete
        </Header3>
      </Flex>
    </Settings>
  );
};

export default ChatSettings;
