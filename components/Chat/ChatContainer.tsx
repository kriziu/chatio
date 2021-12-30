import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import axios from 'axios';
import { BsChevronDown } from 'react-icons/bs';
import { AnimatePresence, m } from 'framer-motion';

import { scrollY } from 'styles/scroll';
import { userContext } from 'context/userContext';
import useWindowSize from 'hooks/useWindowSize';
import { Button } from 'components/Simple/Button';

const Container = styled.ul<{ height: number }>`
  height: ${({ height }) => `calc(${height}px - 17rem)`};
  padding: 0 2rem;
  margin-top: 2rem;

  ${scrollY}
`;

const MessageContainer = styled.li<{ mine: boolean }>`
  display: flex;
  align-items: center;
  align-self: ${({ mine }) => (mine ? 'flex-end' : 'flex-start')};
  flex-direction: ${({ mine }) => (mine ? 'row-reverse' : 'row')};

  max-width: 80%;

  :not(:first-of-type) {
    margin-top: 2rem;
  }
`;

const Message = styled.p<{ mine?: boolean; read?: boolean }>`
  color: #eee;
  padding: 1rem 1.5rem;
  background-image: ${({ mine }) =>
    mine ? 'var(--gradient-mine)' : 'var(--gradient-main)'};
  width: max-content;
  border-radius: 2rem;
  position: relative;
  word-break: break-all;

  ::after {
    display: block;
    content: ' ';
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: ${({ mine, read }) =>
      mine && read ? 'white' : 'transparent'};
    position: absolute;
    right: -1.5rem;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.2s ease;
  }
`;

const DownContainer = styled.div<{ shown: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  flex-direction: column;
  bottom: 0;
  left: 0;
  margin-left: 50%;
  transform: ${({ shown }) =>
      shown ? 'translateY(-10rem)' : 'translateY(100%)'}
    translateX(-50%);
  transition: transform 0.3s ease;
`;

interface Props {
  messages: MessageType[];
  connectionId: string;
}

let lastTimeOut: NodeJS.Timeout;
let prevMessages: MessageType[] = [];

const ChatContainer: FC<Props> = ({ messages, connectionId }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const [, windowHeight] = useWindowSize();

  const [obs, setObs] = useState<IntersectionObserver>();
  const [touched, setTouched] = useState(false);
  const [shown, setShown] = useState(false);
  const [first, setFirst] = useState(true);
  const [counter, setCounter] = useState(0);

  const ref = useRef<HTMLUListElement>(null);
  const messagesRef = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    setObs(
      new IntersectionObserver(
        e => {
          if (e[e.length - 1].isIntersecting) {
            const msg = messages.filter(
              prev => prev._id === e[e.length - 1].target.id
            )[0];

            if (!msg?.read && msg?.sender._id !== _id) {
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
          root: ref.current,
        }
      )
    );

    const noNewMsg = prevMessages.length !== messages.length;

    noNewMsg && setCounter(counter + 1);

    if (
      ref.current &&
      (ref.current.scrollHeight - ref.current.scrollTop <
        ref.current.clientHeight + 200 ||
        noNewMsg ||
        messages[messages.length - 1]?.sender._id === _id)
    ) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
      });
    } else if (prevMessages.length !== messages.length) {
      setShown(true);
    }

    prevMessages = messages;

    if (ref.current && ref.current.scrollTop > 0) setFirst(false);
    else setFirst(true);
  }, [messages, _id, counter, first, connectionId]);

  useEffect(() => {
    const ifsetShown = () => {
      if (
        ref.current &&
        ref.current.scrollHeight - ref.current.scrollTop >
          ref.current.clientHeight + 1000 &&
        !first
      )
        setShown(true);
      else if (
        ref.current &&
        ref.current.scrollHeight - ref.current.scrollTop <=
          ref.current.clientHeight
      ) {
        setShown(false);
        setCounter(0);
      }
    };

    if (ref.current) {
      const el = ref.current;

      el.addEventListener('scroll', ifsetShown);

      return () => {
        el.removeEventListener('scroll', ifsetShown);
      };
    }
  }, []);

  useEffect(() => {
    if (obs && messagesRef.current.length) {
      messagesRef.current.forEach(singleMsgRef => {
        obs.observe(singleMsgRef);
      });
      return () => {
        obs.disconnect();
      };
    }
  }, [obs, messages]);

  return (
    <Container
      ref={ref}
      height={windowHeight}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTouched(false)}
    >
      <AnimatePresence>
        <m.div
          initial={{ y: -300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{
            duration: 0.2,
          }}
          style={{ display: 'flex', flexDirection: 'column' }}
          key={connectionId}
        >
          {messages.map((message, index, arr) => {
            const mine = message.sender._id === _id;
            return (
              <MessageContainer key={message._id} mine={mine}>
                <Message
                  mine={mine}
                  ref={el => el && (messagesRef.current[index] = el)}
                  id={message._id}
                  read={arr[index + 1]?.read ? false : message.read}
                  onMouseEnter={() => setTouched(true)}
                  onMouseLeave={() => setTouched(false)}
                >
                  {message.message}
                </Message>

                <p
                  style={{
                    margin: '0 1rem',
                    color: touched ? 'white' : 'transparent',
                  }}
                >
                  {(new Date(message.date).getHours() < 10 ? '0' : '') +
                    new Date(message.date).getHours()}
                  :
                  {(new Date(message.date).getMinutes() < 10 ? '0' : '') +
                    new Date(message.date).getMinutes()}
                </p>
              </MessageContainer>
            );
          })}
        </m.div>
      </AnimatePresence>
      <DownContainer shown={shown}>
        New messages: {counter}
        <Button
          onClick={() => {
            ref.current &&
              ref.current.scrollTo({
                top: ref.current.scrollHeight,
                behavior: 'smooth',
              });
          }}
          icon
        >
          <BsChevronDown />
        </Button>
      </DownContainer>
    </Container>
  );
};

export default ChatContainer;
