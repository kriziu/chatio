import React, {
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
import { Flex } from 'components/Simple/Flex';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Header4, Header5 } from 'components/Simple/Headers';
import { focusClick } from 'lib/utility';
import { userContext } from 'context/userContext';
import { getUserFromIds } from 'lib/ids';

const StyledHeader = styled(Header5)`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 20rem;
`;

interface Props {
  connection: CConnectionType;
  setOpened: React.Dispatch<SetStateAction<boolean>>;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const NavigationConnection: FC<Props> = ({ connection, setOpened }) => {
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

      channel.bind('new_msg', (data: MessageType) => {
        setMessage([data]);
      });

      channel.bind('read_msg', (data: MessageType) => {
        setMessage([data]);
      });

      channel.bind('pusher:member_added', (member: any) => {
        setActive(true);
      });

      channel.bind('pusher:member_removed', () => {
        if (channel.members.count < 2) setActive(false);
      });

      return () => {
        channels.forEach(channel => {
          if (channel.name.slice(9) === connection._id) {
            channel.unbind('new_msg');
            channel.unbind('read_msg');
            channel.unbind('pusher:member_added');
            channel.unbind('pusher:member_removed');
          }
        });
      };
    }
  }, [channel, channel?.members.count, channels, connection._id]);

  useEffect(() => {
    data && setMessage(data);
  }, [data]);

  return (
    <li key={user._id}>
      <Link href={`/chat/${connection._id}`} passHref>
        <Flex
          as="a"
          style={{ marginTop: '2rem' }}
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
          <AvatarSmall active={active} />
          <Flex
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginLeft: '1rem',
              cursor: 'pointer',
            }}
          >
            <Header4>
              {user.fName} {user.lName}
            </Header4>
            <StyledHeader
              style={
                message
                  ? message[0]?.sender._id !== _id
                    ? !message[0]?.read
                      ? { color: 'white', fontWeight: 500 }
                      : {}
                    : {}
                  : {}
              }
            >
              {message && message[0]?.sender._id === _id ? 'You: ' : ''}{' '}
              {message && message[0]?.message}
            </StyledHeader>
          </Flex>
        </Flex>
      </Link>
    </li>
  );
};

export default NavigationConnection;
