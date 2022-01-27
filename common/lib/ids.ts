export const getUserFromIds = (
  connection: CConnectionType,
  _id: string
): UserType => {
  const user = [...connection.users].filter(userF => userF._id !== _id)[0];

  return user;
};
