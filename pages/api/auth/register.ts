import type { NextApiRequest, NextApiResponse } from 'next';

import bcrypt from 'bcrypt';
import connectDB from 'middlewares/connectDB';
import userModel from 'models/user.model';
import tokenModel from 'models/token.model';
import { generateRefresh, week } from 'lib/generateTokens';

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
    });

    await user.save();

    const token = generateRefresh({ fName, lName, _id: user._id, email });

    const savedToken = new tokenModel({
      token,
      expireAt: week,
    });
    await savedToken.save();

    return res
      .setHeader('Set-Cookie', `REFRESH=${token};HttpOnly ;Path=/`)
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
