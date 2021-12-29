import React, {
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';

import { useRouter } from 'next/router';
import { focusClick } from 'lib/utility';
import { userContext } from 'context/userContext';
import { getUserFromIds } from 'lib/ids';
import axios from 'axios';
import useSWR from 'swr';
import styled from '@emotion/styled';

import { connectionsContext } from 'context/connectionsContext';
import { Flex } from 'components/Simple/Flex';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Header4, Header5 } from 'components/Simple/Headers';

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

  const { data, error } = useSWR<MessageType[]>(
    connection._id ? `/api/message/${connection._id}?latest=true` : null,
    fetcher
  );
  const user = getUserFromIds(connection, _id);

  useEffect(() => {
    channels.forEach(channel => {
      if (channel.name.slice(8) === connection._id) {
        channel.bind('new_msg', (data: MessageType) => {
          setMessage([data]);
        });

        channel.bind('read_msg', (data: MessageType) => {
          setMessage([data]);
        });
      }
    });

    return () => {
      channels.forEach(channel => {
        if (channel.name.slice(8) === connection._id) {
          channel.unbind('new_msg');
          channel.unbind('read_msg');
        }
      });
    };
  }, [connection, channels]);

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
          <AvatarSmall />
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
