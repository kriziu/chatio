import { useContext, useEffect, useState } from 'react';

import { userContext } from 'context/userContext';
import { chatContext } from 'context/chatContext';

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
  }, [data]);

  return isAdmin;
};

export default useAdminGroup;
