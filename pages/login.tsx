import type { NextPage } from 'next';

import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

import useForm from 'common/hooks/useForm';
import { validateEmail } from 'common/lib/validators';
import { errToast } from 'common/lib/toasts';

import { Input } from 'common/components/Input';
import { Header1 } from 'common/components/Headers';
import { Button } from 'common/components/Button';
import { Flex } from 'common/components/Flex';
import { Form } from 'common/components/Form';
import { PageContainer } from 'modules/_pages/login.elements';

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
        if (res.status === 200) router.push('/');
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
    <PageContainer>
      <Header1>Sign in</Header1>
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
      <Flex className="both">
        <Link href="/login">
          <a className="gray">Lost password</a>
        </Link>
        <Link href="/register">
          <a>Register</a>
        </Link>
      </Flex>
    </PageContainer>
  );
};

export default Login;
