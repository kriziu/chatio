import type { NextPage } from 'next';
import { FormEvent, useContext, useState } from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';

import { userContext } from 'common/context/userContext';
import useForm from 'common/hooks/useForm';

import { Header3 } from 'common/components/Headers';
import { Input } from 'common/components/Input';
import { Button } from 'common/components/Button';
import { Form } from 'common/components/Form';
import FriendList from 'modules/group/components/FriendList';
import CheckedFriends from 'modules/group/components/CheckedFriends';
import { HeaderM, TopHeader } from 'modules/_pages/group.elements';

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
      <TopHeader>Group</TopHeader>

      <Form onSubmit={handleFormSubmit} noValidate>
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
      <HeaderM>List of friends in group</HeaderM>
      <CheckedFriends
        checkedFriends={checkedFriends}
        onClick={handleFriendClick}
      />

      <HeaderM>Add friends to group</HeaderM>
      <FriendList
        setCheckedFriends={setCheckedFriends}
        checkedFriends={checkedFriends}
      />
    </>
  );
};

export default Group;
