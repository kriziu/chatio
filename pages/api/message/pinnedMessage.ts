import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'backend/middlewares/connectDB';
import messageModel from 'backend/models/message.model';
import connectionModel from 'backend/models/connection.model';
import userModel from 'backend/models/user.model';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);
  const { connectionId, messageId } = req.query;

  console.log(messageId);

  try {
    const connection = await connectionModel.findById(connectionId);

    if (!connection?.users.includes(_id)) return res.status(403).end();

    const message = await messageModel
      .findById(messageId)
      .populate({ path: 'sender read', model: userModel });

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
      .populate({ path: 'sender read', model: userModel });

    const topMessages = await messageModel
      .find(
        {
          connectionId,
          date: { $lt: message.date },
        },
        {},
        { sort: { _id: -1 }, limit: 49 }
      )
      .populate({ path: 'sender read', model: userModel });
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
