import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'common/lib/pusher';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { connectionId } = req.body;
  const _id = getUserId(req);

  await pusher.trigger(`presence-${connectionId}`, 'online', _id);
  res.json({ message: 'completed' });
};

export default handler;
