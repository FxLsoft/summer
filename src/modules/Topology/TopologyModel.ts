import { Autowired, Bean, Context, PreConstruct } from "@/core/context/Context";
import { EventService } from "@/core/events/EventService";
import { IModel } from "@/core/interfaces/IModel";
import { Logger, LoggerFactory } from "@/core/Logger";

@Bean('model')
export class TopologyModel implements IModel {
    
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('rootDiv') private rootDiv: HTMLElement;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;
    private logger: Logger;

    @PreConstruct
    init():void {
        this.logger = this.loggerFactory.create('Topology');
    }

    start(): void {
        this.logger.log('start');
    }
    destroy(): void {
        this.logger.log('destroy');
    }
    
}