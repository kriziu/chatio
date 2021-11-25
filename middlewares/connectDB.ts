import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

export default (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (mongoose.connection.readyState == 0) {
      mongoose.connect(`mongodb://localhost:27017/chatio`, () =>
        console.log('Connected to database')
      );
    }

    return handler(req, res);
  };
