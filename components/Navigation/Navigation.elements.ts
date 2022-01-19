import styled from '@emotion/styled';
import { Background } from '../Simple/Background';
import { Flex } from '../Simple/Flex';

export const NavBtn = styled.button<{ active: boolean }>`
  width: 4rem;
  height: 4rem;
  position: fixed;
  top: 2.5rem;
  background-color: transparent;
  border: none;
  left: 1.8rem;
  z-index: 11;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  :hover {
    transform: scale(1.1);
  }

  ::after {
    opacity: ${({ active }) => (active ? 1 : 0)};
    content: ' ';
    position: absolute;
    right: 0;
    bottom: 0.5rem;
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    background-color: var(--color-red);
  }
`;

export const NavBtnIcon = styled.span<{ opened: boolean }>`
  border: none;
  border-radius: 1rem;
  background-color: white;
  position: relative;
  display: inline-block;
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

  background-image: linear-gradient(
    to bottom,
    rgba(32, 16, 16, 0.85),
    rgba(0, 10, 47, 0.72)
  );

  padding: 0 2rem;

  z-index: 10;
`;

export const Top = styled(Flex)`
  margin-left: 4rem;
  margin-top: 2rem;
  cursor: pointer;

  div {
    margin-right: 1rem;
  }
`;
