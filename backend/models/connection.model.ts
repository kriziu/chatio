import mongoose from 'mongoose';

export type ConnectionModelType = Omit<
  CConnectionType,
  'users' | 'admins' | 'blocked'
> & {
  users: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  blocked: {
    by: mongoose.Types.ObjectId | null;
    yes: boolean;
  };
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
    by: { type: mongoose.Schema.Types.ObjectId },
    yes: { type: Boolean, required: true },
  },
});

const connectionModel =
  (mongoose.models.Connection as mongoose.Model<ConnectionModelType>) ||
  mongoose.model<ConnectionModelType>('Connection', connectionSchema);

export default connectionModel;
