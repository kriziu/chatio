import { Dispatch, SetStateAction } from 'react';

import axios from 'axios';

import { isReadByMe } from 'common/lib/isReadByMe';

let lastTimeOut: NodeJS.Timeout;

export const setUpObserver = (
  messages: MessageType[],
  setObs: Dispatch<SetStateAction<IntersectionObserver | undefined>>,
  _id: string,
  connectionId: string,
  listRef: HTMLUListElement | undefined
) =>
  setObs(
    new IntersectionObserver(
      e => {
        if (e[e.length - 1].isIntersecting) {
          const msg = messages.find(
            prev => prev._id === e[e.length - 1].target.id
          );

          if (!msg) return;

          let isRead = isReadByMe(msg, _id);

          if (!isRead && msg?.sender._id !== _id) {
            clearTimeout(lastTimeOut);

            lastTimeOut = setTimeout(() => {
              axios.post(
                `/api/pusher/read?connectionId=${connectionId}`,
                {
                  msg,
                },
                { withCredentials: true }
              );
            }, 500);
          }
        }
      },
      {
        root: listRef,
      }
    )
  );

let prevMessages = { length: 0, conId: '' };

export const handleNewMessages = (
  messages: MessageType[],
  listRef: HTMLUListElement | undefined,
  setShown: Dispatch<React.SetStateAction<boolean>>,
  first: boolean,
  setFirst: Dispatch<React.SetStateAction<boolean>>,
  fetched: boolean,
  _id: string,
  connectionId: string
) => {
  const newMsg =
    prevMessages.length !== messages.length &&
    prevMessages.conId === messages[0]?.connectionId;

  if (listRef)
    if (
      first ||
      (!fetched &&
        newMsg &&
        listRef.scrollHeight - listRef.scrollTop < listRef.clientHeight + 200)
    ) {
      listRef.scrollTo({
        top: listRef.scrollHeight,
      });
    } else if (
      newMsg &&
      listRef.scrollHeight - listRef.scrollTop > listRef.clientHeight + 200
    )
      setShown(true);

  prevMessages.length = messages.length;
  prevMessages.conId = messages[0]?.connectionId;

  if (messages.length && listRef?.id === connectionId) setFirst(false);
  else setFirst(true);
};
