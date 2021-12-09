import styled from '@emotion/styled';

export const AvatarSmall = styled.div<{ active?: boolean }>`
  width: 5rem;
  height: 5rem;
  background-color: gray;
  border-radius: 50%;
  position: relative;

  ::after {
    display: ${({ active }) => (active ? 'block' : 'none')};
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    background-color: var(--color-green);
    content: '';
    position: absolute;
    right: 3px;
    bottom: 3px;
  }
`;

export const Avatar = styled.div<{ active?: boolean }>`
  width: 6rem;
  height: 6rem;
  background-color: gray;
  border-radius: 50%;
  position: relative;

  ::after {
    display: ${({ active }) => (active ? 'block' : 'none')};
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    background-color: var(--color-green);
    content: '';
    position: absolute;
    right: 3px;
    bottom: 3px;
  }
`;
