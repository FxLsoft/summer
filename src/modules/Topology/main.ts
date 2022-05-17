import { IModule, IProxyModule } from '@/core/interfaces/IModule';

const proxyModule = () => import('./TopologyModelModule')

export const TopologyModelModule: IProxyModule = {
    moduleName: 'Topology',
    proxy: () => {
        return new Promise<IModule>((resolve, reject) => {
            proxyModule().then(module => resolve(module.TopologyModelModule))
        })
    }
}
