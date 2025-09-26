import bcrypt from 'bcrypt';
import { VALIDATION } from '@constants';
import { Schema, model, Document, Model } from 'mongoose';
import { AppValidationError } from '@utils';

export interface IUserInput {
  userName: string;
  passwordHash: string;
  fullName: string;
  tokenVersion: number;
  _password?: string; // Virtual field for plain text password
}
export interface IUser extends IUserInput, Document {}

export interface IUserModel extends Model<IUser> {
  authenticate(userName: string, password: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>({
  userName: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED("Username"),
    unique: true,
    minlength: VALIDATION.ARRAY.MIN_LENGTH("Username", VALIDATION.LENGTH.USERNAME_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Username", VALIDATION.LENGTH.USERNAME_MAX),
    trim: true,
  },

  passwordHash: { 
    type: String,
    required: function(this: IUser) {
      return !this._password;
    },
    select: false
  },

  fullName: {
    type: String,
    minlength: VALIDATION.ARRAY.MIN_LENGTH("Full name", VALIDATION.LENGTH.FULL_NAME_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Full name", VALIDATION.LENGTH.FULL_NAME_MAX),
    trim: true,
  },

  tokenVersion: { type: Number, default: 1 },
});

userSchema.virtual('password')
  .set(function(this: IUser, password: string) {
    this._password = password;
  })
  .get(function(this: IUser) {
    return this._password;
  });

userSchema.pre('validate', function(this: IUser, next) {
  if (this.isNew || this.isModified('password')) {
    if (!this._password) {
      return next(new AppValidationError("Password is required"));
    }
    if (!VALIDATION.PATTERN.PASSWORD.test(this._password)) {
      return next(new AppValidationError(
        VALIDATION.MESSAGES.PATTERN('Password', VALIDATION.PATTERN.PASSWORD)
      ));
    }
  }
  next();
});

userSchema.pre('save', async function(this: IUser, next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password') && !this._password) {
    return next();
  }

  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(this._password!, saltRounds);
    this.passwordHash = hashedPassword;
    
    // Clear the plain text password!!!
    this._password = undefined;
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.statics.authenticate = async function(userName: string, password: string): Promise<IUser | null> {
  const user: IUser = await this.findOne<IUser>({ userName: new RegExp(`^${userName}$`, "i") }).select('+passwordHash');
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return null;

  return user.toObject();
};

userSchema.virtual("computedInitials").get(function (this: IUser) {
  const name = this.fullName || this.userName;
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.map((p) => p[0]).join("").toUpperCase();
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_, returnedUser) => {
    returnedUser.initials = returnedUser.computedInitials;
    delete returnedUser.passwordHash;
    delete returnedUser._password;
    return returnedUser;
  },
});

userSchema.set('toObject', {
  virtuals: false,
  transform: (_, returnedUser) => {
    delete returnedUser.passwordHash;
    delete returnedUser._password;
    return returnedUser;
  },
});

export const User = model<IUser, IUserModel>('User', userSchema);
