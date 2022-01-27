import { FC, useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { MdOutlineClose } from 'react-icons/md';

import useForm from 'hooks/useForm';
import useWindowSize from 'hooks/useWindowSize';
import useAdminGroup from 'hooks/useAdminGroup';
import useSpinner from 'hooks/useSpinner';
import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';

import FriendList from 'components/Group/FriendList/FriendList';
import { Header3 } from 'components/Simple/Headers';
import { Input } from 'components/Simple/Input';
import CheckedFriends from 'components/Group/CheckedFriends/CheckedFriends';
import { Flex } from 'components/Simple/Flex';
import { Button } from 'components/Simple/Button';
import UserModal from '../UserModal/UserModal';
import AvatarPicker from 'components/Profile/AvatarPicker/AvatarPicker';
import { Edit, Managment } from './GroupManagment.elements';

const GroupManagment: FC<{
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ opened, setOpened }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { data } = useContext(chatContext);

  const [, windowHeight] = useWindowSize();

  const [formData, , , handleInputChange] = useForm({
    name: { value: '', required: false },
  });
  const { name } = formData;

  const [image, setImage] = useState<File>();
  const [activeUser, setActiveUser] = useState<UserType>();
  const [groupUsers, setGroupUsers] = useState<UserType[]>([]);

  const [RenderSpinner, setLoading] = useSpinner();
  const isAdmin = useAdminGroup();

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
      <Managment w="100vw" h={windowHeight + 'px'} opened={opened}>
        <Flex className="close">
          <Button onClick={() => setOpened(false)} icon>
            <MdOutlineClose />
          </Button>
        </Flex>
        {!isAdmin ? (
          ''
        ) : (
          <Edit>
            <label htmlFor="name">
              <Header3>Edit group name</Header3>
            </label>
            <Input
              placeholder="Empty to no changes"
              id="name"
              name="name"
              value={name.value}
              onChange={handleInputChange}
            />
            <AvatarPicker group setImageUp={setImage} />
          </Edit>
        )}

        <Header3>List of users in group</Header3>
        <CheckedFriends
          checkedFriends={groupUsers}
          onClick={handleFriendClick}
        />
        <Header3>Add users to group</Header3>
        <FriendList
          checkedFriends={groupUsers}
          setCheckedFriends={setGroupUsers}
        />
        <Flex className="save">
          <Button inputSize onClick={handleGroupSave}>
            {isAdmin ? 'Save' : 'Add friends'}
          </Button>
        </Flex>
      </Managment>
    </>
  );
};

export default GroupManagment;
