import styled from '@emotion/styled';
import { scrollY } from 'common/styles/scroll';

export const List = styled.ul`
  list-style: none;
  height: 17vh;
  ${scrollY}

  div {
    margin-top: 1rem;
  }

  h2 {
    margin-right: 1rem;
  }
`;
