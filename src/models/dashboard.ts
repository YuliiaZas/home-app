import { Document, Schema, model } from 'mongoose';

export interface IDashboard extends Document {
  ownerUserId: string;
  title: string;
  icon: string;
  tabs: ITab[];
}

export interface ITab extends Document {
  title: string;
  cards: ICard[];
}

export interface ICard extends Document {
  title: string;
  layout: string;
  items: string[];
}

const dashboardSchema = new Schema<IDashboard>({
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  icon: String,
  tabs: [
    {
      title: String,
      cards: [
        {
          title: String,
          layout: { type: String, enum: ['verticalLayout', 'horizontalLayout', 'singleDevice'], required: true },
          items: [
            { type: Schema.Types.ObjectId, ref: 'Instrument', required: true },
          ],
        },
      ],
    },
  ],
});

export const Dashboard = model('Dashboard', dashboardSchema);
