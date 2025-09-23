import { Document, Schema, SchemaDefinition, model } from 'mongoose';

export interface IDashboard extends Document, IDashboardData {}

export interface IDashboardData {
  ownerUserId: Schema.Types.ObjectId;
  title: string;
  icon: string;
  alias?: string;
  tabs: ITab[];
}

export interface ITab {
  title: string;
  alias?: string;
  cards: ICard[];
}

export interface ICard {
  title: string;
  alias?: string;
  layout: string;
  items: string[];
}

export const dashboardSchemaDefinition: SchemaDefinition = {
  title: String,
  icon: String,
  alias: String,
  tabs: [
    {
      title: String,
      alias: String,
      cards: [
        {
          title: String,
          alias: String,
          layout: {
            type: String,
            enum: ['verticalLayout', 'horizontalLayout', 'singleInstrument'],
            required: true,
          },
          items: [{ type: Schema.Types.ObjectId, ref: 'Instrument', required: true }],
        },
      ],
    },
  ],
};

const dashboardSchema = new Schema<IDashboard>({
  ...dashboardSchemaDefinition,
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Dashboard = model('Dashboard', dashboardSchema);
