import { Dispatch, SetStateAction } from 'react';

import axios from 'axios';

export const getAndSetMessagesHelper = async (
  messages: MessageType[],
  setNewestMsgs: Dispatch<SetStateAction<boolean>>,
  setFetched: Dispatch<SetStateAction<boolean>>,
  setCounter: Dispatch<SetStateAction<number>>,
  connectionId: string,
  setScrollTo: Dispatch<
    SetStateAction<{
      behavior: ScrollBehavior;
      id: string;
    }>
  >,
  setMessages: Dispatch<SetStateAction<MessageType[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  top: boolean,
  reset?: boolean
) => {
  if (connectionId) {
    setFetched(true);

    let tempTopMsgId = !reset ? messages[0]?._id : '',
      tempBotMsgId = !reset ? messages[messages.length - 1]?._id : '';

    const res = await axios
      .get<MessageType[]>(
        `/api/message/${connectionId}${
          top && tempTopMsgId
            ? '?chunkTopId=' + tempTopMsgId
            : tempBotMsgId
            ? '?chunkBotId=' + tempBotMsgId
            : ''
        }`
      )
      .catch(err => {
        console.log(err);
      });

    if (!res?.data) return;

    let index = top ? 0 : res.data.length - 1;

    if (!top && !res.data.length) {
      setNewestMsgs(true);
      setCounter(0);
    }

    if (
      res.data[index] &&
      res.data[index]?._id !== (top ? tempTopMsgId : tempBotMsgId)
    ) {
      const messagesLength = messages.length + res.data.length;

      if (messagesLength > 200) {
        setNewestMsgs(false);
      }

      setScrollTo({
        behavior: 'auto',
        id: top ? tempTopMsgId : tempBotMsgId,
      });

      setMessages(prev => {
        const seen = new Set();
        let filteredMessages: MessageType[] = [];

        if (!tempBotMsgId && !tempTopMsgId) {
          filteredMessages = res.data.filter(msg => {
            const duplicate = seen.has(msg._id);
            seen.add(msg._id);
            return !duplicate;
          });

          return filteredMessages;
        }

        if (top) {
          const messages = [...res.data, ...prev].slice(0, 201);

          filteredMessages = messages.filter(msg => {
            const duplicate = seen.has(msg._id);
            seen.add(msg._id);
            return !duplicate;
          });

          return filteredMessages;
        }

        if (messagesLength > 200) {
          const messages = [...prev.slice(res.data.length - 1), ...res.data];

          filteredMessages = messages.filter(msg => {
            const duplicate = seen.has(msg._id);
            seen.add(msg._id);
            return !duplicate;
          });

          return filteredMessages;
        }

        filteredMessages = [...prev, ...res.data].filter(msg => {
          const duplicate = seen.has(msg._id);
          seen.add(msg._id);
          return !duplicate;
        });

        return filteredMessages;
      });
    } else
      setScrollTo({
        behavior: 'auto',
        id: '',
      });
    setLoading(false);

    setFetched(false);
  }
};
