import { FC, useContext, useState } from 'react';

import { userContext } from '../../context/userContext';
import { NavBackground, NavBtn } from './Navigation.elements';

const Navigation: FC = () => {
  const {
    user: { email },
  } = useContext(userContext);

  const [opened, setOpened] = useState(false);

  console.log(email);

  return (
    <>
      {email && <NavBtn opened={opened} onClick={() => setOpened(!opened)} />}
      <NavBackground opened={opened} w="30rem" h="100vh"></NavBackground>
    </>
  );
};

export default Navigation;
