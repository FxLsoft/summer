import { Module, ProxyModule } from '../core/interfaces/IModule';
import { BaseModelModule } from '../core/modules/BaseModule/main';
import { TopologyModelModule } from './Topology/main';
import { DataProviderModule } from './DataProvider/main';

export const AllModules: Module[] = [BaseModelModule];
export const AllProxyModules: ProxyModule[] = [TopologyModelModule, DataProviderModule];