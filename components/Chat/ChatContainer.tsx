import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { BsChevronDown } from 'react-icons/bs';

import { userContext } from 'context/userContext';
import useWindowSize from 'hooks/useWindowSize';
import { Button } from 'components/Simple/Button';
import MessageList from './MessageList';
import { Container, DownContainer } from './ChatContainer.elements';

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
      (ref.current.scrollHeight + ref.current.scrollTop <
        ref.current.clientHeight + 200 ||
        first ||
        messages[messages.length - 1]?.sender._id === _id)
    ) {
      ref.current.scrollTo({
        top: -ref.current.scrollHeight,
      });
    } else if (newMsg) {
      setShown(true);
    }

    prevMessages = messages;

    if (messages.length) setFirst(false);
    else setFirst(true);
  }, [messages, _id, first, connectionId]);

  useEffect(() => {
    const ifsetShown = () => {
      if (
        ref.current &&
        ref.current.scrollHeight + ref.current.scrollTop >
          ref.current.clientHeight + 1000
      )
        setShown(true);
      else if (
        ref.current &&
        ref.current.scrollHeight + ref.current.scrollTop <=
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
        listRef={ref}
      />

      <DownContainer shown={shown}>
        New messages: {counter}
        <Button
          onClick={() => {
            ref.current &&
              ref.current.scrollTo({
                top: -ref.current.scrollHeight,
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
