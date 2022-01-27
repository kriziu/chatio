export const isReadByMe = (msg: MessageType, _id: string): boolean => {
  let isReadByMe = false;
  msg?.read?.forEach(tempUs => {
    if (tempUs._id === _id) isReadByMe = true;
  });

  return isReadByMe;
};
