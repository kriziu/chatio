import styled from '@emotion/styled';

export const Background = styled.div<{
  w: string;
  h: string;
}>`
  background-image: linear-gradient(
    rgba(32, 16, 16, 0.5),
    rgba(0, 10, 47, 0.82)
  );
  width: ${({ w }) => w};
  height: ${({ h }) => h};
  backdrop-filter: blur(1.5rem);
  position: absolute;
  z-index: -1;
`;
