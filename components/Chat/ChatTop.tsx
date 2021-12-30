import { Dispatch, FC, SetStateAction } from 'react';

import { BsTelephoneFill } from 'react-icons/bs';

import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { Header4 } from 'components/Simple/Headers';

interface Props {
  setOpened: Dispatch<SetStateAction<boolean>>;
  secondUser: UserType;
  handlersToOpen: any;
  active: boolean;
}

const ChatTop: FC<Props> = ({
  setOpened,
  secondUser,
  handlersToOpen,
  active,
}) => {
  return (
    <Flex
      style={{
        width: '100%',
        justifyContent: 'space-between',
        padding: '0 3rem',
      }}
      onClick={() => setOpened(true)}
      {...handlersToOpen}
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
  );
};

export default ChatTop;
