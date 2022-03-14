import { _ } from '../../../../core/utils';

interface Options {
    // 子组件高度
    itemHeight: number;
    // 数据
    list: any[];
}

export default class VirtualRolling {
    // 父节点
    private rootDiv: HTMLElement;
    // 参数
    private options: Options;
    // 子dom对象池
    private divPools: HTMLElement[] = [];
    // 窗口高度
    private clientHeight: number = 0;
    // 右侧Bar模板
    private rightBar: HTMLElement;

    private bar: HTMLElement;
    private barHeight: number = 0;
    // 控制鼠标
    private mouseOffsetY: number = -1;
    // bar滚动
    private offsetY: number = 0;

    constructor(el: HTMLElement | string, options: Options) {
        let rootDiv: HTMLElement;
        if (_.isString(el)) {
            rootDiv = document.querySelector(el as string);
        } else {
            rootDiv = el as HTMLElement;
        }
        if (!rootDiv) {
            console.error('Not present el');
            return;
        }
        this.rootDiv = rootDiv;
        this.options = options;
        this.initBar();
        this.initEvent();
        this.fresh();
    }

    // 刷新
    fresh() {
        let rect = this.rootDiv.getBoundingClientRect();
        let clientHeight = rect.height;
        let options = this.options;
        let divPools = this.divPools;
        let rootDiv = this.rootDiv;
        let poolSize = Math.ceil(clientHeight / options.itemHeight);
        let maxSize = Math.max(poolSize, divPools.length);
        for(let i = 0; i < maxSize; i++) {
            let div = divPools[i] || document.createElement('div');
            div.classList.add('item-pool');
            div.style.display = 'none';
            divPools[i] = div;
            rootDiv.appendChild(div);
        }
        this.clientHeight = clientHeight;
        this.barHeight = Math.max(clientHeight * clientHeight / (options.itemHeight * options.list.length), 20);
    }
    // 初始化bar
    initBar() {
        let barTemplate = `
            <div class="right-bar">
				<div class="bar-inner"></div>
			</div>
        `;
        this.rightBar = _.loadTemplate(barTemplate);
        this.bar = this.rightBar.querySelector('.bar-inner');
        this.rootDiv.appendChild(this.rightBar);
    }
    // 初始化事件
    initEvent() {
        let bar = this.bar;
        bar.addEventListener('mousedown', this._onMouseDown.bind(this));
        document.addEventListener('mousemove', this._onMouseMove.bind(this));
        document.addEventListener('mouseup', this._onMouseUp.bind(this));
    }
    // virtual rolling child item render
    render() {

    }

    private getBar(): HTMLElement {
        return this.rightBar.querySelector('.bar-inner');
    }

    // 鼠标点击
    private _onMouseDown(e: MouseEvent) {
        this.mouseOffsetY = e.clientY;
    }

    private _onMouseMove(e: MouseEvent) {
        let mouseY = this.mouseOffsetY;
        if (mouseY === -1) return;
        this.offsetY = (e.clientY - mouseY) + this.offsetY;
        if (this.offsetY < 0) {
            this.offsetY = 0;
        }
        if (this.offsetY > this.clientHeight - this.barHeight) {
            this.offsetY = this.clientHeight - this.barHeight;
        }
        this.mouseOffsetY = e.clientY;
        this.bar.style.transform = `translateY(${this.offsetY}px)`;
        this.render();
    }

    private _onMouseUp(e: MouseEvent) {
        this.mouseOffsetY = -1;
    }

}