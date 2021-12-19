import type { NextPage } from 'next';
import { BsTelephoneFill } from 'react-icons/bs';

import { Header4 } from 'components/Simple/Headers';
import ChatContainer from 'components/Chat/ChatContainer';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';

const Home: NextPage = () => {
  return (
    <>
      <Flex
        style={{
          width: '100%',
          justifyContent: 'space-between',
          padding: '0 3rem',
        }}
      >
        <Flex style={{ marginLeft: '4rem' }}>
          <AvatarSmall active />
          <Header4
            style={{
              width: 'min-content',
              textAlign: 'left',
              marginLeft: '1rem',
            }}
          >
            Bruno Dzięcielski
          </Header4>
        </Flex>
        <div>
          <BsTelephoneFill />
        </div>
      </Flex>

      <ChatContainer />
    </>
  );
};

export default Home;
