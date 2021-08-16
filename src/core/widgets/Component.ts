import { BaseBean } from "../context/BaseBean";
import { IComponent } from "../interfaces/IComponent";
import { _ } from '../utils';
export class Component extends BaseBean {

    private eGui: HTMLElement;
    private childComponents: IComponent<any>[] = [];
    private annotatedEventListeners: any[] = [];
    protected parentComponent: Component | undefined;

    constructor(template?: string) {
        super();
        if (template) {
            // todo
        }
    }

    public destroy(): void {
        super.destroy();
        this.childComponents.forEach(childComponent => {
            if (childComponent && childComponent.destroy) {
                (childComponent as any).destroy();
            }
        });
        this.childComponents.length = 0;

        this.removeAnnotatedEventListeners();
    }

    private removeAnnotatedEventListeners(): void {
        if (!this.annotatedEventListeners || !this.eGui) {
            return;
        }

        this.annotatedEventListeners.forEach((eventListener: any) => {
            this.eGui.removeEventListener(eventListener.eventName, eventListener.listener);
        });
        this.annotatedEventListeners = [];
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public setTemplate(template: string, paramsMap?: any): void {
        const eGui = _.loadTemplate(template as string);
        this.eGui = eGui;
    }

}
