import React, { Dispatch, FC, SetStateAction, useContext } from 'react';

import styled from '@emotion/styled';
import axios from 'axios';
import { SwipeableHandlers } from 'react-swipeable';
import useSWR from 'swr';

import { chatContext } from 'context/chatContext';
import { errToast } from 'lib/toasts';

import { Background } from 'components/Simple/Background';
import { Flex } from 'components/Simple/Flex';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Header3 } from 'components/Simple/Headers';
import Spinner from 'components/Spinner';
import PinnedMessageList from './PinnedMessageList';

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
  secondUser: UserType;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const ChatSettings: FC<Props> = ({
  opened,
  setOpened,
  secondUser,
  handlersToCloseSettings,
}) => {
  const { active, handlePinnedMessageClick, messages, connectionId } =
    useContext(chatContext);

  const { data, error } = useSWR(
    connectionId ? `/api/message/${connectionId}?pinned=true` : null,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data || !messages) return <Spinner />;

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
        messages={data}
        handlePinnedMessageClick={id => {
          setOpened(false);
          handlePinnedMessageClick(id);
        }}
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
