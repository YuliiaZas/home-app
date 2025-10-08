import { Document, Model, Query, Schema, SchemaDefinition, model } from 'mongoose';
import { VALIDATION } from '@constants';
import { AppValidationError, validateAliasIdsDuplication, validateCardOrder } from '@utils';

export interface IDashboard extends IDashboardInput, Document {}

export interface IDashboardModel extends Model<IDashboard> {
  findByAliasId: (aliasId: string, userId: string) => Query<IDashboard | null, IDashboard>;
}

export interface IDashboardInput extends IDashboardBase {
  userId: Schema.Types.ObjectId;
}

export interface IDashboardBase<TItem = Schema.Types.ObjectId> {
  title: string;
  icon: string;
  aliasId: string;
  tabs: ITab<TItem>[];
}

export interface ITab<TItem = Schema.Types.ObjectId> {
  _id?: string;
  title: string;
  aliasId: string;
  cards: ICard<TItem>[];
}

export interface ICard<TItem = Schema.Types.ObjectId> {
  _id: string;
  title?: string;
  layout: 'verticalLayout' | 'horizontalLayout' | 'singleInstrument';
  order: number;
  items: TItem[];
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
    required: VALIDATION.ARRAY.REQUIRED('Card "layout"'),
  },

  items: [{ type: Schema.Types.ObjectId, ref: 'Instrument', required: true }],

  order: {
    type: Number,
    required: VALIDATION.ARRAY.REQUIRED('Card "order"'),
    min: VALIDATION.ARRAY.MIN('Card "order"', 0),
    validate: {
      validator: Number.isInteger,
      message: 'Card "order" must be an integer',
    },
  },
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

tabSchema.pre('validate', function (next) {
  const cardOrderValidation = validateCardOrder(this.cards);
  if (cardOrderValidation) {
    const { order, duplicationIds, overMaxId } = cardOrderValidation;
    if (overMaxId) {
      return next(new AppValidationError(VALIDATION.MESSAGES.MAX(`Card "order"`, this.cards.length - 1, `card ${overMaxId}`)));
    }
    if (duplicationIds) {
      return next(new AppValidationError(
        VALIDATION.MESSAGES.DUPLICATE(`Card "order"`, order, `tab for cards "${duplicationIds.join('", "')}"`)
      ));
    }
  }

  next();
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
  const duplicateTabAliasId = validateAliasIdsDuplication(this.tabs);
  if (duplicateTabAliasId) {
    return next(new AppValidationError(
      VALIDATION.MESSAGES.DUPLICATE(`Tab "aliasId"`, duplicateTabAliasId, `dashboard`)
    ));
  }
  next();
});

dashboardSchema.statics.findByAliasId = function (
  aliasId: string,
  userId: string
): Query<IDashboard | null, IDashboard> {
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
