import styled from '@emotion/styled';
import { Flex } from 'common/components/Flex';

export const Container = styled.div`
  margin-bottom: 2rem;

  label {
    margin: 1rem;
    cursor: pointer;
  }
`;

export const AvatarContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;

  button {
    margin-top: 1rem;
  }
`;
