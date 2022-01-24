import { FC, useContext, useEffect, useState } from 'react';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';

import { Settings } from '../Chat/ChatSettings';
import FriendList from 'components/Group/FriendList';
import { Form } from 'components/Simple/Form';
import { Header3 } from 'components/Simple/Headers';
import { Input } from 'components/Simple/Input';
import CheckedFriends from 'components/Group/CheckedFriends';
import { Flex } from 'components/Simple/Flex';
import { Button } from 'components/Simple/Button';
import { MdOutlineClose } from 'react-icons/md';
import UserModal from './UserModal';

const GroupManagment: FC<{
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ opened, setOpened }) => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { data } = useContext(chatContext);

  const [activeUser, setActiveUser] = useState<UserType>();
  const [groupUsers, setGroupUsers] = useState<UserType[]>([]);

  useEffect(() => {
    setGroupUsers(data.users.filter(user => user._id !== _id));
  }, [data]);

  const handleFriendClick = (_id: string) => {
    const userIndex = groupUsers.findIndex(user => user._id === _id);

    if (userIndex === -1) return;

    setActiveUser(groupUsers[userIndex]);
  };

  return (
    <>
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
        <Form>
          <label htmlFor="name">
            <Header3>Edit group name</Header3>
          </label>
          <Input placeholder="Empty to no changes" id="name" />
        </Form>
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
          <Button inputSize onClick={() => {}}>
            Save
          </Button>
        </Flex>
      </Settings>
    </>
  );
};

export default GroupManagment;
