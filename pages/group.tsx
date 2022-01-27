import type { NextPage } from 'next';
import { FormEvent, useContext, useState } from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';

import { userContext } from 'common/context/userContext';
import useForm from 'common/hooks/useForm';

import { Header1, Header3 } from 'common/components/Headers';
import { Input } from 'common/components/Input';
import { Button } from 'common/components/Button';
import { Form } from 'common/components/Form';
import FriendList from 'modules/group/components/FriendList';
import CheckedFriends from 'modules/group/components/CheckedFriends';

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
