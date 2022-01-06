import React, {
  FC,
  MutableRefObject,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  listRef: RefObject<HTMLUListElement>;
  messagesRef: MutableRefObject<HTMLLIElement[]>;
}

let lastTimeOut: NodeJS.Timeout;
let prevMessages: MessageType[] = [];

const ChatContainer: FC<Props> = ({
  messages,
  connectionId,
  listRef,
  messagesRef,
}) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const [, windowHeight] = useWindowSize();

  const [obs, setObs] = useState<IntersectionObserver>();
  const [touched, setTouched] = useState(false);
  const [shown, setShown] = useState(false);
  const [first, setFirst] = useState(true);
  const [counter, setCounter] = useState(0);

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
          root: listRef.current,
        }
      )
    );

    const newMsg = prevMessages.length !== messages.length;
    newMsg && setCounter(prev => prev + 1);

    if (
      listRef.current &&
      newMsg &&
      (listRef.current.scrollHeight - listRef.current.scrollTop <
        listRef.current.clientHeight + 200 ||
        first ||
        messages[messages.length - 1]?.sender._id === _id)
    ) {
    } else if (newMsg) {
      setShown(true);
    }

    prevMessages = messages;

    if (messages.length) setFirst(false);
    else setFirst(true);
  }, [messages, _id, first, connectionId, listRef]);

  useEffect(() => {
    const ifsetShown = () => {
      if (
        listRef.current &&
        listRef.current.scrollHeight - listRef.current.scrollTop >
          listRef.current.clientHeight + 1000
      )
        setShown(true);
      else if (
        listRef.current &&
        listRef.current.scrollHeight - listRef.current.scrollTop <=
          listRef.current.clientHeight
      ) {
        setShown(false);
        setCounter(0);
      }
    };

    if (listRef.current) {
      const el = listRef.current;

      el.addEventListener('scroll', ifsetShown);

      return () => {
        el.removeEventListener('scroll', ifsetShown);
      };
    }
  }, [listRef]);

  useEffect(() => {
    if (obs && messagesRef.current.length) {
      messagesRef.current.forEach(singleMsgRef => {
        obs.observe(singleMsgRef);
      });
      return () => {
        obs.disconnect();
      };
    }
  }, [obs, messages, messagesRef]);

  return (
    <Container
      height={windowHeight}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTouched(false)}
    >
      <MessageList
        touched={touched}
        messages={messages}
        messagesRef={messagesRef}
        setTouched={setTouched}
        connectionId={connectionId}
        listRef={listRef}
      />

      <DownContainer shown={shown}>
        New messages: {counter}
        <Button
          onClick={() => {
            listRef.current &&
              listRef.current.scrollTo({
                top: listRef.current.scrollHeight,
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
