import type { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';

import connectDB from 'middlewares/connectDB';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { connectionId, latest, chunkId } = req.query;

  try {
    const connection = await connectionModel.findById(connectionId);

    let forbidden = true;
    connection?.users.forEach(user => {
      if (user._id.toString() === _id) forbidden = false;
    });

    if (forbidden) return res.status(403).end();

    const message = chunkId
      ? await messageModel.findById(chunkId)
      : await messageModel.findOne({}, {}, { sort: { _id: -1 }, limit: 1 });

    if (!message) {
      return res.status(404).end();
    }

    const messages = await messageModel.find(
      {
        connectionId,
        date:
          latest || !chunkId ? { $lte: message.date } : { $lt: message.date },
      },
      {},
      { sort: { _id: -1 }, limit: latest ? 1 : 100 }
    );

    messages.reverse();

    return res.status(200).json(messages);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
