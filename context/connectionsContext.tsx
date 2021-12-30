import { createContext, FC, useEffect, useState } from 'react';
import pusherJs, { PresenceChannel } from 'pusher-js';
import axios from 'axios';

export const connectionsContext = createContext<{
  channels: PresenceChannel[];
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
  const [channels, setChannels] = useState<PresenceChannel[]>([]);

  useEffect(() => {
    setChannels([]);

    connections.forEach(connection => {
      const channel = pusher.subscribe(
        `presence-${connection._id}`
      ) as PresenceChannel;

      setChannels(prev => [...prev, channel]);
    });

    return () => {
      connections.forEach(connection => {
        pusher.unsubscribe(`presence-${connection._id}`);
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
