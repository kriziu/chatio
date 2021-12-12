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
    switch (req.method) {
      case 'GET':
        const invites = await inviteModel.find({ to: _id });

        return res.json(invites);
      case 'POST':
        const { to } = req.body;

        const invite = new inviteModel({ from: _id, to });
        await invite.save();

        return res.status(201).json(invite);
      case 'PATCH':
        const { inviteId } = req.body;
        console.log(inviteId);
        const inviteAccepted = await inviteModel.findById(inviteId);

        if (inviteAccepted) {
          const fromUser = await userModel.findOne({
            _id: inviteAccepted.from,
          });
          const toUser = await userModel.findOne({ _id: inviteAccepted.to });

          const newConnection = new connectionModel({
            users: [fromUser, toUser],
            group: false,
          });

          await newConnection.save();
          await inviteAccepted.delete();

          return res.status(201).json(newConnection);
        }
        return res.status(404).end();

      // case 'DELETE':
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
