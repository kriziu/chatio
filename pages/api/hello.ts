import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middlewares/connectDB';
import userModel from '../../models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ hi: 'hi' });
};

export default connectDB(handler);
