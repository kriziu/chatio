import mongoose from 'mongoose';
import { userSchema } from './user.model';

const messageSchema = new mongoose.Schema<MessageDBType>({
  connectionId: {
    type: String,
    required: true,
  },
  sender: {
    type: userSchema,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
    default: new Date(),
  },
  read: {
    type: Boolean,
    required: true,
  },
});

const messageModel =
  (mongoose.models.Message as mongoose.Model<MessageDBType>) ||
  mongoose.model<MessageDBType>('Message', messageSchema);

export default messageModel;
