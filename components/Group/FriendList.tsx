import { Dispatch, FC, SetStateAction, useContext } from 'react';

import axios from 'axios';
import useSWR from 'swr';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';

import { userContext } from 'context/userContext';
import { getUserFromIds } from 'lib/ids';
import { CheckedFriendsType } from 'pages/group';

import Spinner from 'components/Spinner';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { List } from './FriendList.elements';
import { Header4 } from 'components/Simple/Headers';
import { Button } from 'components/Simple/Button';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const FriendList: FC<{
  setCheckedFriends: Dispatch<SetStateAction<CheckedFriendsType[]>>;
  checkedFriends: CheckedFriendsType[];
}> = ({ setCheckedFriends, checkedFriends }) => {
  const {
    user: { _id },
  } = useContext(userContext);

  const { data } = useSWR<CConnectionType[]>(`/api/connection`, fetcher, {
    refreshInterval: 30000,
  });

  if (!data) return <Spinner />;

  return (
    <List>
      {data
        .filter(connection => {
          const user = getUserFromIds(connection, _id);

          let returning = true;

          checkedFriends.forEach(friend => {
            if (friend._id === user._id) returning = false;
          });

          return !connection.group && returning;
        })
        .map(connection => {
          const user = getUserFromIds(connection, _id);
          const { imageURL } = user;

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
                  setCheckedFriends(prev => [
                    ...prev,
                    { _id: user._id, imageURL },
                  ]);
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
