import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { BsTelephoneFill } from 'react-icons/bs';
import useSWR from 'swr';
import { ClipLoader } from 'react-spinners';
import styled from '@emotion/styled';
import { useSwipeable } from 'react-swipeable';

import { Button } from 'components/Simple/Button';
import { Header3, Header4 } from 'components/Simple/Headers';
import { userContext } from 'context/userContext';
import ChatContainer from 'components/Chat/ChatContainer';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { getUserFromIds } from 'lib/ids';
import { Background } from 'components/Simple/Background';
import pusherJs from 'pusher-js';
import ChatSettings from 'components/Chat/ChatSettings';
import ChatTop from 'components/Chat/ChatTop';
import { Input } from 'components/Simple/Input';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Chat: NextPage = () => {
  const { user } = useContext(userContext);
  const { _id } = user;

  const router = useRouter();
  const connectionId = router.query.connectionId as string;

  const [settings, setSettings] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState('');

  const { data, error } = useSWR<CConnectionType>(
    connectionId && `/api/connection?id=${connectionId}`,
    fetcher
  );

  useEffect(() => {
    const pusher = new pusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
      authEndpoint: '/api/pusher/auth',
    });

    if (connectionId !== undefined) {
      const channel = pusher.subscribe(`private-${connectionId}`);

      channel.bind('new_msg', (data: MessageType) => {
        setMessages(prev => [...prev, data]);
      });
    }
    return () => {
      pusher.unsubscribe(`private-${connectionId}`);
    };
  }, [router]);

  const handlersToOpen = useSwipeable({
    onSwipedDown() {
      setSettings(true);
    },
  });

  const handlersToClose = useSwipeable({
    onSwipedUp() {
      setSettings(false);
    },
  });

  if (error) return <div>failed to load</div>;
  if (!data)
    return (
      <Flex style={{ height: '100%' }}>
        <ClipLoader color="white" loading={true} size={100} />
      </Flex>
    );

  const secondUser = getUserFromIds(data, _id);

  const deleteConnection = () => {
    axios.delete('/api/connection?id=' + connectionId).then(() => {
      router.push('/profile');
    });
  };

  return (
    <>
      <ChatSettings
        handlersToClose={handlersToClose}
        secondUser={secondUser}
        opened={settings}
        setOpened={setSettings}
        deleteConnection={deleteConnection}
      />

      <ChatTop
        secondUser={secondUser}
        handlersToOpen={handlersToOpen}
        setOpened={setSettings}
      />

      <ChatContainer messages={messages} />
      <form
        onSubmit={e => {
          e.preventDefault();
          setMessage('');
          axios.post('/api/pusher', {
            connectionId,
            message,
            sender: user,
          });
        }}
      >
        <Input value={message} onChange={e => setMessage(e.target.value)} />
        <Button type="submit">Send</Button>
      </form>
    </>
  );
};

export default Chat;
