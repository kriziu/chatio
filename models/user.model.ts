import mongoose from 'mongoose';
import { validateEmail } from '../lib/utility';

interface UserModelType extends UserType {
  password: string;
}

const userSchema = new mongoose.Schema<UserModelType>({
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
  (mongoose.models.User as mongoose.Model<UserModelType>) ||
  mongoose.model<UserModelType>('User', userSchema);

export default userModel;
