import { Document, Schema, SchemaDefinition, model } from 'mongoose';
import { VALIDATION } from '@constants';
import { AppValidationError, validateTabAliasIds } from '@utils';

export interface IDashboard extends IDashboardInput, Document {}

export interface IDashboardInput extends IDashboardBase {
  ownerUserId: Schema.Types.ObjectId;
}

export interface IDashboardBase {
  title: string;
  icon: string;
  aliasId?: string;
  tabs: ITab[];
}

export interface ITab {
  _id?: string;
  title: string;
  aliasId?: string;
  cards: ICard[];
}

export interface ICard {
  _id?: string;
  title?: string;
  layout: "verticalLayout" | "horizontalLayout" | "singleInstrument";
  items: string[];
}

export interface IDashboardBaseSeed extends Omit<IDashboardBase, 'tabs'> {
  tabs: (Omit<ITab, 'cards'> & {
    cards: (Omit<ICard, 'items'> & { itemAliasIds: string[]; })[];
  })[];
}

const cardSchema = new Schema<ICard>({
  title: {
    type: String,
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Card Title", VALIDATION.LENGTH.TITLE_MAX),
    trim: true,
  },

  layout: {
    type: String,
    enum: ["verticalLayout", "horizontalLayout", "singleInstrument"],
    required: VALIDATION.ARRAY.REQUIRED("Card Layout"),
  },

  items: [{ type: Schema.Types.ObjectId, ref: "Instrument", required: true }],
});

cardSchema.pre("validate", function (next) {
  if (this.layout === "singleInstrument" && this.items.length > 1) {
    return next(new AppValidationError('"singleInstrument" cards can only contain 1 item'));
  }
  if (this.layout === "verticalLayout" && this.items.length > 4) {
    return next(new AppValidationError('"verticalLayout" cards can contain max 4 items'));
  }
  next();
});

const tabSchema = new Schema<ITab>({
  title: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED("Tab Title"),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Tab Title", VALIDATION.LENGTH.TITLE_MAX),
    trim: true,
  },

  aliasId: { 
    type: String, 
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Tab Alias Id", VALIDATION.LENGTH.ALIAS_ID_MAX),
    match: VALIDATION.ARRAY.PATTERN("Tab Alias Id", VALIDATION.PATTERN.ALIAS_ID),
    trim: true,
  },

  cards: [cardSchema],
});

export const dashboardSchemaDefinition: SchemaDefinition = {
  title: {
    type: String,
    required: VALIDATION.ARRAY.REQUIRED("Dashboard Title"),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Dashboard Title", VALIDATION.LENGTH.TITLE_MAX),
    trim: true,
  },

  icon: { 
    type: String, 
    required: VALIDATION.ARRAY.REQUIRED("Dashboard Icon"),
    minlength: VALIDATION.ARRAY.MIN_LENGTH("Dashboard Icon", VALIDATION.LENGTH.ICON_MIN),
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Dashboard Icon", VALIDATION.LENGTH.ICON_MAX),
    trim: true,
  },

  aliasId: { 
    type: String, 
    maxlength: VALIDATION.ARRAY.MAX_LENGTH("Dashboard Alias Id", VALIDATION.LENGTH.ALIAS_ID_MAX),
    match: VALIDATION.ARRAY.PATTERN("Dashboard Alias Id", VALIDATION.PATTERN.ALIAS_ID),
    trim: true,
  },

  tabs: [tabSchema],
};

const dashboardSchema = new Schema<IDashboard>({
  ...dashboardSchemaDefinition,
  ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

dashboardSchema.index(
  { ownerUserId: 1, aliasId: 1 },
  { unique: true, partialFilterExpression: { aliasId: { $exists: true } } }
);

dashboardSchema.pre("validate", function (next) {
  const duplicateTabAliasId = validateTabAliasIds(this.tabs);
  if (duplicateTabAliasId) {
    return next(new AppValidationError(`Duplicate tab aliasId "${duplicateTabAliasId}" in the same dashboard`));
  }
  next();
});

export const Dashboard = model<IDashboard>('Dashboard', dashboardSchema);
