import styled from '@emotion/styled';

export const Container = styled.div<{
  width: number;
  mine?: boolean;
  top: number;
  left: number;
}>`
  z-index: 5;
  transition: none;

  user-select: none;
  background-color: var(--color-gray-darker);
  border-radius: 2rem;
  padding: 1rem;
  position: absolute;

  top: ${({ top }) => top - 45}px;

  ${({ mine, width, left }) =>
    !mine ? `left: ${left + width - 40}px` : `left: ${left - width + 50}px`};

  p {
    padding: 1rem 0.5rem;
    border-radius: 1rem;
    :hover {
      cursor: pointer;
      background-color: black;
    }
  }
`;
