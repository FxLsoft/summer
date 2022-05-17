import { ComponentMeta, Context, ContextParams } from "./context/Context";
import { IModule } from "./interfaces/IModule";
import { IModel } from './interfaces/IModel';
import { ModuleRegistry } from './modules/ModuleRegistry';
import { Logger, LoggerFactory } from "./Logger";
import { EventService } from './services/EventService';
import { SummerCore } from "./SummerCore";
import { _ } from './utils';
import { ReadyEvent, Events } from "./events/Events";
import { Constants } from "./Constants";
import { OptionsWrapper } from "./OptionsWrapper";
import { IComponent } from "./interfaces/IComponent";
import { RegisteredComponentInput, UserComponentRegistry } from "./widgets/framework/userComponentRegistry";
import { SrOptions, SrParams } from "./SummerOptions";

import "../styles/Common.scss";

export class Summer {

    private context: Context;
    private logger: Logger;
    private readonly options: SrOptions;
    private readonly params: SrParams;
    private readonly rootDiv: HTMLElement;
    private srCore: SummerCore;

    constructor(el: HTMLElement | string, options: SrOptions, params?: SrParams) {
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
    }

    private createProvidedBeans(rootDiv: HTMLElement, params: SrParams) {
        // 外部的Bean
        return {
            rootDiv: rootDiv,
            options: this.options,
            params: params
        };
    }

    private createBeansList(registeredModules: IModule[]): any[] {
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

    private getRegisteredModules(params: SrParams): IModule[] {
        const passedViaConstructor: IModule[] = params ? params.modules : null;
        const registered = ModuleRegistry.getRegisteredModules();

        const allModules: IModule[] = [];
        const mapNames: { [name: string]: boolean } = {};

        // adds to list and removes duplicates
        function addModule(module: IModule) {
            function addIndividualModule(m: IModule) {
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

    private createStackComponentsList(registeredModules: IModule[]): any[] {
        let components: ComponentMeta[] = [];

        const moduleStackComps = this.extractModuleEntity(registeredModules, (module: IModule) => module.stackComponents ? module.stackComponents : []);

        components = components.concat(moduleStackComps);

        return components;
    }

    private extractModuleEntity(moduleEntities: any[], extractor: (module: any) => any) {
        return [].concat(...moduleEntities.map(extractor));
    }

    private getModelClass(registeredModules: IModule[]): any {
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

    private dispatchReadyEvent(options: SrOptions): void {
        const eventService: EventService = this.context.getBean('eventService');
        const readyEvent: ReadyEvent = {
            type: Events.EVENT_READY,
            options
        }
        eventService.dispatchEvent(readyEvent);
    }

    private registerModuleUserComponents(registeredModules: IModule[]): void {
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
