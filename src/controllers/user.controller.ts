import { Response } from 'express';
import { DIContainer, SERVICE_TOKENS } from '@di';
import { type IUserService } from '@interfaces';
import {
  type AuthenticatedRequest,
  type ILoginUser,
  type IRegisterUser,
  type ILoginUserResponse,
  type IRegisterUserResponse,
  type IUserProfileResponse,
} from '@types';
import { handleCommonErrors } from '@utils';

export class UserController {
  private userService: IUserService;

  constructor() {
    this.userService = DIContainer.resolve<IUserService>(SERVICE_TOKENS.User);
  }

  async registerUser(req: AuthenticatedRequest<object, IRegisterUser>, res: Response<IRegisterUserResponse>) {
    try {
      const { userName, password, fullName } = req.body;

      res.status(200).json(await this.userService.registerUser({ userName, password, fullName }));
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Registration');
    }
  }

  async loginUser(req: AuthenticatedRequest<object, ILoginUser>, res: Response<ILoginUserResponse>) {
    try {
      const { userName, password } = req.body;

      res.json(await this.userService.loginUser({ userName, password }));
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Login');
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response<IUserProfileResponse | null>) {
    try {
      res.json(await this.userService.getProfile(req.user.id));
    } catch (error: unknown) {
      handleCommonErrors(error, res, 'Get Profile');
    }
  }
}
