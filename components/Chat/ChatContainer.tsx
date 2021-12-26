import { FC, useContext, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { scrollY } from 'styles/scroll';
import { userContext } from 'context/userContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 2rem;
  height: calc(100% - 13.5rem);
  margin-top: 2rem;

  ${scrollY}
`;

const Message = styled.p<{ mine?: boolean }>`
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
`;

interface Props {
  messages: MessageType[];
}

let lastTimeOut: NodeJS.Timeout;

const ChatContainer: FC<Props> = ({ messages }) => {
  const {
    user: { _id },
  } = useContext(userContext);

  const [obs, setObs] = useState<IntersectionObserver>();

  const ref = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    setObs(
      new IntersectionObserver(
        e => {
          if (e[0].isIntersecting) {
            const msg = messages.filter(prev => prev._id === e[0].target.id)[0];

            if (!msg.read) {
              clearTimeout(lastTimeOut);

              lastTimeOut = setTimeout(() => console.log('1'), 500);
            }
          }
        },
        {
          root: ref.current,
        }
      )
    );
  }, [ref.current, messages]);

  useEffect(() => {
    if (obs && messagesRef.current.length) {
      messagesRef.current.forEach(singleMsgRef => {
        obs.observe(singleMsgRef);
      });
      return () => {
        obs.disconnect();
      };
    }
  }, [obs, messagesRef.current, messages]);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, ref.current]);

  return (
    <Container ref={ref}>
      {messages.map((message, index) => {
        return (
          <Message
            key={index}
            mine={message.sender._id === _id}
            ref={el => el && (messagesRef.current[index] = el)}
            id={message._id}
          >
            {message.message}
          </Message>
        );
      })}
    </Container>
  );
};

export default ChatContainer;
