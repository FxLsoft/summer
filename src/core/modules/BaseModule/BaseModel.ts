import { Autowired, Bean, PostConstruct } from "../../context/Context";
import { IModel } from "../../interfaces/IModel";
import { Logger, LoggerFactory } from "../../Logger";

@Bean('model')
export class BaseModel implements IModel {

    @Autowired('loggerFactory') private loggerFactory: LoggerFactory;

    private logger: Logger;

    @PostConstruct
    public init(): void {
        this.logger = this.loggerFactory.create('BaseModule');
    }

    // 启动入口
    start(): void {
        this.logger.log('start');
    }
    destroy(): void {
        this.logger.log('destroy');
    }

}
