import { Dispatch, FC, SetStateAction } from 'react';

import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { CheckedFriendsType } from 'pages/group';
import styled from '@emotion/styled';
import { scrollY } from 'styles/scroll';
import { Header3 } from 'components/Simple/Headers';

const List = styled.ul`
  list-style: none;
  display: flex;
  width: 25rem;

  padding-top: 2rem;
  padding-bottom: 0.3rem;

  ${scrollY}

  overflow-y: hidden;

  margin-left: 50%;

  transform: translateX(-50%);

  li:not(:first-of-type) {
    margin-left: 1rem;
  }
`;

const CheckedFriends: FC<{
  checkedFriends: CheckedFriendsType[];
  setCheckedFriends: Dispatch<SetStateAction<CheckedFriendsType[]>>;
}> = ({ checkedFriends, setCheckedFriends }) => {
  return (
    <div style={{ height: '10rem' }}>
      <Header3 style={{ marginTop: '2rem' }}>List of friends in group</Header3>
      <List onTouchStart={e => e.stopPropagation()}>
        {checkedFriends.map(friend => {
          return (
            <Flex
              as="li"
              key={friend._id}
              tabIndex={0}
              onClick={() =>
                setCheckedFriends(prev =>
                  prev.filter(pre => friend._id !== pre._id)
                )
              }
            >
              <AvatarSmall imageURL={friend.imageURL} />
            </Flex>
          );
        })}
      </List>
    </div>
  );
};

export default CheckedFriends;
