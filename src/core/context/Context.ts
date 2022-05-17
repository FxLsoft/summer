import { ILogger } from "../interfaces/ILogger";
import { Utils as _ } from "../utils";
import { Component } from "../widgets/Component";
import { BaseBean } from "./BaseBean";

// steps in booting up:
// 1. create all beans
// 2. autowired all attributes
// 3. wire all beans
// 4. initialize the model
// 5. initialize the view
// 6. boot??? (not sure if this is needed)
// each bean is responsible for initializing itself, taking items from the optionsWrapper

interface BeanWrapper {
    bean: any;
    beanInstance: any;
    beanName: any;
}

export interface ContextParams {
    providedBeanInstances: any;
    beanClasses: any[];
    components: ComponentMeta[];
    debug: boolean;
}

export interface ComponentMeta {
    componentClass: new (params?: any) => Object;
    componentName: string;
}

export class Context {

    private beanWrappers: { [key: string]: BeanWrapper } = {};
    private contextParams: ContextParams;
    private logger: ILogger;
    private componentsMappedByName: { [key: string]: any } = {};
    private destroyed = false;

    public constructor(params: ContextParams, logger: ILogger) {
        if (!params || !params.beanClasses) {
            return;
        }
        this.contextParams = params;
        this.logger = logger;

        this.logger.log("Creating Application Context");

        this.setupComponents();

        this.createBeans();

        const beanInstances = this.getBeanInstances();

        this.wireBeans(beanInstances);

        this.logger.log("Application Context ready - component is alive");
    }

    private setupComponents(): void {
        if (this.contextParams.components) {
            this.contextParams.components.forEach(componentMeta => this.addComponent(componentMeta));
        }
    }

    private addComponent(componentMeta: ComponentMeta): void {
        const classUpperCase = escapedComponentName(componentMeta.componentName);
        // finally store
        this.componentsMappedByName[classUpperCase] = componentMeta.componentClass;
    }

    private createBeans(): void {
        // register all normal beans
        this.contextParams.beanClasses.forEach(this.createBeanWrapper.bind(this));
        // register override beans, these will overwrite beans above of same name

        // instantiate all beans - overridden beans will be left out
        _.iterateObject(this.beanWrappers, (key: string, beanEntry: BeanWrapper) => {
            let constructorParamsMeta: any;
            if (beanEntry.bean.__beanMetaData && beanEntry.bean.__beanMetaData.autowireMethods && beanEntry.bean.__beanMetaData.autowireMethods.__constructor) {
                constructorParamsMeta = beanEntry.bean.__beanMetaData.autowireMethods.__constructor;
            }
            const constructorParams = this.getBeansForParameters(constructorParamsMeta, beanEntry.bean.name);
            const newInstance = applyToConstructor(beanEntry.bean, constructorParams);
            beanEntry.beanInstance = newInstance;
        });

        const createdBeanNames = Object.keys(this.beanWrappers).join(', ');
        this.logger.log(`created beans: ${createdBeanNames}`);
    }

    private createBeanWrapper(Bean: new () => Object): void {
        const metaData = (Bean as any).__beanMetaData;

        if (!metaData) {
            let beanName: string;
            if (Bean.prototype.constructor) {
                beanName = Bean.prototype.constructor.name;
            } else {
                beanName = "" + Bean;
            }
            console.error("context item " + beanName + " is not a bean");
            return;
        }

        const beanEntry = {
            bean: Bean,
            beanInstance: null as any,
            beanName: metaData.beanName
        };

        this.beanWrappers[metaData.beanName] = beanEntry;

        this.logger.log(`createBean -> ${metaData.beanName}`);
    }

    private getBeansForParameters(parameters: any, beanName: string): any[] {
        const beansList: any[] = [];
        if (parameters) {
            _.iterateObject(parameters, (paramIndex: string, otherBeanName: string) => {
                const otherBean = this.lookupBeanInstance(beanName, otherBeanName);
                beansList[Number(paramIndex)] = otherBean;
            });
        }
        return beansList;
    }

    private lookupBeanInstance(wiringBean: string, beanName: string, optional = false): any {
        if (beanName === "context") {
            return this;
        } else if (this.contextParams.providedBeanInstances && this.contextParams.providedBeanInstances.hasOwnProperty(beanName)) {
            return this.contextParams.providedBeanInstances[beanName];
        } else {
            const beanEntry = this.beanWrappers[beanName];
            if (beanEntry) {
                return beanEntry.beanInstance;
            }
            if (!optional) {
                console.error("Summer: unable to find bean reference " + beanName + " while initializing " + wiringBean);
            }
            return null;
        }
    }

    private getBeanInstances(): any[] {
        return _.values(this.beanWrappers).map(beanEntry => beanEntry.beanInstance);
    }

    public getBean(name: string): any {
        return this.lookupBeanInstance("getBean", name, true);
    }

    private wireBeans(beanInstances: any[], afterPreCreateCallback?: (comp: BaseBean) => void): void {
        this.autoWireBeans(beanInstances);
        this.methodWireBeans(beanInstances);

        this.callLifeCycleMethods(beanInstances, 'preConstructMethods');

        // the callback sets the attributes, so the component has access to attributes
        // before postConstruct methods in the component are executed
        if (_.exists(afterPreCreateCallback)) {
            beanInstances.forEach(afterPreCreateCallback);
        }

        this.callLifeCycleMethods(beanInstances, 'postConstructMethods');
    }

    private autoWireBeans(beanInstances: any[]): void {
        beanInstances.forEach(beanInstance => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any, beanName: string) => {
                const attributes = metaData.__classAttributes;
                if (!attributes) {
                    return;
                }

                attributes.forEach((attribute: any) => {
                    const otherBean = this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
                    beanInstance[attribute.attributeName] = otherBean;
                });
            });
        });
    }

    private forEachMetaDataInHierarchy(beanInstance: any, callback: (metaData: any, beanName: string) => void): void {

        let prototype: any = Object.getPrototypeOf(beanInstance);
        while (prototype != null) {

            const constructor: any = prototype.constructor;

            if (constructor.hasOwnProperty('__beanMetaData')) {
                const metaData = constructor.__beanMetaData;
                const beanName = this.getBeanName(constructor);
                callback(metaData, beanName);
            }

            prototype = Object.getPrototypeOf(prototype);
        }
    }

    private getBeanName(constructor: any): string {
        if (constructor.__beanMetaData && constructor.__beanMetaData.beanName) {
            return constructor.__beanMetaData.beanName;
        }

        const constructorString = constructor.toString();
        const beanName = constructorString.substring(9, constructorString.indexOf("("));
        return beanName;
    }

    private methodWireBeans(beanInstances: any[]): void {
        beanInstances.forEach(beanInstance => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any, beanName: string) => {
                _.iterateObject(metaData.autowireMethods, (methodName: string, wireParams: any[]) => {
                    // skip constructor, as this is dealt with elsewhere
                    if (methodName === "__constructor") {
                        return;
                    }
                    const initParams = this.getBeansForParameters(wireParams, beanName);
                    beanInstance[methodName].apply(beanInstance, initParams);
                });
            });
        });
    }

    private callLifeCycleMethods(beanInstances: any[], lifeCycleMethod: string): void {
        beanInstances.forEach((beanInstance: any) => {
            this.forEachMetaDataInHierarchy(beanInstance, (metaData: any) => {
                const methods = metaData[lifeCycleMethod] as string[];
                if (!methods) { return; }
                methods.forEach(methodName => beanInstance[methodName]());
            });
        });
    }

    // 初始化Bean
    public wireBean(bean: any, afterPreCreateCallback?: (comp: BaseBean) => void): void {
        if (!bean) {
            throw Error(`Can't wire to bean since it is null`);
        }
        this.wireBeans([bean], afterPreCreateCallback);
    }

    // 创建 Component 组件
    public createComponent(key: string, afterPreCreateCallback?: (comp: Component) => void, componentParams?: any, element?: HTMLElement): Component {
        key = escapedComponentName(key);
        if (this.componentsMappedByName && this.componentsMappedByName[key]) {
            // const cls = this.componentsMappedByName[key];
            const newComponent = new this.componentsMappedByName[key](componentParams) as Component;
            this.wireBean(newComponent, afterPreCreateCallback);
            return newComponent;
        }
        return null;
    }

    public destroy(): void {
        // should only be able to destroy once
        if (this.destroyed) {
            return;
        }
        this.logger.log(">> Shutting down Summer-Application Context");

        const beanInstances = this.getBeanInstances();
        this.callLifeCycleMethods(beanInstances, 'preDestroyMethods');

        this.contextParams.providedBeanInstances = null;

        this.destroyed = true;
        this.logger.log(">> Summer-Application Context shut down - component is dead");
    }
}

export function PreConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    const props = getOrCreateProps(target.constructor);
    const preConstructMethods = 'preConstructMethods';
    if (!props[preConstructMethods]) {
        props[preConstructMethods] = [];
    }
    props[preConstructMethods].push(methodName);
}

export function PostConstruct(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    const props = getOrCreateProps(target.constructor);
    const postConstructMethods = 'postConstructMethods';
    if (!props[postConstructMethods]) {
        props[postConstructMethods] = [];
    }
    props[postConstructMethods].push(methodName);
}

export function PreDestroy(target: Object, methodName: string, descriptor: TypedPropertyDescriptor<any>): void {
    const props = getOrCreateProps(target.constructor);
    const preDestroyMethods = 'preDestroyMethods';
    if (!props[preDestroyMethods]) {
        props[preDestroyMethods] = [];
    }
    props[preDestroyMethods].push(methodName);
}

export function Bean(beanName: string): Function {
    // console.log('Bean >> ', beanName);
    return (classConstructor: any) => {
        const props = getOrCreateProps(classConstructor);
        props.beanName = beanName;
    };
}

export function Autowired(name?: string): Function {
    // console.log('Autowired >> ', name);
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        autowiredFunc(target, name, false, target, propertyKey, null);
    };
}

export function Optional(name?: string): Function {
    // console.log('Optional >> ', name);
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        autowiredFunc(target, name, true, target, propertyKey, null);
    };
}

export function Qualifier(name: string): Function {
    // console.log('Qualifier >> ', name);
    return (classPrototype: any, methodOrAttributeName: string, index: number) => {
        const constructor: any = typeof classPrototype == "function" ? classPrototype : classPrototype.constructor;
        let props: any;

        if (typeof index === "number") {
            // it's a parameter on a method
            let methodName: string;
            props = getOrCreateProps(constructor);
            if (methodOrAttributeName) {
                methodName = methodOrAttributeName;
            } else {
                methodName = "__constructor";
            }
            const autowireMethods = 'autowireMethods';
            if (!props[autowireMethods]) {
                props[autowireMethods] = {};
            }
            if (!props[autowireMethods][methodName]) {
                props[autowireMethods][methodName] = {};
            }
            props[autowireMethods][methodName][index] = name;
        }
    };
}

function autowiredFunc(target: any, name: string, optional: boolean, classPrototype: any, methodOrAttributeName: string, index: number) {
    if (name === null) {
        console.error("Context: Autowired name should not be null");
        return;
    }
    if (typeof index === "number") {
        console.error("Context: Autowired should be on an attribute");
        return;
    }

    // it's an attribute on the class
    const props = getOrCreateProps(target.constructor);
    const classAttributes = '__classAttributes';
    if (!props[classAttributes]) {
        props[classAttributes] = [];
    }
    props[classAttributes].push({
        attributeName: methodOrAttributeName,
        beanName: name,
        optional: optional
    });
}

function getOrCreateProps(target: any): any {
    if (!target.hasOwnProperty("__beanMetaData")) {
        target.__beanMetaData = {};
    }

    return target.__beanMetaData;
}

// allows calling 'apply' on a constructor
function applyToConstructor(constructor: Function, argArray: any[]) {
    const args = [null].concat(argArray);
    const factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

function escapedComponentName(componentName: string): string {
    // get name of the class as a string
    // let className = _.getNameOfClass(ComponentClass);
    // insert a dash after every capital letter
    // let classEscaped = className.replace(/([A-Z])/g, "-$1").toLowerCase();
    const classEscaped = componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    // put all to upper case
    return classEscaped.toUpperCase();
}
