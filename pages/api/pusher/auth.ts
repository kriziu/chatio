import { NextApiRequest, NextApiResponse } from 'next';

import jwt from 'jsonwebtoken';

import { pusher } from 'lib/pusher';
import connectDB from 'middlewares/connectDB';
import connectionModel from 'models/connection.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { socket_id, channel_name } = req.body;
  const { ACCESS } = req.cookies;
  const { _id, fName, lName } = jwt.decode(ACCESS) as {
    _id: string;
    fName: string;
    lName: string;
  };

  const randomString = Math.random().toString(36).slice(2);

  const presenceData = {
    user_id: randomString,
    user_info: {
      username: fName + ' ' + lName,
    },
  };

  try {
    const connection = await connectionModel.findById(
      (channel_name as string).slice(8)
    );

    let access = false;
    connection?.users.forEach(user => {
      if (user._id.toString() === _id) access = true;
    });

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
