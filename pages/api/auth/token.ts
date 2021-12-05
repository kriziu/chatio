import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from '../../../middlewares/connectDB';
import userModel from '../../../models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = await userModel.findOne({ email: 'brunodzi07@gmail.com' });

    if (!user) {
      return res.status(404).end();
    }

    return res.json(user);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
