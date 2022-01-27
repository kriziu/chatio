import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema<InviteType>({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const inviteModel =
  (mongoose.models.Invite as mongoose.Model<InviteType>) ||
  mongoose.model<InviteType>('Invite', inviteSchema);

export default inviteModel;
