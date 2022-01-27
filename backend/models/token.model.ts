import mongoose from 'mongoose';

export interface TokenType {
  token: string;
  expireAt?: Date;
}

const tokenSchema = new mongoose.Schema<TokenType>({
  token: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: new Date(),
  },
});

const tokenModel =
  (mongoose.models.Token as mongoose.Model<TokenType>) ||
  mongoose.model<TokenType>('Token', tokenSchema);

export default tokenModel;
