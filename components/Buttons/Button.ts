import styled from '@emotion/styled';

export const Button = styled.button`
  border-radius: 1.5rem;
  font-size: 1.6rem;
  width: 100%;
  padding: 1rem;
  font-weight: 300;

  background-image: var(--gradient-main);
  border: none;

  :focus {
    opacity: 0.8;
  }

  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
  :active {
    opacity: 0.6;
  }
`;
