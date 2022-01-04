import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'lib/pusher';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { messageId } = req.query;

  const message = await messageModel.findById(messageId);

  if (!message) return res.status(404).end();

  const connection = await connectionModel.findById(message.connectionId);

  await pusher.trigger(`presence-${connection?._id}`, 'pin_msg', messageId);

  await message.updateOne({ pin: !message.pin });

  res.json({ message: 'completed' });
};

export default handler;
