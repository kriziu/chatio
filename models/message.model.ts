import mongoose from 'mongoose';
import { userSchema } from './user.model';

const messageSchema = new mongoose.Schema<MessageType>({
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
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
  },
  pin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const messageModel =
  (mongoose.models.Message as mongoose.Model<MessageType>) ||
  mongoose.model<MessageType>('Message', messageSchema);

export default messageModel;
