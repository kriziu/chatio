import jwt from 'jsonwebtoken';

export const generateAccess = (user: UserType) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '30s',
  });
};
