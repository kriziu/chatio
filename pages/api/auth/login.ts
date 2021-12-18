import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';

import connectDB from 'middlewares/connectDB';
import userModel from 'models/user.model';
import tokenModel from 'models/token.model';
import { generateRefresh, week } from 'lib/generateTokens';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).end();
    }

    if (await bcrypt.compare(password, user.password)) {
      const { fName, lName, _id, email } = user;
      const token = generateRefresh({ fName, lName, _id, email });

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
