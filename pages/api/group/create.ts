import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'middlewares/connectDB';
import jwt from 'jsonwebtoken';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { ids, name } = req.body;

  if (!_id) {
    return res.status(400).end();
  }

  try {
    const newConnection = new connectionModel({
      users: ids,
      name,
      imageURL: '-1',
      admins: [_id],
      group: true,
      blocked: {
        yes: false,
        by: null,
      },
    });

    await newConnection.save();

    return res.status(201).json(newConnection);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
