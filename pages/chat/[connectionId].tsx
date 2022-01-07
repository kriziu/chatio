import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  FocusEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
import Spinner from 'components/Spinner';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

let height = 0;
let size = 0;
let fetched = false;
let oldestMsgId = '';

const Chat: NextPage = () => {
  const { user } = useContext(userContext);
  const { _id } = user;
  const { channels } = useContext(connectionsContext);

  const router = useRouter();
  const connectionId = router.query.connectionId as string;

  const [settings, setSettings] = useState(false);
  const [active, setActive] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<PresenceChannel>();

  const listRef = useRef<HTMLUListElement>(null);
  const messagesRef = useRef<HTMLLIElement[]>([]);

  const { data, error } = useSWR<CConnectionType>(
    connectionId && `/api/connection?id=${connectionId}`,
    fetcher
  );

  const getAndSetMessages = useCallback(async (): Promise<
    MessageType[] | undefined
  > => {
    if (connectionId) {
      const res = await axios.get<MessageType[]>(
        `/api/message/${connectionId}${
          oldestMsgId ? '?chunkId=' + oldestMsgId : ''
        }`
      );

      if (res.data[0]?._id !== oldestMsgId) {
        setMessages(prev => [...res.data, ...prev]);
        if (res.data[0]) oldestMsgId = res.data[0]._id;
      }
      return res.data;
    }
  }, [connectionId]);

  useEffect(() => {
    oldestMsgId = '';
    setMessages([]);
    getAndSetMessages();
  }, [connectionId, getAndSetMessages]);

  useEffect(() => {
    channels.forEach(channel1 => {
      if (channel1.name.slice(9) === connectionId) {
        setChannel(channel1);
      }
    });
  }, [connectionId, channels]);

  useEffect(() => {
    if (channel) {
      if (channel.members.count >= 2) setActive(true);

      const newMsgClb = (data: MessageType) => {
        setMessages(prev => [...prev, data]);
      };
      channel.bind('new_msg', newMsgClb);

      const readMsgClb = (data: MessageType) => {
        setMessages(prev => {
          return prev.map(pre => {
            return new Date(pre.date).getTime() <= new Date(data.date).getTime()
              ? { ...pre, read: true }
              : pre;
          });
        });
      };
      channel.bind('read_msg', readMsgClb);

      const delMsgClb = (id: string) => {
        setMessages(prev =>
          prev.map(message =>
            message._id === id
              ? { ...message, message: '', pin: false, deleted: true }
              : message
          )
        );
      };
      channel.bind('delete_msg', delMsgClb);

      const pinMsgClb = (id: string) => {
        setMessages(prev =>
          prev.map(message =>
            message._id === id ? { ...message, pin: !message.pin } : message
          )
        );
      };
      channel.bind('pin_msg', pinMsgClb);

      const delConnClb = () => {
        router.push('/');
      };
      channel.bind('delete_connection', delConnClb);

      const blockConnClb = () => {
        mutate(`/api/connection?id=${connectionId}`);
      };
      channel.bind('block_connection', blockConnClb);

      const membAddClb = () => {
        setActive(true);
      };
      channel.bind('pusher:member_added', membAddClb);

      const membRmvClb = () => {
        if (channel.members.count < 2) setActive(false);
      };
      channel.bind('pusher:member_removed', membRmvClb);

      return () => {
        channel.unbind('new_msg', newMsgClb);
        channel.unbind('read_msg', readMsgClb);
        channel.unbind('delete_message', delMsgClb);
        channel.unbind('pin_msg', pinMsgClb);
        channel.unbind('delete_connection', delConnClb);
        channel.unbind('block_connection', blockConnClb);
        channel.unbind('pusher:member_added', membAddClb);
        channel.unbind('pusher:member_removed', membRmvClb);
      };
    }
  }, [channel, channel?.members.count, router, connectionId]);

  useEffect(() => {
    height = window.innerHeight;

    const getMoreMessages = (e: Event) => {
      const list = e.currentTarget as HTMLElement;

      if (list.scrollTop === 0 && messages.length >= 100) {
        fetched = true;
        getAndSetMessages().then(res => {
          fetched = false;
          const index = res
            ? [...res, ...messages].findIndex(
                message => message._id === messages[0]._id
              )
            : -1;

          index !== -1 &&
            listRef.current?.scrollTo({
              top: messagesRef.current[index].offsetTop - 100,
            });
        });
      }
    };

    const list = listRef.current;

    list?.addEventListener('scroll', getMoreMessages);

    return () => {
      list?.removeEventListener('scroll', getMoreMessages);
    };
  }, [connectionId, messages, getAndSetMessages]);

  useEffect(() => {
    const keyboardClb = () => {
      if (window.innerHeight < height * 0.9) {
        size = window.innerHeight - height;
        setTimeout(
          () =>
            listRef.current &&
            listRef.current.scrollTo({
              top: listRef.current?.scrollTop + height - window.innerHeight,
              behavior: 'smooth',
            }),
          100
        );
      } else {
        if (listRef.current) {
          const scrolledTop = Math.round(listRef.current?.scrollTop);

          if (
            listRef.current?.scrollHeight - scrolledTop >
            window.innerHeight - 100
          )
            listRef.current.scrollTo({
              top: listRef.current?.scrollTop + size,
            });
          size = 0;
        }
      }
    };

    window.addEventListener('resize', keyboardClb);

    return () => {
      window.removeEventListener('resize', keyboardClb);
    };
  }, [listRef]);

  const handlersToOpen = useSwipeable({
    onSwipedDown() {
      setSettings(true);
    },
  });

  const handlersToClose = useSwipeable({
    onSwipedUp(e) {
      let close = true;

      (e.event as TouchEvent).composedPath().forEach(target => {
        const tr = target as HTMLElement;

        if (tr.tagName && tr.tagName.toLowerCase() === 'ul') close = false;
      });

      close && setSettings(false);
    },
  });

  if (error) return <div>failed to load</div>;
  if (!data || !messages) return <Spinner />;

  const secondUser = getUserFromIds(data, _id);

  const handlePinnedMessageClick = (messageId: string) => {
    const index = messages.findIndex(message => message._id === messageId);

    listRef.current?.scrollTo({
      top: messagesRef.current[index].offsetTop - 100,
      behavior: 'smooth',
    });

    setSettings(false);
  };

  return (
    <>
      <ChatSettings
        handlersToClose={handlersToClose}
        secondUser={secondUser}
        opened={settings}
        setOpened={setSettings}
        connectionId={connectionId}
        active={active}
        pinnedMessages={messages.filter(message => message.pin)}
        handlePinnedMessageClick={handlePinnedMessageClick}
      />

      <ChatTop
        secondUser={secondUser}
        handlersToOpen={handlersToOpen}
        setOpened={setSettings}
        active={active}
      />

      <ChatContainer
        messages={messages}
        connectionId={connectionId}
        listRef={listRef}
        messagesRef={messagesRef}
        fetched={fetched}
      />

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
