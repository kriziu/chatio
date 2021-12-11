import { useRouter } from 'next/router';
import {
  FC,
  RefCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSwipeable } from 'react-swipeable';

import { userContext } from '../../context/userContext';
import { Avatar } from '../Simple/Avatars';
import { Button } from '../Simple/Button';
import { Flex } from '../Simple/Flex';
import { Header2 } from '../Simple/Headers';
import { Input } from '../Simple/Input';
import { NavBackground, NavBtn, NavBtnIcon, Top } from './Navigation.elements';

const Navigation: FC = () => {
  const {
    user: { email },
  } = useContext(userContext);
  const router = useRouter();
  const back = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState('');

  const { ref } = useSwipeable({
    onSwipedRight(e) {
      show && e.absX > 40 && setOpened(true);
    },
    onSwipedLeft(e) {
      show && e.absX > 40 && setOpened(false);
    },
  }) as { ref: RefCallback<Document> };

  useEffect(() => {
    ref(document);
  });

  useEffect(() => {
    if (router.pathname === '/login' || router.pathname === '/register')
      setShow(false);
    else setShow(true);
  }, [router.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        opened &&
        back.current &&
        !(e.composedPath() as HTMLElement[]).includes(back.current)
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
        ref={back}
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
          <Button
            style={{ width: 'max-content' }}
            onClick={() => {
              setOpened(false);
              router.push('/find');
            }}
          >
            ++
          </Button>
        </Flex>
      </NavBackground>
    </>
  );
};

export default Navigation;
