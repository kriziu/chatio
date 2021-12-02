import styled from '@emotion/styled';

export const Message = styled.p<{ mine?: boolean }>`
  color: #eee;
  padding: 1rem 1.5rem;
  background-image: ${({ mine }) =>
    mine ? 'var(--gradient-mine)' : 'var(--gradient-main)'};
  width: max-content;
  max-width: 65%;
  border-radius: 2rem;

  ${({ mine }) => mine && 'align-self: flex-end'};

  :not(:first-of-type) {
    margin-top: 2rem;
  }
`;
