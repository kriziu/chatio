import type { NextApiRequest, NextApiResponse } from 'next';

import { Document } from 'mongoose';
import jwt from 'jsonwebtoken';

import connectDB from 'middlewares/connectDB';
import userModel from 'models/user.model';
import connectionModel from 'models/connection.model';
import inviteModel from 'models/invite.model';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let { email, name } = req.query;
  const { ACCESS } = req.cookies;
  const { _id } = jwt.decode(ACCESS) as { _id: string };

  try {
    let users = [];

    const connections = await connectionModel.find({
      'users._id': _id,
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
            connection.users.forEach(userCon => {
              if (
                user.equals(
                  userCon as Document<any, any, UserType> &
                    UserType & {
                      _id: string;
                    }
                )
              )
                toReturn = false;
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
