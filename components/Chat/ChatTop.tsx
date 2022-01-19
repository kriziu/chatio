import { FC, useContext, useEffect, useState } from 'react';

import { BsTelephoneFill } from 'react-icons/bs';
import { useSwipeable } from 'react-swipeable';

import { chatContext } from 'context/chatContext';
import { getUserFromIds } from 'lib/ids';
import { userContext } from 'context/userContext';

import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { Header4 } from 'components/Simple/Headers';
import ChatSettings from './ChatSettings';

import Spinner from 'components/Spinner';

const ChatTop: FC = () => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { active, data } = useContext(chatContext);

  const [opened, setOpened] = useState(false);
  const [secondUser, setSecondUser] = useState<UserType>();

  useEffect(() => {
    setSecondUser(getUserFromIds(data, _id));
  }, [data, _id]);

  const handlersToOpenSettings = useSwipeable({
    onSwipedDown() {
      setOpened(true);
    },
  });

  const handlersToCloseSettings = useSwipeable({
    onSwipedUp(e) {
      let close = true;

      (e.event as TouchEvent).composedPath().forEach(target => {
        const tr = target as HTMLElement;

        if (tr.tagName && tr.tagName.toLowerCase() === 'ul') close = false;
      });

      close && setOpened(false);
    },
  });

  if (!secondUser) return <Spinner />;

  return (
    <>
      <ChatSettings
        opened={opened}
        setOpened={setOpened}
        handlersToCloseSettings={handlersToCloseSettings}
        secondUser={secondUser}
      />

      <Flex
        style={{
          width: '100%',
          justifyContent: 'space-between',
          padding: '0 3rem',
        }}
        onClick={() => setOpened(true)}
        {...handlersToOpenSettings}
      >
        <Flex style={{ marginLeft: '4rem' }}>
          <AvatarSmall
            active={active}
            imageURL={data.imageURL ? data.imageURL : secondUser.imageURL}
          />
          <Header4
            style={{
              width: 'min-content',
              textAlign: 'left',
              marginLeft: '1rem',
            }}
          >
            {data.name ? data.name : secondUser.fName + ' ' + secondUser.lName}
          </Header4>
        </Flex>
        <div>
          <BsTelephoneFill />
        </div>
      </Flex>
    </>
  );
};

export default ChatTop;
