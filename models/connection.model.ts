import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const connectionSchema = new mongoose.Schema<CConnectionType>({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      autopopulate: true,
    },
  ],
  group: { type: Boolean, require: true },
  blocked: {
    by: { type: String },
    yes: { type: Boolean, required: true },
  },
});

connectionSchema.plugin(autopopulate);

const connectionModel =
  (mongoose.models.Connection as mongoose.Model<CConnectionType>) ||
  mongoose.model<CConnectionType>('Connection', connectionSchema);

export default connectionModel;
