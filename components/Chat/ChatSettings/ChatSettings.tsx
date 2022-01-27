import React, {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import axios from 'axios';
import { SwipeableHandlers } from 'react-swipeable';

import useAdminGroup from 'hooks/useAdminGroup';
import { chatContext } from 'context/chatContext';
import { errToast } from 'lib/toasts';

import { Flex } from 'components/Simple/Flex';
import { AvatarSmall } from 'components/Simple/Avatars';
import { Header3 } from 'components/Simple/Headers';
import PinnedMessageList from 'components/Messages/PinnedMessageList/PinnedMessageList';
import { Button } from 'components/Simple/Button';
import GroupManagment from 'components/Group/GroupManagment/GroupManagment';
import {
  BtnContainer,
  OptionsContainer,
  Settings,
} from './ChatSettings.elements';

interface Props {
  opened: boolean;
  setOpened: Dispatch<SetStateAction<boolean>>;
  handlersToCloseSettings: SwipeableHandlers;
  secondUser?: UserType;
}

const ChatSettings: FC<Props> = ({
  opened,
  setOpened,
  secondUser,
  handlersToCloseSettings,
}) => {
  const { active, handlePinnedMessageClick, connectionId, data } =
    useContext(chatContext);

  const [managment, setManagment] = useState(false);
  const isAdmin = useAdminGroup();

  return (
    <>
      <GroupManagment opened={managment} setOpened={setManagment} />

      <Settings
        w="100vw"
        h="100vh"
        opened={opened}
        {...handlersToCloseSettings}
      >
        <Flex onClick={() => setOpened(false)}>
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
          <Header3 className="top">
            {data.name
              ? data.name
              : secondUser?.fName + ' ' + secondUser?.lName}
          </Header3>
        </Flex>
        {data.group && (
          <BtnContainer style={{ marginTop: '3rem' }}>
            <Button width="15rem" onClick={() => setManagment(true)}>
              {isAdmin ? 'Manage group' : 'Check users'}
            </Button>
          </BtnContainer>
        )}

        <PinnedMessageList
          handlePinnedMessageClick={id => {
            setOpened(false);
            handlePinnedMessageClick(id);
          }}
        />
        <OptionsContainer>
          <Header3
            onClick={() => {
              axios
                .post('/api/pusher/block?connectionId=' + connectionId)
                .catch(err => {
                  if (err.response.status === 403)
                    errToast("You can't unblock conversation!");
                });
              setOpened(false);
            }}
          >
            Block
          </Header3>
          <Header3
            onClick={() =>
              axios.delete('/api/pusher/delete?connectionId=' + connectionId)
            }
          >
            Delete
          </Header3>
        </OptionsContainer>
      </Settings>
    </>
  );
};

export default ChatSettings;
