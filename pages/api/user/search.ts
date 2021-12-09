import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from '../../../middlewares/connectDB';
import userModel from '../../../models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let { email, name } = req.query;

  try {
    if (email) {
      const user = await userModel.findOne({ email }).select('-email');

      return res.status(200).json([user]);
    }

    if (!Array.isArray(name)) {
      name = name.split(' ');
    }

    name = name.join('|');
    const searchRgx = '.*' + name + '.*';

    const users = await userModel
      .find({
        $or: [
          { fName: { $regex: searchRgx, $options: 'i' } },
          { lName: { $regex: searchRgx, $options: 'i' } },
        ],
      })
      .select('-email');

    return res.status(200).json(users);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
