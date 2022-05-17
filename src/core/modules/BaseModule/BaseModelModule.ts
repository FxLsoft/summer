import { IModule } from "../../interfaces/IModule";
import { BaseModel } from './BaseModel';

export const BaseModelModule: IModule = {
    moduleName: 'BaseModelModule',
    beans: [],
    stackComponents: [],
    models: {
        BaseModel: BaseModel
    }
}