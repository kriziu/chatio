import { FC, useState } from 'react';

import { AnimatePresence, m } from 'framer-motion';
import axios from 'axios';

import { errToast } from 'lib/toasts';
import {
  List,
  Message,
  MessageContainer,
  PinContainer,
} from './MessageList.elements';
import Portal from '../Portal';

interface Props {
  messages: MessageType[];
  messagesRef: React.MutableRefObject<HTMLParagraphElement[]>;
  touched: boolean;
  setTouched: React.Dispatch<React.SetStateAction<boolean>>;
  _id: string;
  connectionId: string;
  listRef: React.RefObject<HTMLUListElement>;
}

let hover = false;
let timeout: NodeJS.Timeout;

const MotionList = m(List);

const MessageList: FC<Props> = ({
  messages,
  messagesRef,
  touched,
  _id,
  setTouched,
  connectionId,
  listRef,
}) => {
  const [selected, setSelected] = useState(-1);

  const viewportOffset =
    messagesRef.current[selected] &&
    messagesRef.current[selected].getBoundingClientRect();
  const top = viewportOffset ? viewportOffset.top : 0;

  const selectedMessage = messages[selected];

  return (
    <AnimatePresence>
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
      <MotionList
        initial={{ y: -300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{
          duration: 0.2,
        }}
        style={{ scale: '1,-1' }}
        key={connectionId}
        onTouchMove={() => setSelected(-1)}
        ref={listRef}
      >
        {messages.map((message, index, arr) => {
          const time =
            (new Date(message.date).getHours() < 10 ? '0' : '') +
            new Date(message.date).getHours() +
            ':' +
            (new Date(message.date).getMinutes() < 10 ? '0' : '') +
            new Date(message.date).getMinutes();

          const mine = message.sender._id === _id;

          return (
            <MessageContainer
              key={message._id}
              mine={mine}
              time={time}
              touched={touched}
            >
              <Message
                mine={mine}
                ref={el => el && (messagesRef.current[index] = el)}
                id={message._id}
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
                title={
                  (new Date(message.date).getHours() < 10 ? '0' : '') +
                  new Date(message.date).getHours() +
                  ':' +
                  (new Date(message.date).getMinutes() < 10 ? '0' : '') +
                  new Date(message.date).getMinutes()
                }
                deleted={message.deleted}
              >
                {!message.deleted ? message.message : 'Deleted'}
              </Message>
            </MessageContainer>
          );
        })}
      </MotionList>
    </AnimatePresence>
  );
};

export default MessageList;
