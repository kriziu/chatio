import { Dispatch, FC, SetStateAction, useContext } from 'react';

import axios from 'axios';

import { userContext } from 'common/context/userContext';
import { chatContext } from 'modules/chat/context/chatContext';
import { errToast } from 'common/lib/toasts';

import Portal from 'common/components/Portal';
import { Container } from '../styles//MessageMenu.elements';

interface Props {
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
  setHover: Dispatch<SetStateAction<boolean>>;
}

const MessageMenu: FC<Props> = ({ selected, setSelected, setHover }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { messagesRef, messages } = useContext(chatContext);

  const viewportOffset =
    messagesRef.current[selected] &&
    messagesRef.current[selected].getBoundingClientRect();
  const top = viewportOffset ? viewportOffset.top : 0;

  const selectedMessage = messages[selected];

  return (
    <Portal>
      <Container
        width={
          messagesRef.current[selected]
            ? messagesRef.current[selected].offsetWidth
            : 0
        }
        mine={!selectedMessage ? false : selectedMessage.sender._id === _id}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setSelected(-1);
        }}
        onClick={() =>
          setTimeout(() => {
            setHover(false);
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
      </Container>
    </Portal>
  );
};

export default MessageMenu;
