import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

import connectDB from 'backend/middlewares/connectDB';
import userModel from 'backend/models/user.model';
import tokenModel from 'backend/models/token.model';
import { generateRefresh, week } from 'common/lib/generateTokens';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).end();
    }

    if (await bcrypt.compare(password, user.password)) {
      const { fName, lName, _id, email, imageURL } = user;
      const token = generateRefresh({ fName, lName, _id, email, imageURL });

      const savedToken = new tokenModel({
        token,
        expireAt: week,
      });
      await savedToken.save();

      return res
        .setHeader(
          'Set-Cookie',
          `REFRESH=${token};HttpOnly;Path=/;expires=${week};`
        )
        .status(200)
        .end();
    }

    return res.status(403).end();
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
