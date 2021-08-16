export interface IModel {
    /** Gets called after summer is initialized. What happens depends on model. Client Side will take data
     * from options, the other models will start calling their datasources. */
    start(): void;

    /**
     * Gets called after summer is destroy.
     */
    destroy(): void;
}