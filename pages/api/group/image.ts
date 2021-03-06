import type { NextApiRequest, NextApiResponse } from 'next';

import formidable from 'formidable';
import cloudinary from 'cloudinary';

import connectDB from 'backend/middlewares/connectDB';
import messageModel from 'backend/models/message.model';
import userModel from 'backend/models/user.model';
import { pusher } from 'common/lib/pusher';
import checkAdmin from 'backend/middlewares/checkAdmin';
import getUserId from 'backend/middlewares/getUserId';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);
  const { connectionId } = req.query;

  try {
    const connection = await checkAdmin(req, connectionId as string);
    if (!connection) return res.status(403).end();

    const form = new formidable.IncomingForm({
      keepExtensions: true,
    });

    return form.parse(req, async (err, fields, files) => {
      const path = (files.image as any).filepath;

      const oldId = connection.imageURL;

      if (oldId !== '-1' && oldId)
        await cloudinary.v2.uploader.destroy(oldId.slice(60, 80));

      return await cloudinary.v2.uploader.upload(
        path,
        { transformation: { width: 200, height: 200, crop: 'fill' } },
        async (error: any, result: any) => {
          if (error) return res.status(500).send({ error });

          const url = result.secure_url;

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

          await pusher.trigger(
            `presence-${connectionId}`,
            'new_msg',
            newMessage
          );

          await connection.updateOne({ imageURL: url });
          return res.json({ url });
        }
      );
    });
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
