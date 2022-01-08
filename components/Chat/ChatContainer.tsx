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

let lastTimeOut: NodeJS.Timeout;
let prevMessages: MessageType[] = [];

const ChatContainer: FC = () => {
  const { user } = useContext(userContext);
  const { _id } = user;
  const { messages, connectionId, listRef, messagesRef, fetched, data } =
    useContext(chatContext);

  const [, windowHeight] = useWindowSize();

  const [obs, setObs] = useState<IntersectionObserver>();

  const [shown, setShown] = useState(false);
  const [first, setFirst] = useState(true);
  const [message, setMessage] = useState('');
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setObs(
      new IntersectionObserver(
        e => {
          if (e[e.length - 1].isIntersecting) {
            const msg = messages.filter(
              prev => prev._id === e[e.length - 1].target.id
            )[0];

            if (msg && !msg?.read && msg?.sender._id !== _id) {
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

    const newMsg =
      prevMessages.length !== messages.length &&
      prevMessages[0]?.connectionId === messages[0]?.connectionId;
    newMsg && !fetched && setCounter(prev => prev + 1);

    if (
      listRef.current &&
      !fetched &&
      (listRef.current.scrollHeight - listRef.current.scrollTop <
        listRef.current.clientHeight + 200 ||
        first ||
        messages[messages.length - 1]?.sender._id === _id)
    ) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
      });
    } else if (newMsg) {
      setShown(true);
    }

    prevMessages = messages;

    if (messages.length) setFirst(false);
    else setFirst(true);
  }, [messages, _id, first, connectionId, listRef, fetched]);

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
      const list = listRef.current;

      list.addEventListener('scroll', ifsetShown);

      return () => {
        list.removeEventListener('scroll', ifsetShown);
        setShown(false);
        setCounter(0);
      };
    }
  }, [listRef.current, listRef]);

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
    <>
      <Container height={windowHeight}>
        <MessageList />

        <DownContainer shown={shown}>
          New messages: {counter}
          <Button
            onClick={() => {
              console.log(listRef.current);
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
          <Flex style={{ paddingTop: '2rem' }}>
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ marginRight: '1rem', width: '75%' }}
            />
            <Button type="submit" icon>
              <BiSend />
            </Button>
          </Flex>
        </form>
      )}
    </>
  );
};

export default ChatContainer;
