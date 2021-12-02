import { createContext, FC, useEffect, useState } from 'react';
import axios from 'axios';

export const defaultUser = { fName: '', lName: '', email: '' };

export const userContext = createContext<{
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}>({ user: defaultUser, setUser: () => {} });

const UserProvider: FC = ({ children }) => {
  const [user, setUser] = useState<UserType>(defaultUser);

  useEffect(() => {
    axios
      .get<UserType>('/api/auth/getCredentials')
      .then(res => setUser(res.data));

    //es-lint disable next line
  }, []);

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
};

export default UserProvider;
