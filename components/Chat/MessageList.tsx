import { FC, useContext, useState } from 'react';

import { AnimatePresence, m } from 'framer-motion';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';
import { List, Message, MessageContainer } from './MessageList.elements';

import Spinner from 'components/Spinner';
import MessageMenu from './MessageMenu';

let hover = false;
let timeout: NodeJS.Timeout;

const MotionList = m(List);

const MessageList: FC = () => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { messages, messagesRef, setListRef, loading, connectionId } =
    useContext(chatContext);

  const [selected, setSelected] = useState(-1);
  const [touched, setTouched] = useState(false);

  return (
    <>
      <MessageMenu
        selected={selected}
        hover={hover}
        setSelected={setSelected}
      />
      <AnimatePresence exitBeforeEnter>
        {loading ? (
          <Spinner />
        ) : (
          <MotionList
            id={connectionId}
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.1,
            }}
            onTouchMove={() => setSelected(-1)}
            onTouchStart={() => setTouched(true)}
            onTouchEnd={() => setTouched(false)}
            ref={newRef => setListRef(newRef as HTMLUListElement)}
          >
            {messages.map((message, index, arr) => {
              const messageDate = new Date(message.date);

              const time =
                (messageDate.getHours() < 10 ? '0' : '') +
                messageDate.getHours() +
                ':' +
                (messageDate.getMinutes() < 10 ? '0' : '') +
                messageDate.getMinutes();

              const senderId = message.sender._id;

              const mine = senderId === _id;

              const bfDate =
                arr[index - 1]?.sender._id === senderId
                  ? new Date(arr[index - 1].date)
                  : null;
              const afDate =
                arr[index + 1]?.sender._id === senderId
                  ? new Date(arr[index + 1].date)
                  : null;

              const before = !bfDate
                ? false
                : messageDate.getTime() - bfDate.getTime() > 300_000;

              const after = !afDate
                ? false
                : afDate.getTime() - messageDate.getTime() > 300_000;

              const both =
                (before && after) ||
                (!before && after && !!afDate && !bfDate) ||
                (before && !after && !afDate && !!bfDate) ||
                (!bfDate && !afDate);

              return (
                <MessageContainer
                  key={message._id}
                  id={message._id}
                  mine={mine}
                  time={time}
                  touched={touched}
                  ref={el => el && (messagesRef.current[index] = el)}
                  margin={before || after || !afDate || !bfDate}
                  bottom={after || !afDate}
                >
                  <Message
                    margin={before || after || !afDate || !bfDate}
                    bottom={after || !afDate}
                    both={both}
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
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageList;
