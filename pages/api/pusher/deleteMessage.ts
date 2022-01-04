import { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';
import { pusher } from 'lib/pusher';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { messageId } = req.query;

  const message = await messageModel.findById(messageId);

  if (message?.sender._id.toString() !== _id) {
    return res.status(403).end();
  }

  const connection = await connectionModel.findById(message.connectionId);

  await pusher.trigger(`presence-${connection?._id}`, 'delete_msg', messageId);

  await message.updateOne({ deleted: true, message: '' });

  res.json({ message: 'completed' });
};

export default handler;
