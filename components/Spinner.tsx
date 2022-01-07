import { FC } from 'react';

import { ClipLoader } from 'react-spinners';

import { Flex } from './Simple/Flex';

const Spinner: FC = () => {
  return (
    <Flex
      style={{ height: '100vh', position: 'absolute', width: '100vw', top: 0 }}
    >
      <ClipLoader color="white" loading={true} size={100} />
    </Flex>
  );
};

export default Spinner;
