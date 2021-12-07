import jwt from 'jsonwebtoken';

export const week = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);

export const generateRefresh = (user: UserType) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: '7d',
  });
};
