import { IModule, IProxyModule } from "../../core/interfaces/IModule";
import { TopologyModel } from "./TopologyModel";

export const ModuleName = 'Topology';

export const TopologyModelModule: IModule = {
    moduleName: ModuleName,
    beans: [],
    stackComponents: [],
    models: {
        [ModuleName]: TopologyModel
    }
}