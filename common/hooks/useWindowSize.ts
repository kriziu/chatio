import { useLayoutEffect, useState } from 'react';

const useWindowSize = (fromWindow?: boolean) => {
  const [size, setSize] = useState([0, 0]);

  useLayoutEffect(() => {
    const container = document.getElementById('container');

    const updateSize = () => {
      if (fromWindow || window.innerWidth < 1100) {
        setSize([window.innerWidth, window.innerHeight]);
        return;
      }

      if (container) setSize([container.clientWidth, container.clientHeight]);
      else setSize([window.innerWidth, window.innerHeight]);
    };
    if (container) container.addEventListener('resize', updateSize);
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => {
      if (container) container.addEventListener('resize', updateSize);
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  return size;
};

export default useWindowSize;
