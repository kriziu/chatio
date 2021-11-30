import { NextComponentType } from 'next';
import { useEffect } from 'react';
import { Container } from './LeftBar.elements';

const LeftBar: NextComponentType = () => {
  useEffect(() => {
    console.log(document.cookie);
  });
  return <Container></Container>;
};

export default LeftBar;
