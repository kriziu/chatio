import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const getUserId = (req: NextApiRequest): mongoose.Types.ObjectId => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };

  return new mongoose.Types.ObjectId(_id);
};

export default getUserId;
