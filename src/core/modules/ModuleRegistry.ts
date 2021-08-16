import { Module, ProxyModule } from "../interfaces/IModule";
import { AllModules, AllProxyModules } from '../../modules/Modules';

import { _ } from "../utils";

export class ModuleRegistry {

    // having in a map a) removes duplicates and b) allows fast lookup
    private static modulesMap: { [name: string]: Module } = {};
    private static asyncModulesMap: {[name: string]: ProxyModule} = {};

    public static register(module: Module): void {
        ModuleRegistry.modulesMap[module.moduleName] = module;
    }

    // 批量注册模块
    public static registerModules(modules: Module[]): void {
        if (!modules) {
            return;
        }
        modules.forEach(ModuleRegistry.register);
    }

    public static isRegistered(moduleName: string): boolean {
        return !!ModuleRegistry.modulesMap[moduleName];
    }

    public static getRegisteredModules(): Module[] {
        return _.values(ModuleRegistry.modulesMap);
    }

    public static registerAsync(proxyModule: ProxyModule): void {
        ModuleRegistry.asyncModulesMap[proxyModule.moduleName] = proxyModule;
    }

    public static registerAsyncModules(proxyModules: ProxyModule[]): void {
        if (!proxyModules) {
            return;
        }
        proxyModules.forEach(ModuleRegistry.registerAsync);
    }

    public static isRegisteredAsync(moduleName: string): boolean {
        return !!ModuleRegistry.asyncModulesMap[moduleName];
    }

    public static registerAsyncByModuleName(moduleName: string): Promise<Module> {
        return new Promise<Module>((resolve, reject) => {
            let proxyModule = ModuleRegistry.asyncModulesMap[moduleName];
            if (proxyModule) {
                proxyModule.proxy().then((module: Module) => {
                    delete ModuleRegistry.asyncModulesMap[moduleName];
                    ModuleRegistry.register(module);
                    resolve(module)
                })
            } else {
                reject();
            }
        });
    }
}

ModuleRegistry.registerModules(AllModules);
ModuleRegistry.registerAsyncModules(AllProxyModules);