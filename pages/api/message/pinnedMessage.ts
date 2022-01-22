import type { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';

import connectDB from 'middlewares/connectDB';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { connectionId, messageId } = req.query;

  console.log(messageId);

  try {
    const connection = await connectionModel.findById(connectionId);

    if (!connection?.users.includes(_id)) return res.status(403).end();

    const message = await messageModel
      .findById(messageId)
      .populate('sender read');

    if (!message) {
      return res.status(404).end();
    }

    const bottomMessages = await messageModel
      .find(
        {
          connectionId,
          date: { $gt: message.date },
        },
        {},
        { sort: { _id: 1 }, limit: 50 }
      )
      .populate('sender read');

    const topMessages = await messageModel
      .find(
        {
          connectionId,
          date: { $lt: message.date },
        },
        {},
        { sort: { _id: -1 }, limit: 49 }
      )
      .populate('sender read');
    topMessages.reverse();

    const messages = [...topMessages, message, ...bottomMessages];

    return res.status(200).json(messages);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
