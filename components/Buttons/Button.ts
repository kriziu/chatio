import styled from '@emotion/styled';

export const Button = styled.button`
  border-radius: 1.5rem;
  font-size: 1.6rem;
  width: 25rem;
  color: var(--color-white);
  padding: 1rem;
  font-weight: 300;
  border: none;
  background-image: var(--gradient-main);

  :focus {
    border: none;
    outline: none;
  }

  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
  :active {
    opacity: 0.6;
  }
`;
