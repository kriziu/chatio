import { createContext, FC, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import decode from 'jwt-decode';

export const defaultUser = { fName: '', lName: '', email: '', _id: '' };

export const userContext = createContext<{
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
}>({ user: defaultUser, setUser: () => {} });

const UserProvider: FC = ({ children }) => {
  const [user, setUser] = useState<UserType>(defaultUser);
  const access = Cookies.get('ACCESS');

  useEffect(() => {
    if (access) {
      const decoded = decode<UserType>(access);
      const { fName, lName, email, _id } = decoded;

      setUser({ fName, lName, email, _id });
    } else {
      setUser(defaultUser);
    }
  }, [access]);

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
};

export default UserProvider;
