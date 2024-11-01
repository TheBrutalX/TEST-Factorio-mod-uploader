export interface IBaseProcess {
    parseInputs(): void;
    run(): Promise<void>;
}
