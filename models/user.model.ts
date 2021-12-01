import mongoose from 'mongoose';
import { validateEmail } from '../lib/utility';

export interface UserType {
  fName: string;
  lName: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<UserType>({
  fName: {
    type: String,
    required: true,
  },
  lName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: validateEmail,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

const userModel =
  (mongoose.models.User as mongoose.Model<UserType>) ||
  mongoose.model<UserType>('User', userSchema);

export default userModel;
