import styled from '@emotion/styled';
import { Settings } from 'components/Chat/ChatSettings/ChatSettings.elements';
import { Flex } from 'components/Simple/Flex';

export const Managment = styled(Settings)`
  z-index: 999;
  padding: 4rem 0;

  .close {
    position: fixed;
    top: 2rem;
    right: 2rem;
  }

  div {
    margin: 0;
  }

  h2 {
    margin-top: 1rem;
  }

  .save {
    position: fixed;
    bottom: 2rem;
    margin-left: 50%;
    transform: translateX(-50%);
  }
`;

export const Edit = styled(Flex)`
  flex-direction: column;

  label h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
`;
