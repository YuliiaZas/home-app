import { type IDashboardService, type IInstrumentService, type IUserInstrumentService } from "@interfaces";
import { DashboardService, InstrumentService, UserInstrumentService } from "@services";
import { SERVICE_TOKENS } from "./service-tokens";

export class DIContainer {
  static services = new Map<string, unknown>();
  static factories = new Map<string, () => unknown>();

  static registerFactory<T>(name: string, factory: () => T): void {
    if (this.factories.has(name)) {
      throw new Error(`Service with name '${name}' is already registered.`);
    }
    this.factories.set(name, factory);
  }

  static resolve<T>(name: string): T {
    let service = this.services.get(name);
  
    if (!service) {
      const factory = this.factories.get(name);
      if (!factory) {
        throw new Error(`Service with name '${name}' is not registered.`);
      }
      
      service = factory();
      this.services.set(name, service);
    }
  
    return service as T;
  }
}

DIContainer.registerFactory<IDashboardService>(SERVICE_TOKENS.Dashboard, () => new DashboardService());
DIContainer.registerFactory<IUserInstrumentService>(SERVICE_TOKENS.UserInstrument, () => new UserInstrumentService());
DIContainer.registerFactory<IInstrumentService>(SERVICE_TOKENS.Instrument, () => new InstrumentService());
