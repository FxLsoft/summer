import { Module, ProxyModule } from "../../core/interfaces/IModule";
import { TopologyModel } from "./TopologyModel";

export const ModuleName = 'Topology';

export const TopologyModelModule: Module = {
    moduleName: ModuleName,
    beans: [],
    stackComponents: [],
    models: {
        [ModuleName]: TopologyModel
    }
}