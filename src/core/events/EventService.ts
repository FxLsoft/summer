import { IEventEmitter } from "../interfaces/iEventEmitter";
import { Bean } from "../context/Context";
import { SrEvent } from "./Events";

@Bean('eventService')
export class EventService implements IEventEmitter {

    private allSyncListeners = new Map<string, Set<Function>>();
    private allAsyncListeners = new Map<string, Set<Function>>();

    private globalSyncListeners = new Set<Function>();
    private globalAsyncListeners = new Set<Function>();

    private asyncFunctionsQueue: Function[] = [];
    private scheduled = false;

    private firedEvents: { [key: string]: SrEvent } = {};

    public clear() {
        this.allSyncListeners = new Map<string, Set<Function>>();
        this.allAsyncListeners = new Map<string, Set<Function>>();

        this.globalSyncListeners = new Set<Function>();
        this.globalAsyncListeners = new Set<Function>();

        this.asyncFunctionsQueue = [];
        this.scheduled = false;

        this.firedEvents = {};
    }


    private getListeners(eventType: string, async: boolean): Set<Function> {
        const listenerMap = async ? this.allAsyncListeners : this.allSyncListeners;
        let listeners = listenerMap.get(eventType);

        if (!listeners) {
            listeners = new Set<Function>();
            listenerMap.set(eventType, listeners);
        }

        return listeners;
    }

    public addEventListener(eventType: string, listener: Function, async = false): void {
        this.getListeners(eventType, async).add(listener);
    }

	public on(eventType: string, listener: Function, async = false): void {
        this.getListeners(eventType, async).add(listener);
		if (this.firedEvents[eventType]) {
			listener(this.firedEvents[eventType]);
		}
    }

    public removeEventListener(eventType: string, listener: Function, async = false): void {
        this.getListeners(eventType, async).delete(listener);
    }

    public addGlobalListener(listener: Function, async = false): void {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).add(listener);
    }

    public removeGlobalListener(listener: Function, async = false): void {
        (async ? this.globalAsyncListeners : this.globalSyncListeners).delete(listener);
    }

    public dispatchEvent(event: SrEvent): void {
        this.dispatchToListeners(event, true);
        this.dispatchToListeners(event, false);

        this.firedEvents[event.type] = event;
    }

    public dispatchEventOnce(event: SrEvent): void {
        if (!this.firedEvents[event.type]) {
            this.dispatchEvent(event);
        }
    }

    private dispatchToListeners(event: SrEvent, async: boolean) {
        const eventType = event.type;
        const processEventListeners = (listeners: Set<Function>) => listeners.forEach(listener => {
            if (async) {
                this.dispatchAsync(() => listener(event));
            } else {
                listener(event);
            }
        });

        processEventListeners(this.getListeners(eventType, async));

        const globalListeners = async ? this.globalAsyncListeners : this.globalSyncListeners;

        globalListeners.forEach(listener => {
            if (async) {
                this.dispatchAsync(() => listener(eventType, event));
            } else {
                listener(eventType, event);
            }
        });
    }

    // this gets called inside the summer's thread, for each event that it
    // wants to set async. the summer then batches the events into one setTimeout()
    // because setTimeout() is an expensive operation. ideally we would have
    // each event in it's own setTimeout(), but we batch for performance.
    private dispatchAsync(func: Function): void {
        // add to the queue for executing later in the next VM turn
        this.asyncFunctionsQueue.push(func);

        // check if timeout is already scheduled. the first time the summer calls
        // this within it's thread turn, this should be false, so it will schedule
        // the 'flush queue' method the first time it comes here. then the flag is
        // set to 'true' so it will know it's already scheduled for subsequent calls.
        if (!this.scheduled) {
            // if not scheduled, schedule one
            window.setTimeout(this.flushAsyncQueue.bind(this), 0);
            // mark that it is scheduled
            this.scheduled = true;
        }
    }

    // this happens in the next VM turn only, and empties the queue of events
    private flushAsyncQueue(): void {
        this.scheduled = false;

        // we take a copy, because the event listener could be using
        // the grid, which would cause more events, which would be potentially
        // added to the queue, so safe to take a copy, the new events will
        // get executed in a later VM turn rather than risk updating the
        // queue as we are flushing it.
        const queueCopy = this.asyncFunctionsQueue.slice();
        this.asyncFunctionsQueue = [];

        // execute the queue
        queueCopy.forEach(func => func());
    }
}
