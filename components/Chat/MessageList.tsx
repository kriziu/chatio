import { FC, useContext, useState } from 'react';

import { AnimatePresence, m } from 'framer-motion';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';
import { getMessageHelpers } from './MessageList.helpers';

import { List, Message, MessageContainer } from './MessageList.elements';
import Spinner from 'components/Spinner';
import MessageMenu from './MessageMenu';
import { AvatarIcon, AvatarVerySmall } from 'components/Simple/Avatars';

let hover = false;
let timeout: NodeJS.Timeout;

const MotionList = m(List);

const MessageList: FC = () => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { messages, messagesRef, setListRef, loading, connectionId, channel } =
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

              return (
                <MessageContainer
                  key={message._id}
                  id={message._id}
                  mine={mine}
                  time={time}
                  touched={touched}
                  ref={el => el && (messagesRef.current[index] = el)}
                  margin={margin}
                  bottom={bottom}
                >
                  {showAvatar && (
                    <AvatarVerySmall
                      imageURL={message.sender.imageURL}
                      active={active}
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
                  <AvatarIcon
                    imageURL={message.sender.imageURL}
                    read={arr[index + 1]?.read ? false : message.read}
                    height={messagesRef.current[index]?.clientHeight}
                  />
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
