import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import axios from 'axios';

import { scrollY } from 'styles/scroll';
import { userContext } from 'context/userContext';
import useWindowSize from 'hooks/useWindowSize';

const Container = styled.ul<{ height: number }>`
  display: flex;
  height: ${({ height }) => `calc(${height}px - 17rem)`};
  flex-direction: column;
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

interface Props {
  messages: MessageType[];
}

let lastTimeOut: NodeJS.Timeout;

const ChatContainer: FC<Props> = ({ messages }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const [, windowHeight] = useWindowSize();

  const [obs, setObs] = useState<IntersectionObserver>();
  const [touched, setTouched] = useState(false);

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

            if (!msg.read && msg.sender._id !== _id) {
              clearTimeout(lastTimeOut);

              lastTimeOut = setTimeout(() => {
                axios.post(
                  `/api/pusher/read?connectionId=${msg.connectionId}`,
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
  }, [messages, _id]);

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

  useEffect(() => {
    if (
      ref.current &&
      (ref.current.scrollHeight - ref.current.scrollTop <
        ref.current.clientHeight + 100 ||
        messages[messages.length - 1].sender._id === _id)
    ) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
      });
    }
  }, [messages]);

  return (
    <Container
      ref={ref}
      height={windowHeight}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTouched(false)}
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
            >
              {message.message}
            </Message>

            <p
              style={{
                margin: '0 1rem',
                color: touched ? 'white' : 'transparent',
              }}
            >
              {new Date(message.date).getHours()}:
              {new Date(message.date).getMinutes()}
            </p>
          </MessageContainer>
        );
      })}
    </Container>
  );
};

export default ChatContainer;
