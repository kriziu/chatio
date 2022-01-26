import { FC, useContext } from 'react';

import axios from 'axios';
import useSWR from 'swr';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';

import { List, Message, MessageContainer } from './MessageList.elements';
import { Header2, Header5 } from 'components/Simple/Headers';
import Spinner from 'components/Spinner';

interface Props {
  handlePinnedMessageClick: (messageId: string) => void;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const PinnedMessageList: FC<Props> = ({ handlePinnedMessageClick }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { connectionId } = useContext(chatContext);

  const { data, error } = useSWR<MessageType[]>(
    connectionId ? `/api/message/${connectionId}?pinned=true` : null,
    fetcher
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <Spinner />;

  return (
    <>
      <Header2 style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        Pinned messages
      </Header2>
      {!data.length && <Header5>No pinned messagess...</Header5>}
      <List style={{ height: '20rem' }}>
        {data.map(message => {
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
