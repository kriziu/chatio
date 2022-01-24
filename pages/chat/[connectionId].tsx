import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { PresenceChannel } from 'pusher-js';

import { chatContext } from 'context/chatContext';
import { userContext } from 'context/userContext';
import { connectionsContext } from 'context/connectionsContext';

import ChatContainer from 'components/Chat/ChatContainer';
import ChatTop from 'components/Chat/ChatTop';
import Spinner from 'components/Spinner';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

let prevLength = 0,
  fetched = false,
  top = true,
  tempTopMsgId = '',
  tempBotMsgId = '';

const Chat: NextPage = () => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { channels } = useContext(connectionsContext);

  const router = useRouter();
  const connectionId = router.query.connectionId as string;

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const { data, error } = useSWR<CConnectionType>(
    connectionId && `/api/connection?id=${connectionId}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  const getAndSetMessages = useCallback(async () => {
    if (connectionId) {
      fetched = true;
      const res = await axios.get<MessageType[]>(
        `/api/message/${connectionId}${
          top && tempTopMsgId
            ? '?chunkTopId=' + tempTopMsgId
            : tempBotMsgId
            ? '?chunkBotId=' + tempBotMsgId
            : ''
        }`
      );

      let length = top ? 0 : res.data.length - 1;

      if (!top && !res.data.length) {
        setNewestMsgs(true);
        setCounter(0);
      }

      if (
        res.data[length] &&
        res.data[length]?._id !== (top ? tempTopMsgId : tempBotMsgId)
      ) {
        prevLength += res.data.length;
        if (prevLength > 200) {
          setNewestMsgs(false);
        }

        setScrollTo({
          behavior: 'auto',
          id: top ? tempTopMsgId : tempBotMsgId,
        });

        setMessages(prev => {
          if (!tempBotMsgId && !tempTopMsgId) return res.data;

          if (top) return [...res.data, ...prev].slice(0, 201);

          if (prevLength > 200) {
            const messages = [...prev.slice(res.data.length - 1), ...res.data];
            const seen = new Set();

            const filteredMessages = messages.filter(msg => {
              const duplicate = seen.has(msg._id);
              seen.add(msg._id);
              return !duplicate;
            });

            return filteredMessages;
          }

          return [...prev, ...res.data];
        });
      } else
        setScrollTo({
          behavior: 'auto',
          id: '',
        });
      setLoading(false);
      fetched = false;
    }
  }, [connectionId]);

  // RESET ALL
  useEffect(() => {
    tempTopMsgId = '';
    tempBotMsgId = '';
    prevLength = 0;
    setNewestMsgs(true);
    setLoading(true);
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

  // PREPARE CHANNEL CALLBACKS
  useEffect(() => {
    if (channel) {
      if (channel.members.count >= 2) setActive(true);

      const newMsgClb = (data: MessageType) => {
        setScrollTo({ id: '', behavior: 'auto' });
        setCounter(prev => prev + 1);

        if (!newestMsgs) {
          if (data.sender._id === _id) {
            setMessages([]);
            setLoading(true);
            console.log('no');
            tempBotMsgId = '';
            tempTopMsgId = '';
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
  }, [
    channel,
    channel?.members.count,
    router,
    connectionId,
    newestMsgs,
    _id,
    getAndSetMessages,
  ]);

  useEffect(() => {
    if (messages.length) {
      tempTopMsgId = messages[0]._id;
      tempBotMsgId = messages[messages.length - 1]._id;
    }

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

  if (error) return <div>failed to load</div>;
  if (!data || !messages) return <Spinner />;

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
          prevLength = res.data.length;
        });
    } else {
      setScrollTo({ behavior: 'smooth', id: messageId });
    }
  };

  const goToNewestMessages = () => {
    if (!newestMsgs) {
      tempTopMsgId = '';
      tempBotMsgId = '';

      setScrollTo(prev => {
        return { ...prev, id: '' };
      });

      setMessages([]);
      prevLength = 0;

      setLoading(true);
      getAndSetMessages();

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
