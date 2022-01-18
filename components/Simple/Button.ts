import styled from '@emotion/styled';

export const Button = styled.button<{
  inputSize?: boolean;
  icon?: boolean;
  width?: string;
}>`
  border-radius: 1.5rem;
  font-size: 1.6rem;
  width: ${({ inputSize, width }) =>
    width ? width : inputSize ? '25rem' : '100%'};
  padding: 1rem;
  font-weight: 300;
  text-aling: center;

  background-image: var(--gradient-main);
  border: none;
  position: relative;
  z-index: 1;

  :focus {
    opacity: 0.8;
  }

  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
  :active {
    opacity: 0.6;
  }
  ${({ icon }) =>
    icon
      ? `display: flex;
        align-items: center;
        justify-conent: center;
        width: min-content;`
      : ''}

  svg {
    fill: black;
    width: 2.3rem;
    height: 2.3rem;
    mix-blend-mode: overlay;
  }
`;
