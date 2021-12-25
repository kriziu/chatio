import {
  FC,
  RefCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSwipeable } from 'react-swipeable';
import { AiOutlineUserAdd } from 'react-icons/ai';
import axios from 'axios';
import useSWR, { useSWRConfig } from 'swr';
import { ClipLoader } from 'react-spinners';

import { Avatar } from '../Simple/Avatars';
import { Button } from '../Simple/Button';
import { Flex } from '../Simple/Flex';
import { Header2 } from '../Simple/Headers';
import { Input } from '../Simple/Input';
import { NavBackground, NavBtn, NavBtnIcon, Top } from './Navigation.elements';
import NavigationConnection from './NavigationConnection';
import { connectionsContext } from 'context/connectionsContext';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Navigation: FC = () => {
  const { setConnections } = useContext(connectionsContext);

  const { mutate } = useSWRConfig();
  const router = useRouter();
  const back = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState('');
  const { data, error } = useSWR<CConnectionType[]>(
    show ? `/api/connection` : null,
    fetcher,
    {
      refreshInterval: 30000,
    }
  );

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
  }, [ref]);

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
    mutate('/api/connection');

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [opened, mutate]);

  useEffect(() => {
    data && setConnections(data);
  }, [data, setConnections]);

  const renderConnections = (): JSX.Element[] | JSX.Element => {
    return data ? (
      data.map(connection => (
        <NavigationConnection
          connection={connection}
          setOpened={setOpened}
          key={connection._id}
        />
      ))
    ) : (
      <Flex style={{ width: '100%', height: '100%', marginTop: '5rem' }}>
        <ClipLoader color="white" size={50} />
      </Flex>
    );
  };

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
        <Link href="/profile">
          <a>
            <Top
              onClick={() => {
                setOpened(false);
              }}
            >
              <Avatar />
              <Header2>Your profile</Header2>
            </Top>
          </a>
        </Link>

        <Flex style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
          <Input
            placeholder="Search..."
            style={{ width: '80%' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link href="/find" passHref>
            <Button
              icon
              style={{ width: 'max-content' }}
              onClick={() => {
                setOpened(false);
              }}
              as="a"
            >
              <AiOutlineUserAdd />
            </Button>
          </Link>
        </Flex>
        <Flex
          as="ul"
          style={{
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {renderConnections()}
        </Flex>
      </NavBackground>
    </>
  );
};

export default Navigation;
