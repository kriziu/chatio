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
import { PresenceChannel } from 'pusher-js';

import { connectionsContext } from 'common/context/connectionsContext';
import { userContext } from 'common/context/userContext';
import { focusClick } from 'common/lib/utility';
import { getUserFromIds } from 'common/lib/ids';

import { Flex } from 'common/components/Flex';
import { AvatarSmall } from 'common/components/Avatars';
import { Header4 } from 'common/components/Headers';
import { isReadByMe } from 'common/lib/isReadByMe';
import {
  Container,
  StyledHeader,
} from '../styles/NavigationConnection.elements';

interface Props {
  connection: CConnectionType;
  setOpened: React.Dispatch<SetStateAction<boolean>>;
  setNotRead: Dispatch<SetStateAction<{ [x: string]: boolean }[]>>;
  setSorted: Dispatch<SetStateAction<Map<string, number>>>;
}

let tempMsg: MessageType;

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const NavigationConnection: FC<Props> = ({
  connection,
  setOpened,
  setNotRead,
  setSorted,
}) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { channels } = useContext(connectionsContext);

  const router = useRouter();

  const [msg, setMsg] = useState('');
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState<MessageType[]>();
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

      const msgClb = (msg: MessageType) => {
        setMessage([msg]);
        setSorted(prev => {
          prev.set(connection._id, new Date(msg.date).getTime());

          return prev;
        });
        tempMsg = msg;
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
  }, [channel, channel?.members.count, connection._id, message, setSorted]);

  useEffect(() => {
    console.log('change');
    if (data) {
      setSorted(prev => {
        prev.set(connection._id, new Date(data[0]?.date).getTime());

        return prev;
      });
      setMessage(data);
      tempMsg = data[0];
    }
  }, [connection._id, data, setSorted]);

  useEffect(() => {
    if (!message) return;

    if (message && message[0]?.sender._id === _id) {
      setMsg(`You${message[0]?.administrate ? '' : ':'} ${message[0].message}`);
    } else if (message) {
      setMsg(
        message[0]?.sender.fName +
          `${message[0]?.administrate ? '' : ':'} ${message[0].message}`
      );
    }

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
    <Container key={user?._id}>
      <Link href={`/chat/${connection._id}`} passHref>
        <Flex
          className="con"
          as="a"
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
          <Flex>
            <Header4>
              {connection.name
                ? connection.name
                : user.fName + ' ' + user.lName}
            </Header4>
            <StyledHeader read={!message ? false : isReadByMe(message[0], _id)}>
              {message && message[0]?.deleted ? 'Deleted' : msg}
            </StyledHeader>
          </Flex>
        </Flex>
      </Link>
    </Container>
  );
};

export default NavigationConnection;
