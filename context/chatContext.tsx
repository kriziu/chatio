import { createContext, MutableRefObject, RefObject } from 'react';

export const chatContext = createContext<{
  connectionId: string;
  loading: boolean;
  active: boolean;
  fetched: boolean;
  data: CConnectionType;
  messages: MessageType[];
  listRef: RefObject<HTMLUListElement>;
  messagesRef: MutableRefObject<HTMLLIElement[]>;
  handlePinnedMessageClick: (messageId: string) => void;
}>(null!);
