export default class FactorioModPortalApiService {
    static getLatestModVersion(name: string): Promise<string>;
    static ModUploadInit(token: string, modName: string): Promise<string>;
    static ModUploadFinish(token: string, upload_url: string, modZipPath: string): Promise<void>;
}
