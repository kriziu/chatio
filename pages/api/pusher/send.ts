import { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';

import { pusher } from 'lib/pusher';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as {
    _id: string;
  };
  const { message, connectionId } = req.body;

  const connection = await connectionModel.findById(connectionId);

  if (connection?.blocked.yes || !connection?.users?.includes(_id)) {
    return res.status(403).end();
  }

  const newMessage = new messageModel({
    connectionId,
    sender: _id,
    message,
    date: new Date(),
    read: [_id],
  });

  const msg = await newMessage.populate('sender');
  await msg.populate('read');

  await pusher.trigger(`presence-${connectionId}`, 'new_msg', msg);
  await newMessage.save();

  res.json({ message: 'completed' });
};

export default handler;
