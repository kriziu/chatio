import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'backend/middlewares/connectDB';
import connectionModel from 'backend/models/connection.model';
import getUserId from 'backend/middlewares/getUserId';
import messageModel from 'backend/models/message.model';
import userModel from 'backend/models/user.model';
import { pusher } from 'common/lib/pusher';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);
  const { ids, name } = req.body;

  try {
    const newConnection = new connectionModel({
      users: ids,
      name,
      imageURL: '-1',
      admins: [_id],
      group: true,
      blocked: {
        yes: false,
        by: null,
      },
    });

    const newMessage = new messageModel({
      administrate: true,
      connectionId: newConnection._id,
      sender: _id,
      message: 'created group',
      date: new Date(),
      read: [_id],
    });

    await (
      await newMessage.save()
    ).populate({ path: 'sender', model: userModel });

    await pusher.trigger(
      `presence-${newConnection._id}`,
      'new_msg',
      newMessage
    );

    await newConnection.save();

    return res.status(201).json(newConnection);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
