import { IEventEmitter } from "../interfaces/iEventEmitter";
import { Autowired, Context, PreDestroy } from "./Context";
import { SrEvent } from "../events/Events";
import { EventService } from "../events/EventService";

export class BaseBean {
    
    public static EVENT_DESTROYED = 'destroyed';
    private destroyFunctions: (() => void)[] = [];
    private destroyed = false;
    protected localEventService: EventService;
    
    @Autowired('context')
    private context: Context;

    // 获取上下文
    public getContext = (): Context => this.context;

    @PreDestroy
    public destroy(): void {

        this.destroyFunctions.forEach(func => func());
        this.destroyFunctions.length = 0;
        this.destroyed = true;

        this.dispatchEvent({ type: BaseBean.EVENT_DESTROYED });
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (!this.localEventService) {
            this.localEventService = new EventService();
        }

        this.localEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        if (this.localEventService) {
            this.localEventService.removeEventListener(eventType, listener);
        }
    }

    public dispatchEventAsync(event: SrEvent): void {
        window.setTimeout(() => this.dispatchEvent(event), 0);
    }

    public dispatchEvent<T extends SrEvent>(event: T): void {
        if (this.localEventService) {
            this.localEventService.dispatchEvent(event);
        }
    }

    public addDestroyableEventListener(
        object: Window | HTMLElement | IEventEmitter,
        event: string,
        listener: (event?: any) => void
    ): (() => null) | undefined {
        
        if (this.destroyed) {
            return;
        }
        if (object.addEventListener) {
            (object as any).addEventListener(event, listener);
        }
        // if (object instanceof HTMLElement) {
        //     object.addEventListener(event, listener);
        // } else {
        //     (object as any).addEventListener(event, listener);
        // }

        const destroyFunc: () => null = () => {
            (object as any).removeEventListener(event, listener);

            this.destroyFunctions = this.destroyFunctions.filter(fn => fn !== destroyFunc);

            return null;
        };

        this.destroyFunctions.push(destroyFunc);

        return destroyFunc;
    }

    public isAlive = (): boolean => !this.destroyed;

    public addDestroyFunc(func: () => void): void {
        // if we are already destroyed, we execute the func now
        if (this.isAlive()) {
            this.destroyFunctions.push(func);
        } else {
            func();
        }
    }

    public wireDependentBean<T extends BaseBean>(bean: T, context?: Context): T {
        if (bean.destroy) {
            this.addDestroyFunc(bean.destroy.bind(bean));
        }

        return this.wireBean(bean, context);
    }

    protected wireBean<T extends BaseBean>(bean: T, context?: Context): T {
        (context || this.getContext()).wireBean(bean);
        return bean;
    }
}