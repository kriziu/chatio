import { createContext, MutableRefObject, RefObject } from 'react';

export const chatContext = createContext<{
  connectionId: string;
  loading: boolean;
  active: boolean;
  fetched: boolean;
  secondUser: UserType;
  messages: MessageType[];
  listRef: RefObject<HTMLUListElement>;
  messagesRef: MutableRefObject<HTMLLIElement[]>;
  handlePinnedMessageClick: (messageId: string) => void;
}>(null!);
