import type { NextApiRequest, NextApiResponse } from 'next';

import connectDB from 'middlewares/connectDB';
import jwt from 'jsonwebtoken';
import inviteModel from 'models/invite.model';
import connectionModel from 'models/connection.model';
import userModel from 'models/user.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };

  if (!_id) {
    return res.status(400).end();
  }

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
            users: [fromUser, toUser],
            group: false,
            blocked: {
              yes: false,
              by: null,
            },
          });

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
