import { createContext, FC, useEffect, useState } from 'react';
import pusherJs, { Channel } from 'pusher-js';

export const connectionsContext = createContext<{
  channels: Channel[];
  setConnections: React.Dispatch<React.SetStateAction<CConnectionType[]>>;
}>({ channels: [], setConnections: () => {} });

export const pusher = new pusherJs(
  process.env.NEXT_PUBLIC_PUSHER_KEY as string,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    authEndpoint: '/api/pusher/auth',
  }
);

const ConnectionsProvider: FC = ({ children }) => {
  const [connections, setConnections] = useState<CConnectionType[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    setChannels([]);

    connections.forEach(connection => {
      const channel = pusher.subscribe(`private-${connection._id}`);
      setChannels(prev => [...prev, channel]);
    });

    return () => {
      connections.forEach(connection => {
        pusher.unsubscribe(`private-${connection._id}`);
      });
    };
  }, [connections]);

  return (
    <connectionsContext.Provider value={{ channels, setConnections }}>
      {children}
    </connectionsContext.Provider>
  );
};

export default ConnectionsProvider;
