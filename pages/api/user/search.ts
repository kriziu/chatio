import type { NextApiRequest, NextApiResponse } from 'next';

import { Document } from 'mongoose';

import connectDB from 'backend/middlewares/connectDB';
import userModel from 'backend/models/user.model';
import connectionModel from 'backend/models/connection.model';
import inviteModel from 'backend/models/invite.model';
import getUserId from 'backend/middlewares/getUserId';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let { email, name } = req.query;
  const _id = getUserId(req);

  try {
    let users = [];

    const connections = await connectionModel.find({
      users: _id,
    });

    const invites = await inviteModel.find({
      $or: [{ to: _id }, { from: _id }],
    });

    if (email) {
      users = await userModel.find({ email }).select('-email');
    } else {
      if (!Array.isArray(name)) {
        name = name.split(' ');
      }

      name = name.join('|');
      const searchRgx = '.*' + name + '.*';

      users = await userModel
        .find({
          $or: [
            { fName: { $regex: searchRgx, $options: 'i' } },
            { lName: { $regex: searchRgx, $options: 'i' } },
          ],
        })
        .select('-email');
    }

    users = users.filter(
      (
        user: Document<any, any, UserType> &
          UserType & {
            _id: string;
          }
      ) => {
        let toReturn = !(_id === user._id.toString());

        if (toReturn)
          connections.forEach(connection => {
            !connection.group &&
              connection.users.forEach(userCon => {
                if (user._id.equals(userCon)) toReturn = false;
              });
          });

        if (toReturn) {
          invites.forEach(invite => {
            if (
              invite.to === user._id.toString() ||
              invite.from === user._id.toString()
            )
              toReturn = false;
          });
        }

        return toReturn;
      }
    );

    return res.json(users);
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
