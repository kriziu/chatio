import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'common/lib/pusher';
import checkAdmin from 'backend/middlewares/checkAdmin';
import getUserId from 'backend/middlewares/getUserId';
import connectionModel from 'backend/models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);
  const { connectionId } = req.query;

  const connection = await connectionModel.findById(connectionId);

  if (!connection) {
    return res.status(404).end();
  }

  if (connection?.group) {
    const testConnection = await checkAdmin(req, connectionId as string);

    if (!testConnection) return res.status(403).end();
  }

  if (connection.blocked.yes) {
    if (connection.blocked.by?.equals(_id)) {
      await connection.updateOne({
        blocked: { yes: false, by: null },
      });
      await pusher.trigger(`presence-${connectionId}`, 'block_connection', {});

      return res.json({ message: 'completed' });
    } else return res.status(403).end();
  }

  await connection.updateOne({
    blocked: { yes: true, by: _id },
  });
  await pusher.trigger(`presence-${connectionId}`, 'block_connection', {});

  res.json({ message: 'completed' });
};

export default handler;
