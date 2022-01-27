import type { NextApiRequest, NextApiResponse } from 'next';

import bcrypt from 'bcrypt';
import connectDB from 'backend/middlewares/connectDB';
import userModel from 'backend/models/user.model';
import tokenModel from 'backend/models/token.model';
import { generateRefresh, week } from 'common/lib/generateTokens';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password, fName, lName } = req.body;

  try {
    const userWithEmail = await userModel.findOne({ email });
    if (userWithEmail) return res.status(409).end();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      email,
      password: hashedPassword,
      fName,
      lName,
      imageURL: '-1',
    });

    await user.save();

    const token = generateRefresh({
      fName,
      lName,
      _id: user._id,
      email,
      imageURL: '-1',
    });

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
      .status(201)
      .end();
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
