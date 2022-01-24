import React, { FC, useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { BsChevronDown } from 'react-icons/bs';
import { BiSend } from 'react-icons/bi';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';
import useWindowSize from 'hooks/useWindowSize';

import MessageList from './MessageList';
import { Container, DownContainer } from './ChatContainer.elements';
import { Button } from 'components/Simple/Button';
import { Header3 } from 'components/Simple/Headers';
import { Flex } from 'components/Simple/Flex';
import { Input } from 'components/Simple/Input';
import { isReadByMe } from 'lib/isReadByMe';

let keyboardSize = 0,
  lastTimeOut: NodeJS.Timeout,
  prevMessages = { length: 0, conId: '' };

const ChatContainer: FC = () => {
  const { user } = useContext(userContext);
  const { _id } = user;
  const {
    messages,
    connectionId,
    listRef,
    messagesRef,
    fetched,
    data,
    goToNewestMessages,
    newestMsgs,
    scrollTo,
    counter,
    top,
  } = useContext(chatContext);

  const [, windowHeight] = useWindowSize();

  const [obs, setObs] = useState<IntersectionObserver>();

  const [shown, setShown] = useState(false);
  const [first, setFirst] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setObs(
      new IntersectionObserver(
        e => {
          if (e[e.length - 1].isIntersecting) {
            const msg = messages.filter(
              prev => prev._id === e[e.length - 1].target.id
            )[0];

            let isRead = isReadByMe(msg, _id);

            if (msg && !isRead && msg?.sender._id !== _id) {
              clearTimeout(lastTimeOut);

              lastTimeOut = setTimeout(() => {
                axios.post(
                  `/api/pusher/read?connectionId=${connectionId}`,
                  {
                    msg,
                  },
                  { withCredentials: true }
                );
              }, 500);
            }
          }
        },
        {
          root: listRef,
        }
      )
    );

    const newMsg =
      prevMessages.length !== messages.length &&
      prevMessages.conId === messages[0]?.connectionId;

    if (listRef)
      if (
        first ||
        (!fetched &&
          newMsg &&
          (listRef.scrollHeight - listRef.scrollTop <
            listRef.clientHeight + 200 ||
            messages[messages.length - 1]?.sender._id === _id))
      ) {
        listRef.scrollTo({
          top: listRef.scrollHeight,
        });
      } else if (
        newMsg &&
        listRef.scrollHeight - listRef.scrollTop > listRef.clientHeight + 200
      )
        setShown(true);

    prevMessages.length = messages.length;
    prevMessages.conId = messages[0]?.connectionId;

    if (messages.length && listRef?.id === connectionId) setFirst(false);
    else setFirst(true);
  }, [messages, _id, first, connectionId, listRef, fetched]);

  useEffect(() => {
    const height = window.innerHeight;

    const ifsetShown = () => {
      if (
        listRef &&
        listRef.scrollHeight - listRef.scrollTop > listRef.clientHeight + 1000
      )
        setShown(true);
      else if (
        listRef &&
        listRef.scrollHeight - listRef.scrollTop <= listRef.clientHeight
      ) {
        setShown(false);
      }
    };

    const keyboardResizeClb = () => {
      if (window.innerHeight < height * 0.9) {
        keyboardSize = window.innerHeight - height;
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
              top: listRef?.scrollTop + keyboardSize,
            });
          keyboardSize = 0;
        }
      }
    };

    if (listRef) {
      const list = listRef;

      window.addEventListener('resize', keyboardResizeClb);
      list.addEventListener('scroll', ifsetShown);

      return () => {
        window.removeEventListener('resize', keyboardResizeClb);
        list.removeEventListener('scroll', ifsetShown);
        setShown(false);
      };
    }
  }, [listRef, newestMsgs]);

  useEffect(() => {
    if (scrollTo.id) {
      const index = messages.findIndex(message => message._id === scrollTo.id);
      if (index !== -1) {
        listRef?.scrollTo({
          top:
            messagesRef.current[index].offsetTop -
            (top ? 100 : listRef?.clientHeight),
          behavior: scrollTo.behavior,
        });
      }
    }

    if (obs && messagesRef.current.length) {
      messagesRef.current.forEach(singleMsgRef => {
        obs.observe(singleMsgRef);
      });
      return () => {
        obs.disconnect();
      };
    }
  }, [
    obs,
    messages,
    messagesRef,
    listRef,
    scrollTo.behavior,
    scrollTo.id,
    top,
  ]);

  return (
    <>
      <Container height={windowHeight}>
        <MessageList />

        <DownContainer shown={shown || !newestMsgs}>
          New messages: {counter}
          <Button onClick={goToNewestMessages} icon>
            <BsChevronDown />
          </Button>
        </DownContainer>
      </Container>
      {data.blocked.yes ? (
        <Header3>Blocked</Header3>
      ) : (
        <form
          onSubmit={e => {
            // cos anty spam
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
              name="message input"
            />
            <Button type="submit" icon aria-label="send message">
              <BiSend />
            </Button>
          </Flex>
        </form>
      )}
    </>
  );
};

export default ChatContainer;
