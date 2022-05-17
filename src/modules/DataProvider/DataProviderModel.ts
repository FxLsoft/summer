import { Autowired, Bean, Context, PreConstruct } from "@/core/context/Context";
import { EventService } from "@/core/services/EventService";
import { IModel } from "@/core/interfaces/IModel";
import { Logger, LoggerFactory } from "@/core/Logger";
import { ViewBoard } from "./components/ViewBoard/ViewBoard";

@Bean('model')
export class DataProviderModel implements IModel {

    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;
    @Autowired('rootDiv') private rootDiv: HTMLElement;
    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;

    private logger: Logger;
    private viewBoard: ViewBoard;

    @PreConstruct
    init():void {
        this.logger = this.loggerFactory.create('DataProvider')
    }

    start(): void {
        this.logger.log('start');
        this.viewBoard = this.context.createComponent('ViewBoard') as ViewBoard;
    }
    
    destroy(): void {
        this.viewBoard.destroy();
        this.logger.log('destroy');
    }
    
}