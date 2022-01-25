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

import useSpinner from 'hooks/useSpinner';
import useAdminGroup from 'hooks/useAdminGroup';
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
  setGroupUsers?: Dispatch<SetStateAction<UserType[]>>;
  instantDelete?: boolean;
}

const UserModal: FC<Props> = ({
  user,
  setUser,
  setGroupUsers,
  instantDelete,
}) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { data } = useContext(chatContext);

  const [isFriend, setIsFriend] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [notInGroup, setNotInGroup] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const friends = useSWR<CConnectionType[]>(`/api/connection`, fetcher, {
    refreshInterval: 30000,
  });
  const { mutate } = useSWRConfig();

  const isAdmin = useAdminGroup();
  const [RenderSpinner, setLoading] = useSpinner();

  useEffect(() => {
    let found = false,
      isUsAd = false,
      isInGr = false,
      canBeDeleted = false;

    user &&
      friends.data?.forEach(connection => {
        if (connection.group) return;

        const friend = getUserFromIds(connection, _id);

        if (friend._id === user._id) found = true;
      });

    data.admins?.forEach(admin => {
      if (admin._id === user?._id) isUsAd = true;
    });

    const tempData = data.users?.map(user => user._id);
    if (user && !tempData.includes(user._id)) {
      canBeDeleted = true;
      if (instantDelete) isInGr = true;
    }
    setCanDelete(canBeDeleted);
    setIsFriend(found);
    setNotInGroup(isInGr);
    setIsUserAdmin(isUsAd);
  }, [friends, data]);

  const handleDelete = () => {
    setGroupUsers &&
      setGroupUsers(prev => prev.filter(pre => pre._id !== user?._id));
    if (instantDelete) {
      setLoading(true);
      axios
        .patch('/api/group/edit', {
          idsToAdd: [],
          idsToRemove: [user?._id],
          name: '',
          connectionId: data._id,
        })
        .then(() => {
          mutate(`/api/connection?id=${data._id}`);
          setLoading(false);
        });
    }
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
      <RenderSpinner />
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
            {notInGroup ? (
              <Header5 style={{ marginTop: '2rem' }}>Not in group</Header5>
            ) : (
              <>
                {!isAdmin ? (
                  ''
                ) : (
                  <Header4 as="button" onClick={handleMakeAdmin}>
                    {isUserAdmin ? 'Remove admin' : 'Make group admin'}
                  </Header4>
                )}

                {!isAdmin && !canDelete ? (
                  ''
                ) : (
                  <Header4
                    as="button"
                    style={{ color: 'var(--color-red)' }}
                    onClick={handleDelete}
                  >
                    Delete from group
                  </Header4>
                )}
              </>
            )}
          </Options>
        </Container>
      </Background>
    </Portal>
  );
};

export default UserModal;
