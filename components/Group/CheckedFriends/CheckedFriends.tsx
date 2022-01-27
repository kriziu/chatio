import { FC } from 'react';

import { AvatarSmall } from 'components/Simple/Avatars';
import { Flex } from 'components/Simple/Flex';
import { Header5 } from 'components/Simple/Headers';
import { Container, List } from './CheckedFriends.elements';

const CheckedFriends: FC<{
  checkedFriends: UserType[];
  onClick: (_id: string) => void;
}> = ({ checkedFriends, onClick }) => {
  return (
    <Container>
      {!checkedFriends.length ? (
        <Header5>Looks empty...</Header5>
      ) : (
        <List onTouchStart={e => e.stopPropagation()}>
          {checkedFriends.map(friend => {
            return (
              <Flex
                as="li"
                key={friend._id}
                tabIndex={0}
                onClick={() => onClick(friend._id)}
              >
                <AvatarSmall imageURL={friend.imageURL} />
              </Flex>
            );
          })}
        </List>
      )}
    </Container>
  );
};

export default CheckedFriends;
