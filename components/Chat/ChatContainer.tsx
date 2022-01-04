import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import axios from 'axios';
import { BsChevronDown } from 'react-icons/bs';

import { scrollY } from 'styles/scroll';
import { userContext } from 'context/userContext';
import useWindowSize from 'hooks/useWindowSize';
import { Button } from 'components/Simple/Button';
import MessageList from './MessageList';

const Container = styled.ul<{ height: number }>`
  height: ${({ height }) => `calc(${height}px - 17rem)`};
  padding: 0 2rem;
  margin-top: 2rem;

  ${scrollY};
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

    const newMsg = prevMessages.length !== messages.length;
    newMsg && setCounter(prev => prev + 1);

    if (
      ref.current &&
      newMsg &&
      (ref.current.scrollHeight - ref.current.scrollTop <
        ref.current.clientHeight + 200 ||
        first ||
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
  }, [messages, _id, first, connectionId]);

  useEffect(() => {
    const ifsetShown = () => {
      if (
        ref.current &&
        ref.current.scrollHeight - ref.current.scrollTop >
          ref.current.clientHeight + 1000
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
      <MessageList
        touched={touched}
        messages={messages}
        _id={_id}
        messagesRef={messagesRef}
        setTouched={setTouched}
        connectionId={connectionId}
      />

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
