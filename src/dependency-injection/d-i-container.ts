import { IDashboardService, IUserInstrumentService } from "@interfaces";
import { DashboardService, UserInstrumentService } from "@services";
import { SERVICE_TOKENS } from "./service-tokens";

export class DIContainer {
  static services = new Map<string, unknown>();
  static factories = new Map<string, () => unknown>();

  static registerFactory<T>(name: string, factory: () => T): void {
    if (this.services.has(name)) {
      throw new Error(`Service with name '${name}' is already registered.`);
    }
    this.services.set(name, factory);
  }

  static resolve<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      const factory = this.factories.get(name);
      if (factory) {
        const instance = factory();
        this.services.set(name, instance);
        return instance as T;
      }
      throw new Error(`Service with name '${name}' is not registered.`);
    }
    return service as T;
  }
}

DIContainer.registerFactory<IDashboardService>(SERVICE_TOKENS.Dashboard, () => new DashboardService());
DIContainer.registerFactory<IUserInstrumentService>(SERVICE_TOKENS.UserInstrument, () => new UserInstrumentService());
