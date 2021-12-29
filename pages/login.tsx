import type { NextPage } from 'next';
import { useEffect } from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { Input } from 'components/Simple/Input';
import { Header1 } from 'components/Simple/Headers';
import { Button } from 'components/Simple/Button';
import useForm from 'hooks/useForm';
import { validateEmail } from 'lib/validators';
import { errToast } from 'lib/toasts';
import { Flex } from 'components/Simple/Flex';
import { Form } from 'components/Simple/Form';

const Login: NextPage = () => {
  const router = useRouter();

  const [formData, , toggleChecked, handleInputChange, checkValidity] = useForm(
    {
      email: { value: '', required: true },
      password: { value: '', required: true },
    }
  );

  const { email, password } = formData;

  useEffect(() => {
    router.prefetch('/profile');
  }, [router]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkValidity()) return;
    if (!validateEmail(email.value)) {
      toggleChecked('email');
      return;
    }

    axios
      .post<UserType>('/api/auth/login', {
        email: email.value,
        password: password.value,
      })
      .then(res => {
        if (res.status === 200) {
          router.push('/profile');
        }
      })
      .catch(err => {
        if (err.response.status === 403) {
          errToast('Incorrect password!');
        }
        if (err.response.status === 404) {
          errToast('Account with that email not found!');
        }
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
      <Header1 style={{ marginBottom: '1rem' }}>Sign in</Header1>
      <Form onSubmit={handleLogin} noValidate>
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
        <Button type="submit">Login</Button>
      </Form>
      <Flex
        style={{
          width: '25rem',
          justifyContent: 'space-between',
          marginTop: '.5rem',
        }}
      >
        <Link href="/login">
          <a style={{ color: 'var(--color-gray)' }}>Lost password</a>
        </Link>
        <Link href="/register">
          <a>Register</a>
        </Link>
      </Flex>
    </Flex>
  );
};

export default Login;
