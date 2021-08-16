import { Module } from "../../interfaces/IModule";
import { BaseModel } from './BaseModel';

export const BaseModelModule: Module = {
    moduleName: 'BaseModelModule',
    beans: [],
    stackComponents: [],
    models: {
        BaseModel: BaseModel
    }
}