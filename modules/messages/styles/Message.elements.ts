import styled from '@emotion/styled';

export const MessageContainer = styled.li<{
  mine: boolean;
  time: string;
  touched: boolean;
  margin?: boolean;
  bottom?: boolean;
}>`
  display: flex;
  align-items: center;
  align-self: ${({ mine }) => (mine ? 'flex-end' : 'flex-start')};
  flex-direction: ${({ mine }) => (mine ? 'row-reverse' : 'row')};

  transition: none;
  max-width: 80%;
  :last-of-type {
    margin-bottom: 3rem;
  }

  ${({ margin, bottom }) =>
    bottom
      ? `margin-bottom: ${margin ? 2 : 0.2}rem; margin-top: 0.2rem`
      : `margin-top: ${margin ? 2 : 0.2}rem; margin-bottom: 0.2rem`};

  ::after {
    margin: 0 1rem;
    color: ${({ touched }) => (touched ? 'white' : 'transparent')};
    userselect: none;
    content: '${({ time }) => time}';
  }
`;

export const MessageP = styled.p<{
  margin?: boolean;
  bottom?: boolean;
  both?: boolean;
  mine: boolean;
  pinned: boolean;
  deleted: boolean;
  avatar?: boolean;
}>`
  color: #eee;
  padding: 1rem 1.5rem;
  background-image: ${({ mine, deleted }) =>
    deleted ? 'none' : mine ? 'var(--gradient-mine)' : 'var(--gradient-main)'};
  border: ${({ pinned }) => (pinned ? 2 : 0)}px solid white;
  width: max-content;
  border-radius: ${({ mine, bottom, margin, both }) =>
    !margin
      ? mine
        ? `2rem 0.5rem 0.5rem 2rem`
        : `0.5rem 2rem 2rem 0.5rem`
      : both
      ? '2rem'
      : mine
      ? `2rem ${bottom ? '0.5rem 2rem' : '2rem 0.5rem'} 2rem`
      : `${bottom ? '0.5rem 2rem 2rem 2rem' : '2rem 2rem 2rem 0.5rem'}`};
  margin-left: ${({ mine, avatar }) => (!mine ? (avatar ? 0.5 : 3.5) : 0)}rem;
  word-break: break-all;
  user-select: none;
  background-color: black;
`;
