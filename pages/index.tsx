import type { NextPage } from 'next';

import axios from 'axios';
import { useRouter } from 'next/router';

import { Button } from '../components/Buttons/Button';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div>
      You are logged in!{' '}
      <Button
        onClick={() =>
          axios.post('/api/auth/logout').then(res => router.push('/login'))
        }
      >
        Log out
      </Button>
    </div>
  );
};

export default Home;
