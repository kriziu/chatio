export {};
// import type { NextApiRequest, NextApiResponse } from 'next';

// import jwt from 'jsonwebtoken';
// import cloudinary from 'cloudinary';
// import fs from 'fs';
// import formidable from 'formidable';

// import connectDB from 'middlewares/connectDB';
// import userModel from 'models/user.model';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const { ACCESS } = req.cookies;
//   const { _id } = jwt.decode(ACCESS) as { _id: string };

//   try {
//     const user = await userModel.findById(_id).select('-email');

//     if (!user) {
//       return res.status(404).end();
//     }

//     const form = new formidable.IncomingForm();

//     form.parse(req, async (err, fields, files) => {
//       const file = files.file;
//       // const data = fs.readFileSync(file.path);
//       // fs.writeFileSync(`./public/${file.name}`, data);
//       // await fs.unlinkSync(file.path);
//       // return;

//       cloudinary.v2.uploader.upload(file);
//     });

//     return res.status(200).json(user);
//   } catch (err) {
//     const msg = (err as Error).message;
//     console.log(msg);
//     if (msg) return res.status(500).send({ error: msg });
//     res.status(500).end();
//   }
// };

// export default connectDB(handler);
