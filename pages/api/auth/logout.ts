import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middlewares/connectDB';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    res
      .setHeader('Set-Cookie', [
        'REFRESH=; HttpOnly; Path=/; max-age=0',
        'ACCESS=; Path=/; max-age=0',
      ])
      .status(200)
      .json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

export default connectDB(handler);
