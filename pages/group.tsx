import type { NextPage } from 'next';
import { FormEvent, useContext, useState } from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';

import { userContext } from 'context/userContext';
import useForm from 'hooks/useForm';

import { Header1, Header3 } from 'components/Simple/Headers';
import { Input } from 'components/Simple/Input';
import { Button } from 'components/Simple/Button';
import { Form } from 'components/Simple/Form';
import FriendList from 'components/Group/FriendList/FriendList';
import CheckedFriends from 'components/Group/CheckedFriends/CheckedFriends';

const Group: NextPage = () => {
  const {
    user: { _id },
  } = useContext(userContext);

  const router = useRouter();

  const [formData, , , handleInputChange] = useForm({
    name: { value: '', required: true },
  });
  const { name } = formData;

  const [checkedFriends, setCheckedFriends] = useState<UserType[]>([]);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const ids = checkedFriends.map(friend => friend._id);

    ids.push(_id);

    axios
      .post<CConnectionType>('/api/group/create', {
        ids,
        name: name.value,
      })
      .then(res => {
        router.push(`/chat/${res.data._id}`);
      });
  };

  const handleFriendClick = (_id: string) => {
    setCheckedFriends(prev => prev.filter(pre => pre._id !== _id));
  };

  return (
    <>
      <Header1 style={{ padding: '6rem 1rem 1rem 1rem' }}>Group</Header1>

      <Form
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onSubmit={handleFormSubmit}
        noValidate
      >
        <Input
          placeholder="Group name"
          value={name.value}
          onChange={handleInputChange}
          name="name"
          warn={name.checked}
        />
        <Button inputSize type="submit">
          Create group
        </Button>
      </Form>
      <Header3 style={{ marginTop: '2rem' }}>List of friends in group</Header3>
      <CheckedFriends
        checkedFriends={checkedFriends}
        onClick={handleFriendClick}
      />

      <Header3 style={{ marginTop: '2rem' }}>Add friends to group</Header3>
      <FriendList
        setCheckedFriends={setCheckedFriends}
        checkedFriends={checkedFriends}
      />
    </>
  );
};

export default Group;
