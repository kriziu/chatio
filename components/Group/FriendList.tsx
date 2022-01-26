import { Dispatch, FC, SetStateAction, useContext } from 'react';

import axios from 'axios';
import useSWR from 'swr';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';

import { userContext } from 'context/userContext';
import { getUserFromIds } from 'lib/ids';

import Spinner from 'components/Spinner';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { List } from './FriendList.elements';
import { Header4, Header5 } from 'components/Simple/Headers';
import { Button } from 'components/Simple/Button';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const FriendList: FC<{
  setCheckedFriends: Dispatch<SetStateAction<UserType[]>>;
  checkedFriends: UserType[];
}> = ({ setCheckedFriends, checkedFriends }) => {
  const {
    user: { _id },
  } = useContext(userContext);

  const { data } = useSWR<CConnectionType[]>(`/api/connection`, fetcher, {
    refreshInterval: 30000,
  });

  if (!data) return <Spinner />;

  const filteredConnection = data.filter(connection => {
    const user = getUserFromIds(connection, _id);

    let returning = true;

    checkedFriends.forEach(friend => {
      if (friend?._id === user?._id) returning = false;
    });

    return !connection.group && returning;
  });

  if (data && !filteredConnection.length)
    return (
      <Header5 style={{ marginTop: '1rem' }}>No friends at the time...</Header5>
    );

  return (
    <List>
      {filteredConnection.map(connection => {
        const user = getUserFromIds(connection, _id);

        return (
          <Flex as="li" key={user._id}>
            <AvatarSmall imageURL={user.imageURL} />
            <Header4>
              {user.fName} {user.lName}
            </Header4>
            <Button
              aria-label="Add friend to group"
              icon
              onClick={() => {
                setCheckedFriends(prev => [...prev, user]);
              }}
            >
              <AiOutlineUsergroupAdd />
            </Button>
          </Flex>
        );
      })}
    </List>
  );
};

export default FriendList;
