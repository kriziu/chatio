import mongoose from 'mongoose';
import { validateEmail } from 'common/lib/validators';

interface UserModelType extends UserType {
  password: string;
}

export const userSchema = new mongoose.Schema<UserType>({
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
  imageURL: {
    type: String,
    required: true,
  },
});

const userPasswordSchema = new mongoose.Schema<UserModelType>({
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userPasswordSchema.add(userSchema);

const userModel =
  (mongoose.models.User as mongoose.Model<UserModelType>) ||
  mongoose.model<UserModelType>('User', userPasswordSchema);

export default userModel;
