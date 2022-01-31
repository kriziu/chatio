import type { NextApiRequest, NextApiResponse } from 'next';

import formidable from 'formidable';
import cloudinary from 'cloudinary';

import connectDB from 'backend/middlewares/connectDB';
import userModel from 'backend/models/user.model';
import getUserId from 'backend/middlewares/getUserId';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const _id = getUserId(req);

  try {
    const user = await userModel.findById(_id);

    if (!user) {
      return res.status(404).end();
    }

    switch (req.method) {
      case 'POST':
        const form = new formidable.IncomingForm({
          keepExtensions: true,
        });

        return form.parse(req, async (err, fields, files) => {
          const path = (files.image as any).filepath;

          const oldId = user.imageURL;

          if (oldId !== '-1' && oldId)
            await cloudinary.v2.uploader.destroy(oldId.slice(60, 80));

          return await cloudinary.v2.uploader.upload(
            path,
            { transformation: { width: 200, height: 200, crop: 'fill' } },
            async (error: any, result: any) => {
              if (error) return res.status(500).send({ error });

              const url = result.secure_url;

              await user.updateOne({ imageURL: url });
              return res.json({ url });
            }
          );
        });
      case 'GET':
        return res.json({ url: user.imageURL });
    }
  } catch (err) {
    const msg = (err as Error).message;
    console.log(msg);
    if (msg) return res.status(500).send({ error: msg });
    res.status(500).end();
  }
};

export default connectDB(handler);
