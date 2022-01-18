import { Dispatch, FC, SetStateAction } from 'react';

import { ClipLoader } from 'react-spinners';

import { Header5 } from 'components/Simple/Headers';
import NavigationConnection from './NavigationConnection';
import { Flex } from 'components/Simple/Flex';

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
}

const ConnectionList: FC<Props> = ({ data, setNotRead, setOpened }) => {
  if (data && !data.length) return <Header5>No friends at the time...</Header5>;

  if (!data)
    return (
      <Flex style={{ width: '100%', height: '100%', marginTop: '5rem' }}>
        <ClipLoader color="white" size={50} />
      </Flex>
    );

  return (
    <>
      {data.map(connection => (
        <NavigationConnection
          connection={connection}
          setOpened={setOpened}
          key={connection._id}
          setNotRead={setNotRead}
        />
      ))}
    </>
  );
};

export default ConnectionList;
