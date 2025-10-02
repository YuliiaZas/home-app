import { type IUser } from "@models";

export enum USER_KEYS {
  'id',
  'userName',
  'fullName',
  'initials',
}

export type IUserProfileResponse = Pick<Required<IUser>, keyof typeof USER_KEYS>;
