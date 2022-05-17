import { SrOptions } from './../SummerOptions';
export { Events } from './EventKeys';

export interface SrEvent {
    type: string;
}

export interface ReadyEvent extends SrEvent {
    options: SrOptions
};