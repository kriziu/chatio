import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middlewares/connectDB';
import userModel from '../../models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

export default connectDB(handler);
