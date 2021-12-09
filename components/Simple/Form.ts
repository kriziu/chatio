import styled from '@emotion/styled';

export const Form = styled.form`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-around;

  *:not(:last-child) {
    margin-bottom: 1.5rem;
  }
`;
