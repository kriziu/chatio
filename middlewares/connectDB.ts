import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

const { DB_PASS } = process.env;

export default (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (mongoose.connection.readyState === 0) {
      mongoose.connect(
        `mongodb+srv://root:${DB_PASS}@main.hkwom.mongodb.net/chamee?retryWrites=true&w=majority`,
        () => console.log('Connected to database')
      );
    }

    return handler(req, res);
  };
