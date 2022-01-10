import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import useSWR, { mutate } from 'swr';
import { PresenceChannel } from 'pusher-js';

import { chatContext } from 'context/chatContext';
import { connectionsContext } from 'context/connectionsContext';

import ChatContainer from 'components/Chat/ChatContainer';
import ChatTop from 'components/Chat/ChatTop';
import Spinner from 'components/Spinner';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

let height = 0;
let size = 0;
let fetched = false;
let top = false;
let tempTopMsgId = '';
let tempBotMsgId = '';

const Chat: NextPage = () => {
  const { channels } = useContext(connectionsContext);

  const router = useRouter();
  const connectionId = router.query.connectionId as string;

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [channel, setChannel] = useState<PresenceChannel>();
  const [listRef, setListRef] = useState<HTMLUListElement>();

  const messagesRef = useRef<HTMLLIElement[]>([]);

  const { data, error } = useSWR<CConnectionType>(
    connectionId && `/api/connection?id=${connectionId}`,
    fetcher
  );

  const getAndSetMessages = useCallback(async (): Promise<
    MessageType[] | undefined
  > => {
    console.log(top);
    console.log(tempTopMsgId);
    console.log(tempBotMsgId);
    if (connectionId) {
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

      if (
        res.data[length] &&
        res.data[length]?._id !== (top ? tempTopMsgId : tempBotMsgId)
      ) {
        setMessages(prev =>
          top ? [...res.data, ...prev] : [...prev, ...res.data]
        );

        if (!tempBotMsgId) tempBotMsgId = tempTopMsgId = res.data[0]._id;
        if (!tempTopMsgId) tempTopMsgId = res.data[res.data.length - 1]._id;

        if (top) tempTopMsgId = res.data[0]._id;
        else tempBotMsgId = res.data[res.data.length - 1]._id;
      }
      return res.data;
    }
  }, [connectionId]);

  useEffect(() => {
    tempTopMsgId = '';
    tempBotMsgId = '';
    setLoading(true);
    setMessages([]);
    getAndSetMessages().then(() => setLoading(false));
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

      if (
        (list.scrollTop === 0 ||
          list.scrollTop + list.clientHeight === list.scrollHeight) &&
        messages.length >= 100
      ) {
        if (list.scrollTop === 0) top = true;
        else top = false;

        fetched = true;

        getAndSetMessages().then(res => {
          fetched = false;
          const index = res
            ? (top ? [...res, ...messages] : [...messages, ...res]).findIndex(
                message =>
                  message._id === messages[top ? 0 : messages.length - 1]._id
              )
            : -1;

          console.log(index);

          index !== -1 &&
            listRef?.scrollTo({
              top: messagesRef.current[index].offsetTop - 100,
            });
        });
      }
    };

    const list = listRef;

    list?.addEventListener('scroll', getMoreMessages);

    return () => {
      list?.removeEventListener('scroll', getMoreMessages);
    };
  }, [connectionId, messages, getAndSetMessages, loading, listRef]);

  useEffect(() => {
    const keyboardClb = () => {
      if (window.innerHeight < height * 0.9) {
        size = window.innerHeight - height;
        setTimeout(
          () =>
            listRef &&
            listRef.scrollTo({
              top: listRef?.scrollTop + height - window.innerHeight,
              behavior: 'smooth',
            }),
          100
        );
      } else {
        if (listRef) {
          const scrolledTop = Math.round(listRef?.scrollTop);

          if (listRef?.scrollHeight - scrolledTop > window.innerHeight - 100)
            listRef.scrollTo({
              top: listRef?.scrollTop + size,
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

  if (error) return <div>failed to load</div>;
  if (!data || !messages) return <Spinner />;

  const handlePinnedMessageClick = (messageId: string) => {
    const index = messages.findIndex(message => message._id === messageId);

    listRef?.scrollTo({
      top: messagesRef.current[index].offsetTop - 100,
      behavior: 'smooth',
    });
  };

  return (
    <chatContext.Provider
      value={{
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
      }}
    >
      <ChatTop />

      <ChatContainer />
    </chatContext.Provider>
  );
};

export default Chat;
