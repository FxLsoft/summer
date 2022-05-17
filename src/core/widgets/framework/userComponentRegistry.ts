import { Component } from "@vue/runtime-core";
import { Autowired, Bean, Context, PostConstruct } from "../../context/Context";
import { IComponent } from "../../interfaces/IComponent";
/*
 * @description: 
 * @author: fxlsoft
 * @Date: 2021-12-20 11:24:24
 */
import { Options } from "../../Summer";

export type RegisteredComponentInput<A extends IComponent<any>> = ComponentFunctionInput | { new(): A };
export type ComponentFunctionInput = (params: any) => string | HTMLElement;

/**
 * 用户组件注册，单独维护
 */
@Bean('userComponentRegistry')
export class UserComponentRegistry {

    @Autowired('options')
    private options: Options;

    @Autowired('context')
    private context: Context;

    private componentDefaults: { [key: string]: RegisteredComponentInput<any> } = {};

    private vueComponent: { [key: string]: Component };

    private frameworkComponents: { [key: string]: { new(): any } } = {};

    @PostConstruct
    private init(): void {
        if (this.options.components != null) {
            Object.keys(this.options.components).forEach(it => {
                this.registerDefaultComponent(it, this.options.components[it]);
            });
        }
        if (this.options.frameworkComponents != null) {
            Object.keys(this.options.frameworkComponents).forEach(it => {
                this.registerComponent(it, this.options.frameworkComponents[it]);
            });
        }
    }

    // 注册默认组件
    public registerDefaultComponent<A extends IComponent<any>>(rawName: string, component: RegisteredComponentInput<A>) {
        const name: string = rawName;
        if (this.componentDefaults[name]) {
            console.error(`Trying to overwrite a default component. You should call registerComponent`);
            return;
        }

        this.componentDefaults[name] = component;
    }

    public registerComponent<A extends IComponent<any>>(rawName: string, component: { new(): any }) {
        const name: string = rawName;
        if (this.frameworkComponents[name]) {
            console.error(`Trying to register a component that you have already registered for frameworks: ${name}`);
            return;
        }

        this.frameworkComponents[name] = component;
    }

}