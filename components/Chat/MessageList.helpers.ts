export const getMessageHelpers = (
  _id: string,
  message: MessageType,
  arr: MessageType[],
  index: number
): [boolean, boolean, boolean, boolean, boolean, boolean, string] => {
  const messageDate = new Date(message.date);

  const senderId = message.sender._id;

  const bfDate =
    arr[index - 1]?.sender._id === senderId
      ? new Date(arr[index - 1]?.date)
      : null;
  const afDate =
    arr[index + 1]?.sender._id === senderId
      ? new Date(arr[index + 1]?.date)
      : null;

  const before = !bfDate
    ? false
    : messageDate.getTime() - bfDate.getTime() > 300_000;

  const after = !afDate
    ? false
    : afDate.getTime() - messageDate.getTime() > 300_000;

  const nextRead = arr[index + 1]?.read;

  // END
  const time =
    (messageDate.getHours() < 10 ? '0' : '') +
    messageDate.getHours() +
    ':' +
    (messageDate.getMinutes() < 10 ? '0' : '') +
    messageDate.getMinutes();

  const margin =
    before || after || !afDate || !bfDate || (!nextRead && message.read);

  const marginMessage = before || after || !afDate || !bfDate;

  const bottom = after || !afDate || (!nextRead && message.read);

  const both =
    (before && after) ||
    (!before && after && !!afDate && !bfDate) ||
    (before && !after && !afDate && !!bfDate) ||
    (!bfDate && !afDate);

  const mine = senderId === _id;

  const showAvatar = !mine && (after || !afDate);

  return [margin, marginMessage, bottom, both, mine, showAvatar, time];
};
