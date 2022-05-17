import { Autowired, PostConstruct } from './context/Context';
import { EventService } from './services/EventService';
import { Logger, LoggerFactory } from './Logger';
import { Component } from './widgets/Component';

import '../styles/SummerCore.scss';

export class SummerCore extends Component {

    @Autowired('eventService') protected eventService: EventService;

    @Autowired('loggerFactory') loggerFactory: LoggerFactory;

    @Autowired('rootDiv') private rootDiv: HTMLElement;

    private logger: Logger;

    constructor() {
        super();
    }

    @PostConstruct
    init(): void {
        this.logger = this.loggerFactory.create('SummerCore');

        const template = this.createTemplate();
        this.setTemplate(template);

        this.rootDiv.appendChild(this.getGui());
        this.addDestroyFunc(() => {
            this.getGui().remove();
        });

        this.logger.log('SummerCore init');
    }

    private createTemplate(): string {
        return `
            <div class="loading-mask">
                <div class="loading-spinner">
                    <svg viewBox="25 25 50 50" class="circular">
                        <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
                    </svg>
                </div>
            </div>
        `;
    }

    public destroy() {
        super.destroy();
        this.logger.log('Summer DOM removed');
    }
}