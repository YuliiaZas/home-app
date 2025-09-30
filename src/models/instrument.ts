import { Document, Schema, model } from 'mongoose';
import { VALIDATION } from '@constants';
import { AppValidationError, validateInstrumentData } from '@utils';

export interface IInstrumentBase {
  type: 'sensor' | 'device';
  icon: string;
  label: string;
}

export interface IInstrumentInput extends IInstrumentBase {
  aliasId?: string;
  state?: boolean;
  value?: {
    amount: number | string | boolean;
    unit: string | null;
  };
}

export interface IInstrument extends Document, IInstrumentInput {}

const instrumentSchema = new Schema<IInstrument>({
  type: {
    type: String,
    enum: {
      values: ['sensor', 'device'],
      message: '{VALUE} is not a valid instrument type. Must be "sensor" or "device"',
    },
    required: VALIDATION.ARRAY.REQUIRED('"type"'),
  },

  icon: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED('"icon"'),
    minlength: VALIDATION.ARRAY.MIN_LENGTH('"icon"', VALIDATION.LENGTH.ICON_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('"icon"', VALIDATION.LENGTH.ICON_MAX),
    trim: true,
  },

  label: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED('"label"'),
    minlength: VALIDATION.ARRAY.MIN_LENGTH('"label"', VALIDATION.LENGTH.LABEL_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('"label"', VALIDATION.LENGTH.LABEL_MAX),
    trim: true,
  },

  aliasId: {
    type: String,
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('"aliasId"', VALIDATION.LENGTH.ALIAS_ID_MAX),
    match: VALIDATION.ARRAY.PATTERN('"aliasId"', VALIDATION.PATTERN.ALIAS_ID),
    trim: true,
  },

  state: { type: Boolean },

  value: {
    amount: Schema.Types.Mixed,
    unit: {
      type: String,
      maxlength: VALIDATION.ARRAY.MAX_LENGTH('"value.unit"', VALIDATION.LENGTH.UNIT_MAX),
      trim: true,
    },
  },
});

instrumentSchema.index({ aliasId: 1 }, { unique: true, partialFilterExpression: { aliasId: { $exists: true } } });

instrumentSchema.pre('validate', function (next) {
  const error = validateInstrumentData(this.type, this.state, this.value);
  if (error) return next(new AppValidationError(error));
  next();
});

export const Instrument = model('Instrument', instrumentSchema);
