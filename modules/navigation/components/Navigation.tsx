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

import { userContext } from 'common/context/userContext';
import { connectionsContext } from 'common/context/connectionsContext';

import { AvatarSmall } from 'common/components/Avatars';
import { Button } from 'common/components/Button';
import { Flex } from 'common/components/Flex';
import { Header2 } from 'common/components/Headers';
import { Input } from 'common/components/Input';
import {
  NavBackground,
  NavBtn,
  NavBtnIcon,
  SearchContainer,
  Top,
} from '../styles/Navigation.elements';
import ConnectionList from './ConnectionList';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const Navigation: FC = () => {
  const {
    user: { imageURL },
  } = useContext(userContext);
  const { setConnections } = useContext(connectionsContext);

  const router = useRouter();

  const back = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);
  const [checked, setChecked] = useState(false);
  const [notRead, setNotRead] = useState<{ [x: string]: boolean }[]>([]);
  const [search, setSearch] = useState('');

  const { mutate } = useSWRConfig();
  const { data } = useSWR<CConnectionType[]>(
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
    if (data) {
      setConnections(data);
      const arr: { [x: string]: boolean }[] = [];

      data.forEach(connection => {
        arr.push({ [connection._id]: false });
      });

      setNotRead(arr);
    }
  }, [data, setConnections, setNotRead]);

  useEffect(() => {
    let temp = false;

    notRead.forEach(val => {
      if (Object.values(val)[0]) temp = true;
    });

    if (temp) setChecked(true);
    else setChecked(false);
  }, [notRead]);

  return (
    <>
      {show && (
        <>
          <NavBtn
            onClick={() => setOpened(!opened)}
            active={!opened && checked}
            aria-label="Navigation"
          >
            <NavBtnIcon opened={opened} />
          </NavBtn>
          <NavBackground opened={opened} w="32rem" h="100vh" ref={back}>
            <Link href="/">
              <a>
                <Top
                  onClick={() => {
                    setOpened(false);
                  }}
                >
                  <AvatarSmall imageURL={imageURL} />
                  <Header2>Your profile</Header2>
                </Top>
              </a>
            </Link>
            <Link href="/group" passHref>
              <div className="group">
                <Button
                  aria-label="Create group"
                  onClick={() => {
                    setOpened(false);
                  }}
                  as="a"
                >
                  Create group
                </Button>
              </div>
            </Link>
            <SearchContainer>
              <Input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Link href="/find" passHref>
                <Button
                  aria-label="Add friend"
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
            </SearchContainer>

            <ConnectionList
              search={search}
              setNotRead={setNotRead}
              listOfConnections={data}
              setOpened={setOpened}
            />
          </NavBackground>
        </>
      )}
    </>
  );
};

export default Navigation;
