import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import connectDB from '../../../middlewares/connectDB';
import userModel from '../../../models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).end();
    }

    if (await bcrypt.compare(password, user.password)) {
      const { fName, lName } = user;

      const token = jwt.sign(
        { fName, lName, email },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '1h' }
      );

      return res
        .setHeader('Set-Cookie', `jwt=${token}; HttpOnly; Path=/`)
        .status(200)
        .json({ fName, lName, email });
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
