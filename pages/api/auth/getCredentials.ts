import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.cookies['jwt'];

  return jwt.verify(
    auth,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, user) => {
      if (err || user === undefined)
        return res
          .setHeader('Set-Cookie', 'jwt=; HttpOnly; Path=/; max-age=0')
          .status(204)
          .end();

      return res.status(200).json(user);
    }
  );
};
