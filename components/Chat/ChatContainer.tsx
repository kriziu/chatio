import { FC, useContext } from 'react';

import styled from '@emotion/styled';

import { scrollY } from 'styles/scroll';
import { userContext } from 'context/userContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 2rem;
  height: 80vh;
  margin-top: 2rem;

  ${scrollY}
`;

const Message = styled.p<{ mine?: boolean }>`
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

interface Props {
  messages: MessageType[];
}

const ChatContainer: FC<Props> = ({ messages }) => {
  const {
    user: { _id },
  } = useContext(userContext);

  return (
    <Container>
      {messages.map((message, index) => {
        return (
          <Message key={index} mine={message.sender._id === _id}>
            {message.message}
          </Message>
        );
      })}
    </Container>
  );
};

export default ChatContainer;
