import { FC, useContext, useEffect, useState } from 'react';

import { AnimatePresence, m } from 'framer-motion';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';
import { getMessageHelpers } from './MessageList.helpers';

import {
  AvatarsContainer,
  List,
  Message,
  MessageContainer,
} from './MessageList.elements';
import Spinner from 'components/Spinner';
import MessageMenu from './MessageMenu';
import { AvatarIcon, AvatarVerySmall } from 'components/Simple/Avatars';
import UserModal from 'components/Group/UserModal';
import { Header5 } from 'components/Simple/Headers';

let hover = false;
let timeout: NodeJS.Timeout;
const usersRead: Map<string, number> = new Map();
const readPositions: number[] = [];

const MotionList = m(List);

const MessageList: FC = () => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { messages, messagesRef, setListRef, loading, connectionId, channel } =
    useContext(chatContext);

  const [selected, setSelected] = useState(-1);
  const [touched, setTouched] = useState(false);
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
              const [
                margin,
                marginMessage,
                bottom,
                both,
                mine,
                showAvatar,
                time,
              ] = getMessageHelpers(_id, message, arr, index);

              const active = Object.keys(channel?.members.members).includes(
                message.sender._id
              );

              let additionalMargin = false;
              for (const [, value] of usersRead) {
                if (value === index) additionalMargin = true;
              }

              if (message.administrate)
                return (
                  <li
                    key={message._id}
                    id={message._id}
                    ref={el => el && (messagesRef.current[index] = el)}
                    style={{ margin: '1rem 0' }}
                  >
                    <Header5>
                      {message.sender.fName} {message.message}
                    </Header5>
                  </li>
                );

              return (
                <MessageContainer
                  key={message._id}
                  id={message._id}
                  mine={mine}
                  time={time}
                  touched={touched}
                  ref={el => el && (messagesRef.current[index] = el)}
                  margin={margin || additionalMargin}
                  bottom={bottom || additionalMargin}
                >
                  {showAvatar && (
                    <AvatarVerySmall
                      imageURL={message.sender.imageURL}
                      active={active}
                      onClick={() => setSelectedUser(message.sender)}
                    />
                  )}
                  <Message
                    margin={marginMessage}
                    bottom={bottom}
                    both={both}
                    mine={mine}
                    pinned={message.pin}
                    avatar={showAvatar}
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
            {readPositions.map(position => {
              return (
                <AvatarsContainer
                  key={position}
                  height={
                    !messagesRef.current[position]
                      ? 0
                      : messagesRef.current[position]?.offsetTop +
                        messagesRef.current[position]?.clientHeight
                  }
                >
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
