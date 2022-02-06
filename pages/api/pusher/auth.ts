import { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';

import { pusher } from 'common/lib/pusher';
import connectDB from 'backend/middlewares/connectDB';
import connectionModel from 'backend/models/connection.model';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { socket_id, channel_name } = req.body;
  const { ACCESS } = req.cookies;
  const _id = getUserId(req);
  const { fName, lName } = jwt.decode(ACCESS) as {
    fName: string;
    lName: string;
  };

  const presenceData = {
    user_id: _id.toString(),
    user_info: {
      username: fName + ' ' + lName,
    },
  };

  try {
    const connection = await connectionModel.findById(
      (channel_name as string).slice(9)
    );

    let access = connection?.users.includes(_id);

    if (access) {
      const auth = pusher.authenticate(socket_id, channel_name, presenceData);
      return res.send(auth);
    }

    return res.status(403).end();
  } catch (error) {
    console.error(error);
  }
};

export default connectDB(handler);
