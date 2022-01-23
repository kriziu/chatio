import type { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';
import { pusher } from 'lib/pusher';

import connectDB from 'middlewares/connectDB';
import messageModel from 'models/message.model';
import userModel from 'models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { connectionId } = req.query;
  const message: MessageType = req.body.msg;

  try {
    if (message.sender._id === _id) return res.status(403).end();

    const messages = await messageModel.updateMany(
      {
        connectionId,
        date: { $lte: message.date },
        read: { $ne: _id },
      },
      {
        $push: {
          read: _id,
        },
      }
    );

    if (!messages.acknowledged) {
      return res.status(500).end();
    }

    const readMessages = await messageModel
      .find({
        connectionId,
        date: { $lte: message.date },
      })
      .populate({ path: 'sender read', model: userModel });

    await pusher.trigger(
      `presence-${connectionId}`,
      'read_msg',
      readMessages[readMessages.length - 1]
    );
    return res.status(200).json(readMessages[readMessages.length - 1]);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
