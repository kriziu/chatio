import React, { FC, useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { BsChevronDown } from 'react-icons/bs';
import { BiSend } from 'react-icons/bi';

import { userContext } from 'common/context/userContext';
import { chatContext } from 'modules/chat/context/chatContext';
import useWindowSize from 'common/hooks/useWindowSize';

import MessageList from 'modules/messages/components/MessageList';
import {
  Container,
  DownContainer,
  FlexTop,
} from '../styles/ChatContainer.elements';
import { Button } from 'common/components/Button';
import { Header3 } from 'common/components/Headers';
import { Input } from 'common/components/Input';
import {
  handleNewMessages,
  setUpObserver,
} from '../helpers/ChatContainer.helpers';

let keyboardSize = 0;

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
    setUpObserver(messages, setObs, _id, connectionId, listRef);

    handleNewMessages(
      messages,
      listRef,
      setShown,
      first,
      setFirst,
      fetched,
      _id,
      connectionId
    );
  }, [messages, _id, first, connectionId, listRef, fetched]);

  useEffect(() => {
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

    if (listRef) {
      const list = listRef;

      list.addEventListener('scroll', ifsetShown);

      return () => {
        list.removeEventListener('scroll', ifsetShown);
        setShown(false);
      };
    }
  }, [listRef]);

  useEffect(() => {
    const height = window.innerHeight;

    // FIX TO PHONES
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

    window.addEventListener('resize', keyboardResizeClb);

    return () => {
      window.removeEventListener('resize', keyboardResizeClb);
    };
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
  }, [messages, messagesRef, listRef, scrollTo.behavior, scrollTo.id, top]);

  useEffect(() => {
    if (obs && messagesRef.current.length) {
      messagesRef.current.forEach(singleMsgRef => {
        obs.observe(singleMsgRef);
      });
      return () => {
        obs.disconnect();
      };
    }
  }, [obs, messagesRef]);

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
          <FlexTop>
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              name="message input"
            />
            <Button type="submit" icon aria-label="send message">
              <BiSend />
            </Button>
          </FlexTop>
        </form>
      )}
    </>
  );
};

export default ChatContainer;
