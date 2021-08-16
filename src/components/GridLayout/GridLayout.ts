import { EventService } from "@/core/events/EventService";

import '@interactjs/auto-start';
import '@interactjs/actions/drag';
import '@interactjs/actions/resize';
import '@interactjs/modifiers';

import interact from '@interactjs/interact/index';

export class Layout {

}

type BreakPoint = {
    lg: number,
    md: number,
    sm: number,
    xs: number,
    xxs: number
}

type Col = {
    lg: number,
    md: number,
    sm: number,
    xs: number,
    xxs: number
}


export class GridLayout {
    protected autoSize: boolean = true;
    protected colNum: number = 12;
    protected rowHeight: number = 150;
    protected maxRows: number = Infinity;
    protected margin: number[] = [10, 10];
    protected isDraggable: boolean = true;
    protected isResizable: boolean = true;
    protected isMirrored: boolean = false;
    protected useCssTransforms: boolean = true;
    protected verticalCompact: boolean = true;
    protected layout: Layout[] = [];
    protected responsive: boolean = false;
    protected responsiveLayouts: object = {};
    protected breakpoints: BreakPoint = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    protected cols: Col = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
    protected preventCollision: boolean = false;
    protected useStyleCursor: boolean = true;

    protected localEventService: EventService = new EventService();



}