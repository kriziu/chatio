import styled from '@emotion/styled';

import { Flex } from 'components/Simple/Flex';

export const Container = styled.div`
  background-color: var(--color-black);
  border-radius: 2rem;
  padding: 3rem;
  width: 25rem;
  height: 35rem;

  margin-top: 20%;
  margin-left: 50%;

  transform: translateX(-50%);

  h2 {
    margin-top: 1rem;
  }
`;

export const Options = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;

  h5 {
    margin-top: 2rem;
  }

  .delete {
    color: var(--color-red);
  }

  button {
    margin-top: 2rem;

    cursor: pointer;

    :hover {
      transform: scale(1.07);
    }

    :active {
      transform: scale(0.93);
    }
  }
`;
