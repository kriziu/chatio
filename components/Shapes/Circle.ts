import styled from '@emotion/styled';

export const Circle = styled.div<{
  radius: number;
  secondary?: boolean;
  position: { x: number; y: number };
}>`
  border-radius: 50%;
  background-image: ${({ secondary }) =>
    secondary ? 'var(--gradient-secondary)' : 'var(--gradient-main)'};
  width: ${({ radius }) => radius}rem;
  height: ${({ radius }) => radius}rem;
  position: absolute;
  left: ${({ position, radius }) => `calc(${position.x}vw - ${radius}rem)`};
  top: ${({ position, radius }) => `calc(${position.y}vh - ${radius}rem)`};
  z-index: -50;
`;
