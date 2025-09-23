import { Document, Schema, model } from 'mongoose';
import { dashboardSchemaDefinition, ICard, IDashboardData, ITab } from './dashboard';

export interface IDashboardTemplateInitial extends Omit<IDashboardData, 'ownerUserId' | 'tabs'> {
  tabs: ITabTemplateInitial[];
}

export interface ITabTemplateInitial extends Omit<ITab, 'cards'> {
  cards: ICardTemplateInitial[];
}

export interface ICardTemplateInitial extends Omit<ICard, 'items'> {
  itemAliases: string[];
}

export interface IDashboardTemplateData extends Omit<IDashboardData, 'ownerUserId'> {
  isTemplate: boolean;
}

export interface IDashboardTemplate extends IDashboardTemplateData, Document {}

const dashboardTemplateSchema = new Schema<IDashboardTemplate>({
  ...dashboardSchemaDefinition,
  isTemplate: true,
});

export const DashboardTemplate = model('DashboardTemplate', dashboardTemplateSchema);
