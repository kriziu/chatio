import styled from '@emotion/styled';
import { Background } from '../Background/Background';

export const NavBtn = styled.button<{ opened: boolean }>`
  border: none;
  border-radius: 1rem;
  background-color: white;
  position: fixed;
  top: 4.3rem;
  left: 2rem;
  z-index: 11;
  width: 3.3rem;
  height: 0.4rem;

  transform: ${({ opened }) => (opened ? 'rotate(225deg)' : 'rotate(0)')};

  :focus {
    outline: var(--color-blue);
  }

  ::after {
    border-radius: 1rem;
    content: '';
    display: inline-block;
    position: absolute;
    width: 3.3rem;
    height: 0.4rem;
    top: -0.9rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;

    opacity: ${({ opened }) => (opened ? 0 : 1)};
  }

  ::before {
    content: '';
    border-radius: 1rem;
    display: inline-block;
    position: absolute;
    width: 3.3rem;
    height: 0.4rem;
    top: ${({ opened }) => (opened ? ' 0' : ' 0.9rem')};
    left: 50%;
    transform: translateX(-50%)
      ${({ opened }) => (opened ? 'rotate(90deg)' : 'rotate(0)')};
    background-color: white;
  }
`;

export const NavBackground = styled(Background)<{ opened: boolean }>`
  transform: ${({ opened }) =>
    opened ? 'translateX(0)' : 'translateX(-100%)'};

  border-top-right-radius: 2rem;
  border-bottom-right-radius: 2rem;
  z-index: 10;
`;
