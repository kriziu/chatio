import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from '../../../middlewares/connectDB';
import userModel from '../../../models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { _id } = req.query;

  console.log(_id);

  try {
    const user = await userModel.findById(_id).select('-email');

    if (!user) {
      return res.status(404).end();
    }

    return res.status(200).json(user);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
