import { FC, useContext } from 'react';

import { userContext } from 'context/userContext';

import { List, Message, MessageContainer } from './MessageList.elements';
import { Header2 } from 'components/Simple/Headers';

interface Props {
  messages: MessageType[];
  handlePinnedMessageClick: (messageId: string) => void;
}

const PinnedMessageList: FC<Props> = ({
  messages,
  handlePinnedMessageClick,
}) => {
  const {
    user: { _id },
  } = useContext(userContext);

  return (
    <>
      <Header2 style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        Pinned messages
      </Header2>
      <List style={{ height: '20rem' }}>
        {messages.map(message => {
          const messageDate = new Date(message.date);

          const time =
            (messageDate.getHours() < 10 ? '0' : '') +
            messageDate.getHours() +
            ':' +
            (messageDate.getMinutes() < 10 ? '0' : '') +
            messageDate.getMinutes() +
            ' | ' +
            (messageDate.getDate() < 10 ? '0' : '') +
            messageDate.getDate() +
            '/' +
            (messageDate.getMonth() + 1 < 10 ? '0' : '') +
            (messageDate.getMonth() + 1);

          const mine = message.sender._id === _id;

          return (
            <MessageContainer
              key={message._id}
              mine={mine}
              time={time}
              touched={true}
              onClick={() => handlePinnedMessageClick(message._id)}
              margin
            >
              <Message
                mine={mine}
                id={message._id}
                pinned={message.pin}
                deleted={message.deleted}
                margin
                both
              >
                {message.message}
              </Message>
            </MessageContainer>
          );
        })}
      </List>
    </>
  );
};

export default PinnedMessageList;
