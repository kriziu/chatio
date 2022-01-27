import styled from '@emotion/styled';

import { scrollY } from 'styles/scroll';

export const List = styled.ul`
  padding: 0 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  ${scrollY};

  overflow-x: hidden;
`;

export const AvatarsContainer = styled.ul<{ height: number }>`
  position: absolute;
  z-index: 5;
  display: flex;
  right: 1rem;
  margin-top: ${({ height }) => height + 3}px;

  li {
    margin-left: 0.3rem;
  }
`;
