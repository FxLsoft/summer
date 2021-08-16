import { Autowired, PreConstruct } from "@/core/context/Context";
import { EventService } from "@/core/events/EventService";
import { UserComponentRegistry } from "@/core/widgets/framework/userComponentRegistry";
import { Component } from "@/core/widgets/Component";
import { Logger, LoggerFactory } from "@/core/Logger";
import { App, createApp } from 'vue';

const createView = () => import('./ViewBoard.vue');

export class ViewBoard extends Component {

    id: string = 'view-board';

    @Autowired('userComponentRegistry') userComponentRegistry: UserComponentRegistry;
    @Autowired('rootDiv') rootDiv: HTMLElement;
    @Autowired('loggerFactory') loggerFactory: LoggerFactory;
    @Autowired('eventService') eventService: EventService;

    private logger: Logger;

    private view: App<Element>;

    constructor(params: ViewBoard) {
        super();
    }

    @PreConstruct
    init(): void {
        this.logger = this.loggerFactory.create('ViewBoard');
        this.logger.log('init');
        createView().then(module => {
            let view = createApp(module.default, { vm: this });
            view.mount(this.rootDiv);
            this.logger.log('View >> ', view);
            this.view = view;
        });
        this.addDestroyFunc(() => {
            this.destroy();
        });
    }

    testImage() {
        let image = new Image();
        image.src = '/sources/1.png';
        image.onload = () => {
            this.logger.log('image 加载成功 >> ', image.src);
            let width = image.naturalWidth;
            let height = image.naturalHeight;
            let canvas = document.createElement('canvas');
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            canvas.height = height;
            canvas.width = width;
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, width, height);
            let img = canvas.toDataURL();
            this.logger.log(img);
            let transformImage = new Image();
            transformImage.src = img;
            document.body.appendChild(image);
            document.body.appendChild(transformImage);
            document.body.appendChild(canvas);
        }
    }

    getGui(): HTMLElement {
        return this.rootDiv;
    }

    destroy(): void {
        this.logger.log('destroy');
        if (this.view) {
            this.view.unmount();
            this.view = null;
        }
    }
}