import { FC, useContext, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import axios from 'axios';

import { scrollY } from 'styles/scroll';
import { userContext } from 'context/userContext';
import useWindowSize from 'hooks/useWindowSize';

const Container = styled.div<{ height: number }>`
  display: flex;
  height: ${({ height }) => `calc(${height}px - 17rem)`};
  flex-direction: column;
  padding: 0 2rem;
  margin-top: 2rem;

  ${scrollY}
`;

const Message = styled.p<{ mine?: boolean; read?: boolean }>`
  color: #eee;
  padding: 1rem 1.5rem;
  background-image: ${({ mine }) =>
    mine ? 'var(--gradient-mine)' : 'var(--gradient-main)'};
  width: max-content;
  max-width: 65%;
  border-radius: 2rem;

  ${({ mine }) => mine && 'align-self: flex-end'};

  :not(:first-of-type) {
    margin-top: 2rem;
  }

  position: relative;
  ::after {
    display: ${({ mine, read }) => (mine && read ? 'block' : 'none')};
    content: ' ';
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: white;
    position: absolute;
    right: -1.5rem;
    top: 50%;
    transform: translateY(-50%);
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

  const ref = useRef<HTMLDivElement>(null);
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
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <Container ref={ref} height={windowHeight}>
      {messages.map((message, index) => {
        return (
          <Message
            key={index}
            mine={message.sender._id === _id}
            ref={el => el && (messagesRef.current[index] = el)}
            id={message._id}
            read={message.read}
          >
            {message.message}
          </Message>
        );
      })}
    </Container>
  );
};

export default ChatContainer;
