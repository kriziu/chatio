import styled from '@emotion/styled';

export const Container = styled.div<{ height: number }>`
  height: ${({ height }) => `calc(${height}px - 17rem)`};
  margin-top: 2rem;

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
      shown ? 'translateY(-10rem)' : 'translateY(100%)'}
    translateX(-50%);
  transition: transform 0.3s ease;
`;
