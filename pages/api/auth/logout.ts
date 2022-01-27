import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from 'backend/middlewares/connectDB';
import tokenModel from 'backend/models/token.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const refresh = req.cookies['REFRESH'];

  try {
    await tokenModel.findOneAndDelete({ refresh });

    return res
      .setHeader('Set-Cookie', [
        'REFRESH=; HttpOnly; Path=/;',
        'ACCESS=; Path=/;',
      ])
      .status(200)
      .json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

export default connectDB(handler);
