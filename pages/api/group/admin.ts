import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'backend/middlewares/connectDB';
import jwt from 'jsonwebtoken';
import connectionModel from 'backend/models/connection.model';
import messageModel from 'backend/models/message.model';
import { pusher } from 'common/lib/pusher';
import userModel from 'backend/models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };
  const { adminId, connectionId } = req.body;

  if (!_id) {
    return res.status(400).end();
  }

  try {
    const connection = await connectionModel.findOne({
      _id: connectionId,
      group: true,
    });

    if (!connection) return res.status(400).end();

    if (!connection.admins.includes(_id)) return res.status(403).end();

    const newMessage = new messageModel({
      administrate: true,
      connectionId,
      sender: _id,
      message: 'made changes to the group',
      date: new Date(),
      read: [_id],
    });

    await (
      await newMessage.save()
    ).populate({ path: 'sender', model: userModel });
    await pusher.trigger(`presence-${connectionId}`, 'new_msg', newMessage);

    if (connection.admins.includes(adminId)) {
      await connection.updateOne({ $pull: { admins: adminId } });

      return res.json(connection);
    }

    await connection.updateOne({ $push: { admins: adminId } });

    await newMessage.save();

    return res.json(connection);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
