import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

const getUserId = (req: NextApiRequest): string => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };

  return _id;
};

export default getUserId;
