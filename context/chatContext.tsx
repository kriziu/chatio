import {
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react';

export const chatContext = createContext<{
  newestMsgs: boolean;
  goToNewestMessages: () => void;
  connectionId: string;
  loading: boolean;
  active: boolean;
  fetched: boolean;
  scrollTo: {
    behavior: ScrollBehavior;
    id: string;
  };
  data: CConnectionType;
  messages: MessageType[];
  listRef: HTMLUListElement | undefined;
  setListRef: Dispatch<SetStateAction<HTMLUListElement | undefined>>;
  messagesRef: MutableRefObject<HTMLLIElement[]>;
  handlePinnedMessageClick: (messageId: string) => void;
}>(null!);
