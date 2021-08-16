import { Bean, Qualifier } from "./context/Context";
import { OptionsWrapper } from "./OptionsWrapper";

/**
 * 日志工厂类
 */
@Bean('loggerFactory')
export class LoggerFactory {

    private logging: boolean;

    private setBeans(@Qualifier('optionsWrapper') optionsWrapper: OptionsWrapper): void {
        this.logging = optionsWrapper.isDebug();
    }

    public create(name: string) {
        return new Logger(name, this.isLogging.bind(this));
    }

    public isLogging(): boolean {
        return this.logging;
    }
}

/**
 * 日志类
 */
export class Logger {

    private isLoggingFunc: () => boolean;
    private name: string;

    constructor(name: string, isLoggingFunc: () => boolean) {
        this.name = name;
        this.isLoggingFunc = isLoggingFunc;
    }

    public isLogging(): boolean {
        return this.isLoggingFunc();
    }

    public log(...message: any[]) {
        if (this.isLoggingFunc()) {
            console.log('Logger.' + this.name + ': ', ...message);
        }
    }

}