import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'lib/pusher';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { connectionId } = req.query;

  await connectionModel.findByIdAndDelete(connectionId);
  await messageModel.deleteMany({ connectionId });

  await pusher.trigger(`presence-${connectionId}`, 'delete_connection', {});

  res.json({ message: 'completed' });
};

export default handler;
