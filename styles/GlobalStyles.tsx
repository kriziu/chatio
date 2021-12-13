import { css, Global } from '@emotion/react';

export const GlobalStyles = () => (
  <Global
    styles={css`
      *,
      *::after,
      *::before {
        margin: 0;
        padding: 0;
        box-sizing: inherit;
        font-family: 'Montserrat', sans-serif;
        transition: var(--trans-default);
        color: var(--color-white);
      }

      svg {
        color: var(--color-white);
        width: 2.3rem;
        height: 2.3rem;
      }

      body {
        margin: 0;
        padding: 0;
        font-size: 1.6rem;
        font-family: 'Montserrat', sans-serif;
        box-sizing: border-box;
        transition: all 0.3s;
        overflow: hidden;
        background-image: linear-gradient(
          to bottom right,
          rgb(3, 38, 57),
          rgb(29, 0, 43)
        );
        height: 100vh;
      }

      html {
        font-size: 62.5%;
      }

      a {
        color: var(--color-white);
      }

      :root {
        // COLORS
        --color-gray: #cbd5e0;
        --color-gray-dark: #9ea3a8;
        --color-gray-darker: #343434;
        --color-black: #222;
        --color-white: #fff;
        --color-red: #e53e3e;
        --color-green: #00ff57;
        --color-blue: #3ea8e5;
        // GRADIENTS
        --gradient-main: linear-gradient(to bottom right, #f14a4a, #6153ff);
        --gradient-secondary: linear-gradient(
          to bottom right,
          #4200ff,
          #3a0000
        );
        --gradient-mine: linear-gradient(to right bottom, #242f4d, #222);
        // TRANSITIONS
        --trans-default: all 0.2s ease;
        --trans-long: all 0.7s ease;
        // SHADOWS
        --shadow-default: 0px 5px 30px 2px rgba(0, 0, 0, 0.2);
      }
    `}
  />
);
