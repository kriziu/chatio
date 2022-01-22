import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'lib/pusher';
import jwt from 'jsonwebtoken';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { connectionId } = req.body;
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as {
    _id: string;
  };

  await pusher.trigger(`presence-${connectionId}`, 'online', _id);
  res.json({ message: 'completed' });
};

export default handler;
