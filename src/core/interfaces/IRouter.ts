

export interface IRouter {

    addRoute(route: Route): void;
    addRoute(parentName: string, route: Route): void;
    removeRoute(name: string): void;
    hasRoute(name: string): void;
    getRoutes(): Route[];
    push(): Promise<void>;
    replace(): Promise<void>;
    back(): Route;
    forward(): Route;
    go(delta: number): void;
    beforeEach(guard: Function): void;
    afterEach(guard: Function): void;
    onError(handler: Function): void;
    isReady(): Promise<void>;

}

export interface Route {
    name: string;
    redirect?: string;
    path?: string;
    query?: Record<string, any>;
    children?: Route[];
    meta?: Record<string, any>;
}