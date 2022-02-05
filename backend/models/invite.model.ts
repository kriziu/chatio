import mongoose, { ObjectId } from 'mongoose';

interface InviteModelType {
  from: ObjectId;
  to: ObjectId;
  date: Date;
}

const inviteSchema = new mongoose.Schema<InviteModelType>({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const inviteModel =
  (mongoose.models.Invite as mongoose.Model<InviteModelType>) ||
  mongoose.model<InviteModelType>('Invite', inviteSchema);

export default inviteModel;
