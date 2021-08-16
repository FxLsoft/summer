import { Module } from "@/core/interfaces/IModule";
import { DataProviderModel } from "./DataProviderModel";
import { ModuleName } from './main';
import { ViewBoard } from './components/ViewBoard/ViewBoard';

export const DataProviderModule: Module = {
    moduleName: ModuleName,
    beans: [],
    stackComponents: [{componentName: 'ViewBoard', componentClass: ViewBoard}],
    models: {
        [ModuleName]: DataProviderModel
    }
}

export default DataProviderModule;