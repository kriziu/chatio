import mongoose from 'mongoose';

type ConnectionModelType = Omit<CConnectionType, 'users' | 'admins'> & {
  users: string[];
  admins: string[];
};

const connectionSchema = new mongoose.Schema<ConnectionModelType>({
  name: {
    type: String,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  imageURL: {
    type: String,
  },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  group: { type: Boolean, require: true },
  blocked: {
    by: { type: String },
    yes: { type: Boolean, required: true },
  },
});

const connectionModel =
  (mongoose.models.Connection as mongoose.Model<ConnectionModelType>) ||
  mongoose.model<ConnectionModelType>('Connection', connectionSchema);

export default connectionModel;
