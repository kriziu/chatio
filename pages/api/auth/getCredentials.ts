import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const auth = req.cookies['jwt'];

  const decoded = jwt.decode(auth) as {
    fName: string;
    lName: string;
    email: string;
    iat: number;
    exp: number;
  };

  return res.json(decoded);
};
