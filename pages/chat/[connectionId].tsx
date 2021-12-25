import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { BiSend } from 'react-icons/bi';
import useSWR from 'swr';
import { ClipLoader } from 'react-spinners';
import { useSwipeable } from 'react-swipeable';

import { Button } from 'components/Simple/Button';
import { userContext } from 'context/userContext';
import ChatContainer from 'components/Chat/ChatContainer';
import { Flex } from 'components/Simple/Flex';
import { getUserFromIds } from 'lib/ids';
import pusherJs from 'pusher-js';
import ChatSettings from 'components/Chat/ChatSettings';
import ChatTop from 'components/Chat/ChatTop';
import { Input } from 'components/Simple/Input';
import { connectionsContext } from 'context/connectionsContext';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Chat: NextPage = () => {
  const { user } = useContext(userContext);
  const { _id } = user;
  const { channels } = useContext(connectionsContext);

  const router = useRouter();
  const connectionId = router.query.connectionId as string;

  const [settings, setSettings] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState('');

  const { data, error } = useSWR<CConnectionType>(
    connectionId && `/api/connection?id=${connectionId}`,
    fetcher
  );

  const fetchedMessages = useSWR<MessageType[]>(
    connectionId && `/api/message/${connectionId}`,
    fetcher
  );

  useEffect(() => {
    if (fetchedMessages.data) {
      setMessages(fetchedMessages.data);
    }
  }, [fetchedMessages.data]);

  useEffect(() => {
    channels.forEach(channel => {
      if (channel.name.slice(8) === connectionId) {
        channel.bind('new_msg', (data: MessageType) => {
          setMessages(prev => [...prev, data]);
        });
      }
    });
    return () => {
      channels.forEach(channel => {
        if (channel.name.slice(8) === connectionId) {
          channel.unbind('new_msg');
        }
      });
    };
  }, [connectionId, channels]);

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
          message &&
            axios.post('/api/pusher', {
              connectionId,
              message,
              sender: user,
            });
          setMessage('');
        }}
      >
        <Flex style={{ paddingTop: '2rem' }}>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ marginRight: '1rem', width: '75%' }}
          />
          <Button type="submit" icon>
            <BiSend />
          </Button>
        </Flex>
      </form>
    </>
  );
};

export default Chat;
