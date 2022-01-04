import { FC, useState } from 'react';

import styled from '@emotion/styled';
import { AnimatePresence, m } from 'framer-motion';
import axios from 'axios';
import { errToast } from 'lib/toasts';

const MessageContainer = styled.li<{
  mine: boolean;
  time: string;
  touched: boolean;
}>`
  display: flex;
  align-items: center;
  align-self: ${({ mine }) => (mine ? 'flex-end' : 'flex-start')};
  flex-direction: ${({ mine }) => (mine ? 'row-reverse' : 'row')};
  position: relative;

  max-width: 80%;

  :not(:first-of-type) {
    margin-top: 2rem;
  }

  ::after {
    margin: 0 1rem;
    color: ${({ touched }) => (touched ? 'white' : 'transparent')};
    userselect: none;
    content: '${({ time }) => time}';
  }
`;

const Message = styled.p<{
  mine?: boolean;
  read?: boolean;
  pinned?: boolean;
  deleted?: boolean;
}>`
  color: #eee;
  padding: 1rem 1.5rem;
  background-image: ${({ mine, deleted }) =>
    deleted ? 'none' : mine ? 'var(--gradient-mine)' : 'var(--gradient-main)'};
  border: ${({ pinned }) => (pinned ? 2 : 0)}px solid white;
  width: max-content;
  border-radius: 2rem;
  position: relative;
  word-break: break-all;
  user-select: none;
  background-color: black;

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

const PinContainer = styled.div<{
  width?: number;
  mine?: boolean;
  visible?: boolean;
}>`
  z-index: 5;

  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: ${({ visible }) => (visible ? '' : 'none')};
  user-select: none;
  background-color: var(--color-gray-darker);
  border-radius: 2rem;
  padding: 1rem;
  position: absolute;

  right: ${({ width, mine }) => (mine && width ? width + 10 : -50)}px;

  p {
    padding: 1rem 0.5rem;
    border-radius: 1rem;
    :hover {
      cursor: pointer;
      background-color: black;
    }
  }
`;

interface Props {
  messages: MessageType[];
  messagesRef: React.MutableRefObject<HTMLParagraphElement[]>;
  touched: boolean;
  setTouched: React.Dispatch<React.SetStateAction<boolean>>;
  _id: string;
  connectionId: string;
}

let hover = false;
let timeout: NodeJS.Timeout;

const MessageList: FC<Props> = ({
  messages,
  messagesRef,
  touched,
  _id,
  setTouched,
  connectionId,
}) => {
  const [selected, setSelected] = useState(-1);

  return (
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
        onClick={() => setSelected(-1)}
        onTouchMove={() => setSelected(-1)}
      >
        {messages.map((message, index, arr) => {
          const mine = message.sender._id === _id;
          const time =
            (new Date(message.date).getHours() < 10 ? '0' : '') +
            new Date(message.date).getHours() +
            ':' +
            (new Date(message.date).getMinutes() < 10 ? '0' : '') +
            new Date(message.date).getMinutes();

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
                    setTimeout(() => setSelected(index), 50);
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
              <PinContainer
                width={
                  messagesRef.current[index]
                    ? messagesRef.current[index].offsetWidth
                    : 0
                }
                mine={mine}
                visible={selected === index}
                onMouseEnter={() => (hover = true)}
                onMouseLeave={() => {
                  hover = false;
                  setSelected(-1);
                }}
              >
                <p
                  onClick={() =>
                    axios.delete(`/api/pusher/pin?messageId=${message._id}`)
                  }
                >
                  Pin
                </p>
                <p
                  onClick={() => navigator.clipboard.writeText(message.message)}
                >
                  Copy
                </p>
                <p
                  onClick={() =>
                    axios
                      .delete(
                        `/api/pusher/deleteMessage?messageId=${message._id}`
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
            </MessageContainer>
          );
        })}
      </m.div>
    </AnimatePresence>
  );
};

export default MessageList;
