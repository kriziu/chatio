import Image from 'next/image';
import { FC } from 'react';

import styled from '@emotion/styled';

const StyledImage = styled(Image)`
  border-radius: 50%;
`;

const Container = styled.div<{ size: number; active?: boolean }>`
  border-radius: 50%;
  background-color: gray;

  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;

  position: relative;

  ::before {
    display: ${({ active }) => (active ? 'block' : 'none')};
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    background-color: var(--color-green);
    content: '';
    position: absolute;
    right: 3px;
    bottom: 3px;
    z-index: 5;
  }
`;

export const Avatar: FC<{
  imageURL: string;
  active?: boolean;
  unoptimized?: boolean;
}> = ({ imageURL, active, unoptimized }) => {
  return (
    <Container size={80} active={active}>
      {imageURL && imageURL !== '-1' && (
        <StyledImage
          src={imageURL}
          width={80}
          height={80}
          alt="Avatar"
          objectFit="cover"
          unoptimized={unoptimized}
        />
      )}
    </Container>
  );
};

export const AvatarSmall: FC<{ imageURL: string; active?: boolean }> = ({
  imageURL,
  active,
}) => {
  return (
    <Container size={50} active={active}>
      {imageURL && imageURL !== '-1' && (
        <StyledImage
          src={imageURL}
          width={50}
          height={50}
          alt="Avatar"
          objectFit="cover"
        />
      )}
    </Container>
  );
};
