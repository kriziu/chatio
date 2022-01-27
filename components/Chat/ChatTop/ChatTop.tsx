import { FC, useContext, useEffect, useState } from 'react';

import { BsTelephoneFill } from 'react-icons/bs';
import { useSwipeable } from 'react-swipeable';

import { chatContext } from 'context/chatContext';
import { getUserFromIds } from 'lib/ids';
import { userContext } from 'context/userContext';

import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { Header4 } from 'components/Simple/Headers';
import ChatSettings from '../ChatSettings/ChatSettings';
import Spinner from 'components/Spinner';
import { Top } from './ChatTop.elements';

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

  if (!secondUser && !data.group) return <Spinner />;

  return (
    <>
      <ChatSettings
        opened={opened}
        setOpened={setOpened}
        handlersToCloseSettings={handlersToCloseSettings}
        secondUser={secondUser}
      />

      <Top onClick={() => setOpened(true)} {...handlersToOpenSettings}>
        <Flex>
          <AvatarSmall
            active={active}
            imageURL={
              data.imageURL
                ? data.imageURL
                : secondUser
                ? secondUser.imageURL
                : '-1'
            }
          />
          <Header4>
            {data.name
              ? data.name
              : secondUser?.fName + ' ' + secondUser?.lName}
          </Header4>
        </Flex>
        <div>
          <BsTelephoneFill />
        </div>
      </Top>
    </>
  );
};

export default ChatTop;
