import mongoose from 'mongoose';
import { userSchema } from './user.model';

const connectionSchema = new mongoose.Schema<CConnectionType>({
  users: [
    {
      type: userSchema,
      required: true,
    },
  ],
  group: { type: Boolean, require: true },
  blocked: {
    by: { type: String },
    yes: { type: Boolean, required: true },
  },
});

const connectionModel =
  (mongoose.models.Connection as mongoose.Model<CConnectionType>) ||
  mongoose.model<CConnectionType>('Connection', connectionSchema);

export default connectionModel;
