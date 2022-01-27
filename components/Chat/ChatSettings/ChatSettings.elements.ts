import styled from '@emotion/styled';
import { Background } from 'components/Simple/Background';
import { Flex } from 'components/Simple/Flex';

export const Settings = styled(Background)<{ opened: boolean }>`
  overflow: hidden;
  margin-top: -2rem;
  padding: 4rem 0;
  z-index: 15;
  transition: transform 0.4s ease;
  transform: ${({ opened }) =>
    !opened ? 'translateY(-100%)' : 'translateY(0)'};

  .top {
    margin-left: 1rem;
  }
`;

export const BtnContainer = styled(Flex)`
  margin-top: 3rem;
`;

export const OptionsContainer = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  padding: 4rem 6rem;

  h2 {
    color: var(--color-red);
    cursor: pointer;
  }
`;
