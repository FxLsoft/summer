import { ComponentMeta } from "@/core/context/Context";
import { RegisteredComponentInput } from "@/core/widgets/framework/userComponentRegistry";
import { IComponent } from "@/core/interfaces/IComponent";
import { IModel } from "@/core/interfaces/IModel";

export interface IModule {
    moduleName: string;
    beans?: any[];
    stackComponents?: ComponentMeta[];
    userComponents?: { componentName: string, componentClass: RegisteredComponentInput<IComponent<any>> }[];
    models?: { [name: string]: { new(): IModel } };
    dependantModules?: IModule[];
}
/**
 * Async IModule
 */
export interface IProxyModule {
    moduleName: string;
    proxy: () =>  Promise<IModule>
}