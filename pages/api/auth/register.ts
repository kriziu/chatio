import type { NextApiRequest, NextApiResponse } from 'next';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectDB from '../../../middlewares/connectDB';
import userModel from '../../../models/user.model';

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

    const token = jwt.sign(
      { fName, lName, email, _id: user._id },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '72h' }
    );

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
