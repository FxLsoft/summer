export interface IModel {
    /** Gets called after summer is initialized. What happens depends on model.*/
    start(): void;

    /**
     * Gets called after summer is destroy.
     */
    destroy(): void;
}