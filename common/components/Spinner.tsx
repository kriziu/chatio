import { FC } from 'react';

import { ClipLoader } from 'react-spinners';

import { Flex } from './Flex';

const Spinner: FC = () => {
  return (
    <Flex style={{ height: '100%', width: '100%' }}>
      <ClipLoader color="white" loading={true} size={100} />
    </Flex>
  );
};

export const BigSpinner: FC<{ loading: boolean }> = ({ loading }) => {
  return (
    <Flex
      style={{
        height: '100vh',
        position: 'absolute',
        width: '100vw',
        top: 0,
        backgroundColor: 'black',
        opacity: loading ? 0.3 : 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <ClipLoader color="white" loading={true} size={100} />
    </Flex>
  );
};

export default Spinner;
