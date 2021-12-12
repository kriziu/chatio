import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'middlewares/connectDB';
import tokenModel from 'models/token.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { refresh } = req.query;

  try {
    const token = await tokenModel.findOne({
      token: refresh,
    });

    if (!token) {
      return res.status(404).end();
    }

    return res.status(200).end();
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
