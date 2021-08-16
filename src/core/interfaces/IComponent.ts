export interface IComponent<T> {
    /** Return the DOM element of your editor, this is what the grid puts into the DOM */
    getGui(): HTMLElement;

    /** Gets called once by grid after editing is finished - if your editor needs to do any cleanup, do it here */
    destroy?(): void;

    /** The init(params) method is called on the filter once. See below for details on the parameters. */
    init?(params: T): Promise<void> | void;
}