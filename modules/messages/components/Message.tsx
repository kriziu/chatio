import { Dispatch, FC, SetStateAction, useContext, useEffect } from 'react';

import { chatContext } from 'modules/chat/context/chatContext';
import { userContext } from 'common/context/userContext';

import { AvatarVerySmall } from 'common/components/Avatars';
import { Header5 } from 'common/components/Headers';
import { MessageContainer, MessageP } from '../styles/Message.elements';
import { getMessageHelpers } from '../helpers/Message.helpers';

interface Props {
  additionalMargin?: boolean;
  hover: boolean;
  touched: boolean;
  selected: number;
  index: number;
  message: MessageType;
  array: MessageType[];
  setSelectedUser: Dispatch<SetStateAction<UserType | undefined>>;
  setTouched: Dispatch<SetStateAction<boolean>>;
  setSelected: Dispatch<SetStateAction<number>>;
}

let timeout: NodeJS.Timeout;
let tempHover = false;

const Message: FC<Props> = ({
  additionalMargin,
  message,
  index,
  array,
  setSelected,
  setSelectedUser,
  setTouched,
  touched,
  selected,
  hover,
}) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { messagesRef, channel } = useContext(chatContext);

  const [time, mine, margin, marginMessage, bottom, both, showAvatar] =
    getMessageHelpers(_id, message, array, index);

  const active = Object.keys(!channel ? {} : channel.members.members).includes(
    message.sender._id
  );

  useEffect(() => {
    tempHover = hover;
  }, [hover]);

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
      <MessageP
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
            () => !tempHover && selected === index && setSelected(-1),
            500
          ))
        }
        title={time}
        deleted={message.deleted}
      >
        {!message.deleted ? message.message : 'Deleted'}
      </MessageP>
    </MessageContainer>
  );
};

export default Message;
