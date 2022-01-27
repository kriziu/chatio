import { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';
import { pusher } from 'common/lib/pusher';
import messageModel from 'backend/models/message.model';
import connectionModel from 'backend/models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { messageId } = req.query;

  const message = await messageModel.findById(messageId);

  if (message?.sender.toString() !== _id) {
    return res.status(403).end();
  }

  const connection = await connectionModel.findById(message.connectionId);

  await pusher.trigger(`presence-${connection?._id}`, 'delete_msg', messageId);

  await message.updateOne({ deleted: true, pin: false, message: '' });

  res.json({ message: 'completed' });
};

export default handler;
