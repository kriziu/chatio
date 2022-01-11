import { Dispatch, FC, SetStateAction, useContext } from 'react';

import axios from 'axios';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';
import { errToast } from 'lib/toasts';

import Portal from 'components/Portal';
import { PinContainer } from './MessageList.elements';

interface Props {
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
  hover: boolean;
}

const MessageMenu: FC<Props> = ({ selected, setSelected, hover }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { messagesRef, messages } = useContext(chatContext);

  if (selected === -1) return <></>;

  const viewportOffset =
    messagesRef.current[selected] &&
    messagesRef.current[selected].getBoundingClientRect();
  const top = viewportOffset ? viewportOffset.top : 0;

  const selectedMessage = messages[selected];

  return (
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
          {selectedMessage.pin ? 'Unpin' : 'Pin'}
        </p>
        <p
          onClick={() => navigator.clipboard.writeText(selectedMessage.message)}
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
  );
};

export default MessageMenu;
