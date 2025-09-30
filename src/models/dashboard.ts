import { Document, Model, Query, Schema, SchemaDefinition, model } from 'mongoose';
import { VALIDATION } from '@constants';
import { AppValidationError, validateTabAliasIds } from '@utils';

export interface IDashboard extends IDashboardInput, Document {}

export interface IDashboardModel extends Model<IDashboard> {
  findByAliasId: (aliasId: string, userId: string) => Query<IDashboard | null, IDashboard>;
}

export interface IDashboardInput extends IDashboardBase {
  userId: Schema.Types.ObjectId;
}

export interface IDashboardBase {
  title: string;
  icon: string;
  aliasId: string;
  tabs: ITab[];
}

export interface ITab {
  _id?: string;
  title: string;
  aliasId: string;
  cards: ICard[];
}

export interface ICard {
  _id?: string;
  title?: string;
  layout: 'verticalLayout' | 'horizontalLayout' | 'singleInstrument';
  items: Schema.Types.ObjectId[];
}

const cardSchema = new Schema<ICard>({
  title: {
    type: String,
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('Card "title"', VALIDATION.LENGTH.TITLE_MAX),
    trim: true,
  },

  layout: {
    type: String,
    enum: ['verticalLayout', 'horizontalLayout', 'singleInstrument'],
    required: VALIDATION.ARRAY.REQUIRED('Card `layout"'),
  },

  items: [{ type: Schema.Types.ObjectId, ref: 'Instrument', required: true }],
});

cardSchema.pre('validate', function (next) {
  if (this.layout === 'singleInstrument' && this.items.length > 1) {
    return next(new AppValidationError('"singleInstrument" cards can only contain 1 item'));
  }
  if (this.layout === 'verticalLayout' && this.items.length > 4) {
    return next(new AppValidationError('"verticalLayout" cards can contain max 4 items'));
  }
  next();
});

const tabSchema = new Schema<ITab>({
  title: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED('Tab "title"'),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('Tab "title"', VALIDATION.LENGTH.TITLE_MAX),
    trim: true,
  },

  aliasId: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED('Tab "aliasId"'),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('Tab "aliasId"', VALIDATION.LENGTH.ALIAS_ID_MAX),
    match: VALIDATION.ARRAY.PATTERN('Tab "aliasId"', VALIDATION.PATTERN.ALIAS_ID),
    trim: true,
  },

  cards: [cardSchema],
});

export const dashboardSchemaDefinition: SchemaDefinition = {
  title: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED('Dashboard "title"'),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('Dashboard "title"', VALIDATION.LENGTH.TITLE_MAX),
    trim: true,
  },

  icon: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED('Dashboard "icon"'),
    minlength: VALIDATION.ARRAY.MIN_LENGTH('Dashboard "icon"', VALIDATION.LENGTH.ICON_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('Dashboard "icon"', VALIDATION.LENGTH.ICON_MAX),
    trim: true,
  },

  aliasId: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED('Dashboard "aliasId"'),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH('Dashboard "aliasId"', VALIDATION.LENGTH.ALIAS_ID_MAX),
    match: VALIDATION.ARRAY.PATTERN('Dashboard "aliasId"', VALIDATION.PATTERN.ALIAS_ID),
    trim: true,
  },

  tabs: [tabSchema],
};

const dashboardSchema = new Schema<IDashboard>({
  ...dashboardSchemaDefinition,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

dashboardSchema.index({ userId: 1, aliasId: 1 }, { unique: true });

dashboardSchema.pre('validate', function (next) {
  const duplicateTabAliasId = validateTabAliasIds(this.tabs);
  if (duplicateTabAliasId) {
    return next(new AppValidationError(`Duplicate Tab "aliasId" "${duplicateTabAliasId}" in the same dashboard`));
  }
  next();
});

dashboardSchema.statics.findByAliasId = function (aliasId: string, userId: string): Query<IDashboard | null, IDashboard> {
  return this.findOne({ aliasId, userId });
};

const dashboardTransformFunction = (returnedDashboard: Record<string, unknown>) => {
  delete returnedDashboard._id;
  delete returnedDashboard.__v;
  delete returnedDashboard.userId;
  return returnedDashboard;
};

const tabTransformFunction = (returnedTab: Record<string, unknown>) => {
  delete returnedTab._id;
  return returnedTab;
};

dashboardSchema.set('toJSON', {
  transform: (_, returnedDashboard) => dashboardTransformFunction(returnedDashboard),
});

dashboardSchema.set('toObject', {
  transform: (_, returnedDashboard) => dashboardTransformFunction(returnedDashboard),
});

tabSchema.set('toObject', {
  transform: (_, returnedTab) => tabTransformFunction(returnedTab),
});

export const Dashboard = model<IDashboard, IDashboardModel>('Dashboard', dashboardSchema);
