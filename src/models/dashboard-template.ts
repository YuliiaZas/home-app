import { Document, Schema, model } from 'mongoose';
import { AppValidationError, validateAliasIdsDuplication } from '@utils';
import { dashboardSchemaDefinition, type IDashboardBase } from './dashboard';

export interface DashboardTemplateInput extends IDashboardBase<string> {
  isTemplate: boolean;
}

export interface IDashboardTemplate extends DashboardTemplateInput, Document {}

const dashboardTemplateSchema = new Schema<IDashboardTemplate>({
  ...dashboardSchemaDefinition,
  isTemplate: { type: Boolean, default: true, required: true },
});

dashboardTemplateSchema.pre('validate', function (next) {
  const duplicateTabAliasId = validateAliasIdsDuplication(this.tabs);
  if (duplicateTabAliasId) {
    return next(new AppValidationError(`Duplicate Tab "aliasId" "${duplicateTabAliasId}" in the same dashboard`));
  }
  next();
});

export const DashboardTemplate = model('DashboardTemplate', dashboardTemplateSchema);
