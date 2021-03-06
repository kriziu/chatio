import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'backend/middlewares/connectDB';
import connectionModel from 'backend/models/connection.model';
import messageModel from 'backend/models/message.model';
import { pusher } from 'common/lib/pusher';
import userModel from 'backend/models/user.model';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);
  const { idsToAdd, idsToRemove, name, connectionId } = req.body;

  try {
    const connection = await connectionModel.findOne({
      _id: connectionId,
      group: true,
    });

    await connection?.updateOne({ $push: { users: idsToAdd } });

    if (!connection?.admins.includes(_id)) {
      const newMessage = new messageModel({
        administrate: true,
        connectionId,
        sender: _id,
        message: 'added users to the group',
        date: new Date(),
        read: [_id],
      });

      await (
        await newMessage.save()
      ).populate({ path: 'sender', model: userModel });

      await pusher.trigger(`presence-${connectionId}`, 'new_msg', newMessage);

      return res.json(connection);
    }

    await connection?.updateOne({
      $pullAll: { users: idsToRemove },
      name: !name ? connection.name : name,
    });

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

    return res.json(connection);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
