import { Document, Schema, model } from 'mongoose';
import { VALIDATION } from '@constants';
import { IInstrument } from '@models';
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

  if (instrument.type === 'device') {
    if (this.state === undefined) {
      this.state = instrument.state ?? false;
    }
    this.value = undefined;
  }

  if (instrument.type === 'sensor') {
    if (this.value === undefined || this.value.amount === undefined) {
      this.value = {
        amount: instrument.value?.amount ?? 0,
        unit: instrument.value?.unit ?? null,
      };
    }
    this.state = undefined;
  }

  const error = validateInstrumentData(instrument.type, instrument.state, instrument.value);
  if (error) return next(new AppValidationError(error));

  next();
});

export const UserInstrument = model('UserInstrument', userInstrumentSchema);
