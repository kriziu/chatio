import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div>
      <button
        onClick={() => {
          document.cookie = 'jwt="123"';
        }}
      >
        Sign in
      </button>
    </div>
  );
};

export default Home;
