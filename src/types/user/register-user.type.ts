import { type IUserInput } from "@models";
import { type ILoginUser, type ILoginUserResponse } from "./login-user.type";
import { type IDashboardCreationResult } from "../dashboard";

export enum REGISTER_KEYS {
  'fullName'
}

export type IRegisterUser = ILoginUser & Pick<IUserInput, keyof typeof REGISTER_KEYS>;

export type IRegisterUserResponse = ILoginUserResponse & {
  dashboardsCreation: IDashboardCreationResult;
};
