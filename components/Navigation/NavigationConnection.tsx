import React, {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';

import { useRouter } from 'next/router';
import axios from 'axios';
import useSWR from 'swr';
import styled from '@emotion/styled';
import { PresenceChannel } from 'pusher-js';

import { connectionsContext } from 'context/connectionsContext';
import { userContext } from 'context/userContext';
import { focusClick } from 'lib/utility';
import { getUserFromIds } from 'lib/ids';

import { Flex } from 'components/Simple/Flex';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Header4, Header5 } from 'components/Simple/Headers';
import { isReadByMe } from 'lib/isReadByMe';

const StyledHeader = styled(Header5)`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 20rem;
`;

interface Props {
  connection: CConnectionType;
  setOpened: React.Dispatch<SetStateAction<boolean>>;
  setNotRead: Dispatch<SetStateAction<{ [x: string]: boolean }[]>>;
}

let tempMsg: MessageType;

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const NavigationConnection: FC<Props> = ({
  connection,
  setOpened,
  setNotRead,
}) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { channels } = useContext(connectionsContext);

  const router = useRouter();

  const [message, setMessage] = useState<MessageType[]>();
  const [active, setActive] = useState(false);
  const [channel, setChannel] = useState<PresenceChannel>();

  const { data, error } = useSWR<MessageType[]>(
    connection._id ? `/api/message/${connection._id}?latest=true` : null,
    fetcher
  );
  const user = getUserFromIds(connection, _id);

  useEffect(() => {
    channels.forEach(channel1 => {
      if (channel1.name.slice(9) === connection._id) setChannel(channel1);
    });
  }, [connection, channels]);

  useEffect(() => {
    if (channel) {
      if (channel.members.count >= 2) setActive(true);

      const msgClb = (data: MessageType) => {
        setMessage([data]);
        tempMsg = data;
      };
      channel.bind('new_msg', msgClb);
      channel.bind('read_msg', msgClb);

      const delMsgClb = (id: string) => {
        if (message && id === tempMsg._id)
          setMessage(prev =>
            prev ? [{ ...prev[0], message: '', deleted: true }] : prev
          );
      };
      channel.bind('delete_msg', delMsgClb);

      const membAddClb = () => {
        setActive(true);
      };
      channel.bind('pusher:member_added', membAddClb);

      const membRmvClb = () => {
        if (channel.members.count < 2) setActive(false);
      };
      channel.bind('pusher:member_removed', membRmvClb);

      return () => {
        channel.unbind('new_msg', msgClb);
        channel.unbind('read_msg', msgClb);
        channel.unbind('delete_msg', delMsgClb);
        channel.unbind('pusher:member_added', membAddClb);
        channel.unbind('pusher:member_removed', membRmvClb);
      };
    }
  }, [channel, channel?.members.count, message]);

  useEffect(() => {
    if (data) {
      setMessage(data);
      tempMsg = data[0];
    }
  }, [data]);

  useEffect(() => {
    if (!message) return;

    const listOfIdsRead = message[0]?.read.map(msg => msg._id);

    if (
      message[0] &&
      message[0]?.sender._id !== _id &&
      !listOfIdsRead.includes(_id)
    )
      setNotRead(prev =>
        prev.map(conn =>
          conn[connection._id] === undefined ? conn : { [connection._id]: true }
        )
      );
    else
      setNotRead(prev =>
        prev.map(conn =>
          conn[connection._id] === undefined
            ? conn
            : { [connection._id]: false }
        )
      );
  }, [message, _id, connection._id, setNotRead]);

  return (
    <li key={user?._id} style={{ width: '100%' }}>
      <Link href={`/chat/${connection._id}`} passHref>
        <Flex
          as="a"
          style={{ marginTop: '2rem', justifyContent: 'flex-start' }}
          onClick={() => {
            setOpened(false);
          }}
          onKeyDown={e =>
            focusClick(e, () => {
              setOpened(false);
              router.push(`/chat/${connection._id}`);
            })
          }
          tabIndex={0}
        >
          <AvatarSmall
            active={active}
            imageURL={connection.imageURL ? connection.imageURL : user.imageURL}
          />
          <Flex
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginLeft: '1rem',
              cursor: 'pointer',
            }}
          >
            <Header4>
              {connection.name
                ? connection.name
                : user.fName + ' ' + user.lName}
            </Header4>
            <StyledHeader
              style={
                message
                  ? message[0]?.sender._id !== _id
                    ? !isReadByMe(message[0], _id)
                      ? { color: 'white', fontWeight: 500 }
                      : {}
                    : {}
                  : {}
              }
            >
              {message && message[0]?.deleted ? (
                'Deleted'
              ) : (
                <>
                  {message && message[0]?.sender._id === _id
                    ? `You${message[0]?.administrate ? '' : ':'} `
                    : connection.group
                    ? message &&
                      message[0]?.sender.fName +
                        `${message[0]?.administrate ? '' : ':'} `
                    : ''}{' '}
                  {message && message[0]?.message}
                </>
              )}
            </StyledHeader>
          </Flex>
        </Flex>
      </Link>
    </li>
  );
};

export default NavigationConnection;
