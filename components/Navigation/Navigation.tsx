import { useRouter } from 'next/router';
import { FC, useContext, useEffect, useRef, useState } from 'react';

import { userContext } from '../../context/userContext';
import { Avatar } from '../Avatar/Avatars';
import { Button } from '../Buttons/Button';
import { Flex } from '../Flex/Flex';
import { Header2 } from '../Headers/Headers';
import { Input } from '../Input/Input';
import { NavBackground, NavBtn, NavBtnIcon, Top } from './Navigation.elements';

const Navigation: FC = () => {
  const {
    user: { email },
  } = useContext(userContext);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (router.pathname === '/login' || router.pathname === '/register')
      setShow(false);
    else setShow(true);
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        opened &&
        ref.current &&
        !(e.composedPath() as HTMLElement[]).includes(ref.current)
      )
        setOpened(false);
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [opened]);

  return (
    <>
      {show && (
        <NavBtn onClick={() => setOpened(!opened)}>
          <NavBtnIcon opened={opened} />
        </NavBtn>
      )}
      <NavBackground
        opened={opened}
        w="32rem"
        h="100vh"
        ref={ref}
        style={{ maxWidth: '100vw' }}
      >
        <Top>
          <Avatar />
          <Header2>Your profile</Header2>
        </Top>
        <Flex style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
          <Input
            placeholder="Search..."
            style={{ width: '80%' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button style={{ width: 'max-content' }}>++</Button>
        </Flex>
      </NavBackground>
    </>
  );
};

export default Navigation;
