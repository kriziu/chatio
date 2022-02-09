import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'common/lib/pusher';
import messageModel from 'backend/models/message.model';
import checkAdmin from 'backend/middlewares/checkAdmin';
import connectionModel from 'backend/models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { connectionId } = req.query;

  const connection = await connectionModel.findById(connectionId);

  if (!connection) {
    return res.status(404).end();
  }
  console.log(connection);
  if (connection?.group) {
    const testConnection = await checkAdmin(req, connectionId as string);

    if (!testConnection) return res.status(403).end();
  }

  await connection.delete();
  await messageModel.deleteMany({ connectionId });

  await pusher.trigger(`presence-${connectionId}`, 'delete_connection', {});

  res.json({ message: 'completed' });
};

export default handler;
