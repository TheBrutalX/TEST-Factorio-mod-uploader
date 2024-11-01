import { IBaseProcess } from '../interfaces/IBaseProcess';
import FormData from 'form-data';
export default class UploadProcess implements IBaseProcess {
    private modName;
    private modZipPath;
    private modApiToken;
    parseInputs(): void;
    run(): Promise<void>;
    getUploadUrl(): Promise<string>;
    uploadMod(upload_url: string): Promise<void>;
    convertFormDataToBuffer(formData: FormData): Promise<Buffer>;
}
