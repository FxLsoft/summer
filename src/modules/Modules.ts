import { IModule, IProxyModule } from '../core/interfaces/IModule';
import { BaseModelModule } from '../core/modules/BaseModule/main';
import { TopologyModelModule } from './Topology/main';
import { DataProviderModule } from './DataProvider/main';
import { ModuleRegistry } from '@/core/modules/ModuleRegistry';

export const AllModules: IModule[] = [BaseModelModule];
export const AllProxyModules: IProxyModule[] = [TopologyModelModule, DataProviderModule];

ModuleRegistry.registerModules(AllModules);
ModuleRegistry.registerAsyncModules(AllProxyModules);