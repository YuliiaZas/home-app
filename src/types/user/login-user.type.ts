import { type IUserInput } from "@models";

export enum LOGIN_KEYS {
  'userName',
}

export type ILoginUser = Pick<IUserInput, keyof typeof LOGIN_KEYS> & {
  password: string;
};

export type ILoginUserResponse = {
  token: string;
};
