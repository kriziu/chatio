import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';

import axios from 'axios';

import { Header1, Header2 } from '../components/Simple/Headers';
import { userContext } from '../context/userContext';
import { Input } from 'components/Simple/Input';
import { Flex } from '../components/Simple/Flex';
import { Button } from 'components/Simple/Button';
import { Form } from 'components/Simple/Form';
import useForm from 'hooks/useForm';
import { validateEmail } from 'lib/validators';

const Home: NextPage = () => {
  const {
    user: { email },
    setUser,
  } = useContext(userContext);

  const [formData, setFormData, toggleChecked, handleInputChange] = useForm({
    emailInput: { value: '', required: false },
    name: { value: '', required: false },
  });
  const { emailInput, name } = formData;

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (emailInput.value)
      setFormData({
        ...formData,
        name: { value: '', required: false, checked: false },
      });
  }, [emailInput.value]);

  useEffect(() => {
    if (name.value)
      setFormData({
        ...formData,
        emailInput: { value: '', required: false, checked: false },
      });
  }, [name.value]);

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
      {loading && 'loading'}

      {users.length
        ? users.map(user => {
            return (
              <div key="123">
                {user.fName} {user.lName}
              </div>
            );
          })
        : ''}
    </>
  );
};

export default Home;
