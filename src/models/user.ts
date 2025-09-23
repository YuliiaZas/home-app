import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  userName: string;
  passwordHash: string;
  fullName: string;
  initials: string;
  tokenVersion: number;
}

const userSchema = new Schema<IUser>({
  userName: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: String,
  initials: String,
  tokenVersion: { type: Number, default: 1 },
});

userSchema.path('initials').set(function (this: IUser) {
  return getInitials(this.fullName || this.userName);
});

export const User = model('User', userSchema);

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
