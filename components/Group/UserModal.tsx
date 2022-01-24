import {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import useSWR, { useSWRConfig } from 'swr';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';
import { getUserFromIds } from 'lib/ids';
import { errToast, successToast } from 'lib/toasts';

import Portal from 'components/Portal';
import { Avatar } from 'components/Simple/Avatars';
import { Background } from 'components/Simple/Background';
import { Flex } from 'components/Simple/Flex';
import { Header3, Header4, Header5 } from 'components/Simple/Headers';
import { Container, Options } from './UserModal.elements';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

interface Props {
  user: UserType | undefined;
  setUser: Dispatch<SetStateAction<UserType | undefined>>;
  setGroupUsers: Dispatch<SetStateAction<UserType[]>>;
}

const UserModal: FC<Props> = ({ user, setUser, setGroupUsers }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { data } = useContext(chatContext);

  const [isFriend, setIsFriend] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  const friends = useSWR<CConnectionType[]>(`/api/connection`, fetcher, {
    refreshInterval: 30000,
  });
  const { mutate } = useSWRConfig();

  useEffect(() => {
    let found = false,
      isUsAd = false,
      isAdmin = false;

    user &&
      friends.data?.forEach(connection => {
        if (connection.group) return;

        const friend = getUserFromIds(connection, _id);

        if (friend._id === user._id) found = true;
      });

    data.admins?.forEach(admin => {
      if (admin._id === _id) isAdmin = true;
      if (admin._id === user?._id) isUsAd = true;
    });

    setIsFriend(found);
    setIsUserAdmin(isUsAd);
    setIsAdmin(isAdmin);
  }, [friends, data]);

  const handleDelete = () => {
    setGroupUsers(prev => prev.filter(pre => pre._id !== user?._id));
    setUser(undefined);
  };

  const handleAddToFriends = () => {
    axios
      .post('/api/invite', { to: user?._id })
      .then(() => successToast('Invite sent!'));
  };

  const handleMakeAdmin = () => {
    axios
      .post('/api/group/admin', {
        connectionId: data._id,
        adminId: user?._id,
      })
      .then(() => {
        mutate(`/api/connection?id=${data._id}`);
      })
      .catch(() => errToast('You are not admin in this group!'));
  };

  return (
    <Portal>
      <Background
        w="100vw"
        h="100vh"
        style={{
          zIndex: 1000,
          opacity: user ? 1 : 0,
          pointerEvents: user ? 'all' : 'none',
        }}
        onClick={() => setUser(undefined)}
      >
        <Container onClick={e => e.stopPropagation()}>
          <Flex>
            <Avatar imageURL={!user ? '-1' : user.imageURL} />
          </Flex>
          <Header3>{!user ? '' : user.fName + ' ' + user.lName}</Header3>
          <Options>
            {isFriend ? (
              <Header5>Already your friend</Header5>
            ) : (
              <Header4 as="button" onClick={handleAddToFriends}>
                Add to friends
              </Header4>
            )}
            {!isAdmin ? (
              ''
            ) : (
              <Header4 as="button" onClick={handleMakeAdmin}>
                {isUserAdmin ? 'Remove admin' : 'Make group admin'}
              </Header4>
            )}

            <Header4
              as="button"
              style={{ color: 'var(--color-red)' }}
              onClick={handleDelete}
            >
              Delete from group
            </Header4>
          </Options>
        </Container>
      </Background>
    </Portal>
  );
};

export default UserModal;
