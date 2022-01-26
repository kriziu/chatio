import { FC, useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { useSWRConfig } from 'swr';
import { MdOutlineClose } from 'react-icons/md';

import useForm from 'hooks/useForm';
import useAdminGroup from 'hooks/useAdminGroup';
import useSpinner from 'hooks/useSpinner';
import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';

import { Settings } from '../Chat/ChatSettings';
import FriendList from 'components/Group/FriendList';
import { Header3 } from 'components/Simple/Headers';
import { Input } from 'components/Simple/Input';
import CheckedFriends from 'components/Group/CheckedFriends';
import { Flex } from 'components/Simple/Flex';
import { Button } from 'components/Simple/Button';
import UserModal from './UserModal';
import AvatarPicker from 'components/Profile/AvatarPicker';

const GroupManagment: FC<{
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ opened, setOpened }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { data } = useContext(chatContext);

  const [formData, , , handleInputChange] = useForm({
    name: { value: '', required: false },
  });
  const { name } = formData;

  const [image, setImage] = useState<File>();
  const [activeUser, setActiveUser] = useState<UserType>();
  const [groupUsers, setGroupUsers] = useState<UserType[]>([]);

  const [RenderSpinner, setLoading] = useSpinner();
  const isAdmin = useAdminGroup();

  const { mutate } = useSWRConfig();

  useEffect(() => {
    setGroupUsers(data.users.filter(user => user._id !== _id));
  }, [_id, data]);

  const handleFriendClick = (_id: string) => {
    const userIndex = groupUsers.findIndex(user => user._id === _id);

    if (userIndex === -1) return;

    setActiveUser(groupUsers[userIndex]);
  };

  const handleGroupSave = () => {
    const dataUsers = data.users.map(user => user._id);
    const fromGroupUsers = groupUsers.map(user => user._id);

    const idsToAdd = groupUsers
      .filter(user => !dataUsers.includes(user._id))
      .map(user => user._id);

    const idsToRemove = data.users
      .filter(user => !fromGroupUsers.includes(user._id))
      .filter(user => !idsToAdd.includes(user._id))
      .filter(user => user._id !== _id)
      .map(user => user._id);

    if (!idsToRemove.length && !idsToAdd.length && !name.value && !image)
      return;

    setLoading(true);
    axios
      .patch('/api/group/edit', {
        idsToAdd,
        idsToRemove,
        name: name.value,
        connectionId: data._id,
      })
      .then(() => {
        if (image) {
          const body = new FormData();
          body.append('image', image);

          axios
            .post(`/api/group/image?connectionId=${data._id}`, body)
            .then(() => {
              setOpened(false);
              setLoading(false);
              setImage(undefined);
            });
        } else {
          setOpened(false);
          setLoading(false);
        }
      });
  };

  return (
    <>
      <RenderSpinner />
      <UserModal
        user={activeUser}
        setUser={setActiveUser}
        setGroupUsers={setGroupUsers}
      />
      <Settings
        w="100vw"
        h="100vh"
        opened={opened}
        style={{ zIndex: 999, padding: '4rem 0' }}
      >
        <Flex
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
          }}
        >
          <Button onClick={() => setOpened(false)} icon>
            <MdOutlineClose />
          </Button>
        </Flex>
        {!isAdmin ? (
          ''
        ) : (
          <Flex style={{ flexDirection: 'column' }}>
            <label htmlFor="name">
              <Header3 style={{ marginBottom: '2rem' }}>
                Edit group name
              </Header3>
            </label>
            <Input
              placeholder="Empty to no changes"
              id="name"
              name="name"
              value={name.value}
              onChange={handleInputChange}
            />
            <AvatarPicker group setImageUp={setImage} />
          </Flex>
        )}

        <Header3 style={{ marginTop: '2rem' }}>List of users in group</Header3>
        <CheckedFriends
          checkedFriends={groupUsers}
          onClick={handleFriendClick}
        />
        <Header3 style={{ marginTop: '2rem' }}>Add users to group</Header3>
        <FriendList
          checkedFriends={groupUsers}
          setCheckedFriends={setGroupUsers}
        />
        <Flex
          style={{
            position: 'fixed',
            bottom: '2rem',
            marginLeft: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Button inputSize onClick={handleGroupSave}>
            {isAdmin ? 'Save' : 'Add friends'}
          </Button>
        </Flex>
      </Settings>
    </>
  );
};

export default GroupManagment;
