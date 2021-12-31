import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'lib/pusher';
import jwt from 'jsonwebtoken';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { connectionId } = req.query;

  const connection = await connectionModel.findById(connectionId);

  if (!connection) return res.status(404).end();

  if (connection.blocked.yes) {
    if (connection.blocked.by === _id) {
      await connection.update({
        blocked: { yes: false, by: null },
      });
      await pusher.trigger(`presence-${connectionId}`, 'block_connection', {});

      return res.json({ message: 'completed' });
    } else return res.status(403).end();
  }

  await connection.update({
    blocked: { yes: true, by: _id },
  });
  await pusher.trigger(`presence-${connectionId}`, 'block_connection', {});

  res.json({ message: 'completed' });
};

export default handler;
