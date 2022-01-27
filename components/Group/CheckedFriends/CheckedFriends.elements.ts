import styled from '@emotion/styled';
import { scrollY } from 'styles/scroll';

export const List = styled.ul`
  list-style: none;
  display: flex;
  width: 25rem;

  align-items: center;

  padding-top: 2rem;
  padding-bottom: 0.3rem;

  ${scrollY}

  overflow-y: hidden;

  margin-left: 50%;

  transform: translateX(-50%);

  li:not(:first-of-type) {
    margin-left: 1rem;
  }
`;

export const Container = styled.div`
  height: 10rem;

  h5 {
    margin-top: 1rem;
  }
`;
