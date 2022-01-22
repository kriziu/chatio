import type { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';

import connectDB from 'middlewares/connectDB';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { connectionId, latest, chunkTopId, chunkBotId, pinned } = req.query;

  try {
    const connection = await connectionModel.findById(connectionId);

    if (!connection?.users.includes(_id)) return res.status(403).end();

    if (pinned) {
      const messages = await messageModel.find({ connectionId, pin: true });

      return res.status(200).json(messages);
    }

    const message = chunkTopId
      ? await messageModel.findById(chunkTopId)
      : chunkBotId
      ? await messageModel.findById(chunkBotId)
      : await messageModel.findOne({}, {}, { sort: { _id: -1 }, limit: 1 });

    if (!message) {
      return res.end();
    }

    const messages = await messageModel
      .find(
        {
          connectionId,
          date: chunkBotId
            ? { $gt: message.date }
            : chunkTopId
            ? { $lt: message.date }
            : { $lte: message.date },
        },
        {},
        { sort: { _id: chunkBotId ? 1 : -1 }, limit: latest ? 1 : 100 }
      )
      .populate('sender read');

    !chunkBotId && messages.reverse();

    return res.status(200).json(messages);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
