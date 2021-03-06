import styled from '@emotion/styled';
import { Flex } from 'common/components/Flex';

export const Container = styled.div<{ height: number }>`
  height: ${({ height }) => `calc(${height}px - 17rem)`};
  margin-top: 2rem;
  position: relative;

  transition: none;
`;

export const DownContainer = styled.div<{ shown: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  flex-direction: column;
  bottom: 0;
  left: 0;
  margin-left: 50%;
  transform: ${({ shown }) =>
      shown ? 'translateY(-2rem)' : 'translateY(1000%)'}
    translateX(-50%);
  transition: transform 0.3s ease;
`;

export const FlexTop = styled(Flex)`
  padding-top: 2rem;

  input {
    margin-right: 1rem;
    width: 75%;
  }
`;
