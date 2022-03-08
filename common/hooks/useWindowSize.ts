import { useLayoutEffect, useState } from 'react';

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    const container = document.getElementById('container');

    const updateSize = () => {
      if (container) setSize([container.clientWidth, container.clientHeight]);
      else setSize([window.innerWidth, window.innerHeight]);
    };
    if (container) container.addEventListener('resize', updateSize);
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

export default useWindowSize;
