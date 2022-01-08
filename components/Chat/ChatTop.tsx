import { Dispatch, FC, SetStateAction, useContext, useState } from 'react';

import { BsTelephoneFill } from 'react-icons/bs';

import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { Header4 } from 'components/Simple/Headers';
import ChatSettings from './ChatSettings';
import { chatContext } from 'context/chatContext';
import { useSwipeable } from 'react-swipeable';

const ChatTop: FC = () => {
  const { secondUser, active } = useContext(chatContext);

  const [opened, setOpened] = useState(false);

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

  return (
    <>
      <ChatSettings
        opened={opened}
        setOpened={setOpened}
        handlersToCloseSettings={handlersToCloseSettings}
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
          <AvatarSmall active={active} />
          <Header4
            style={{
              width: 'min-content',
              textAlign: 'left',
              marginLeft: '1rem',
            }}
          >
            {secondUser.fName} {secondUser.lName}
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
