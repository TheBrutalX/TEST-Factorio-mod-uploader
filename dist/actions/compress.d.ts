import { IBaseProcess } from '../interfaces/IBaseProcess';
export default class CompressProcess implements IBaseProcess {
    private modName;
    private modPath;
    private modVersion;
    private tmpPath;
    parseInputs(): void;
    run(): Promise<void>;
    private normalizedZipName;
}
