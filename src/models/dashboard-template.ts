import { Document, Schema, model } from 'mongoose';
import { AppValidationError } from '@utils';
import { dashboardSchemaDefinition, IDashboardBase } from './dashboard';

export interface DashboardTemplateInput extends IDashboardBase {
  isTemplate: boolean;
}

export interface IDashboardTemplate extends DashboardTemplateInput, Document {}

const dashboardTemplateSchema = new Schema<IDashboardTemplate>({
  ...dashboardSchemaDefinition,
  isTemplate: { type: Boolean, default: true, required: true },
});

dashboardTemplateSchema.pre("validate", function (next) {
  const tabAliasIds = new Set();
  for (const tab of this.tabs) {
    if (tab.aliasId) {
      if (tabAliasIds.has(tab.aliasId)) {
        return next(new AppValidationError(`Duplicate tab aliasId "${tab.aliasId}" in the same dashboard`));
      }
      tabAliasIds.add(tab.aliasId);
    }
  }
  next();
});

export const DashboardTemplate = model('DashboardTemplate', dashboardTemplateSchema);
