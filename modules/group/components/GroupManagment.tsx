import { FC, useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { MdOutlineClose } from 'react-icons/md';

import useForm from 'common/hooks/useForm';
import useWindowSize from 'common/hooks/useWindowSize';
import useAdminGroup from '../hooks/useAdminGroup';
import useSpinner from 'common/hooks/useSpinner';
import { userContext } from 'common/context/userContext';
import { chatContext } from 'modules/chat/context/chatContext';

import FriendList from './FriendList';
import { Header3 } from 'common/components/Headers';
import { Input } from 'common/components/Input';
import CheckedFriends from './CheckedFriends';
import { Flex } from 'common/components/Flex';
import { Button } from 'common/components/Button';
import UserModal from './UserModal';
import AvatarPicker from 'common/components/AvatarPicker/AvatarPicker';
import { Edit, Managment } from '../styles/GroupManagment.elements';

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
      <Managment w="100%" h={windowHeight + 'px'} opened={opened}>
        <Flex className="close">
          <Button
            onClick={() => setOpened(false)}
            icon
            aria-label="Close group managment"
          >
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
          <Button inputSize onClick={handleGroupSave} aria-label="Save group">
            {isAdmin ? 'Save' : 'Add friends'}
          </Button>
        </Flex>
      </Managment>
    </>
  );
};

export default GroupManagment;
