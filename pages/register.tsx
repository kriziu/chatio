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

const Register: NextPage = () => {
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

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
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
        if (res.status === 201) router.push('/');
      })
      .catch(() => {
        errToast('Account with that email already exists!');
      });
  };

  return (
    <PageContainer>
      <Header1>Register</Header1>
      <Form onSubmit={handleRegister} noValidate>
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
      <Flex>
        <Link href="/login">
          <a>Login</a>
        </Link>
      </Flex>
    </PageContainer>
  );
};

export default Register;
