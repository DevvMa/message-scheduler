import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    birthday: Date;
    timezone: string;
    email: string;
}

const userSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthday: { type: Date, required: true },
  timezone: { type: String, required: true },
  email: { type: String, required: true }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
