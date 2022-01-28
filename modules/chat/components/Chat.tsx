import { useRouter } from 'next/router';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import useSWR, { useSWRConfig } from 'swr';
import { PresenceChannel } from 'pusher-js';

import { chatContext } from 'modules/chat/context/chatContext';
import { userContext } from 'common/context/userContext';
import { connectionsContext } from 'common/context/connectionsContext';

import ChatContainer from 'modules/chat/components/ChatContainer';
import ChatTop from 'modules/chat/components/ChatTop';
import Spinner from 'common/components/Spinner';
import { getAndSetMessagesHelper } from '../helpers/Chat.helpers';
import { Error, SpinnerContainer } from '../styles/Chat.elements';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

let top = true;

const Chat: FC = () => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { channels } = useContext(connectionsContext);

  const router = useRouter();
  const connectionId = router.query.connectionId as string;

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [newestMsgs, setNewestMsgs] = useState(true);
  const [counter, setCounter] = useState(0);
  const [scrollTo, setScrollTo] = useState<{
    behavior: ScrollBehavior;
    id: string;
  }>({ behavior: 'auto', id: '' });
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [channel, setChannel] = useState<PresenceChannel>();
  const [listRef, setListRef] = useState<HTMLUListElement>();

  const messagesRef = useRef<HTMLLIElement[]>([]);

  const { mutate } = useSWRConfig();
  const { data, error } = useSWR<CConnectionType>(
    connectionId && `/api/connection?id=${connectionId}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const getAndSetMessages = useCallback(
    async (reset?: boolean) =>
      await getAndSetMessagesHelper(
        messages,
        setNewestMsgs,
        setFetched,
        setCounter,
        connectionId,
        setScrollTo,
        setMessages,
        setLoading,
        top,
        reset
      ),
    [connectionId, messages]
  );

  // RESET ALL
  useEffect(() => {
    setNewestMsgs(true);
    setLoading(true);
    setMessages([]);
    getAndSetMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId]);

  useEffect(() => {
    error && getAndSetMessages(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error]);

  useEffect(() => {
    channels.forEach(channel1 => {
      if (channel1.name.slice(9) === connectionId) {
        setChannel(channel1);
      }
    });
  }, [connectionId, channels]);

  // PREPARE CHANNEL CALLBACKS
  useEffect(() => {
    if (channel) {
      if (channel.members.count >= 2) setActive(true);

      const newMsgClb = (data: MessageType) => {
        setScrollTo({ id: '', behavior: 'auto' });
        setCounter(prev => prev + 1);

        if (data.sender._id === _id)
          setTimeout(() => goToNewestMessages(), 100);

        if (data?.administrate) mutate(`/api/connection?id=${connectionId}`);

        if (!newestMsgs) {
          if (data.sender._id === _id) {
            setMessages([]);
            setLoading(true);
            getAndSetMessages();
          }

          return;
        }
        setMessages(prev => [...prev, data]);
      };
      channel.bind('new_msg', newMsgClb);

      const readMsgClb = (data: MessageType) => {
        setMessages(prev => {
          return prev.map(pre => {
            return pre._id === data._id ? data : pre;
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
        mutate(`/api/message/${connectionId}?pinned=true`);
        setScrollTo({ id: '', behavior: 'auto' });
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
        setActive(false); // refresh users
        setActive(true);
      };
      channel.bind('pusher:member_added', membAddClb);

      const membRmvClb = () => {
        setActive(false); // refresh users
        setActive(true); // refresh users
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    channel,
    channel?.members.count,
    router,
    connectionId,
    newestMsgs,
    _id,
    getAndSetMessages,
    mutate,
  ]);

  useEffect(() => {
    const getMoreMessages = (e: Event) => {
      const list = e.currentTarget as HTMLElement;

      if (
        list.scrollTop === 0 ||
        list.scrollTop + list.clientHeight > list.scrollHeight - 2
      ) {
        if (list.scrollTop === 0) top = true;
        else top = false;
        getAndSetMessages();
      }
    };

    if (listRef) {
      const list = listRef;

      list.addEventListener('scroll', getMoreMessages);

      const clickClb = () => setScrollTo({ id: '', behavior: 'auto' });
      list.addEventListener('click', clickClb);
      return () => {
        list.removeEventListener('scroll', getMoreMessages);
        list.removeEventListener('click', clickClb);
      };
    }
  }, [
    connectionId,
    messages,
    getAndSetMessages,
    loading,
    listRef,
    scrollTo.id,
  ]);

  if (error) return <Error>Failed to load</Error>;

  if (!data || !messages)
    return (
      <SpinnerContainer>
        <Spinner />
      </SpinnerContainer>
    );

  const handlePinnedMessageClick = (messageId: string) => {
    const index = messages.findIndex(message => message._id === messageId);
    top = true;
    if (index === -1) {
      setLoading(true);
      setNewestMsgs(false);

      axios
        .get<MessageType[]>(
          `/api/message/pinnedMessage?connectionId=${connectionId}&messageId=${messageId}`
        )
        .then(res => {
          setLoading(false);

          setScrollTo({ behavior: 'auto', id: messageId });

          setMessages(res.data);
        });
    } else {
      setScrollTo({ behavior: 'smooth', id: messageId });
    }
  };

  const goToNewestMessages = () => {
    setScrollTo(prev => {
      return { ...prev, id: '' };
    });
    if (!newestMsgs) {
      setMessages([]);
      setLoading(true);
      getAndSetMessages(true);

      setNewestMsgs(true);
    }

    listRef?.scrollTo({
      top: listRef.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <chatContext.Provider
      value={{
        channel,
        newestMsgs,
        goToNewestMessages,
        connectionId,
        messagesRef,
        messages,
        listRef,
        setListRef,
        data,
        active,
        fetched,
        loading,
        handlePinnedMessageClick,
        scrollTo,
        counter,
        top,
      }}
    >
      <ChatTop />
      <ChatContainer />
    </chatContext.Provider>
  );
};

export default Chat;
