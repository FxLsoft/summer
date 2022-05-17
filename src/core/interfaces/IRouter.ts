

export interface IRouter {
    addRoute(route: IRoute): void;
    addRoute(parentName: string, route: IRoute): void;
    removeRoute(name: string): void;
    hasRoute(name: string): void;
    getRoutes(): IRoute[];
    push(): Promise<void>;
    replace(): Promise<void>;
    back(): IRoute;
    forward(): IRoute;
    go(delta: number): void;
    beforeEach(guard: Function): void;
    afterEach(guard: Function): void;
    onError(handler: Function): void;
    isReady(): Promise<void>;

}

export interface IRoute {
    name: string;
    redirect?: string;
    path?: string;
    query?: Record<string, any>;
    children?: IRoute[];
    meta?: Record<string, any>;
}