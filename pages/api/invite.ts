import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'backend/middlewares/connectDB';
import inviteModel from 'backend/models/invite.model';
import connectionModel from 'backend/models/connection.model';
import userModel from 'backend/models/user.model';
import messageModel from 'backend/models/message.model';
import { pusher } from 'common/lib/pusher';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);

  try {
    const { inviteId } = req.body;
    const inviteFound = await inviteModel.findById(inviteId);

    switch (req.method) {
      case 'GET':
        const your = req.query['your'];

        if (your) {
          const invites = await inviteModel.find({ from: _id });
          return res.json(invites);
        }

        const invites = await inviteModel.find({ to: _id });

        return res.json(invites);
      case 'POST':
        const { to } = req.body;

        const found = await inviteModel.findOne({ from: _id, to });
        const foundConnection = await connectionModel.findOne({
          users: { $all: [_id, to] },
          group: false,
        });

        if (found || foundConnection) return res.status(200).end();

        const invite = new inviteModel({ from: _id, to });
        await invite.save();

        return res.status(201).json(invite);
      case 'PATCH':
        if (inviteFound?.to.toString() === _id) {
          const fromUser = await userModel.findOne({
            _id: inviteFound.from,
          });
          const toUser = await userModel.findOne({ _id: inviteFound.to });

          const newConnection = new connectionModel({
            users: [fromUser?._id, toUser?._id],
            group: false,
            blocked: {
              yes: false,
              by: null,
            },
          });

          const newMessage = new messageModel({
            administrate: true,
            connectionId: newConnection._id,
            sender: _id,
            message: 'created conversation',
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
          await inviteFound.delete();

          return res.status(201).json(newConnection);
        }

        return res.status(400).end();

      case 'DELETE':
        if (
          inviteFound?.to.toString() === _id ||
          inviteFound?.from.toString() === _id
        ) {
          await inviteFound.delete();

          return res.end();
        }
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
