import styled from '@emotion/styled';

import { scrollY } from 'styles/scroll';

export const List = styled.ul`
  padding: 0 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;

  ${scrollY};
`;

export const MessageContainer = styled.li<{
  mine: boolean;
  time: string;
  touched: boolean;
}>`
  display: flex;
  align-items: center;
  align-self: ${({ mine }) => (mine ? 'flex-end' : 'flex-start')};
  flex-direction: ${({ mine }) => (mine ? 'row-reverse' : 'row')};
  position: relative;

  transition: none;
  max-width: 80%;

  :not(:first-of-type) {
    margin-top: 2rem;
  }

  ::after {
    margin: 0 1rem;
    color: ${({ touched }) => (touched ? 'white' : 'transparent')};
    userselect: none;
    content: '${({ time }) => time}';
  }
`;

export const Message = styled.p<{
  mine?: boolean;
  read?: boolean;
  pinned?: boolean;
  deleted?: boolean;
}>`
  color: #eee;
  padding: 1rem 1.5rem;
  background-image: ${({ mine, deleted }) =>
    deleted ? 'none' : mine ? 'var(--gradient-mine)' : 'var(--gradient-main)'};
  border: ${({ pinned }) => (pinned ? 2 : 0)}px solid white;
  width: max-content;
  border-radius: 2rem;
  word-break: break-all;
  user-select: none;
  background-color: black;

  ::after {
    display: block;
    content: ' ';
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background-color: ${({ mine, read }) =>
      mine && read ? 'white' : 'transparent'};
    position: absolute;
    right: -1.5rem;
    top: 50%;
    transform: translateY(-50%);
    transition: all 0.2s ease;
  }
`;

export const PinContainer = styled.div<{
  width: number;
  mine?: boolean;
  top: number;
}>`
  z-index: 5;
  transition: none;

  user-select: none;
  background-color: var(--color-gray-darker);
  border-radius: 2rem;
  padding: 1rem;
  position: absolute;

  top: ${({ top }) => top - 45}px;

  ${({ mine, width }) =>
    !mine ? `left: ${width + 30}px` : `right: ${width + 40}px`};

  p {
    padding: 1rem 0.5rem;
    border-radius: 1rem;
    :hover {
      cursor: pointer;
      background-color: black;
    }
  }
`;
