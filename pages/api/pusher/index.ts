import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'lib/pusher';
import messageModel from 'models/message.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { message, sender, connectionId } = req.body;

  const newMessage = new messageModel({
    connectionId,
    sender,
    message,
    read: false,
  });

  await pusher.trigger(`private-${connectionId}`, 'new_msg', newMessage);
  await newMessage.save();

  res.json({ message: 'completed' });
};

export default handler;
