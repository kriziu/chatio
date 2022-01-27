import styled from '@emotion/styled';
import { Header5 } from 'components/Simple/Headers';

export const Container = styled.li`
  width: 100%;

  .con {
    margin-top: 1rem;
    justify-content: flex-start;

    div {
      flex-direction: column;
      align-items: flex-start;
      margin-left: 1rem;
      cursor: pointer;
    }
  }
`;

export const StyledHeader = styled(Header5)<{ read: boolean }>`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 20rem;
  ${({ read }) => !read && 'color: white; font-weight: 500;'}
`;
