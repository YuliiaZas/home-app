import { Document, Schema, model } from 'mongoose';
import { VALIDATION } from '@constants';
import { AppValidationError, validateInstrumentData } from '@utils';

export interface IInstrument extends Document {
  type: 'sensor' | 'device';
  icon: string;
  label: string;
  aliasId?: string;
  state?: boolean;
  value?: {
    amount: number | string | boolean;
    unit: string | null;
  };
}

const instrumentSchema = new Schema<IInstrument>({
  type: { 
    type: String, 
    enum: {
      values: ['sensor', 'device'],
      message: '{VALUE} is not a valid instrument type. Must be "sensor" or "device"'
    },
    required: VALIDATION.ARRAY.REQUIRED("Type"),
  },

  icon: { 
    type: String, 
    required: VALIDATION.ARRAY.REQUIRED("Icon"),
    minlength: VALIDATION.ARRAY.MIN_LENGTH("Icon", VALIDATION.LENGTH.ICON_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Icon", VALIDATION.LENGTH.ICON_MAX),
    trim: true,
  },

  label: { 
    type: String, 
    required: VALIDATION.ARRAY.REQUIRED("Label"),
    minlength: VALIDATION.ARRAY.MIN_LENGTH("Label", VALIDATION.LENGTH.LABEL_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Label", VALIDATION.LENGTH.LABEL_MAX),
    trim: true,
  },

  aliasId: { 
    type: String, 
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Alias Id", VALIDATION.LENGTH.ALIAS_ID_MAX),
    match: VALIDATION.ARRAY.PATTERN("Alias Id", VALIDATION.PATTERN.ALIAS_ID),
    trim: true,
  },

  state: { type: Boolean },

  value: {
    amount: Schema.Types.Mixed,
    unit: {
      type: String,
      maxlength: VALIDATION.ARRAY.MAX_LENGTH("Unit", VALIDATION.LENGTH.UNIT_MAX),
      trim: true,
    },
  },
});

instrumentSchema.index(
  { aliasId: 1 },
  { unique: true, partialFilterExpression: { aliasId: { $exists: true } } }
);

instrumentSchema.pre("validate", function (next) {
  const error = validateInstrumentData(this.type, this.state, this.value);
  if (error) return next(new AppValidationError(error));
  next();
});

export const Instrument = model('Instrument', instrumentSchema);
