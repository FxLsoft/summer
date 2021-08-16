import { Module, ProxyModule } from '@/core/interfaces/IModule';

const proxyModule = () => import('./DataProviderModelModule');

export const ModuleName = 'DataProvider';

export const DataProviderModule: ProxyModule = {
    moduleName: ModuleName,
    proxy: () => {
        return new Promise<Module>((resolve, reject) => {
            proxyModule().then(module => resolve(module.default))
        })
    } 
}