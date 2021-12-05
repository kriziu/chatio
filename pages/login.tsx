import type { NextPage } from 'next';

import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { Input } from '../components/Input/Input';
import { Header1 } from '../components/Headers/Headers';
import { Button } from '../components/Buttons/Button';
import useForm from '../hooks/useForm';
import { validateEmail } from '../lib/utility';
import { errToast } from '../lib/toasts';

const Login: NextPage = () => {
  const router = useRouter();

  const [formData, , toggleChecked, handleInputChange, checkValidity] = useForm(
    {
      email: { value: '', required: true },
      password: { value: '', required: true },
    }
  );

  const { email, password } = formData;

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
          router.push('/');
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
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '85vh',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Header1>Sign in</Header1>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '17rem',
          justifyContent: 'space-around',
        }}
        onSubmit={handleLogin}
        noValidate
      >
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
      </form>
      <div style={{ display: 'flex' }}>
        <Link href="/login">
          <a style={{ marginRight: '6.5rem', color: 'var(--color-gray)' }}>
            Lost password
          </a>
        </Link>
        <Link href="/register">
          <a>Register</a>
        </Link>
      </div>
    </div>
  );
};

export default Login;
