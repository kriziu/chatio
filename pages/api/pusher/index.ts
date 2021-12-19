import { NextApiRequest, NextApiResponse } from 'next';

import { pusher } from 'lib/pusher';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { message, sender, connectionId } = req.body;

  const response = await pusher.trigger(`private-${connectionId}`, 'new_msg', {
    message,
    sender,
  });

  res.json({ message: 'completed' });
};

export default handler;
