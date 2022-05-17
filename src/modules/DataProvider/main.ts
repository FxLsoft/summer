import { IModule, IProxyModule } from '@/core/interfaces/IModule';

const proxyModule = () => import('./DataProviderModelModule');

export const ModuleName = 'DataProvider';

export const DataProviderModule: IProxyModule = {
    moduleName: ModuleName,
    proxy: () => {
        return new Promise<IModule>((resolve, reject) => {
            proxyModule().then(module => resolve(module.default))
        })
    } 
}