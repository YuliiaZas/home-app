import {
  type ILoginUser,
  type ILoginUserResponse,
  type IRegisterUser,
  type IRegisterUserResponse,
  type IUserProfileResponse,
} from '@types';

export interface IUserService {
  registerUser(params: IRegisterUser): Promise<IRegisterUserResponse>;

  loginUser(params: ILoginUser): Promise<ILoginUserResponse>;

  getProfile(userId: string): Promise<IUserProfileResponse | null>;
}
