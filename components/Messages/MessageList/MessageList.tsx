import { FC, useContext, useEffect, useState } from 'react';

import { AnimatePresence, m } from 'framer-motion';

import { chatContext } from 'context/chatContext';

import { AvatarsContainer, List } from './MessageList.elements';
import Spinner from 'components/Spinner';
import MessageMenu from '../MessageMenu/MessageMenu';
import { AvatarIcon } from 'components/Simple/Avatars';
import UserModal from 'components/Group/UserModal/UserModal';
import Message from '../Message/Message';

const usersRead: Map<string, number> = new Map();
const readPositions: number[] = [];

const MotionList = m(List);

const MessageList: FC = () => {
  const { messages, messagesRef, setListRef, loading, connectionId, channel } =
    useContext(chatContext);

  const [selected, setSelected] = useState(-1);
  const [touched, setTouched] = useState(false);
  const [hover, setHover] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType>();

  useEffect(() => {
    messages.forEach((message, index) => {
      for (const user of message.read) {
        if (user._id) usersRead.set(user._id, index);
      }
    });

    Array.from(usersRead).forEach(([, value]) => {
      if (!readPositions.includes(value)) readPositions.push(value);
    });
  }, [messages]);

  return (
    <>
      <UserModal user={selectedUser} setUser={setSelectedUser} instantDelete />
      {selected !== -1 && (
        <MessageMenu
          selected={selected}
          setHover={setHover}
          setSelected={setSelected}
        />
      )}
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
              let additionalMargin = false;
              for (const [, value] of usersRead) {
                if (value === index) additionalMargin = true;
              }

              return (
                <Message
                  key={message._id}
                  additionalMargin={additionalMargin}
                  hover={hover}
                  touched={touched}
                  selected={selected}
                  index={index}
                  message={message}
                  array={arr}
                  setSelectedUser={setSelectedUser}
                  setSelected={setSelected}
                  setTouched={setTouched}
                />
              );
            })}
            {readPositions.map(position => {
              const height = !messagesRef.current[position]
                ? 0
                : messagesRef.current[position]?.offsetTop +
                  messagesRef.current[position]?.clientHeight;

              return (
                <AvatarsContainer key={position} height={height}>
                  {Array.from(usersRead).map(([key, value], index, arr) => {
                    const message = messages[value];
                    const read = message?.read;

                    if (!read || value !== position || index > 7) return;

                    if (index === 0 && arr.length > 7) {
                      return <li>...</li>;
                    }

                    const user = read.find(pre => pre._id === key);

                    return (
                      <AvatarIcon
                        key={index}
                        imageURL={!user ? '-1' : user?.imageURL}
                      />
                    );
                  })}
                </AvatarsContainer>
              );
            })}
          </MotionList>
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageList;
