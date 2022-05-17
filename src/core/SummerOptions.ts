import { IModule } from "./interfaces/IModule";
import { RegisteredComponentInput } from "./widgets/framework/userComponentRegistry";

/**
 * Summer 配置
 */
 export interface SrOptions {
    // Debugger 模式
    debug: boolean,
    // 启动 Model 类型
    modelType?: string,
    // 自定义 Component
    components?: { [key: string]: RegisteredComponentInput<any> },
}

/**
 * Summer 参数
 */
 export interface SrParams {
    // bean instances to add to the context
    providedBeanInstances?: { [key: string]: any };
    modules?: IModule[];
}