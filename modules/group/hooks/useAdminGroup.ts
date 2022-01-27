import { useContext, useEffect, useState } from 'react';

import { userContext } from 'common/context/userContext';
import { chatContext } from 'modules/chat/context/chatContext';

const useAdminGroup = () => {
  const {
    user: { _id },
  } = useContext(userContext);
  const { data } = useContext(chatContext);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isAdmin = false;

    data.admins?.forEach(admin => {
      if (admin._id === _id) isAdmin = true;
    });

    setIsAdmin(isAdmin);
  }, [data, _id]);

  return isAdmin;
};

export default useAdminGroup;
