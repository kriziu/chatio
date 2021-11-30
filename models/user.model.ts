import mongoose from 'mongoose';
import { validateEmail } from '../lib/utility';

const userSchema = new mongoose.Schema({
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

const userModel = mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;
