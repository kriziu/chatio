import styled from '@emotion/styled';
import { Header5 } from 'components/Simple/Headers';
import { scrollY } from 'styles/scroll';

export const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  height: 20rem;
  margin: 1rem 5rem 1rem 5.5rem;

  ${scrollY}

  li:not(:last-of-type) {
    padding-bottom: 1.5rem;
  }

  li {
    width: 100%;

    h4 {
      margin-left: 1rem;
      width: 13rem;
      text-align: left;
    }
  }
`;

export const HeaderM = styled(Header5)`
  margin-top: 1rem;
`;
