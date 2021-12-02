import { FC, useContext } from 'react';

import styled from '@emotion/styled';

import { scrollY } from '../../styles/scroll';
import { userContext } from '../../context/userContext';
import { Message } from './Message/Message';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 2rem;
  height: 80vh;
  margin-top: 2rem;

  ${scrollY}
`;

const ChatContainer: FC = () => {
  const { user } = useContext(userContext);

  return (
    <Container>
      <Message>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, quo?
        Voluptatibus sapiente obcaecati laborum maxime suscipit eos iusto
        molestias atque consectetur maiores provident repellendus necessitatibus
        omnis aspernatur, numquam deleniti culpa!
      </Message>
      <Message>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </Message>
      <Message mine>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, quo?
        Voluptatibus sapiente obcaecati laborum maxime suscipit eos iusto
        molestias atque consectetur maiores provident repellendus necessitatibus
        omnis aspernatur, numquam deleniti culpa!
      </Message>
      <Message>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </Message>
      <Message mine>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor, quo?
        Voluptatibus sapiente obcaecati laborum maxime suscipit eos iusto
        molestias atque consectetur maiores provident repellendus necessitatibus
        omnis aspernatur, numquam deleniti culpa!
      </Message>
      <Message mine>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </Message>
    </Container>
  );
};

export default ChatContainer;
