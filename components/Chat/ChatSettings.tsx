import React, { Dispatch, FC, SetStateAction, useContext } from 'react';

import styled from '@emotion/styled';

import { Background } from 'components/Simple/Background';
import { Flex } from 'components/Simple/Flex';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Header3 } from 'components/Simple/Headers';
import axios from 'axios';
import PinnedMessageList from './PinnedMessageList';
import { errToast } from 'lib/toasts';
import { chatContext } from 'context/chatContext';
import { SwipeableHandlers } from 'react-swipeable';

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
  handlersToCloseSettings: SwipeableHandlers;
}

const ChatSettings: FC<Props> = ({
  opened,
  setOpened,
  handlersToCloseSettings,
}) => {
  const {
    active,
    secondUser,
    handlePinnedMessageClick,
    messages,
    connectionId,
  } = useContext(chatContext);

  const pinnedMessages = messages.filter(message => message.pin);

  return (
    <Settings w="100vw" h="100vh" opened={opened} {...handlersToCloseSettings}>
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
