import type { NextPage } from 'next';
import { useState } from 'react';

import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { AiOutlineUserAdd } from 'react-icons/ai';

import useForm from 'common/hooks/useForm';
import { validateEmail } from 'common/lib/validators';
import { successToast } from 'common/lib/toasts';

import { Header1, Header2, Header3 } from 'common/components/Headers';
import { Input } from 'common/components/Input';
import { Flex } from 'common/components/Flex';
import { Button } from 'common/components/Button';
import { Form } from 'common/components/Form';
import { AvatarSmall } from 'common/components/Avatars';

const Find: NextPage = () => {
  const [formData, , toggleChecked, handleInputChange] = useForm(
    {
      emailInput: { value: '', required: false },
      name: { value: '', required: false },
    },
    true
  );
  const { emailInput, name } = formData;

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);

  const searchUsers = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailInput.value && !name.value) {
      return;
    }
    if (emailInput.value && !validateEmail(emailInput.value)) {
      toggleChecked('emailInput');
      return;
    }

    setLoading(true);
    axios
      .get<UserType[]>('/api/user/search', {
        params: {
          name: name.value,
          email: emailInput.value,
        },
      })
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      });
  };

  const createInvite = (to: string) => {
    axios.post('/api/invite', { to }).then(() => {
      successToast('Invite sent!');
      setUsers(prev => prev.filter(pre => pre._id !== to));
    });
  };

  return (
    <>
      <Header1 style={{ padding: '6rem 1rem 1rem 1rem' }}>
        Search for friend
      </Header1>

      <Form
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onSubmit={searchUsers}
        noValidate
      >
        <Input
          placeholder="Email"
          value={emailInput.value}
          onChange={handleInputChange}
          name="emailInput"
          warn={emailInput.checked}
          type="email"
        />
        <Header2>or</Header2>
        <Input
          placeholder="Name"
          value={name.value}
          onChange={handleInputChange}
          name="name"
          warn={name.checked}
        />
        <Button inputSize type="submit">
          Search
        </Button>
      </Form>
      <Flex style={{ height: '40%', display: loading ? 'flex' : 'none' }}>
        <ClipLoader color="white" size={100} />
      </Flex>

      <Flex style={{ flexDirection: 'column', marginTop: '4rem' }} as="ul">
        {users.length && !loading
          ? users.map((user, index) => {
              return (
                <Flex
                  as="li"
                  key={user._id}
                  style={{
                    width: '31rem',
                    justifyContent: 'space-between',
                    marginBottom: index === users.length - 1 ? '0' : '2rem',
                  }}
                >
                  <AvatarSmall imageURL={user.imageURL} />
                  <Header3 style={{ maxWidth: '20rem' }}>
                    {user.fName} {user.lName}
                  </Header3>
                  <Button
                    style={{ width: 'max-content' }}
                    aria-label="Add friend"
                    icon
                    onClick={() => createInvite(user._id)}
                  >
                    <AiOutlineUserAdd />
                  </Button>
                </Flex>
              );
            })
          : ''}
      </Flex>
    </>
  );
};

export default Find;
