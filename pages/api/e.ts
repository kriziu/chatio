import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('scroll12');

  res.json({ message: 'completed' });
};

export default handler;
