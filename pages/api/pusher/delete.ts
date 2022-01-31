import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'common/lib/pusher';
import messageModel from 'backend/models/message.model';
import checkAdmin from 'backend/middlewares/checkAdmin';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { connectionId } = req.query;
  const _id = getUserId(req);

  const connection = await checkAdmin(req, connectionId as string);
  if (!connection) return res.status(403).end();

  await connection.delete();
  await messageModel.deleteMany({ connectionId });

  await pusher.trigger(`presence-${connectionId}`, 'delete_connection', {});

  res.json({ message: 'completed' });
};

export default handler;
