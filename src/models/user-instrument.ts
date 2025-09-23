import { Document, Schema, model } from 'mongoose';

export interface IUserInstrument extends Document {
  userId: string;
  instrumentId: string;
  dashboards: string[];
  state?: boolean;
  value?: {
    amount: number | string | boolean;
    unit: string;
  };
}

const userInstrumentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  instrumentId: {
    type: Schema.Types.ObjectId,
    ref: 'Instrument',
    required: true,
  },
  dashboards: [{ type: Schema.Types.ObjectId, ref: 'Dashboard' }],
  state: Boolean,
  value: {
    amount: Schema.Types.Mixed,
    unit: String,
  },
});

export const UserInstrument = model('UserInstrument', userInstrumentSchema);
