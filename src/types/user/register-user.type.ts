import { type IUserInput } from "@models";
import { type ILoginUser, type ILoginUserResponse } from "./login-user.type";

export enum REGISTER_KEYS {
  'fullName'
}

export type IRegisterUser = ILoginUser & Pick<IUserInput, keyof typeof REGISTER_KEYS>;

export type IDashboardCreationResult = {
  created: string[];
  skipped: string[];
  failed: string[];
  errors: string[];
};

export type IRegisterUserResponse = ILoginUserResponse & {
  dashboardsCreation: IDashboardCreationResult;
};
