import type { NextPage } from 'next';

import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { Input } from '../components/Simple/Input';
import { Header1 } from '../components/Simple/Headers';
import { Button } from '../components/Simple/Button';
import useForm from '../hooks/useForm';
import { validateEmail } from '../lib/validators';
import { errToast } from '../lib/toasts';
import { Flex } from 'components/Simple/Flex';
import { Form } from 'components/Simple/Form';

const Login: NextPage = () => {
  const router = useRouter();

  const [formData, , toggleChecked, handleInputChange, checkValidity] = useForm(
    {
      fName: { value: '', required: true },
      lName: { value: '', required: true },
      email: { value: '', required: true },
      password: { value: '', required: true },
      checkPassword: { value: '', required: true },
    }
  );

  const { fName, lName, email, password, checkPassword } = formData;

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkValidity()) return;
    if (!validateEmail(email.value)) {
      toggleChecked('email');
      return;
    }
    if (password.value !== checkPassword.value) {
      toggleChecked('checkPassword');
      return;
    }

    axios
      .post('/api/auth/register', {
        fName: fName.value,
        lName: lName.value,
        email: email.value,
        password: password.value,
      })
      .then(res => {
        if (res.status === 201) {
          router.push('/chat/61a72fde651e2a979b5e7422');
        }
      })
      .catch(() => {
        errToast('Account with that email already exists!');
      });
  };

  return (
    <Flex
      style={{
        width: '100vw',
        height: '85vh',
        flexDirection: 'column',
      }}
    >
      <Header1 style={{ marginBottom: '1rem' }}>Register</Header1>
      <Form onSubmit={handleLogin} noValidate>
        <Input
          placeholder="First name"
          value={fName.value}
          onChange={handleInputChange}
          name="fName"
          type="fName"
          warn={fName.checked}
        />
        <Input
          placeholder="Last Name"
          value={lName.value}
          onChange={handleInputChange}
          name="lName"
          type="lName"
          warn={lName.checked}
        />
        <Input
          placeholder="Email"
          value={email.value}
          onChange={handleInputChange}
          name="email"
          type="email"
          warn={email.checked}
        />
        <Input
          placeholder="Password"
          value={password.value}
          onChange={handleInputChange}
          name="password"
          type="password"
          warn={password.checked}
        />
        <Input
          placeholder="Check password"
          value={checkPassword.value}
          onChange={handleInputChange}
          name="checkPassword"
          type="password"
          warn={checkPassword.checked}
        />
        <Button type="submit">Register</Button>
      </Form>
      <Flex
        style={{
          width: '25rem',
          justifyContent: 'flex-end',
          marginTop: '.5rem',
        }}
      >
        <Link href="/login">
          <a style={{ marginLeft: '20rem' }}>Login</a>
        </Link>
      </Flex>
    </Flex>
  );
};

export default Login;
