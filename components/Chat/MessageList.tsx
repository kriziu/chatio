import { FC, useContext, useEffect, useState } from 'react';

import { AnimatePresence, m, motion } from 'framer-motion';
import axios from 'axios';

import { errToast } from 'lib/toasts';
import {
  List,
  Message,
  MessageContainer,
  PinContainer,
} from './MessageList.elements';
import Portal from '../Portal';
import { userContext } from 'context/userContext';
import Spinner from 'components/Spinner';

interface Props {
  messages: MessageType[];
  messagesRef: React.MutableRefObject<HTMLLIElement[]>;
  touched: boolean;
  setTouched: React.Dispatch<React.SetStateAction<boolean>>;
  listRef: React.RefObject<HTMLUListElement>;
}

let hover = false;
let timeout: NodeJS.Timeout;

const MotionList = motion(List);

const MessageList: FC<Props> = ({
  messages,
  messagesRef,
  touched,
  setTouched,
  listRef,
}) => {
  const {
    user: { _id },
  } = useContext(userContext);

  const [selected, setSelected] = useState(-1);

  const viewportOffset =
    messagesRef.current[selected] &&
    messagesRef.current[selected].getBoundingClientRect();
  const top = viewportOffset ? viewportOffset.top : 0;

  const selectedMessage = messages[selected];

  return (
    <AnimatePresence exitBeforeEnter>
      {selected !== -1 && (
        <Portal>
          <PinContainer
            width={
              messagesRef.current[selected]
                ? messagesRef.current[selected].offsetWidth
                : 0
            }
            mine={!selectedMessage ? false : selectedMessage.sender._id === _id}
            onMouseEnter={() => (hover = true)}
            onMouseLeave={() => {
              hover = false;
              setSelected(-1);
            }}
            onClick={() =>
              setTimeout(() => {
                hover = false;
                setSelected(-1);
              }, 100)
            }
            top={top}
          >
            <p
              onClick={() =>
                axios.delete(`/api/pusher/pin?messageId=${selectedMessage._id}`)
              }
            >
              Pin
            </p>
            <p
              onClick={() =>
                navigator.clipboard.writeText(selectedMessage.message)
              }
            >
              Copy
            </p>
            <p
              onClick={() =>
                axios
                  .delete(
                    `/api/pusher/deleteMessage?messageId=${selectedMessage._id}`
                  )
                  .catch(err => {
                    if (err.response.status === 403)
                      errToast('This is not your message!');
                  })
              }
            >
              Delete
            </p>
          </PinContainer>
        </Portal>
      )}

      {messages.length ? (
        <MotionList
          initial={{ y: -300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.1,
          }}
          onTouchMove={() => setSelected(-1)}
          ref={listRef}
        >
          {messages.map((message, index, arr) => {
            const messageDate = new Date(message.date);

            const time =
              (messageDate.getHours() < 10 ? '0' : '') +
              messageDate.getHours() +
              ':' +
              (messageDate.getMinutes() < 10 ? '0' : '') +
              messageDate.getMinutes();

            const mine = message.sender._id === _id;

            return (
              <MessageContainer
                key={message._id}
                id={message._id}
                mine={mine}
                time={time}
                touched={touched}
                ref={el => el && (messagesRef.current[index] = el)}
              >
                <Message
                  mine={mine}
                  read={arr[index + 1]?.read ? false : message.read}
                  pinned={message.pin}
                  onClick={() => {
                    if (!message.deleted) {
                      setTouched(false);
                      setSelected(index);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!message.deleted) {
                      setSelected(index);
                      timeout && clearTimeout(timeout);
                    }
                  }}
                  onMouseLeave={() =>
                    (timeout = setTimeout(
                      () => !hover && selected === index && setSelected(-1),
                      500
                    ))
                  }
                  title={time}
                  deleted={message.deleted}
                >
                  {!message.deleted ? message.message : 'Deleted'}
                </Message>
              </MessageContainer>
            );
          })}
        </MotionList>
      ) : (
        <Spinner />
      )}
    </AnimatePresence>
  );
};

export default MessageList;
