import styled from '@emotion/styled';
import { Flex } from 'common/components/Flex';
import { Header1 } from 'common/components/Headers';

export const TopHeader = styled(Header1)`
  padding: 6rem 1rem 1rem 1rem;
`;

export const SpinnerContainer = styled(Flex)`
  margin-top: 5rem;
`;

export const FoundList = styled(Flex)`
  flex-direction: column;
  margin-top: 4rem;

  li {
    width: 31rem;
    justify-content: space-between;

    :not(:last-of-type) {
      margin-bottom: 2rem;
    }

    h2 {
      max-width: 20rem;
    }

    button {
      width: max-content;
    }
  }
`;
