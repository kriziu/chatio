import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'backend/middlewares/connectDB';
import messageModel from 'backend/models/message.model';
import { pusher } from 'common/lib/pusher';
import userModel from 'backend/models/user.model';
import checkAdmin from 'backend/middlewares/checkAdmin';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);
  const { adminId, connectionId } = req.body;

  try {
    const connection = await checkAdmin(req, connectionId);
    if (!connection) return res.status(403).end();

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
