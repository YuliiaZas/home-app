import { DIContainer, SERVICE_TOKENS } from '@di';
import { type IDashboardService, type IUserService } from '@interfaces';
import { User } from '@models';
import {
  USER_KEYS,
  type ILoginUser,
  type ILoginUserResponse,
  type IRegisterUser,
  type IRegisterUserResponse,
  type IUserProfileResponse,
} from '@types';
import { AppAuthError, AppNotFoundError, enumKeysToSelector, signAccessToken } from '@utils';

export class UserService implements IUserService {
  private dashboardService: IDashboardService;

  constructor() {
    this.dashboardService = DIContainer.resolve<IDashboardService>(SERVICE_TOKENS.Dashboard);
  }

  async registerUser({ userName, password, fullName }: IRegisterUser): Promise<IRegisterUserResponse> {
    const newUser = await User.create({ userName, password, fullName });

    return {
      token: signAccessToken(newUser),
      dashboardsCreation: await this.dashboardService.addDefaultDashboards(newUser._id),
    };
  }

  async loginUser({ userName, password }: ILoginUser): Promise<ILoginUserResponse> {
    const user = await User.authenticate(userName, password);
    if (!user) throw new AppAuthError('Invalid credentials');

    return { token: signAccessToken(user) };
  }

  async getProfile(userId: string): Promise<IUserProfileResponse> {
    const profile = await User.findById(userId).select(enumKeysToSelector(USER_KEYS));
    if (!profile) throw new AppNotFoundError('User');

    return profile.toJSON();
  }
}
