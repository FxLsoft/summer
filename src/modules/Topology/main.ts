import { Module, ProxyModule } from '@/core/interfaces/IModule';

const proxyModule = () => import('./TopologyModelModule')

export const TopologyModelModule: ProxyModule = {
    moduleName: 'Topology',
    proxy: () => {
        return new Promise<Module>((resolve, reject) => {
            proxyModule().then(module => resolve(module.TopologyModelModule))
        })
    }
}
