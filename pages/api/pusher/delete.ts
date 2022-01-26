import { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';

import { pusher } from 'lib/pusher';
import messageModel from 'models/message.model';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { connectionId } = req.query;
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };

  const connection = await connectionModel.findById(connectionId);

  if (!connection?.admins?.includes(_id) && connection?.group)
    res.status(403).end();

  await connection?.delete();
  await messageModel.deleteMany({ connectionId });

  await pusher.trigger(`presence-${connectionId}`, 'delete_connection', {});

  res.json({ message: 'completed' });
};

export default handler;
