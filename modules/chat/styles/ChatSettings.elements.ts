import styled from '@emotion/styled';
import { Background } from 'common/components/Background';
import { Flex } from 'common/components/Flex';

export const Settings = styled(Background)<{ opened: boolean }>`
  overflow: hidden;
  margin-top: -2rem;
  padding-bottom: 4rem;
  z-index: 15;
  transition: transform 0.4s ease;
  transform: ${({ opened }) =>
    !opened ? 'translateY(-100%)' : 'translateY(0)'};

  .top {
    margin-left: 1rem;
  }
`;

export const Top = styled(Flex)`
  cursor: pointer;
  padding-top: 4rem;
  padding-bottom: 1rem;
`;

export const BtnContainer = styled(Flex)`
  margin-top: 1rem;
`;

export const OptionsContainer = styled(Flex)`
  flex-direction: column;
  align-items: flex-start;
  padding: 4rem 6rem;

  h2 {
    color: var(--color-red);
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    svg {
      fill: var(--color-red);
      margin-right: 0.5rem;
    }
  }
`;
