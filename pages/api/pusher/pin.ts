import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'common/lib/pusher';
import messageModel from 'backend/models/message.model';
import connectionModel from 'backend/models/connection.model';
import checkAdmin from 'backend/middlewares/checkAdmin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { messageId } = req.query;

  const message = await messageModel.findById(messageId);

  if (!message) return res.status(404).end();

  const connection = await connectionModel.findById(message.connectionId);

  if (connection?.group) {
    const testConnection = await checkAdmin(req, message.connectionId);

    if (!testConnection) return res.status(403).end();
  }

  await pusher.trigger(`presence-${connection?._id}`, 'pin_msg', messageId);

  await message.updateOne({ pin: !message.pin });

  res.json({ message: 'completed' });
};

export default handler;
