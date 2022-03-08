import React, {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useState,
} from 'react';

import axios from 'axios';
import { SwipeableHandlers } from 'react-swipeable';
import { MdDeleteForever } from 'react-icons/md';
import { BiBlock } from 'react-icons/bi';

import useAdminGroup from 'modules/group/hooks/useAdminGroup';
import { chatContext } from 'modules/chat/context/chatContext';
import { errToast } from 'common/lib/toasts';

import { AvatarSmall } from 'common/components/Avatars';
import { Header3 } from 'common/components/Headers';
import PinnedMessageList from 'modules/messages/components/PinnedMessageList';
import { Button } from 'common/components/Button';
import GroupManagment from 'modules/group/components/GroupManagment';
import {
  BtnContainer,
  OptionsContainer,
  Settings,
  Top,
} from '../styles/ChatSettings.elements';

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

      <Settings w="100%" h="100%" opened={opened} {...handlersToCloseSettings}>
        <Top onClick={() => setOpened(false)}>
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
        </Top>
        {data.group && (
          <BtnContainer>
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
            <BiBlock />
            Block
          </Header3>
          <Header3
            onClick={() =>
              axios.delete('/api/pusher/delete?connectionId=' + connectionId)
            }
          >
            <MdDeleteForever />
            Delete
          </Header3>
        </OptionsContainer>
      </Settings>
    </>
  );
};

export default ChatSettings;
