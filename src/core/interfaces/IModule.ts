import { ComponentMeta } from "../context/Context";
import { RegisteredComponentInput } from "../widgets/framework/userComponentRegistry";
import { IComponent } from "./IComponent";
import { IModel } from "./IModel";

export interface IModule {
    moduleName: string;
    beans?: any[];
    stackComponents?: ComponentMeta[];
    userComponents?: { componentName: string, componentClass: RegisteredComponentInput<IComponent<any>> }[];
    models?: { [name: string]: { new(): IModel } };
    dependantModules?: IModule[]; // Niall / Sean - my addition
}
/**
 * Async IModule
 */
export interface IProxyModule {
    moduleName: string;
    proxy: () =>  Promise<IModule>
}