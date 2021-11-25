import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

export default (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (mongoose.connection.readyState == 0) {
      mongoose.connect(
        `mongodb+srv://root:${'TFvJiWgCq3K7TvRa'}@cluster0.jghn2.mongodb.net/Cluster0?retryWrites=true&w=majority`
      );
    }

    return handler(req, res);
  };
