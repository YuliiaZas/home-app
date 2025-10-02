import { Document, Schema, model } from 'mongoose';
import { VALIDATION } from '@constants';
import { type IInstrument } from '@models';
import { AppError, AppValidationError, validateInstrumentData } from '@utils';

export interface IUserInstrument extends Document {
  userId: Schema.Types.ObjectId;
  instrumentId: Schema.Types.ObjectId;
  aliasLabel?: string;
  dashboards: Schema.Types.ObjectId[];
  state?: boolean;
  value?: {
    amount: number | string | boolean;
    unit: string | null;
  };
}

const userInstrumentSchema = new Schema<IUserInstrument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  instrumentId: {
    type: Schema.Types.ObjectId,
    ref: 'Instrument',
    required: true,
  },

  aliasLabel: {
    type: String,
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('"aliasId"', VALIDATION.LENGTH.ALIAS_MAX),
    trim: true,
  },

  dashboards: [{ type: Schema.Types.ObjectId, ref: 'Dashboard' }],

  state: Boolean,

  value: {
    amount: Schema.Types.Mixed,
    unit: {
      type: String,
      maxlength: VALIDATION.ARRAY.MAX_LENGTH('"value.unit"', VALIDATION.LENGTH.UNIT_MAX),
      trim: true,
    },
  },
});

userInstrumentSchema.pre('validate', async function (next) {
  const Instrument = this.model('Instrument');
  const instrument = await Instrument.findById<IInstrument>(this.instrumentId);

  if (!instrument) {
    return next(new AppError(`Invalid instrument reference ${this.instrumentId}`, 404));
  }

  const error = validateInstrumentData(instrument.type, this.state, this.value);
  if (error) return next(new AppValidationError(error));
  
  next();
});

userInstrumentSchema.index({ userId: 1, instrumentId: 1 }, { unique: true });

export const UserInstrument = model('UserInstrument', userInstrumentSchema);
