import { FC, useContext } from 'react';

import axios from 'axios';
import useSWR from 'swr';

import { userContext } from 'common/context/userContext';
import { chatContext } from 'modules/chat/context/chatContext';

import { Header5 } from 'common/components/Headers';
import Spinner from 'common/components/Spinner';
import { MessageContainer, MessageP } from '../styles/Message.elements';
import { getMessageHelpers } from '../helpers/Message.helpers';
import { HeaderM, HeightList } from '../styles/PinnedMessageList.elements';

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
      <HeaderM>Pinned messages</HeaderM>
      {!data.length && <Header5>No pinned messagess...</Header5>}
      <HeightList>
        {data.map((message, index, arr) => {
          const [time, mine] = getMessageHelpers(_id, message, arr, index);

          return (
            <MessageContainer
              key={message._id}
              mine={mine}
              time={time}
              touched={true}
              onClick={() => handlePinnedMessageClick(message._id)}
              margin
            >
              <MessageP
                mine={mine}
                id={message._id}
                pinned={message.pin}
                deleted={message.deleted}
                margin
                both
              >
                {message.message}
              </MessageP>
            </MessageContainer>
          );
        })}
      </HeightList>
    </>
  );
};

export default PinnedMessageList;
