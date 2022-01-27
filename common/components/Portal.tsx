import { FC, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const Portal: FC = ({ children }) => {
  const [dom, setDom] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setDom(document.querySelector('#portal') as HTMLElement | null);
  }, []);

  if (!dom) return null;

  return ReactDOM.createPortal(children, dom);
};

export default Portal;
