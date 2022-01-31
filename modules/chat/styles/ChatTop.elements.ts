import styled from '@emotion/styled';

import { Flex } from 'common/components/Flex';

export const Top = styled(Flex)`
  width: 100%;
  justify-content: space-between;
  padding: 0 3rem;
  cursor: pointer;

  div {
    margin-left: 2rem;

    h4 {
      width: min-content;
      text-align: left;
      margin-left: 1rem;
    }
  }
`;
