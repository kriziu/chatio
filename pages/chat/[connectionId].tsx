import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { BiSend } from 'react-icons/bi';
import useSWR, { mutate } from 'swr';
import { ClipLoader } from 'react-spinners';
import { useSwipeable } from 'react-swipeable';
import { PresenceChannel } from 'pusher-js';

import { Button } from 'components/Simple/Button';
import { userContext } from 'context/userContext';
import ChatContainer from 'components/Chat/ChatContainer';
import { Flex } from 'components/Simple/Flex';
import { getUserFromIds } from 'lib/ids';
import ChatSettings from 'components/Chat/ChatSettings';
import ChatTop from 'components/Chat/ChatTop';
import { Input } from 'components/Simple/Input';
import { connectionsContext } from 'context/connectionsContext';
import { Header3 } from 'components/Simple/Headers';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Chat: NextPage = () => {
  const { user } = useContext(userContext);
  const { _id } = user;
  const { channels, setConnections } = useContext(connectionsContext);

  const router = useRouter();
  const connectionId = router.query.connectionId as string;

  const [settings, setSettings] = useState(false);
  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<PresenceChannel>();

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
    channels.forEach(channel1 => {
      if (channel1.name.slice(9) === connectionId) {
        setChannel(channel1);
      }
    });
  }, [connectionId, channels]);

  useEffect(() => {
    console.log(channel);
    if (channel) {
      if (channel.members.count >= 2) setActive(true);

      channel.bind('new_msg', (data: MessageType) => {
        console.log('2');
        setMessages(prev => [...prev, data]);
      });

      channel.bind('read_msg', (data: MessageType) => {
        setMessages(prev => {
          return prev.map(pre => {
            return new Date(pre.date).getTime() <= new Date(data.date).getTime()
              ? { ...pre, read: true }
              : pre;
          });
        });
      });

      channel.bind('delete_connection', () => {
        router.push('/');
      });

      channel.bind('block_connection', () => {
        mutate(`/api/connection?id=${connectionId}`);
      });

      channel.bind('pusher:member_added', () => {
        setActive(true);
      });

      channel.bind('pusher:member_removed', () => {
        if (channel.members.count < 2) setActive(false);
      });

      return () => {
        channels.forEach(channel => {
          if (channel.name.slice(9) === connectionId) {
            channel.unbind('new_msg');
            channel.unbind('read_msg');
            channel.unbind('delete_connection');
            channel.unbind('pusher:member_added');
            channel.unbind('pusher:member_removed');
          }
        });
      };
    }
  }, [channel, channel?.members.count, channels, connectionId, router]);

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

  return (
    <>
      <ChatSettings
        handlersToClose={handlersToClose}
        secondUser={secondUser}
        opened={settings}
        setOpened={setSettings}
        connectionId={connectionId}
      />

      <ChatTop
        secondUser={secondUser}
        handlersToOpen={handlersToOpen}
        setOpened={setSettings}
        active={active}
      />

      <ChatContainer messages={messages} connectionId={connectionId} />

      {data.blocked.yes ? (
        <Header3>Blocked</Header3>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            message &&
              axios.post('/api/pusher/send', {
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
      )}
    </>
  );
};

export default Chat;
