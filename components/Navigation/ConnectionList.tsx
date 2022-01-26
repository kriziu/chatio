import { Dispatch, FC, SetStateAction, useContext } from 'react';

import styled from '@emotion/styled';

import { userContext } from 'context/userContext';
import { getUserFromIds } from 'lib/ids';
import { scrollY } from 'styles/scroll';

import { Header5 } from 'components/Simple/Headers';
import NavigationConnection from './NavigationConnection';
import Spinner from 'components/Spinner';

const List = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: calc(100% - 23rem);
  margin-top: 3rem;

  ${scrollY}
`;

interface Props {
  setOpened: Dispatch<SetStateAction<boolean>>;
  setNotRead: Dispatch<
    SetStateAction<
      {
        [x: string]: boolean;
      }[]
    >
  >;
  data: CConnectionType[] | undefined;
  search: string;
}

const ConnectionList: FC<Props> = ({ data, setNotRead, setOpened, search }) => {
  const {
    user: { _id },
  } = useContext(userContext);

  if (data && !data.length)
    return (
      <Header5 style={{ marginTop: '1rem' }}>No friends at the time...</Header5>
    );

  if (!data)
    return (
      <div style={{ marginTop: '10rem' }}>
        <Spinner />
      </div>
    );

  return (
    <List>
      {data
        .filter(connection => {
          const user = getUserFromIds(connection, _id);

          return (
            user?.fName.toLowerCase() +
            ' ' +
            user?.lName.toLowerCase() +
            ' ' +
            connection.name
          ).includes(search.toLowerCase());
        })
        .map(connection => (
          <NavigationConnection
            connection={connection}
            setOpened={setOpened}
            key={connection._id}
            setNotRead={setNotRead}
          />
        ))}
    </List>
  );
};

export default ConnectionList;
