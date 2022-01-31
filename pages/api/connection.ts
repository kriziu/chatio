import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'backend/middlewares/connectDB';
import connectionModel from 'backend/models/connection.model';
import userModel from 'backend/models/user.model';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);

  if (!_id) {
    return res.status(400).end();
  }

  try {
    const connId = req.query['id'];

    switch (req.method) {
      case 'GET':
        if (connId) {
          const connection = await connectionModel.findById(connId);

          if (!connection) return res.status(404).end();

          if (!connection?.users?.includes(_id)) return res.status(403).end();

          await connection.populate({ path: 'users admins', model: userModel });

          return res.json(connection);
        }

        const connections = await connectionModel
          .find({ users: _id })
          .populate({ path: 'users admins', model: userModel });

        return res.json(connections);
      // case 'PATCH':
      //   break;

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
