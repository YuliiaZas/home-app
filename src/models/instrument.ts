import { Document, Schema, model } from 'mongoose';

export interface IInstrument extends Document {
  type: string;
  icon: string;
  label: string;
  alias?: string;
  state?: boolean;
  value?: {
    amount: number | string | boolean;
    unit: string;
  };
}

const InstrumentSchema = new Schema<IInstrument>({
  type: { type: String, enum: ['sensor', 'device'], required: true },
  icon: String,
  label: String,
  alias: String,
  state: Boolean, // only for "device"
  value: {
    amount: Schema.Types.Mixed,
    unit: String,
  }, // only for "sensor"
});

export const Instrument = model('Instrument', InstrumentSchema);
