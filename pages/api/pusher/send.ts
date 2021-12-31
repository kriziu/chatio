import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'lib/pusher';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { message, sender, connectionId } = req.body;

  const connection = await connectionModel.findById(connectionId);

  if (connection?.blocked.yes) {
    return res.status(403).end();
  }

  const newMessage = new messageModel({
    connectionId,
    sender,
    message,
    date: new Date(),
  });

  await pusher.trigger(`presence-${connectionId}`, 'new_msg', newMessage);
  await newMessage.save();

  res.json({ message: 'completed' });
};

export default handler;
