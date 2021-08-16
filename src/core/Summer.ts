import { ComponentMeta, Context, ContextParams } from "./context/Context";
import { Module } from "./interfaces/IModule";
import { IModel } from './interfaces/IModel';
import { ModuleRegistry } from './modules/ModuleRegistry';
import { Logger, LoggerFactory } from "./Logger";
import { EventService } from './events/EventService';
import { SummerCore } from "./SummerCore";
import { _ } from './utils';
import { ReadyEvent, Events } from "./events/Events";
import { Constants } from "./Constants";
import { OptionsWrapper } from "./OptionsWrapper";
import { IComponent } from "./interfaces/IComponent";
import { RegisteredComponentInput, UserComponentRegistry } from "./widgets/framework/userComponentRegistry";

import "../styles/Common.scss";

/**
 * Summer 配置
 */
export interface Options {
    // Debugger 模式
    debug: boolean,
    // 启动 Model 类型
    modelType?: string,
    // 自定义 Component
    components?: { [key: string]: RegisteredComponentInput<any> },
    // 覆盖框架的 Component
    frameworkComponents?: { [key: string]: { new(): any } }
}
/**
 * Summer 参数
 */
export interface Params {
    // bean instances to add to the context
    providedBeanInstances?: { [key: string]: any };
    modules?: Module[];
}

export class Summer {

    private context: Context;
    private logger: Logger;
    private readonly options: Options;
    private readonly params: Params;
    private readonly rootDiv: HTMLElement;
    private srCore: SummerCore;

    constructor(el: HTMLElement | string, options: Options, params?: Params) {
        console.time('Summer');
        let rootDiv: HTMLElement;
        if (_.isString(el)) {
            rootDiv = document.querySelector(el as string);
        } else {
            rootDiv = el as HTMLElement;
        }
        if (!rootDiv) {
            console.error('Not present el');
            return;
        }
        this.options = options;
        this.params = params;
        this.rootDiv = rootDiv;
        if (ModuleRegistry.isRegisteredAsync(options.modelType)) {
            ModuleRegistry.registerAsyncByModuleName(options.modelType).then(() => {
                this.init();
            })
        } else {
            this.init();
        }
    }

    private init() {
        const startTime = Date.now();

        const options = this.options;
        const params = this.params;
        const rootDiv = this.rootDiv;
        const debug = !!options.debug;

        // 注册模块
        const registeredModules = this.getRegisteredModules(params);

        // 实例化 Beans
        const beanClasses = this.createBeansList(registeredModules);

        // 注册 Component
        const stackComponents = this.createStackComponentsList(registeredModules);

        // 实例化 私有Bean
        const providedBeanInstances = this.createProvidedBeans(rootDiv, params);

        if (!beanClasses) {
            console.error('No Model Found');
            return;
        }
        const contextParams: ContextParams = {
            providedBeanInstances: providedBeanInstances,
            beanClasses: beanClasses,
            components: stackComponents,
            debug: debug
        };
        this.logger = new Logger('Summer >> ', () => options.debug);
        const contextLogger = new Logger('Context >> ', () => contextParams.debug);
        this.context = new Context(contextParams, contextLogger);

        this.registerModuleUserComponents(registeredModules);

        let srCore = new SummerCore();
        this.context.wireBean(srCore);
        this.srCore = srCore;
        // 设置数据
        this.setData();
        // 出发事件
        this.dispatchReadyEvent(options);

        this.logger.log(`initialized successfully ${Date.now() - startTime}ms`);

        console.timeEnd('Summer');
    }

    private createProvidedBeans(rootDiv: HTMLElement, params: Params) {
        // 外部的Bean
        const seed = {
            rootDiv: rootDiv,
            options: this.options
        };
        return seed;
    }

    private createBeansList(registeredModules: Module[]): any[] {
        const modelClass = this.getModelClass(registeredModules);
        const beansNoDuplicates: any[] = [];
        // 系统自带的Bean
        const beans = [
            EventService, LoggerFactory, OptionsWrapper, UserComponentRegistry
        ];
        if (modelClass) {
            beans.unshift(modelClass);
        }
        const moduleBeans = this.extractModuleEntity(registeredModules, (module) => module.beans ? module.beans : []);
        beans.push(...moduleBeans);
        beans.forEach(bean => {
            if (beansNoDuplicates.indexOf(bean) < 0) {
                beansNoDuplicates.push(bean);
            }
        });
        return beansNoDuplicates;
    }

    private getRegisteredModules(params: Params): Module[] {
        const passedViaConstructor: Module[] = params ? params.modules : null;
        const registered = ModuleRegistry.getRegisteredModules();

        const allModules: Module[] = [];
        const mapNames: { [name: string]: boolean } = {};

        // adds to list and removes duplicates
        function addModule(module: Module) {
            function addIndividualModule(m: Module) {
                if (!mapNames[m.moduleName]) {
                    mapNames[m.moduleName] = true;
                    allModules.push(m);
                    ModuleRegistry.register(m);
                }
            }

            addIndividualModule(module);
            if (module.dependantModules) {
                module.dependantModules.forEach(addModule);
            }
        }

        if (passedViaConstructor) {
            passedViaConstructor.forEach(addModule);
        }

        if (registered) {
            registered.forEach(addModule);
        }

        return allModules;
    }

    private createStackComponentsList(registeredModules: Module[]): any[] {
        let components: ComponentMeta[] = [];

        const moduleStackComps = this.extractModuleEntity(registeredModules, (module: Module) => module.stackComponents ? module.stackComponents : []);

        components = components.concat(moduleStackComps);

        return components;
    }

    private extractModuleEntity(moduleEntities: any[], extractor: (module: any) => any) {
        return [].concat(...moduleEntities.map(extractor));
    }

    private getModelClass(registeredModules: Module[]): any {
        let modelType = this.options.modelType;
        if (!modelType) {
            modelType = Constants.DEFAULT_MODEL_TYPE;
        }
        const modelClasses: { [name: string]: { new(): IModel } } = {};
        registeredModules.forEach(module => {
            _.iterateObject(module.models, (key: string, value: { new(): IModel }) => {
                modelClasses[key] = value;
            });
        });
        const modelClass = modelClasses[modelType];
        if (_.exists(modelClass)) {
            return modelClass;
        } else {
            return undefined;
        }
    }

    private setData(): void {
        const model: IModel = this.getCurrentModel();
        if (model) {
            model.start();
        } else {
            this.logger.log('No Model to start');
        }
    }

    private getCurrentModel(): IModel {
        return this.context.getBean('model');
    }

    private dispatchReadyEvent(options: Options): void {
        const eventService: EventService = this.context.getBean('eventService');
        const readyEvent: ReadyEvent = {
            type: Events.EVENT_READY
        }
        eventService.dispatchEvent(readyEvent);
    }

    private registerModuleUserComponents(registeredModules: Module[]): void {
        const userComponentRegistry: UserComponentRegistry = this.context.getBean('userComponentRegistry');

        const moduleUserComps: {
            componentName: string,
            componentClass: RegisteredComponentInput<IComponent<any>>
        }[] = this.extractModuleEntity(registeredModules, (module) => module.userComponents ? module.userComponents : []);

        moduleUserComps.forEach(compMeta => {
            userComponentRegistry.registerDefaultComponent(compMeta.componentName, compMeta.componentClass);
        });
    }

    public destroy(): void {
        const model: IModel = this.getCurrentModel();
        if (model) {
            model.destroy();
        }
        // destroy the UI first (as they use the services)
        this.srCore.destroy();
        // destroy the services
        this.context.destroy();
    }

}
