import { ComponentMeta } from "../context/Context";
import { RegisteredComponentInput } from "../widgets/framework/userComponentRegistry";
import { IComponent } from "./IComponent";
import { IModel } from "./IModel";

export interface Module {
    moduleName: string;
    beans?: any[];
    stackComponents?: ComponentMeta[];
    userComponents?: { componentName: string, componentClass: RegisteredComponentInput<IComponent<any>> }[];
    models?: { [name: string]: { new(): IModel } };
    dependantModules?: Module[]; // Niall / Sean - my addition
}
/**
 * Async Module
 */
export interface ProxyModule {
    moduleName: string;
    proxy: () =>  Promise<Module>
};