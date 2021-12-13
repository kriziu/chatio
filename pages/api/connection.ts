import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'middlewares/connectDB';
import jwt from 'jsonwebtoken';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };

  if (!_id) {
    return res.status(400).end();
  }

  try {
    const connId = req.query['id'];

    switch (req.method) {
      case 'GET':
        if (connId) {
          const connection = await connectionModel.findById(connId);

          return res.json(connection);
        }

        const connections = await connectionModel.find({
          'users._id': _id,
        });

        return res.json(connections);
      // case 'PATCH':
      //   break;

      case 'DELETE':
        const connection = await connectionModel.findById(connId);

        await connection?.delete();

        return res.json(connection);
      default:
        return res.status(400).end();
    }
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
