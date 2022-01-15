import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const messageSchema = new mongoose.Schema<MessageType>({
  connectionId: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: true,
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
  deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

messageSchema.plugin(autopopulate);

const messageModel =
  (mongoose.models.Message as mongoose.Model<MessageType>) ||
  mongoose.model<MessageType>('Message', messageSchema);

export default messageModel;
