import { IBaseProcess } from '../interfaces/IBaseProcess';
export default class ValidateProcess implements IBaseProcess {
    private modPath;
    parseInputs(): void;
    run(): Promise<void>;
    private checkOnlineVersion;
    private isValidVersion;
}
