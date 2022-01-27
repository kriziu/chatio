import styled from '@emotion/styled';
import { scrollY } from 'styles/scroll';

export const SpinnerContainer = styled.div`
  margin-top: 10rem;
`;

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: calc(100% - 23rem);
  margin-top: 3rem;

  ${scrollY}
`;
